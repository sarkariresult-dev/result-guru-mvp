'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import webpush from 'web-push';
import { env } from '@/config/env';

// Configure web-push with VAPID details
webpush.setVapidDetails(
  'mailto:hello@resultguru.co.in',
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  env.VAPID_PRIVATE_KEY as string
);

const broadcastSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  url: z.string().url('A valid URL is required'),
});

/** Maximum subscriptions to fetch per page (Supabase default limit is 1000) */
const SUBSCRIPTION_PAGE_SIZE = 1000;

/** Number of push notifications sent in parallel per batch */
const BATCH_SIZE = 50;

/**
 * Append UTM tracking parameters to a URL for analytics attribution.
 * If the URL already has query params, appends with &. Otherwise uses ?.
 */
function appendUtmParams(url: string, broadcastId: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', 'web_push');
    urlObj.searchParams.set('utm_medium', 'push');
    urlObj.searchParams.set('utm_campaign', broadcastId);
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Fetch all web_push_subscriptions using paginated queries.
 * Handles >1000 subscribers by fetching in pages.
 */
async function fetchAllSubscriptions(supabaseAdmin: ReturnType<typeof createAdminClient>) {
  const allSubscriptions: Array<{
    endpoint: string;
    p256dh: string;
    auth: string;
  }> = [];

  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabaseAdmin
      .from('web_push_subscriptions')
      .select('endpoint, p256dh, auth')
      .range(offset, offset + SUBSCRIPTION_PAGE_SIZE - 1);

    if (error) {
      console.error('[broadcasts] Failed to fetch subscriptions page:', error);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allSubscriptions.push(...data);
      offset += SUBSCRIPTION_PAGE_SIZE;
      // If we got fewer than PAGE_SIZE, we've reached the end
      if (data.length < SUBSCRIPTION_PAGE_SIZE) {
        hasMore = false;
      }
    }
  }

  return allSubscriptions;
}

export async function sendPushBroadcast(input: z.infer<typeof broadcastSchema>) {
  try {
    const parsed = broadcastSchema.safeParse(input);
    if (!parsed.success) {
      return { error: 'Invalid input', details: parsed.error.format() };
    }

    const { subject, body, url } = parsed.data;

    const supabase = await createServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      return { error: 'Unauthorized' };
    }

    // Role check - ensure it's an admin
    const role = userData.user.user_metadata?.user_role || userData.user.app_metadata?.user_role;
    if (role !== 'admin') {
      return { error: 'Forbidden. Admin access required.' };
    }

    const supabaseAdmin = createAdminClient();

    let authorId = null;
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_user_id', userData.user.id)
      .single();
    authorId = userRecord?.id || null;

    // 1. Create a draft broadcast record to get an ID
    const { data: broadcast, error: broadcastErr } = await supabaseAdmin
      .from('broadcasts')
      .insert({
        subject,
        body_text: body,
        channel: 'push',
        status: 'sending',
        created_by: authorId,
      })
      .select('id')
      .single();

    if (broadcastErr || !broadcast) {
      console.error('[broadcasts] Failed to create broadcast record:', broadcastErr);
      return { error: 'Failed to initiate broadcast' };
    }

    const broadcastId = broadcast.id as string;

    // 2. Fetch all subscriptions (paginated to handle >1000)
    const subscriptions = await fetchAllSubscriptions(supabaseAdmin);

    if (subscriptions.length === 0) {
      console.error('[broadcasts] No subscriptions found');
      return { error: 'No active subscribers' };
    }

    // 3. Build the notification payload with UTM-tagged URL
    const trackedUrl = appendUtmParams(url, broadcastId);
    const payload = JSON.stringify({
      title: subject,
      body: body,
      url: trackedUrl,
      broadcastId: broadcastId,
    });

    let sentCount = 0;
    let failedCount = 0;

    // 4. Send notifications in parallel batches
    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      const batch = subscriptions.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (sub) => {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          }, payload);
          sentCount++;
        } catch (error: unknown) {
          failedCount++;
          // Type-narrow to check for HTTP status codes from push service
          const statusCode = (error as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            // Subscription expired or unsubscribed — clean up
            await supabaseAdmin.from('web_push_subscriptions').delete().eq('endpoint', sub.endpoint);
          } else {
            console.error('[broadcasts] Failed to send push to:', sub.endpoint, error);
          }
        }
      });

      await Promise.allSettled(promises);
    }

    // 5. Update the broadcast record with the results
    await supabaseAdmin
      .from('broadcasts')
      .update({
        status: 'sent',
        sent_count: sentCount,
        sent_at: new Date().toISOString()
      })
      .eq('id', broadcastId);

    return { success: true, data: { sentCount, failedCount } };
  } catch (error: unknown) {
    console.error('[broadcasts] Unexpected error:', error);
    return { error: 'Internal server error' };
  }
}

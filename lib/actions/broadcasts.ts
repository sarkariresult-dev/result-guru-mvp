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
      void 0;
      return { error: 'Failed to initiate broadcast' };
    }

    const broadcastId = broadcast.id;

    // 2. Fetch all subscriptions
    // In a real large-scale system, this would be chunked or sent via a queue.
    const { data: subscriptions, error: subErr } = await supabaseAdmin
      .from('web_push_subscriptions')
      .select('*');

    if (subErr || !subscriptions) {
      void 0;
      return { error: 'Failed to fetch subscriptions' };
    }

    const payload = JSON.stringify({
      title: subject,
      body: body,
      url: url,
      broadcastId: broadcastId
    });

    let sentCount = 0;
    let failedCount = 0;

    // 3. Send notifications in parallel batches
    const BATCH_SIZE = 50;
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
        } catch (error: any) {
          failedCount++;
          if (error.statusCode === 404 || error.statusCode === 410) {
            // Subscription expired or unsubscribed
            await supabaseAdmin.from('web_push_subscriptions').delete().eq('endpoint', sub.endpoint);
          } else {
            void 0;
          }
        }
      });

      await Promise.allSettled(promises);
    }

    // 4. Update the broadcast record with the results
    await supabaseAdmin
      .from('broadcasts')
      .update({
        status: 'sent',
        sent_count: sentCount,
        sent_at: new Date().toISOString()
      })
      .eq('id', broadcastId);

    return { success: true, data: { sentCount, failedCount } };
  } catch (error) {
    void 0;
    return { error: 'Internal server error' };
  }
}

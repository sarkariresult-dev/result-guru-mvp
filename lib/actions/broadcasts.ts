'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import webpush from 'web-push';
import { Resend } from 'resend';
import { env } from '@/config/env';

// Configure web-push with VAPID details
webpush.setVapidDetails(
  'mailto:hello@resultguru.co.in',
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  env.VAPID_PRIVATE_KEY as string
);

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

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
function appendUtmParams(url: string, broadcastId: string, channel: 'push' | 'email'): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', channel === 'push' ? 'web_push' : 'email_newsletter');
    urlObj.searchParams.set('utm_medium', channel === 'push' ? 'push' : 'email');
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
    const trackedUrl = appendUtmParams(url, broadcastId, 'push');
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

/**
 * Escapes characters in HTML to prevent XSS.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sends a newsletter email broadcast to all active email subscribers using Resend.
 */
export async function sendEmailBroadcast(input: z.infer<typeof broadcastSchema>) {
  try {
    const parsed = broadcastSchema.safeParse(input);
    if (!parsed.success) {
      return { error: 'Invalid input', details: parsed.error.format() };
    }

    const { subject, body, url } = parsed.data;

    if (!resend) {
      return { error: 'Resend is not configured. Please add RESEND_API_KEY to your environment variables.' };
    }

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

    // Fetch active email subscribers from the 'subscribers' table
    const { data: activeSubscribers, error: subscribersErr } = await supabaseAdmin
      .from('subscribers')
      .select('email, unsubscribe_token')
      .eq('status', 'active');

    if (subscribersErr) {
      console.error('[broadcasts] Failed to fetch email subscribers:', subscribersErr);
      return { error: 'Failed to fetch email subscribers' };
    }

    if (!activeSubscribers || activeSubscribers.length === 0) {
      return { error: 'No active email subscribers found' };
    }

    // Create a draft broadcast record with channel = 'email'
    const { data: broadcast, error: broadcastErr } = await supabaseAdmin
      .from('broadcasts')
      .insert({
        subject,
        body_text: body,
        body_html: '',
        channel: 'email',
        status: 'sending',
        created_by: authorId,
      })
      .select('id')
      .single();

    if (broadcastErr || !broadcast) {
      console.error('[broadcasts] Failed to create broadcast record:', broadcastErr);
      return { error: 'Failed to initiate email broadcast' };
    }

    const broadcastId = broadcast.id as string;
    const trackedUrl = appendUtmParams(url, broadcastId, 'email');

    const fromEmail = env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const appUrl = env.NEXT_PUBLIC_APP_URL || 'https://resultguru.co.in';

    // We send emails in batches of up to 100
    const EMAIL_BATCH_SIZE = 100;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < activeSubscribers.length; i += EMAIL_BATCH_SIZE) {
      const batch = activeSubscribers.slice(i, i + EMAIL_BATCH_SIZE);
      const batchPayloads = batch.map((sub) => {
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f9fafb;
      padding: 40px 20px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .header {
      background-color: #0f172a;
      padding: 24px;
      text-align: center;
    }
    .header a {
      color: #ffffff;
      font-size: 20px;
      font-weight: bold;
      text-decoration: none;
      letter-spacing: 0.05em;
    }
    .content {
      padding: 32px 24px;
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .body-text {
      font-size: 16px;
      line-height: 1.6;
      color: #4b5563;
      margin-bottom: 24px;
      white-space: pre-wrap;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 32px;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
    }
    .footer {
      background-color: #f3f4f6;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #6b7280;
      text-decoration: underline;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="${appUrl}">RESULT GURU</a>
      </div>
      <div class="content">
        <h1 class="title">${escapeHtml(subject)}</h1>
        <div class="body-text">${escapeHtml(body)}</div>
        ${url ? `
        <div class="cta-container">
          <a href="${trackedUrl}" class="cta-button" target="_blank">View Details</a>
        </div>
        ` : ''}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Result Guru. All rights reserved.</p>
        <p>You received this email because you subscribed to updates on Result Guru.</p>
        <p><a href="${appUrl}/unsubscribe?token=${sub.unsubscribe_token}">Unsubscribe</a> from all future emails.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
        return {
          from: fromEmail,
          to: sub.email,
          subject: subject,
          html: htmlContent,
          headers: {
            'List-Unsubscribe': `<${appUrl}/unsubscribe?token=${sub.unsubscribe_token}>`
          }
        };
      });

      try {
        const response = await resend.batch.send(batchPayloads);
        if (response.error) {
          console.error('[broadcasts] Resend batch error:', response.error);
          failedCount += batch.length;
        } else if (response.data?.data) {
          response.data.data.forEach((res) => {
            if (res.id) {
              sentCount++;
            } else {
              failedCount++;
            }
          });
        } else {
          sentCount += batch.length;
        }
      } catch (err) {
        console.error('[broadcasts] Error sending email batch:', err);
        failedCount += batch.length;
      }
    }

    // Save template version to DB (generic unsubscribe link for archival)
    const sampleHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: sans-serif; background-color: #f9fafb; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(subject)}</h1>
    <p>${escapeHtml(body)}</p>
    <a href="${trackedUrl}">View Details</a>
  </div>
</body>
</html>
`;

    // Update the broadcast record with the results
    await supabaseAdmin
      .from('broadcasts')
      .update({
        status: 'sent',
        sent_count: sentCount,
        body_html: sampleHtmlContent,
        sent_at: new Date().toISOString()
      })
      .eq('id', broadcastId);

    return { success: true, data: { sentCount, failedCount } };
  } catch (error: unknown) {
    console.error('[broadcasts] Unexpected email error:', error);
    return { error: 'Internal server error' };
  }
}

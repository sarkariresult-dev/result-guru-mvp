# Spec: Web Push Notifications

## 1. Migration Analysis & Database Schema
Currently, the database has a `broadcasts` table (in `011_newsletter.sql`) that explicitly supports the `push` channel (`CHECK (channel IN ('email','whatsapp','telegram','push'))`), but there is no table to store Web Push subscriptions.
To implement native Web Push API without a third-party service, we need to create a new migration (`025_web_push.sql`) to store user subscriptions. A standard Web Push subscription payload includes an endpoint URL and cryptographic keys (`p256dh` and `auth`).

**Proposed Schema:**
```sql
CREATE TABLE IF NOT EXISTS web_push_subscriptions (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        REFERENCES users(id) ON DELETE SET NULL, -- Nullable for anonymous guests
  endpoint       TEXT        UNIQUE NOT NULL,
  p256dh         TEXT        NOT NULL,
  auth           TEXT        NOT NULL,
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at   TIMESTAMPTZ
);

-- RLS Policies (Mandatory per Code Standards)
ALTER TABLE web_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON web_push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Allow anonymous inserts (with service role bypass for admin sends)
CREATE POLICY "Anyone can insert subscriptions" ON web_push_subscriptions
  FOR INSERT WITH CHECK (true);
```

## 2. Implementation Requirements for Full Functionality
To make this fully functional without third-party services and comply with project standards, we must build:

1.  **VAPID Keys Management:** Generate VAPID (Voluntary Application Server Identification) keys (public/private pair). Store them in `.env.local` (`NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`) and **validate them in `config/env.ts` using Zod**.
2.  **Service Worker (`public/sw.js`):**
    *   Listens for `push` events to display the notification using `self.registration.showNotification()`.
    *   Listens for `notificationclick` events to open the target URL when the user clicks.
3.  **Client-Side UI (`components/shared/PushNotificationPrompt.tsx`):**
    *   Checks if the browser supports Service Workers and the PushManager.
    *   Requests notification permissions from the user.
    *   Subscribes the user using the VAPID public key and sends the subscription payload to our API.
4.  **API Routes (Following `app/api/` Standards):**
    *   `POST /api/push/subscribe`: Parses body with Zod, checks rate limits (`generalLimiter`), saves subscription via `createServerClient()`, returns `{ data }` or `{ error }`.
    *   `POST /api/push/unsubscribe`: Validates endpoint, removes subscription.
5.  **Sending Infrastructure & Admin UI:**
    *   Use the `web-push` npm package in server actions or the cron job.
    *   Update the Admin CMS to allow sending broadcast push notifications to all stored `web_push_subscriptions` using `createAdminClient()` to bypass RLS.
    *   **Admin Dashboard View:** Build a UI in the Admin CMS (`app/(dashboard)/admin/broadcasts`) so admins can view past push campaigns, see the total count of active `web_push_subscriptions`, and monitor `sent_count` and `click_count` metrics for each broadcast.

## 3. Do We Need Tracking?
**Yes, tracking is highly recommended** to understand campaign performance. Your `broadcasts` table already has `sent_count`, `open_count`, and `click_count`.

**How to track with Native Web Push:**
1.  **Sent Count:** Tracked server-side when the `web-push` library successfully delivers the payload to the browser vendor's push service.
2.  **Open/Impression Count:** Native Web Push makes it difficult to reliably track "opens" (when the notification appears) because network requests inside the Service Worker `push` event can fail or slow down the display. It's usually skipped.
3.  **Click Count:** Easily tracked in two ways:
    *   **Simple (UTM Parameters):** The notification URL includes `?utm_source=web_push&utm_campaign=xyz`. Vercel Analytics or GA4 will automatically track this.
    *   **Internal DB Tracking:** Inside the Service Worker's `notificationclick` event, you can perform a `fetch('/api/analytics/push-click', { method: 'POST' })` in the background before opening the URL. This route would use `createAdminClient()` to safely increment the `broadcasts.click_count` column without exposing RLS.

We can start with the core subscription + UTM parameter tracking, and layer on internal DB tracking if you want to see exact click counts inside the CMS.

## 4. Execution Plan
1. Generate VAPID keys, add them to `.env.local`, and update `config/env.ts` Zod schema.
2. Create `025_web_push.sql` migration for the subscriptions table including RLS policies.
3. Add the `web-push` npm dependency to `package.json`.
4. Add the Service Worker (`public/sw.js`) to handle Push and Click events.
5. Implement the `/api/push/subscribe` Next.js route with Zod validation and rate limiting.
6. Build the UI prompt (`PushNotificationPrompt`) for users to opt-in.
7. Create an admin Server Action using `web-push` and `createAdminClient()` to send broadcasts.
8. Build the Admin CMS UI for managing and viewing push broadcasts, total subscribers, and click tracking metrics.

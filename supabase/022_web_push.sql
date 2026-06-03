-- ═══════════════════════════════════════════════════════════════
-- 022_web_push.sql - Result Guru
-- Web Push Subscriptions table for native push notifications.
-- ═══════════════════════════════════════════════════════════════

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

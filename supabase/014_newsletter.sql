-- ═══════════════════════════════════════════════════════════════
-- 014_newsletter.sql — Result Guru
-- Email / WhatsApp / Telegram subscriber list and broadcast log.
-- ═══════════════════════════════════════════════════════════════

-- ── Subscriber list ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscribers (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             TEXT        UNIQUE NOT NULL,
  name              TEXT,
  phone             TEXT,
  whatsapp_opt_in   BOOLEAN     NOT NULL DEFAULT FALSE,
  telegram_user_id  TEXT,
  -- Notification preferences (JSON: { "job": true, "result": true, … })
  preferences       JSONB       NOT NULL DEFAULT '{}',
  status            TEXT        NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','unsubscribed','bounced')),
  -- Unique token for one-click unsubscribe (no login required)
  unsubscribe_token TEXT        UNIQUE NOT NULL
                      DEFAULT encode(gen_random_bytes(32), 'hex'),
  subscribed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at   TIMESTAMPTZ
);
COMMENT ON TABLE subscribers IS
  'Email / WhatsApp / Telegram subscriber list. unsubscribe_token allows
   one-click unsubscribe from email without requiring login (CAN-SPAM / GDPR).';

-- ── Broadcast / newsletter log ────────────────────────────────
CREATE TABLE IF NOT EXISTS broadcasts (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject       TEXT        NOT NULL,
  body_html     TEXT,
  body_text     TEXT,
  channel       TEXT        NOT NULL CHECK (channel IN ('email','whatsapp','telegram','push')),
  -- Audience filter stored as JSON for replay / audit
  target_filter JSONB       NOT NULL DEFAULT '{}',
  -- Delivery stats
  sent_count    INT         NOT NULL DEFAULT 0,
  open_count    INT         NOT NULL DEFAULT 0,
  click_count   INT         NOT NULL DEFAULT 0,
  status        TEXT        NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','sending','sent','failed')),
  scheduled_at  TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ,
  created_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE broadcasts IS
  'Outbound newsletter / notification broadcast records.';
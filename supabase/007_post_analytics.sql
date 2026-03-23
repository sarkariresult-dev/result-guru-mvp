-- ═══════════════════════════════════════════════════════════════
-- 007_post_analytics.sql - Result Guru
-- Partitioned page-view event store.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS post_views (
  id         UUID        NOT NULL DEFAULT uuid_generate_v4(),
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referrer   TEXT,
  device     TEXT        CHECK (device IN ('mobile','desktop','tablet','bot',NULL)),
  country    TEXT        NOT NULL DEFAULT 'IN',
  session_id TEXT        -- Anonymised session fingerprint (no PII)
) PARTITION BY RANGE (viewed_at);

-- ── Quarterly partitions (2025 – 2026) ───────────────────────
CREATE TABLE IF NOT EXISTS post_views_2025_q1 PARTITION OF post_views FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS post_views_2025_q2 PARTITION OF post_views FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE IF NOT EXISTS post_views_2025_q3 PARTITION OF post_views FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE IF NOT EXISTS post_views_2025_q4 PARTITION OF post_views FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE IF NOT EXISTS post_views_2026_q1 PARTITION OF post_views FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS post_views_2026_q2 PARTITION OF post_views FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS post_views_2026_q3 PARTITION OF post_views FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS post_views_2026_q4 PARTITION OF post_views FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');

CREATE TABLE IF NOT EXISTS post_views_default PARTITION OF post_views DEFAULT;

-- ═══════════════════════════════════════════════════════════════
-- 008_media.sql - Result Guru
-- Central media / asset library.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Media Asset Library ──────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  bucket           TEXT        NOT NULL DEFAULT 'posts',
  storage_path     TEXT        NOT NULL,
  public_url       TEXT        NOT NULL,
  file_name        TEXT        NOT NULL,
  mime_type        TEXT        NOT NULL,
  file_size        INT         CHECK (file_size > 0),
  width            SMALLINT    CHECK (width > 0),
  height           SMALLINT    CHECK (height > 0),
  alt_text         TEXT,
  caption          TEXT,
  webp_path        TEXT,
  webp_url         TEXT,
  is_webp_ready    BOOLEAN     NOT NULL DEFAULT FALSE,
  uploaded_by      UUID        REFERENCES users(id) ON DELETE SET NULL,
  used_in_posts    UUID[],
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_mime        ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_bucket      ON media(bucket);

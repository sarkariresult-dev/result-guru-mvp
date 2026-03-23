-- ═══════════════════════════════════════════════════════════════
-- 013_web_stories.sql - Result Guru
-- Google Web Stories (AMP) database schema
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Web Story Metadata ──────────────────────────────────
CREATE TABLE IF NOT EXISTS web_stories (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT        NOT NULL,
  slug            TEXT        UNIQUE NOT NULL,
  cover_image     TEXT        NOT NULL,
  publisher_logo  TEXT,
  status          post_status NOT NULL DEFAULT 'draft',
  meta_title      TEXT,
  meta_desc       TEXT,
  author_id       UUID        REFERENCES users(id) ON DELETE SET NULL,
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Story Slides ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS web_story_slides (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id        UUID        NOT NULL REFERENCES web_stories(id) ON DELETE CASCADE,
  position        INT         NOT NULL DEFAULT 0,
  bg_image        TEXT        NOT NULL,
  bg_color        TEXT        DEFAULT '#000000',
  headline        TEXT,
  description     TEXT,
  text_color      TEXT        DEFAULT '#ffffff',
  cta_text        TEXT,
  cta_link        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (story_id, position) DEFERRABLE INITIALLY DEFERRED
);

-- Triggers handled in 015_triggers.sql
-- RLS handled in 018_rls.sql

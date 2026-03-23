-- ═══════════════════════════════════════════════════════════════
-- 004_taxonomy.sql - Result Guru
-- Reference / lookup tables that classify posts.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. States & Regions ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS states (
  slug             TEXT        PRIMARY KEY,
  name             TEXT        NOT NULL,
  abbr             CHAR(2),
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order       SMALLINT    NOT NULL DEFAULT 0,
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  h1_override      TEXT,
  intro_html       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Qualifications & Education Levels ─────────────────────
CREATE TABLE IF NOT EXISTS qualifications (
  slug             TEXT        PRIMARY KEY,
  name             TEXT        NOT NULL,
  short_name       TEXT,
  sort_order       SMALLINT    NOT NULL DEFAULT 0,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Organizations & Boards ────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT        UNIQUE NOT NULL,
  name             TEXT        NOT NULL,
  short_name       TEXT,
  state_slug       TEXT        REFERENCES states(slug) ON DELETE SET NULL,
  official_url     TEXT,
  logo_url         TEXT,
  description      TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  schema_json      JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 4. Content Categories ───────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT        UNIQUE NOT NULL,
  name             TEXT        NOT NULL,
  parent_id        UUID        REFERENCES categories(id) ON DELETE SET NULL,
  description      TEXT,
  icon             TEXT,
  sort_order       SMALLINT    NOT NULL DEFAULT 0,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  h1_override      TEXT,
  intro_html       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Tags ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tags (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT        UNIQUE NOT NULL,
  name             TEXT        NOT NULL,
  description      TEXT,
  tag_type         TEXT        NOT NULL DEFAULT 'general',
  post_count       INT         NOT NULL DEFAULT 0 CHECK (post_count >= 0),
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  canonical_tag_id UUID        REFERENCES tags(id) ON DELETE SET NULL,
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
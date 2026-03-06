-- ═══════════════════════════════════════════════════════════════
-- 004_taxonomy.sql — Result Guru
-- Reference / lookup tables that classify posts.
-- Seed data is in 005_seed_taxonomy.sql.
-- ═══════════════════════════════════════════════════════════════

-- ── States & Union Territories ───────────────────────────────
-- "central" is a pseudo-state for all-India posts.
CREATE TABLE IF NOT EXISTS states (
  slug             TEXT        PRIMARY KEY,
  name             TEXT        NOT NULL,
  abbr             CHAR(2),
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order       SMALLINT    NOT NULL DEFAULT 0,
  -- SEO
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  h1_override      TEXT,
  intro_html       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE states IS
  'Indian states, UTs, and the "central" pseudo-state for all-India posts.';

-- ── Educational qualification levels ────────────────────────
CREATE TABLE IF NOT EXISTS qualifications (
  slug             TEXT        PRIMARY KEY,
  name             TEXT        NOT NULL,
  short_name       TEXT,
  sort_order       SMALLINT    NOT NULL DEFAULT 0,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  -- SEO
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE qualifications IS
  'Educational qualification levels used to filter posts (10th, 12th, Graduation, …).';

-- ── Recruiting / issuing organizations ───────────────────────
-- official_url is the canonical source; posts inherit it via joins.
CREATE TABLE IF NOT EXISTS organizations (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT        UNIQUE NOT NULL,
  name             TEXT        NOT NULL,
  short_name       TEXT,
  state_slug       TEXT        REFERENCES states(slug) ON DELETE SET NULL,
  official_url     TEXT,          -- Used as post's official link — no need to store on post
  logo_url         TEXT,
  description      TEXT,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  -- SEO
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  schema_json      JSONB,         -- Organization JSON-LD
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE organizations IS
  'Hiring / issuing organizations (UPSC, SSC, RRBs, State PSCs, banks …).
   official_url surfaces on post pages via JOIN — never duplicated on posts.';

-- ── Post categories (hierarchical) ───────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT        UNIQUE NOT NULL,
  name             TEXT        NOT NULL,
  parent_id        UUID        REFERENCES categories(id) ON DELETE SET NULL,
  description      TEXT,
  icon             TEXT,
  sort_order       SMALLINT    NOT NULL DEFAULT 0,
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  -- SEO
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  h1_override      TEXT,
  intro_html       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE categories IS
  'Hierarchical post categories (Railway Jobs → RRB NTPC, etc.).';

-- ── Flat tag taxonomy ─────────────────────────────────────────
-- post_count is maintained by trigger (see 016_triggers.sql).
CREATE TABLE IF NOT EXISTS tags (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug             TEXT        UNIQUE NOT NULL,
  name             TEXT        NOT NULL,
  description      TEXT,
  tag_type         TEXT        NOT NULL DEFAULT 'general',
  post_count       INT         NOT NULL DEFAULT 0 CHECK (post_count >= 0),
  is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
  -- Points duplicate tags to the canonical one for SEO consolidation
  canonical_tag_id UUID        REFERENCES tags(id) ON DELETE SET NULL,
  -- SEO
  meta_title       TEXT,
  meta_description TEXT        CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  meta_robots      TEXT        NOT NULL DEFAULT 'index,follow',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE tags IS
  'Flat tag taxonomy; post_count maintained by trigger; canonical_tag_id for duplicate consolidation.';
-- ═══════════════════════════════════════════════════════════════
-- 006_posts.sql - Result Guru
-- Core content table + junction tables.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS posts (

  -- ── Identity ──────────────────────────────────────────────
  id                   UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  type                 post_type          NOT NULL,
  status               post_status        NOT NULL DEFAULT 'draft',
  
  -- Important Dates for Jobs/Exams replacing Enum application_status
  application_start_date TIMESTAMPTZ,
  application_end_date   TIMESTAMPTZ,

  -- ── Core content ─────────────────────────────────────────
  title                TEXT               NOT NULL,
  slug                 TEXT               UNIQUE NOT NULL,
  excerpt              TEXT,
  content              TEXT,

  -- ── Taxonomy ──────────────────────────────────────────────
  state_slug           TEXT               REFERENCES states(slug) ON DELETE SET NULL,
  organization_id      UUID               REFERENCES organizations(id) ON DELETE SET NULL,
  org_name             TEXT,
  org_short_name       TEXT,
  qualification        TEXT[],
  category_id          UUID               REFERENCES categories(id) ON DELETE SET NULL,

  -- ── Media ─────────────────────────────────────────────────
  featured_image       TEXT,
  featured_image_alt   TEXT,
  featured_image_width  SMALLINT,
  featured_image_height SMALLINT,
  notification_pdf     TEXT,

  -- ── Key links (type-specific external URLs) ───────────────
  admit_card_link      TEXT,
  result_link          TEXT,
  answer_key_link      TEXT,

  faq                  JSONB              NOT NULL DEFAULT '[]',

  related_post_ids     UUID[],

  -- ── SEO ───────────────────────────────────────────────────
  meta_title           TEXT,
  meta_description     TEXT,
  meta_keywords        TEXT[],
  focus_keyword        TEXT,
  secondary_keywords   TEXT[],
  canonical_url        TEXT,
  robots_directive     TEXT               NOT NULL DEFAULT 'index,follow',
  noindex              BOOLEAN            NOT NULL DEFAULT FALSE,
  structured_data_type TEXT               NOT NULL DEFAULT 'auto',
  schema_json          JSONB,
  hreflang             JSONB              NOT NULL DEFAULT '[]',
  breadcrumb_override  JSONB              NOT NULL DEFAULT '[]',

  -- ── Open Graph / Twitter ──────────────────────────────────
  og_title             TEXT,
  og_description       TEXT,
  og_image             TEXT,
  og_image_width       SMALLINT           NOT NULL DEFAULT 1200,
  og_image_height      SMALLINT           NOT NULL DEFAULT 630,
  twitter_title        TEXT,
  twitter_description  TEXT,
  twitter_card_type    TEXT               NOT NULL DEFAULT 'summary_large_image',

  -- ── Computed SEO metrics (trigger-maintained) ──────────────
  seo_score            SMALLINT           NOT NULL DEFAULT 0,
  word_count           INT                NOT NULL DEFAULT 0,
  reading_time_min     SMALLINT           NOT NULL DEFAULT 1,
  internal_links_count SMALLINT           NOT NULL DEFAULT 0,
  last_reviewed_at     TIMESTAMPTZ,
  content_updated_at   TIMESTAMPTZ,

  -- ── Publishing ────────────────────────────────────────────
  author_id            UUID               REFERENCES users(id) ON DELETE SET NULL,
  published_at         TIMESTAMPTZ,
  scheduled_at         TIMESTAMPTZ,
  expires_at           TIMESTAMPTZ,

  -- ── Analytics ─────────────────────────────────────────────
  view_count           BIGINT             NOT NULL DEFAULT 0,
  share_count          INT                NOT NULL DEFAULT 0,

  -- ── Timestamps ────────────────────────────────────────────
  created_at           TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  -- ── Trigger-maintained search columns ─────────────────────
  search_vector        TSVECTOR,
  title_lower          TEXT,

  CONSTRAINT chk_posts_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  CONSTRAINT chk_posts_meta_title_len CHECK (meta_title IS NULL OR char_length(meta_title) <= 70),
  CONSTRAINT chk_posts_meta_desc_len CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  CONSTRAINT chk_posts_seo_score_range CHECK (seo_score BETWEEN 0 AND 100),
  CONSTRAINT chk_posts_twitter_card CHECK (twitter_card_type IN ('summary','summary_large_image','app','player')),
  CONSTRAINT chk_posts_og_dims CHECK (og_image_width > 0 AND og_image_height > 0),
  CONSTRAINT chk_posts_scheduled_needs_date CHECK (status <> 'scheduled' OR scheduled_at IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS post_qualifications (
  post_id            UUID NOT NULL REFERENCES posts(id)             ON DELETE CASCADE,
  qualification_slug TEXT NOT NULL REFERENCES qualifications(slug)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, qualification_slug)
);

CREATE TABLE IF NOT EXISTS post_internal_links (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id   UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  target_id   UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  anchor_text TEXT,
  link_type   TEXT        NOT NULL DEFAULT 'content'
                CHECK (link_type IN ('content','related','breadcrumb')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_id, target_id)
);

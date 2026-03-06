-- ═══════════════════════════════════════════════════════════════
-- 007_posts.sql — Result Guru
-- Core content table + junction tables.
--
-- DESIGN DECISIONS
-- ────────────────
-- ✅ official_link REMOVED — always read from organizations.official_url
--    via JOIN (avoids stale duplicates, single source of truth).
--
-- ✅ JSONB content sections are type-driven:
--    • important_dates   — job, exam, admit, result, admission
--    • application_fee   — job, exam, admission
--    • vacancy_details   — job
--    • eligibility       — job, exam, scheme, admission
--    • selection_process — job, exam (ordered text array)
--    • how_to_apply      — job, scheme, admission (ordered steps)
--    • age_limit         — job, exam
--    • pay_scale         — job
--    • syllabus_sections — syllabus, exam
--    • exam_pattern_data — exam_pattern, exam
--    • previous_year_papers — previous_paper
--    • cut_off_marks     — cut_off, result
--    • preparation_tips  — any
--    • faq               — any
--
-- ✅ notification_pdf stored as a path inside the 'posts' Storage
--    bucket (not a full URL — built at render time via storage_public_url()).
--
-- ✅ search_vector + title_lower are trigger-maintained columns
--    (not generated / immutable) so trigger can call unaccent().
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS posts (

  -- ── Identity ──────────────────────────────────────────────
  id                   UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  type                 post_type          NOT NULL,
  status               post_status        NOT NULL DEFAULT 'draft',
  application_status   application_status NOT NULL DEFAULT 'na',

  -- ── Core content ─────────────────────────────────────────
  title                TEXT               NOT NULL,
  slug                 TEXT               UNIQUE NOT NULL,
  excerpt              TEXT,
  content              TEXT,                                         -- Rich HTML body

  -- ── Taxonomy ──────────────────────────────────────────────
  state_slug           TEXT               REFERENCES states(slug) ON DELETE SET NULL,
  organization_id      UUID               REFERENCES organizations(id) ON DELETE SET NULL,
  org_name             TEXT,                                         -- e.g. "UPSC"
  org_short_name       TEXT,                                         -- e.g. "UPSC"
  qualification        TEXT[],                                       -- Denorm; join table is authoritative
  category_id          UUID               REFERENCES categories(id) ON DELETE SET NULL,

  -- ── Media ─────────────────────────────────────────────────
  featured_image       TEXT,                                         -- Storage path or absolute URL
  featured_image_alt   TEXT,
  featured_image_width  SMALLINT,
  featured_image_height SMALLINT,
  notification_pdf     TEXT,                                         -- Storage path (posts bucket)

  -- ── Key links (type-specific external URLs) ───────────────
  -- official_link intentionally OMITTED — read from organizations.official_url
  admit_card_link      TEXT,                                         -- External URL
  result_link          TEXT,                                         -- External URL
  answer_key_link      TEXT,                                         -- External URL (new)

  -- ── Structured content (type-driven JSONB) ─────────────────
  --
  -- important_dates shape:
  -- { "notification": "2025-01-01", "apply_start": "...", "apply_end": "...",
  --   "fee_last_date": "...", "exam_date": "...", "admit_card": "...",
  --   "result": null, "extra": [{"label":"...", "date":"..."}] }
  important_dates      JSONB              NOT NULL DEFAULT '{}',

  --
  -- application_fee shape:
  -- { "general": 500, "obc": 500, "sc": 250, "st": 0, "ews": 500,
  --   "female": 0, "pwd": 0, "ex_servicemen": 0,
  --   "payment_mode": ["online","offline"],
  --   "note": "Fee once paid will not be refunded." }
  application_fee      JSONB              NOT NULL DEFAULT '{}',

  --
  -- vacancy_details shape:
  -- { "total": 1000,
  --   "posts": [
  --     { "name": "Junior Clerk", "total": 500,
  --       "general": 300, "obc": 100, "sc": 60, "st": 40, "ews": 0,
  --       "female": 0, "pwd": 0 }
  --   ] }
  vacancy_details      JSONB              NOT NULL DEFAULT '{}',

  --
  -- eligibility shape:
  -- { "qualification": ["graduation"],
  --   "age_min": 18, "age_max": 30,
  --   "age_relaxation": { "obc": 3, "sc": 5, "st": 5, "pwd": 10 },
  --   "nationality": "Indian",
  --   "note": "" }
  eligibility          JSONB              NOT NULL DEFAULT '{}',

  --
  -- selection_process shape: ["Written Exam","Physical Test","Interview","Medical"]
  selection_process    JSONB              NOT NULL DEFAULT '[]',

  --
  -- how_to_apply shape:
  -- ["Visit official website","Click Apply Online","Fill form",
  --  "Upload documents","Pay fee","Submit and print"]
  how_to_apply         JSONB              NOT NULL DEFAULT '[]',

  -- pay_scale shape:
  -- { "level": "Level-4 (7th CPC)", "min": 25500, "max": 81100,
  --   "grade_pay": null, "note": "" }
  pay_scale            JSONB              NOT NULL DEFAULT '{}',

  -- total_vacancies: denorm from vacancy_details.total for fast filtering
  total_vacancies      INT,

  --
  -- syllabus_sections shape:
  -- [{ "subject": "General Knowledge", "topics": ["History","Geography"],
  --    "marks": 100, "questions": 100, "duration_min": 60 }]
  syllabus_sections    JSONB              NOT NULL DEFAULT '[]',

  --
  -- exam_pattern_data shape:
  -- [{ "stage": "Tier I", "mode": "online", "duration_min": 60,
  --    "total_marks": 200, "negative_marking": true,
  --    "sections": [{"name":"Reasoning","questions":25,"marks":50}] }]
  exam_pattern_data    JSONB              NOT NULL DEFAULT '[]',

  --
  -- previous_year_papers shape:
  -- [{ "year": 2023, "exam": "SSC CGL Tier I", "url": "https://...",
  --    "is_solved": true }]
  previous_year_papers JSONB              NOT NULL DEFAULT '[]',

  -- preparation_tips shape: ["Focus on current affairs","Practice mock tests"]
  preparation_tips     JSONB              NOT NULL DEFAULT '[]',

  --
  -- cut_off_marks shape:
  -- { "year": 2024,
  --   "categories": { "general": 142.5, "obc": 138.0, "sc": 125.0, "st": 120.0 },
  --   "note": "" }
  cut_off_marks        JSONB              NOT NULL DEFAULT '{}',

  --
  -- faq shape:
  -- [{ "q": "What is the last date to apply?", "a": "15 Feb 2025" }]
  faq                  JSONB              NOT NULL DEFAULT '[]',

  -- Related post UUIDs (displayed as "Also Read" at bottom of page)
  related_post_ids     UUID[],

  -- ── SEO ───────────────────────────────────────────────────
  meta_title           TEXT,
  meta_description     TEXT,
  meta_keywords        TEXT[],
  focus_keyword        TEXT,
  secondary_keywords   TEXT[],
  canonical_url        TEXT,                                          -- Override canonical; NULL = self
  robots_directive     TEXT               NOT NULL DEFAULT 'index,follow',
  noindex              BOOLEAN            NOT NULL DEFAULT FALSE,
  structured_data_type TEXT               NOT NULL DEFAULT 'auto',   -- 'auto'|'JobPosting'|'FAQPage'|...
  schema_json          JSONB,                                         -- Raw JSON-LD override
  hreflang             JSONB              NOT NULL DEFAULT '[]',      -- [{"lang":"hi","url":"..."}]
  breadcrumb_override  JSONB              NOT NULL DEFAULT '[]',      -- Custom breadcrumb trail

  -- ── Open Graph / Twitter ──────────────────────────────────
  og_title             TEXT,
  og_description       TEXT,
  og_image             TEXT,                                          -- Defaults to featured_image at render
  og_image_width       SMALLINT           NOT NULL DEFAULT 1200,
  og_image_height      SMALLINT           NOT NULL DEFAULT 630,
  twitter_title        TEXT,
  twitter_description  TEXT,
  twitter_card_type    TEXT               NOT NULL DEFAULT 'summary_large_image',

  -- ── Computed SEO metrics (trigger-maintained) ──────────────
  seo_score            SMALLINT           NOT NULL DEFAULT 0,         -- 0–100 composite
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
  -- (plain columns — triggers call unaccent() which is not IMMUTABLE)
  search_vector        TSVECTOR,
  title_lower          TEXT,

  -- ── Constraints ───────────────────────────────────────────
  CONSTRAINT chk_posts_slug_format
    CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  CONSTRAINT chk_posts_meta_title_len
    CHECK (meta_title IS NULL OR char_length(meta_title) <= 70),
  CONSTRAINT chk_posts_meta_desc_len
    CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  CONSTRAINT chk_posts_seo_score_range
    CHECK (seo_score BETWEEN 0 AND 100),
  CONSTRAINT chk_posts_twitter_card
    CHECK (twitter_card_type IN ('summary','summary_large_image','app','player')),
  CONSTRAINT chk_posts_og_dims
    CHECK (og_image_width > 0 AND og_image_height > 0),
  CONSTRAINT chk_posts_scheduled_needs_date
    CHECK (status <> 'scheduled' OR scheduled_at IS NOT NULL)
);

COMMENT ON TABLE posts IS
  'Central content table. All post types share this table — type column
   drives which JSONB sections are populated. official_link lives on
   organizations.official_url and is surfaced via JOIN.
   search_vector + title_lower are trigger-maintained.';

COMMENT ON COLUMN posts.org_name IS
  'Denormalised organisation display name for fast card renders. Keep in sync with organizations.name.';
COMMENT ON COLUMN posts.notification_pdf IS
  'Storage path inside the "posts" Supabase Storage bucket. Build full URL with storage_public_url().';
COMMENT ON COLUMN posts.structured_data_type IS
  '"auto" = system picks based on type; override with "JobPosting", "FAQPage", "Article", etc.';

-- ── Post ↔ Tags (many-to-many) ────────────────────────────────
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
COMMENT ON TABLE post_tags IS 'Many-to-many posts ↔ tags. tag.post_count maintained by trigger.';

-- ── Post ↔ Qualifications (normalised join, synced by trigger) ─
CREATE TABLE IF NOT EXISTS post_qualifications (
  post_id            UUID NOT NULL REFERENCES posts(id)             ON DELETE CASCADE,
  qualification_slug TEXT NOT NULL REFERENCES qualifications(slug)  ON DELETE CASCADE,
  PRIMARY KEY (post_id, qualification_slug)
);
COMMENT ON TABLE post_qualifications IS
  'Normalised posts ↔ qualifications. Auto-synced from posts.qualification[] by trigger.';

-- ── Internal link graph ───────────────────────────────────────
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
COMMENT ON TABLE post_internal_links IS
  'Directed internal link graph (source → target). Upserted by content parser.
   Drives posts.internal_links_count via trigger.';
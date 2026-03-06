-- ═══════════════════════════════════════════════════════════════
-- 009_automation.sql — Result Guru
-- AI content pipeline: raw topic queue, LLM prompt templates,
-- and JSON-LD schema templates.
-- ═══════════════════════════════════════════════════════════════

-- ── Raw inbound topics (scraped / submitted for AI generation) ──
CREATE TABLE IF NOT EXISTS topics (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_url        TEXT        NOT NULL,
  source_name       TEXT,
  raw_title         TEXT,
  raw_text          TEXT,
  suggested_type    post_type,
  suggested_state   TEXT        REFERENCES states(slug) ON DELETE SET NULL,
  suggested_org_id  UUID        REFERENCES organizations(id) ON DELETE SET NULL,
  priority          SMALLINT    NOT NULL DEFAULT 0,        -- Higher = process first
  processed         BOOLEAN     NOT NULL DEFAULT FALSE,
  processing_error  TEXT,
  generated_post_id UUID        REFERENCES posts(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at      TIMESTAMPTZ
);
COMMENT ON TABLE topics IS
  'Inbound raw topics queued for AI-assisted post generation.
   Worker picks rows WHERE processed = FALSE ORDER BY priority DESC.';

-- ── LLM prompt templates keyed by post type ───────────────────
CREATE TABLE IF NOT EXISTS ai_templates (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL UNIQUE,
  post_type     post_type,
  system_prompt TEXT        NOT NULL,
  user_prompt   TEXT        NOT NULL,    -- Supports {{title}}, {{org}}, {{state}} placeholders
  model         TEXT        NOT NULL DEFAULT 'gpt-4o',
  max_tokens    INT         NOT NULL DEFAULT 2000,
  temperature   NUMERIC(3,2) NOT NULL DEFAULT 0.3
                  CHECK (temperature BETWEEN 0 AND 2),
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE ai_templates IS
  'LLM prompt templates per post_type. {{placeholder}} syntax substituted at runtime.';

-- ── JSON-LD schema.org templates ──────────────────────────────
CREATE TABLE IF NOT EXISTS schema_templates (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL UNIQUE,
  post_type   post_type,                                  -- NULL = applies to all types
  schema_type TEXT        NOT NULL,                       -- e.g. 'JobPosting', 'FAQPage'
  template    JSONB       NOT NULL,                       -- {{placeholder}} substituted at render
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE schema_templates IS
  'JSON-LD schema.org templates. {{placeholders}} substituted at server-render time.';

-- ── Seed schema templates ─────────────────────────────────────
INSERT INTO schema_templates (name, post_type, schema_type, template, description) VALUES

  ('Job Posting', 'job', 'JobPosting',
   '{"@context":"https://schema.org","@type":"JobPosting",
     "title":"{{title}}",
     "description":"{{excerpt}}",
     "hiringOrganization":{"@type":"Organization","name":"{{org_name}}","sameAs":"{{org_official_url}}"},
     "jobLocation":{"@type":"Place","address":{"@type":"PostalAddress","addressRegion":"{{state_name}}","addressCountry":"IN"}},
     "datePosted":"{{published_at}}",
     "validThrough":"{{apply_end}}",
     "employmentType":"FULL_TIME",
     "baseSalary":{"@type":"MonetaryAmount","currency":"INR","value":{"@type":"QuantitativeValue","value":"{{pay_scale_min}}","unitText":"YEAR"}}}',
   'JobPosting schema for government job posts'),

  ('FAQ Page', NULL, 'FAQPage',
   '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":"{{faq_items}}"}',
   'FAQPage schema — injected when post.faq has ≥1 item'),

  ('Article', 'notification', 'Article',
   '{"@context":"https://schema.org","@type":"Article",
     "headline":"{{title}}",
     "description":"{{excerpt}}",
     "datePublished":"{{published_at}}",
     "dateModified":"{{content_updated_at}}",
     "image":"{{og_image}}",
     "publisher":{"@type":"Organization","name":"{{site_name}}","logo":{"@type":"ImageObject","url":"{{site_logo}}"}}}',
   'Article schema for notification and circular posts'),

  ('Government Service', 'scheme', 'GovernmentService',
   '{"@context":"https://schema.org","@type":"GovernmentService",
     "name":"{{title}}",
     "description":"{{excerpt}}",
     "provider":{"@type":"GovernmentOrganization","name":"{{org_name}}"},
     "areaServed":{"@type":"State","name":"{{state_name}}","containedInPlace":{"@type":"Country","name":"India"}}}',
   'GovernmentService schema for scheme  posts'),

  ('Exam Event', 'exam', 'Event',
   '{"@context":"https://schema.org","@type":"Event",
     "name":"{{title}}",
     "description":"{{excerpt}}",
     "startDate":"{{exam_date}}",
     "location":{"@type":"VirtualLocation","url":"{{org_official_url}}"},
     "organizer":{"@type":"Organization","name":"{{org_name}}"}}',
   'Event schema for upcoming exam notification posts')

ON CONFLICT (name) DO NOTHING;
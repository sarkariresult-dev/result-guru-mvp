-- ═══════════════════════════════════════════════════════════════
-- 013_seo.sql - Result Guru
-- Global SEO config, URL redirects, internal search analytics,
-- and sitemap configuration.
-- ═══════════════════════════════════════════════════════════════

-- ── Global key-value SEO settings ────────────────────────────
CREATE TABLE IF NOT EXISTS seo_settings (
  key         TEXT        PRIMARY KEY,
  value       TEXT,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE seo_settings IS
  'Site-wide SEO configuration. Read at build time or cached server-side.';

-- NOTE: Site identity, analytics IDs, and verification tokens are managed
-- exclusively via ENV vars (NEXT_PUBLIC_APP_NAME, _URL, _GA_ID, etc.).
-- Only DB-only settings that the admin UI can edit are seeded here.
INSERT INTO seo_settings (key, value, description) VALUES
  ('default_og_image',        '/og-default.png',                             'Default OG image path (served from site root)'),
  ('default_og_image_width',  '1200',                                        'Default OG image width px'),
  ('default_og_image_height', '630',                                         'Default OG image height px'),
  ('robots_global',           'index,follow',                                'Default robots meta directive'),
  ('robots_pagination',       'noindex,follow',                              'Robots for paginated pages (?page=N)'),
  ('robots_search',           'noindex,follow',                              'Robots for internal search pages'),
  ('sitemap_posts_per_index', '50000',                                       'Max URLs per sitemap file (spec limit)'),
  ('sitemap_ping_google',     'true',                                        'Ping Google on sitemap rebuild'),
  ('website_schema_json',
   '{"@context":"https://schema.org","@type":"WebSite","name":"Result Guru","url":"https://resultguru.co.in","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://resultguru.co.in/search?q={search_term_string}"},"query-input":"required name=search_term_string"}}',
   'Global WebSite JSON-LD with SearchAction'),
  ('organization_schema_json',
   '{"@context":"https://schema.org","@type":"Organization","name":"Result Guru","url":"https://resultguru.co.in","logo":"https://resultguru.co.in/logo.png","sameAs":[]}',
   'Global Organization JSON-LD')
ON CONFLICT (key) DO NOTHING;

-- ── URL redirect rules ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS redirects (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_path   TEXT          UNIQUE NOT NULL,
  to_path     TEXT,
  type        redirect_type NOT NULL DEFAULT '301',
  hits        INT           NOT NULL DEFAULT 0,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  -- Set by trigger when to_path itself has a redirect (chain detected)
  is_chained  BOOLEAN       NOT NULL DEFAULT FALSE,
  note        TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE redirects IS
  'URL redirect rules. is_chained flag set by trigger - always fix chains.
   410 (Gone) tells Googlebot to deindex the URL immediately.';

-- ── Internal site search analytics ───────────────────────────
CREATE TABLE IF NOT EXISTS search_queries (
  id            BIGSERIAL   PRIMARY KEY,
  query         TEXT        NOT NULL,
  results_count INT         NOT NULL DEFAULT 0,
  post_clicked  UUID        REFERENCES posts(id) ON DELETE SET NULL,
  device        TEXT,
  searched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE search_queries IS
  'Internal site search log. Drives autocomplete and "Popular searches".
   idx_search_queries_trgm enables fuzzy "did you mean" suggestions.';

-- ── Sitemap priority / changefreq per URL pattern ─────────────
CREATE TABLE IF NOT EXISTS sitemap_config (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_pattern TEXT          UNIQUE NOT NULL,
  changefreq  TEXT          NOT NULL DEFAULT 'weekly'
                CHECK (changefreq IN ('always','hourly','daily','weekly','monthly','yearly','never')),
  priority    NUMERIC(2,1)  NOT NULL DEFAULT 0.5 CHECK (priority BETWEEN 0.0 AND 1.0),
  include     BOOLEAN       NOT NULL DEFAULT TRUE,
  note        TEXT
);
COMMENT ON TABLE sitemap_config IS
  'Per-pattern sitemap priority/changefreq rules. Used by sitemap.ts.';

INSERT INTO sitemap_config (url_pattern, changefreq, priority, include, note) VALUES
  -- Listing pages (match ROUTE_PREFIXES from config/site.ts)
  ('/',                  'daily',   1.0, TRUE,  'Homepage'),
  ('/job',               'daily',   0.9, TRUE,  'Job listing'),
  ('/result',            'daily',   0.9, TRUE,  'Result listing'),
  ('/admit-card',        'daily',   0.9, TRUE,  'Admit Card listing'),
  ('/answer-key',        'daily',   0.8, TRUE,  'Answer Key listing'),
  ('/cut-off',           'weekly',  0.7, TRUE,  'Cut Off listing'),
  ('/syllabus',          'weekly',  0.7, TRUE,  'Syllabus listing'),
  ('/exam-pattern',      'weekly',  0.7, TRUE,  'Exam Pattern listing'),
  ('/previous-paper',    'weekly',  0.7, TRUE,  'Previous Paper listing'),
  ('/scheme',            'weekly',  0.8, TRUE,  'Scheme listing'),
  ('/exam',              'weekly',  0.8, TRUE,  'Exam listing'),
  ('/admission',         'weekly',  0.8, TRUE,  'Admission listing'),
  ('/notification',      'weekly',  0.6, TRUE,  'Notification listing'),

  -- Individual post detail pages
  ('/job/%',             'weekly',  0.8, TRUE,  'Individual job posts'),
  ('/result/%',          'weekly',  0.8, TRUE,  'Individual result posts'),
  ('/admit-card/%',      'weekly',  0.8, TRUE,  'Individual admit card posts'),
  ('/answer-key/%',      'weekly',  0.7, TRUE,  'Individual answer key posts'),
  ('/cut-off/%',         'weekly',  0.7, TRUE,  'Individual cut off posts'),
  ('/syllabus/%',        'monthly', 0.6, TRUE,  'Individual syllabus posts'),
  ('/exam-pattern/%',    'monthly', 0.6, TRUE,  'Individual exam pattern posts'),
  ('/previous-paper/%',  'monthly', 0.6, TRUE,  'Individual previous paper posts'),
  ('/scheme/%',          'monthly', 0.7, TRUE,  'Individual scheme posts'),
  ('/exam/%',            'weekly',  0.7, TRUE,  'Individual exam posts'),
  ('/admission/%',       'weekly',  0.7, TRUE,  'Individual admission posts'),
  ('/notification/%',    'weekly',  0.6, TRUE,  'Individual notification posts'),

  -- Directory pages
  ('/states/%',          'weekly',  0.7, TRUE,  'State filter pages'),
  ('/organizations/%',   'weekly',  0.6, TRUE,  'Organization pages'),
  ('/tag/%',             'weekly',  0.5, TRUE,  'Tag pages'),

  -- Static pages
  ('/about',             'monthly', 0.4, TRUE,  'About page'),
  ('/contact',           'monthly', 0.4, TRUE,  'Contact page'),
  ('/privacy-policy',    'monthly', 0.3, TRUE,  'Privacy policy'),
  ('/terms-of-service',  'monthly', 0.3, TRUE,  'Terms of service'),
  ('/disclaimer',        'monthly', 0.3, TRUE,  'Disclaimer'),

  -- Excluded
  ('/search',            'daily',   0.0, FALSE, 'Search results - noindex'),
  ('/admin/%',           'daily',   0.0, FALSE, 'Admin - always excluded'),
  ('/api/%',             'daily',   0.0, FALSE, 'API routes - excluded')
ON CONFLICT (url_pattern) DO NOTHING;

-- ── Plural → Singular internal redirects ─────────────────────
INSERT INTO redirects (from_path, to_path, type, note) VALUES
  ('/jobs',             '/job',             '301', 'Standardize plural to singular'),
  ('/results',          '/result',          '301', 'Standardize plural to singular'),
  ('/admit-cards',      '/admit-card',      '301', 'Standardize plural to singular'),
  ('/answer-keys',      '/answer-key',      '301', 'Standardize plural to singular'),
  ('/syllabuses',       '/syllabus',        '301', 'Standardize plural to singular'),
  ('/exam-patterns',    '/exam-pattern',    '301', 'Standardize plural to singular'),
  ('/previous-papers',  '/previous-paper',  '301', 'Standardize plural to singular'),
  ('/schemes',          '/scheme',          '301', 'Standardize plural to singular'),
  ('/exams',            '/exam',            '301', 'Standardize plural to singular'),
  ('/admissions',       '/admission',       '301', 'Standardize plural to singular'),
  ('/notifications',    '/notification',    '301', 'Standardize plural to singular')
ON CONFLICT (from_path) DO NOTHING;
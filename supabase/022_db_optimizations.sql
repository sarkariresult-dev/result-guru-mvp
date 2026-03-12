-- ═══════════════════════════════════════════════════════════════════════════
-- 022_db_optimizations.sql - Result Guru
-- DATABASE OPTIMIZATION: D1 – D6
--
-- Run this ONCE in the Supabase SQL Editor.
-- All statements are idempotent (IF NOT EXISTS / OR REPLACE).
--
-- D1: Materialized views for hot dashboard queries
-- D2: Missing composite indexes & covering indexes
-- D3: Autovacuum tuning for high-write tables
-- D4: Statement-level timeouts & memory tuning
-- D5: Optimised RPC functions (search, homepage, stats)
-- D6: 2027 partition pre-creation & enhanced purge
-- ═══════════════════════════════════════════════════════════════════════════


-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  D1: MATERIALIZED VIEWS FOR HOT QUERIES                            ║
-- ║  Problem: v_trending_posts scans ALL post_views from the last 7    ║
-- ║  days on every request. Dashboard stats do multiple COUNT(*).      ║
-- ║  Fix: Materialise the two hottest views; refresh on schedule.      ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ── D1a: Materialised trending posts (refresh every 15 min) ──────────
DROP MATERIALIZED VIEW IF EXISTS mv_trending_posts;
CREATE MATERIALIZED VIEW mv_trending_posts AS
SELECT
  pv.post_id,
  COUNT(*)            AS views_7d,
  p.title,
  p.slug,
  p.type,
  p.state_slug,
  p.org_name,
  p.featured_image,
  p.featured_image_alt,
  p.excerpt,
  p.published_at
FROM      post_views pv
JOIN      posts      p  ON p.id = pv.post_id
WHERE
  pv.viewed_at > NOW() - INTERVAL '7 days'
  AND p.status = 'published'
GROUP BY
  pv.post_id, p.title, p.slug, p.type,
  p.state_slug, p.org_name,
  p.featured_image, p.featured_image_alt,
  p.excerpt, p.published_at
WITH DATA;

-- Unique index required for CONCURRENTLY refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_trending_post_id
  ON mv_trending_posts (post_id);

CREATE INDEX IF NOT EXISTS idx_mv_trending_views
  ON mv_trending_posts (views_7d DESC);

COMMENT ON MATERIALIZED VIEW mv_trending_posts IS
  'Cached 7-day trending posts. Refresh: SELECT fn_refresh_trending();
   Schedule every 15 min via pg_cron or external scheduler.';

-- ── D1b: Materialised post counts per type (for homepage badges) ─────
DROP MATERIALIZED VIEW IF EXISTS mv_post_type_counts;
CREATE MATERIALIZED VIEW mv_post_type_counts AS
SELECT
  type,
  application_status,
  COUNT(*)            AS post_count,
  MAX(published_at)   AS latest_published_at
FROM posts
WHERE status = 'published'
GROUP BY type, application_status
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_type_counts_pk
  ON mv_post_type_counts (type, application_status);

COMMENT ON MATERIALIZED VIEW mv_post_type_counts IS
  'Cached post counts grouped by type + app status. Avoids repeated COUNT(*)
   on the posts table. Refresh alongside mv_trending_posts.';

-- ── D1c: Materialised site-wide stats (for admin dashboard) ──────────
DROP MATERIALIZED VIEW IF EXISTS mv_site_stats;
CREATE MATERIALIZED VIEW mv_site_stats AS
SELECT
  (SELECT COUNT(*) FROM posts)                                       AS total_posts,
  (SELECT COUNT(*) FROM posts WHERE status = 'published')            AS published_posts,
  (SELECT COALESCE(SUM(view_count), 0) FROM posts
   WHERE status = 'published')                                       AS total_views,
  (SELECT COUNT(*) FROM users)                                       AS total_users,
  (SELECT COUNT(*) FROM subscribers WHERE status = 'active')         AS total_subscribers,
  (SELECT COUNT(*) FROM posts
   WHERE created_at > NOW() - INTERVAL '7 days')                     AS recent_posts_7d,
  NOW()                                                              AS refreshed_at
WITH DATA;

COMMENT ON MATERIALIZED VIEW mv_site_stats IS
  'Single-row site-wide stats snapshot. Avoids 6 separate COUNT(*)
   queries on dashboard load. Refresh every 5–15 min.';

-- ── D1d: Concurrent refresh functions (non-blocking) ─────────────────
CREATE OR REPLACE FUNCTION fn_refresh_trending()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_trending_posts;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_post_type_counts;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_site_stats;
END;
$$;

COMMENT ON FUNCTION fn_refresh_trending() IS
  'Refreshes all materialized views concurrently (non-blocking reads).
   Schedule: every 15 min via pg_cron.
   Usage: SELECT fn_refresh_trending();';

-- ── D1e: RPC to read site stats from MV ──────────────────────────────
CREATE OR REPLACE FUNCTION fn_site_stats()
RETURNS TABLE (
  total_posts       BIGINT,
  published_posts   BIGINT,
  total_views       BIGINT,
  total_users       BIGINT,
  total_subscribers BIGINT,
  recent_posts_7d   BIGINT,
  refreshed_at      TIMESTAMPTZ
)
LANGUAGE sql STABLE
AS $$
  SELECT
    total_posts,
    published_posts,
    total_views,
    total_users,
    total_subscribers,
    recent_posts_7d,
    refreshed_at
  FROM mv_site_stats
  LIMIT 1;
$$;

COMMENT ON FUNCTION fn_site_stats() IS
  'Returns cached dashboard stats from mv_site_stats. O(1) read.';


-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  D2: MISSING COMPOSITE & COVERING INDEXES                          ║
-- ║  Problem: Some query patterns lack optimal indexes.                ║
-- ║  Fix: Add targeted indexes for the actual query shapes.            ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ── D2a: Slug + Type lookup (detail page - most critical query) ──────
-- getPostBySlug() queries: WHERE slug = :slug AND type = :type
CREATE INDEX IF NOT EXISTS idx_posts_slug_type
  ON posts (slug, type);
  -- Covers the exact query pattern: supabase.from('v_published_posts').eq('slug', slug).eq('type', type)

-- ── D2b: Author + Status + Created (author dashboard listing) ───────
-- getAuthorPosts(): WHERE author_id = :id ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_posts_author_status_created
  ON posts (author_id, status, created_at DESC);
  -- Covers: .eq('author_id', id).eq('status', status).order('created_at', desc)

-- ── D2c: Admin listing (all statuses, ordered by created_at) ────────
-- getAdminPosts(): ORDER BY created_at DESC with optional status/type filters
CREATE INDEX IF NOT EXISTS idx_posts_status_created
  ON posts (status, created_at DESC);
  -- Covers: .eq('status', s).order('created_at', desc).range(...)

-- ── D2d: Category + Type + Published (category filtered listings) ────
CREATE INDEX IF NOT EXISTS idx_posts_cat_type_pub
  ON posts (category_id, type, published_at DESC)
  WHERE status = 'published';
  -- Covers: category page filtered by type

-- ── D2e: Qualification array containment + published ────────────────
CREATE INDEX IF NOT EXISTS idx_posts_qual_pub
  ON posts USING gin (qualification)
  WHERE status = 'published';
  -- Covers: .contains('qualification', ['graduation']).order('published_at', desc)
  -- Replaces idx_posts_qualification which lacks the partial WHERE clause

-- ── D2f: Post views - post_id index on each partition ────────────────
-- The parent table has idx_post_views_post but partitions may not inherit it
-- Supabase handles partition index propagation, but let's be explicit:
DO $$
DECLARE
  _part TEXT;
BEGIN
  FOR _part IN
    SELECT inhrelid::regclass::TEXT
    FROM pg_inherits
    WHERE inhparent = 'post_views'::regclass
  LOOP
    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I ON %s (post_id, viewed_at DESC)',
      'idx_' || replace(_part, '.', '_') || '_post_viewed',
      _part
    );
  END LOOP;
END$$;

-- ── D2g: Search queries - date + query for analytics ─────────────────
CREATE INDEX IF NOT EXISTS idx_search_queries_date_query
  ON search_queries (searched_at, query)
  WHERE query IS NOT NULL;
  -- Covers: "top searches today" analytics dashboard
  -- Range queries like: WHERE searched_at >= current_date AND searched_at < current_date + 1

-- ── D2h: Tags - name trigram for admin tag search ────────────────────
CREATE INDEX IF NOT EXISTS idx_tags_name_trgm
  ON tags USING gin (lower(name) gin_trgm_ops);
  -- Covers: admin tag autocomplete / search

-- ── D2i: Organizations - state + name for state-filtered org lists ───
CREATE INDEX IF NOT EXISTS idx_orgs_state_name
  ON organizations (state_slug, name);
  -- Covers: /states/:slug → list organizations in that state


-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  D3: AUTOVACUUM TUNING FOR HIGH-WRITE TABLES                       ║
-- ║  Problem: Default autovacuum (50 + 20% threshold) delays cleanup   ║
-- ║  on tables with heavy INSERT/UPDATE traffic, causing index bloat.  ║
-- ║  Fix: Aggressive autovacuum on posts, post_views, ad_events.       ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ── D3a: posts table - frequent UPDATEs (view_count, seo_score, status)
ALTER TABLE posts SET (
  autovacuum_vacuum_scale_factor = 0.05,       -- vacuum after 5% rows change (default 20%)
  autovacuum_analyze_scale_factor = 0.02,      -- analyze after 2% rows change (default 10%)
  autovacuum_vacuum_cost_delay = 5             -- less delay = faster vacuum (default 2ms, but more aggressive)
);

-- ── D3b: post_views - INSERT-heavy (every page view)
-- post_views is partitioned, so we must set storage params on each leaf partition
DO $$
DECLARE _part TEXT;
BEGIN
  FOR _part IN
    SELECT inhrelid::regclass::TEXT
    FROM pg_inherits
    WHERE inhparent = 'post_views'::regclass
  LOOP
    EXECUTE format(
      'ALTER TABLE %s SET (autovacuum_vacuum_scale_factor = 0.01, autovacuum_analyze_scale_factor = 0.01, autovacuum_vacuum_cost_delay = 2)',
      _part
    );
  END LOOP;
END$$;

-- ── D3c: ad_events - INSERT-heavy (ad impressions/clicks)
-- ad_events is partitioned, so we must set storage params on each leaf partition
DO $$
DECLARE _part TEXT;
BEGIN
  FOR _part IN
    SELECT inhrelid::regclass::TEXT
    FROM pg_inherits
    WHERE inhparent = 'ad_events'::regclass
  LOOP
    EXECUTE format(
      'ALTER TABLE %s SET (autovacuum_vacuum_scale_factor = 0.01, autovacuum_analyze_scale_factor = 0.01, autovacuum_vacuum_cost_delay = 2)',
      _part
    );
  END LOOP;
END$$;

-- ── D3d: post_tags - many INSERT/DELETE during post saves
ALTER TABLE post_tags SET (
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.05
);

-- ── D3e: search_queries - INSERT-only, append-heavy
ALTER TABLE search_queries SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_analyze_scale_factor = 0.02
);

-- ── D3f: Run a manual ANALYZE now to seed fresh statistics ────────────
ANALYZE posts;
ANALYZE post_views;
ANALYZE post_tags;
ANALYZE tags;
ANALYZE organizations;
ANALYZE states;
ANALYZE categories;
ANALYZE subscribers;


-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  D4: STATEMENT TIMEOUT & MEMORY GUARDS                             ║
-- ║  Problem: Runaway queries can lock the DB or exhaust shared memory. ║
-- ║  Fix: Set role-level statement_timeout and work_mem.                ║
-- ║  NOTE: These use ALTER ROLE which requires superuser/owner.         ║
-- ║  On Supabase, some of these may need the Dashboard Settings panel. ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ── D4a: Anon role - max 10s per statement (prevents abuse) ──────────
DO $$ BEGIN
  EXECUTE 'ALTER ROLE anon SET statement_timeout = ''10000''';      -- 10s
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not ALTER ROLE anon - set via Supabase Dashboard > Database > Roles';
END$$;

-- ── D4b: Authenticated role - max 30s ────────────────────────────────
DO $$ BEGIN
  EXECUTE 'ALTER ROLE authenticated SET statement_timeout = ''30000'''; -- 30s
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not ALTER ROLE authenticated - set via Dashboard';
END$$;

-- ── D4c: Service role - max 120s (for admin & maintenance tasks) ─────
DO $$ BEGIN
  EXECUTE 'ALTER ROLE service_role SET statement_timeout = ''120000'''; -- 2min
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not ALTER ROLE service_role - set via Dashboard';
END$$;

-- ── D4d: Increase work_mem for complex sort/hash operations ──────────
-- Default is 4MB which is fine for most queries,
-- but search + trending queries benefit from more headroom.
DO $$ BEGIN
  EXECUTE 'ALTER DATABASE postgres SET work_mem = ''8MB''';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not ALTER DATABASE - set via Supabase Dashboard > Settings > Database';
END$$;

-- ── D4e: Enable JIT for complex aggregation queries ──────────────────
DO $$ BEGIN
  EXECUTE 'ALTER DATABASE postgres SET jit = on';
  EXECUTE 'ALTER DATABASE postgres SET jit_above_cost = 500000';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not enable JIT - may need Supabase Dashboard';
END$$;


-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  D5: OPTIMISED RPC FUNCTIONS                                       ║
-- ║  Problem: Some common query patterns are sent as multiple round-   ║
-- ║  trips. Homepage loads 5+ separate queries that could be combined. ║
-- ║  Fix: Server-side RPC functions that batch work in a single call.  ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ── D5a: Homepage section loader (single RPC replaces 5+ queries) ────
CREATE OR REPLACE FUNCTION fn_homepage_sections(
  p_limit INT DEFAULT 6
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result JSONB := '{}'::JSONB;
  _type   TEXT;
  -- Expanded to all 12 post types for the massive left/right split homepage layout
  _types  TEXT[] := ARRAY[
    'job', 'result', 'admit', 'answer_key', 'cut_off', 
    'syllabus', 'exam_pattern', 'previous_paper', 
    'scheme', 'exam', 'admission', 'notification'
  ];
BEGIN
  FOREACH _type IN ARRAY _types LOOP
    _result := _result || jsonb_build_object(
      _type,
      (
        SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::JSONB)
        FROM (
          SELECT id, type, application_status, title, slug, excerpt,
                 state_slug, state_name, org_name, org_short_name,
                 category_slug, category_name, qualification,
                 featured_image, featured_image_alt,
                 view_count, reading_time_min, published_at, updated_at
          FROM v_published_posts
          WHERE type = _type::post_type
          ORDER BY published_at DESC
          LIMIT p_limit
        ) t
      )
    );
  END LOOP;

  RETURN _result;
END;
$$;

COMMENT ON FUNCTION fn_homepage_sections(INT) IS
  'Returns latest posts for all 12 homepage sections in a single JSONB response.
   Replaces 12 separate getPosts() calls with one DB round-trip.
   Usage: SELECT fn_homepage_sections(6);';

-- ── D5b: Optimised full-text search with ranking + highlights ────────
CREATE OR REPLACE FUNCTION fn_search_posts(
  p_query   TEXT,
  p_limit   INT DEFAULT 20,
  p_offset  INT DEFAULT 0,
  p_type    TEXT DEFAULT NULL
)
RETURNS TABLE (
  id                 UUID,
  type               TEXT,
  application_status TEXT,
  title              TEXT,
  slug               TEXT,
  excerpt            TEXT,
  state_slug         TEXT,
  state_name         TEXT,
  org_name           TEXT,
  org_short_name     TEXT,
  category_slug      TEXT,
  category_name      TEXT,
  featured_image     TEXT,
  featured_image_alt TEXT,
  view_count         BIGINT,
  reading_time_min   SMALLINT,
  published_at       TIMESTAMPTZ,
  rank               REAL,
  total_count        BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tsquery TSQUERY;
  _total   BIGINT;
BEGIN
  _tsquery := websearch_to_tsquery('simple', p_query);

  -- Get total count for pagination
  SELECT COUNT(*) INTO _total
  FROM posts p
  WHERE p.search_vector @@ _tsquery
    AND p.status = 'published'
    AND (p_type IS NULL OR p.type = p_type::post_type);

  RETURN QUERY
  SELECT
    p.id,
    p.type::TEXT,
    p.application_status::TEXT,
    p.title,
    p.slug,
    p.excerpt,
    p.state_slug,
    s.name AS state_name,
    p.org_name,
    p.org_short_name,
    c.slug AS category_slug,
    c.name AS category_name,
    p.featured_image,
    p.featured_image_alt,
    p.view_count,
    p.reading_time_min,
    p.published_at,
    ts_rank_cd(p.search_vector, _tsquery, 32) AS rank,
    _total AS total_count
  FROM      posts      p
  LEFT JOIN states     s ON s.slug = p.state_slug
  LEFT JOIN categories c ON c.id   = p.category_id
  WHERE p.search_vector @@ _tsquery
    AND p.status = 'published'
    AND (p_type IS NULL OR p.type = p_type::post_type)
  ORDER BY rank DESC, p.published_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION fn_search_posts(TEXT, INT, INT, TEXT) IS
  'Full-text search with ts_rank_cd scoring and total_count for pagination.
   Single round-trip replaces separate search + count queries.
   Usage: SELECT * FROM fn_search_posts(''ssc cgl 2026'', 20, 0);';

-- ── D5c: Related posts by shared tags (avoids N+1) ──────────────────
CREATE OR REPLACE FUNCTION fn_related_posts(
  p_post_id UUID,
  p_limit   INT DEFAULT 6
)
RETURNS TABLE (
  id                 UUID,
  type               TEXT,
  title              TEXT,
  slug               TEXT,
  excerpt            TEXT,
  featured_image     TEXT,
  featured_image_alt TEXT,
  org_name           TEXT,
  published_at       TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT ON (p.id)
    p.id,
    p.type::TEXT,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image,
    p.featured_image_alt,
    p.org_name,
    p.published_at
  FROM post_tags pt1
  JOIN post_tags pt2 ON pt2.tag_id = pt1.tag_id AND pt2.post_id <> pt1.post_id
  JOIN posts     p   ON p.id = pt2.post_id AND p.status = 'published'
  WHERE pt1.post_id = p_post_id
  ORDER BY p.id, p.published_at DESC
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION fn_related_posts(UUID, INT) IS
  'Finds related published posts sharing tags with the given post.
   Usage: SELECT * FROM fn_related_posts(''uuid-here'', 6);';

-- ── D5d: Trending posts from MV (fast read) ─────────────────────────
CREATE OR REPLACE FUNCTION fn_trending_posts(
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  post_id            UUID,
  views_7d           BIGINT,
  title              TEXT,
  slug               TEXT,
  type               TEXT,
  state_slug         TEXT,
  org_name           TEXT,
  featured_image     TEXT,
  featured_image_alt TEXT,
  excerpt            TEXT,
  published_at       TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    post_id, views_7d, title, slug, type::TEXT,
    state_slug, org_name, featured_image, featured_image_alt,
    excerpt, published_at
  FROM mv_trending_posts
  ORDER BY views_7d DESC
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION fn_trending_posts(INT) IS
  'Returns trending posts from materialised view. O(1) via index.';

-- ── D5e: Post counts by type from MV ────────────────────────────────
CREATE OR REPLACE FUNCTION fn_post_counts_by_type()
RETURNS TABLE (
  type               TEXT,
  total_count        BIGINT,
  open_count         BIGINT,
  latest_published   TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    type::TEXT,
    SUM(post_count)                                        AS total_count,
    SUM(post_count) FILTER (WHERE application_status = 'open') AS open_count,
    MAX(latest_published_at)                               AS latest_published
  FROM mv_post_type_counts
  GROUP BY type;
$$;

COMMENT ON FUNCTION fn_post_counts_by_type() IS
  'Returns per-type post counts from mv_post_type_counts. O(1).';


-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  D6: PARTITION MAINTENANCE & 2027 PRE-CREATION                      ║
-- ║  Problem: post_views & ad_events only have partitions through 2026. ║
-- ║  As traffic grows, we need 2027 partitions ready before Q1 starts. ║
-- ║  Fix: Create 2027 partitions now; enhance purge to be batched.     ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ── D6a: Create 2027 quarterly partitions ────────────────────────────
SELECT fn_create_quarterly_partitions(2027, 1);  -- Q1: Jan–Mar 2027
SELECT fn_create_quarterly_partitions(2027, 2);  -- Q2: Apr–Jun 2027
SELECT fn_create_quarterly_partitions(2027, 3);  -- Q3: Jul–Sep 2027
SELECT fn_create_quarterly_partitions(2027, 4);  -- Q4: Oct–Dec 2027

-- ── D6b: Batched purge for post_views (avoids long locks) ────────────
CREATE OR REPLACE FUNCTION fn_purge_old_post_views_batched(
  older_than_days INT DEFAULT 365,
  batch_size      INT DEFAULT 10000
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total   BIGINT := 0;
  _deleted INT;
BEGIN
  LOOP
    DELETE FROM post_views
    WHERE ctid IN (
      SELECT ctid FROM post_views
      WHERE viewed_at < NOW() - make_interval(days => older_than_days)
      LIMIT batch_size
    );
    GET DIAGNOSTICS _deleted = ROW_COUNT;
    _total := _total + _deleted;

    -- Stop when no more rows to delete
    EXIT WHEN _deleted = 0;

    -- Yield to other transactions between batches
    PERFORM pg_sleep(0.1);
  END LOOP;

  RETURN _total;
END;
$$;

COMMENT ON FUNCTION fn_purge_old_post_views_batched(INT, INT) IS
  'Deletes old post_views in batches of 10k rows to avoid long locks.
   Returns total rows deleted. Usage: SELECT fn_purge_old_post_views_batched(365, 10000);';

-- ── D6c: Batched purge for ad_events ─────────────────────────────────
CREATE OR REPLACE FUNCTION fn_purge_old_ad_events_batched(
  older_than_days INT DEFAULT 90,
  batch_size      INT DEFAULT 10000
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _total   BIGINT := 0;
  _deleted INT;
BEGIN
  LOOP
    DELETE FROM ad_events
    WHERE ctid IN (
      SELECT ctid FROM ad_events
      WHERE occurred_at < NOW() - make_interval(days => older_than_days)
      LIMIT batch_size
    );
    GET DIAGNOSTICS _deleted = ROW_COUNT;
    _total := _total + _deleted;

    EXIT WHEN _deleted = 0;
    PERFORM pg_sleep(0.1);
  END LOOP;

  RETURN _total;
END;
$$;

COMMENT ON FUNCTION fn_purge_old_ad_events_batched(INT, INT) IS
  'Deletes old ad_events in batches to avoid long locks. Schedule: weekly.';

-- ── D6d: Automated partition creation for next year ──────────────────
CREATE OR REPLACE FUNCTION fn_ensure_future_partitions()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _next_year INT := EXTRACT(YEAR FROM NOW() + INTERVAL '3 months')::INT;
  _q INT;
BEGIN
  FOR _q IN 1..4 LOOP
    PERFORM fn_create_quarterly_partitions(_next_year, _q);
  END LOOP;
END;
$$;

COMMENT ON FUNCTION fn_ensure_future_partitions() IS
  'Creates all 4 quarterly partitions for the next upcoming year.
   Safe to call repeatedly (IF NOT EXISTS). Schedule: quarterly.
   Usage: SELECT fn_ensure_future_partitions();';

-- ── D6e: Search query cleanup (purge old search logs) ────────────────
CREATE OR REPLACE FUNCTION fn_purge_old_search_queries(
  older_than_days INT DEFAULT 90
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _n BIGINT;
BEGIN
  DELETE FROM search_queries
  WHERE searched_at < NOW() - make_interval(days => older_than_days);
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;

COMMENT ON FUNCTION fn_purge_old_search_queries(INT) IS
  'Purges search_queries older than N days. Schedule: monthly.';


-- ╔═══════════════════════════════════════════════════════════════════════╗
-- ║  MAINTENANCE SCHEDULE REFERENCE                                     ║
-- ║  Set these up via pg_cron (Supabase Dashboard > Database > Cron)    ║
-- ╚═══════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────┐
-- │ Schedule           │ Function                          │ Purpose   │
-- ├─────────────────────────────────────────────────────────────────────┤
-- │ Every 15 min       │ fn_refresh_trending()             │ D1: MVs   │
-- │ Nightly 00:05      │ fn_mark_closing_soon()            │ App status│
-- │ Nightly 00:10      │ fn_auto_close_applications()      │ App status│
-- │ Nightly 00:15      │ fn_aggregate_ad_stats()           │ Ad rollup │
-- │ Weekly  Sun 02:00  │ fn_purge_old_ad_events_batched(90)│ D6: Purge │
-- │ Monthly 1st 03:00  │ fn_purge_old_post_views_batched() │ D6: Purge │
-- │ Monthly 1st 03:30  │ fn_purge_old_search_queries(90)   │ D6: Purge │
-- │ Quarterly          │ fn_ensure_future_partitions()     │ D6: Parts │
-- └─────────────────────────────────────────────────────────────────────┘
--
-- pg_cron SQL examples (run in SQL Editor with superuser):
--
-- SELECT cron.schedule('refresh-mvs',       '*/15 * * * *', 'SELECT fn_refresh_trending()');
-- SELECT cron.schedule('mark-closing-soon', '5 0 * * *',    'SELECT fn_mark_closing_soon()');
-- SELECT cron.schedule('auto-close-apps',   '10 0 * * *',   'SELECT fn_auto_close_applications()');
-- SELECT cron.schedule('ad-stats-rollup',   '15 0 * * *',   'SELECT fn_aggregate_ad_stats()');
-- SELECT cron.schedule('purge-ad-events',   '0 2 * * 0',    'SELECT fn_purge_old_ad_events_batched(90)');
-- SELECT cron.schedule('purge-post-views',  '0 3 1 * *',    'SELECT fn_purge_old_post_views_batched(365)');
-- SELECT cron.schedule('purge-searches',    '30 3 1 * *',   'SELECT fn_purge_old_search_queries(90)');
-- SELECT cron.schedule('future-partitions', '0 4 1 1,4,7,10 *', 'SELECT fn_ensure_future_partitions()');


-- ═══════════════════════════════════════════════════════════════════════════
-- Done. All D1–D6 optimizations applied.
-- ═══════════════════════════════════════════════════════════════════════════

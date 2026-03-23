-- ═══════════════════════════════════════════════════════════════════════════
-- 022_db_optimizations.sql - Result Guru
-- DATABASE OPTIMIZATION: D2 – D6
-- (Note: D1 materialized views have been moved to 019_materialized_views.sql)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── D2a: Slug + Type lookup (detail page - most critical query) ──────
-- ── 1. Critical Lookup Indexes ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_slug_type ON posts (slug, type);

-- ── D2b: Author + Status + Created (author dashboard listing) ───────
CREATE INDEX IF NOT EXISTS idx_posts_author_status_created ON posts (author_id, status, created_at DESC);

-- ── D2c: Admin listing (all statuses, ordered by created_at) ────────
CREATE INDEX IF NOT EXISTS idx_posts_status_created ON posts (status, created_at DESC);

-- ── D2d: Category + Type + Published (category filtered listings) ────
CREATE INDEX IF NOT EXISTS idx_posts_cat_type_pub ON posts (category_id, type, published_at DESC) WHERE status = 'published';

-- ── D2e: Qualification array containment + published ────────────────
CREATE INDEX IF NOT EXISTS idx_posts_qual_pub ON posts USING gin (qualification) WHERE status = 'published';

-- ── D2f: Post views - post_id index on each partition ────────────────
DO $$
DECLARE _part TEXT;
BEGIN
  FOR _part IN SELECT inhrelid::regclass::TEXT FROM pg_inherits WHERE inhparent = 'post_views'::regclass LOOP
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %s (post_id, viewed_at DESC)', 'idx_' || replace(_part, '.', '_') || '_post_viewed', _part);
  END LOOP;
END$$;

-- ── D2g: Search queries - date + query for analytics ─────────────────
CREATE INDEX IF NOT EXISTS idx_search_queries_date_query ON search_queries (searched_at, query) WHERE query IS NOT NULL;

-- ── D2h: Tags - name trigram for admin tag search ────────────────────
CREATE INDEX IF NOT EXISTS idx_tags_name_trgm ON tags USING gin (lower(name) gin_trgm_ops);

-- ── D2i: Organizations - state + name for state-filtered org lists ───
CREATE INDEX IF NOT EXISTS idx_orgs_state_name ON organizations (state_slug, name);

-- ── D3a: posts table - frequent UPDATEs
-- ── 2. Table Storage Tuning (Autovacuum) ────────────────────
ALTER TABLE posts SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02, autovacuum_vacuum_cost_delay = 5);

-- ── D3b: post_views - INSERT-heavy
DO $$
DECLARE _part TEXT;
BEGIN
  FOR _part IN SELECT inhrelid::regclass::TEXT FROM pg_inherits WHERE inhparent = 'post_views'::regclass LOOP
    EXECUTE format('ALTER TABLE %s SET (autovacuum_vacuum_scale_factor = 0.01, autovacuum_analyze_scale_factor = 0.01, autovacuum_vacuum_cost_delay = 2)', _part);
  END LOOP;
END$$;

-- ── D3c: ad_events - INSERT-heavy
DO $$
DECLARE _part TEXT;
BEGIN
  FOR _part IN SELECT inhrelid::regclass::TEXT FROM pg_inherits WHERE inhparent = 'ad_events'::regclass LOOP
    EXECUTE format('ALTER TABLE %s SET (autovacuum_vacuum_scale_factor = 0.01, autovacuum_analyze_scale_factor = 0.01, autovacuum_vacuum_cost_delay = 2)', _part);
  END LOOP;
END$$;

-- ── D3d: post_tags
ALTER TABLE post_tags SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.05);

-- ── D3e: search_queries
ALTER TABLE search_queries SET (autovacuum_vacuum_scale_factor = 0.02, autovacuum_analyze_scale_factor = 0.02);

-- ── D3f: Run a manual ANALYZE now to seed fresh statistics ────────────
ANALYZE posts; ANALYZE post_views; ANALYZE post_tags; ANALYZE tags; ANALYZE organizations; ANALYZE states; ANALYZE categories; ANALYZE subscribers;

-- ── D4: Statement timeouts
-- ── 3. Resource & Performance Limits ────────────────────────
DO $$ BEGIN EXECUTE 'ALTER ROLE anon SET statement_timeout = ''10000'''; EXCEPTION WHEN OTHERS THEN NULL; END$$;
DO $$ BEGIN EXECUTE 'ALTER ROLE authenticated SET statement_timeout = ''30000'''; EXCEPTION WHEN OTHERS THEN NULL; END$$;
DO $$ BEGIN EXECUTE 'ALTER ROLE service_role SET statement_timeout = ''120000'''; EXCEPTION WHEN OTHERS THEN NULL; END$$;
DO $$ BEGIN EXECUTE 'ALTER DATABASE postgres SET work_mem = ''8MB'''; EXCEPTION WHEN OTHERS THEN NULL; END$$;
DO $$ BEGIN EXECUTE 'ALTER DATABASE postgres SET jit = on'; EXECUTE 'ALTER DATABASE postgres SET jit_above_cost = 500000'; EXCEPTION WHEN OTHERS THEN NULL; END$$;

-- ── D5a: Homepage section loader (single RPC replaces 5+ queries) ────
-- ── 4. Highly Optimized RPCs for Frontend ───────────────────
CREATE OR REPLACE FUNCTION fn_homepage_sections(
  p_limit INT DEFAULT 6
)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _result JSONB := '{}'::JSONB; _type TEXT; _types TEXT[] := ARRAY['job', 'result', 'admit', 'answer_key', 'cut_off', 'syllabus', 'exam_pattern', 'previous_paper', 'scheme', 'exam', 'admission', 'notification'];
BEGIN
  FOREACH _type IN ARRAY _types LOOP
    _result := _result || jsonb_build_object(_type, (SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::JSONB) FROM (SELECT id, type, application_status, title, slug, excerpt, state_slug, state_name, org_name, org_short_name, category_slug, category_name, qualification, featured_image, featured_image_alt, view_count, reading_time_min, published_at, updated_at FROM v_published_posts WHERE type = _type::post_type ORDER BY published_at DESC LIMIT p_limit) t));
  END LOOP; RETURN _result;
END;
$$;

-- ── D5b: Optimised full-text search with ranking + highlights ────────
CREATE OR REPLACE FUNCTION fn_search_posts(
  p_query TEXT, p_limit INT DEFAULT 20, p_offset INT DEFAULT 0, p_type TEXT DEFAULT NULL
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
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _tsquery TSQUERY; _total BIGINT;
BEGIN
  _tsquery := websearch_to_tsquery('simple', p_query);
  SELECT COUNT(*) INTO _total FROM posts p WHERE p.search_vector @@ _tsquery AND p.status = 'published' AND (p_type IS NULL OR p.type = p_type::post_type);
  RETURN QUERY SELECT p.id, p.type::TEXT, p.application_start_date::TEXT, p.title, p.slug, p.excerpt, p.state_slug, s.name AS state_name, p.org_name, p.org_short_name, c.slug AS category_slug, c.name AS category_name, p.featured_image, p.featured_image_alt, p.view_count, p.reading_time_min, p.published_at, ts_rank_cd(p.search_vector, _tsquery, 32) AS rank, _total AS total_count FROM posts p LEFT JOIN states s ON s.slug = p.state_slug LEFT JOIN categories c ON c.id = p.category_id WHERE p.search_vector @@ _tsquery AND p.status = 'published' AND (p_type IS NULL OR p.type = p_type::post_type) ORDER BY rank DESC, p.published_at DESC LIMIT p_limit OFFSET p_offset;
END;
$$;

-- ── D5c: Related posts by shared tags (avoids N+1) ──────────────────
CREATE OR REPLACE FUNCTION fn_related_posts(p_post_id UUID, p_limit INT DEFAULT 6)
RETURNS TABLE (id UUID, type TEXT, title TEXT, slug TEXT, excerpt TEXT, featured_image TEXT, featured_image_alt TEXT, org_name TEXT, published_at TIMESTAMPTZ) LANGUAGE sql STABLE AS $$
  SELECT DISTINCT ON (p.id) p.id, p.type::TEXT, p.title, p.slug, p.excerpt, p.featured_image, p.featured_image_alt, p.org_name, p.published_at FROM post_tags pt1 JOIN post_tags pt2 ON pt2.tag_id = pt1.tag_id AND pt2.post_id <> pt1.post_id JOIN posts p ON p.id = pt2.post_id AND p.status = 'published' WHERE pt1.post_id = p_post_id ORDER BY p.id, p.published_at DESC LIMIT p_limit;
$$;

-- ── D5d: Trending posts from MV (fast read) ─────────────────────────
CREATE OR REPLACE FUNCTION fn_trending_posts(p_limit INT DEFAULT 10)
RETURNS TABLE (post_id UUID, views_7d BIGINT, title TEXT, slug TEXT, type TEXT, state_slug TEXT, org_name TEXT, featured_image TEXT, featured_image_alt TEXT, excerpt TEXT, published_at TIMESTAMPTZ) LANGUAGE sql STABLE AS $$
  SELECT post_id, views_7d, title, slug, type::TEXT, state_slug, org_name, featured_image, featured_image_alt, excerpt, published_at FROM mv_trending_posts ORDER BY views_7d DESC LIMIT p_limit;
$$;

-- ── D5e: Post counts by type from MV ────────────────────────────────
CREATE OR REPLACE FUNCTION fn_post_counts_by_type()
RETURNS TABLE (type TEXT, total_count BIGINT, open_count BIGINT, latest_published TIMESTAMPTZ) LANGUAGE sql STABLE AS $$
  SELECT type::TEXT, SUM(post_count) AS total_count, SUM(post_count) FILTER (WHERE application_status = 'open') AS open_count, MAX(latest_published_at) AS latest_published FROM mv_post_type_counts GROUP BY type;
$$;

-- ── D6: Batched Purge & Partition Creation ────────────────────────
-- ── 5. Advanced Maintenance Functions ───────────────────────
CREATE OR REPLACE FUNCTION fn_purge_old_post_views_batched(
older_than_days INT DEFAULT 365, batch_size INT DEFAULT 10000)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _total BIGINT := 0; _deleted INT;
BEGIN
  LOOP DELETE FROM post_views WHERE ctid IN (SELECT ctid FROM post_views WHERE viewed_at < NOW() - make_interval(days => older_than_days) LIMIT batch_size); GET DIAGNOSTICS _deleted = ROW_COUNT; _total := _total + _deleted; EXIT WHEN _deleted = 0; PERFORM pg_sleep(0.1); END LOOP; RETURN _total;
END;
$$;

CREATE OR REPLACE FUNCTION fn_purge_old_ad_events_batched(older_than_days INT DEFAULT 90, batch_size INT DEFAULT 10000)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _total BIGINT := 0; _deleted INT;
BEGIN
  LOOP DELETE FROM ad_events WHERE ctid IN (SELECT ctid FROM ad_events WHERE occurred_at < NOW() - make_interval(days => older_than_days) LIMIT batch_size); GET DIAGNOSTICS _deleted = ROW_COUNT; _total := _total + _deleted; EXIT WHEN _deleted = 0; PERFORM pg_sleep(0.1); END LOOP; RETURN _total;
END;
$$;

CREATE OR REPLACE FUNCTION fn_ensure_future_partitions()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _next_year INT := EXTRACT(YEAR FROM NOW() + INTERVAL '3 months')::INT; _q INT;
BEGIN FOR _q IN 1..4 LOOP PERFORM fn_create_quarterly_partitions(_next_year, _q); END LOOP; END;
$$;

CREATE OR REPLACE FUNCTION fn_purge_old_search_queries(older_than_days INT DEFAULT 90)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _n BIGINT; BEGIN DELETE FROM search_queries WHERE searched_at < NOW() - make_interval(days => older_than_days); GET DIAGNOSTICS _n = ROW_COUNT; RETURN _n; END;
$$;

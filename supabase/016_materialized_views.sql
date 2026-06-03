-- ═══════════════════════════════════════════════════════════════════════════
-- 016_materialized_views.sql - Result Guru
-- Materialized views for hot dashboard queries.
-- ═══════════════════════════════════════════════════════════════════════════



-- ── 2. mv_post_type_counts ──────────────────────────────────
DROP MATERIALIZED VIEW IF EXISTS mv_post_type_counts;
CREATE MATERIALIZED VIEW mv_post_type_counts AS
SELECT
  type,
  application_status,
  COUNT(*)            AS post_count,
  MAX(published_at)   AS latest_published_at
FROM v_published_posts
GROUP BY type, application_status
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_type_counts_pk ON mv_post_type_counts (type, application_status);

-- ── 3. mv_site_stats ────────────────────────────────────────
DROP MATERIALIZED VIEW IF EXISTS mv_site_stats;
CREATE MATERIALIZED VIEW mv_site_stats AS
SELECT
  (SELECT COUNT(*) FROM posts)                                       AS total_posts,
  (SELECT COUNT(*) FROM posts WHERE status = 'published')            AS published_posts,
  (SELECT COUNT(*) FROM users)                                       AS total_users,
  (SELECT COUNT(*) FROM subscribers WHERE status = 'active')         AS total_subscribers,
  (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '7 days') AS recent_posts_7d,
  NOW()                                                              AS refreshed_at
WITH DATA;

-- ── 4. Refresh & Access Helpers ─────────────────────────────
CREATE OR REPLACE FUNCTION fn_refresh_materialized_views()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_post_type_counts;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_site_stats;
END;
$$;

CREATE OR REPLACE FUNCTION fn_site_stats()
RETURNS TABLE (
  total_posts       BIGINT,
  published_posts   BIGINT,
  total_users       BIGINT,
  total_subscribers BIGINT,
  recent_posts_7d   BIGINT,
  refreshed_at      TIMESTAMPTZ
) LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT total_posts, published_posts, total_users, total_subscribers, recent_posts_7d, refreshed_at
  FROM mv_site_stats LIMIT 1;
$$;

-- ── 5. Security & Access ────────────────────────────────────
REVOKE SELECT ON mv_site_stats FROM anon, authenticated;
REVOKE SELECT ON mv_post_type_counts FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION fn_refresh_materialized_views() FROM anon, authenticated;

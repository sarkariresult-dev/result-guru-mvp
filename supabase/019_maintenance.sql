-- ═══════════════════════════════════════════════════════════════
-- 019_maintenance.sql — Result Guru
-- Scheduled maintenance functions. Call via pg_cron or an
-- external scheduler (GitHub Actions, Inngest, etc.).
--
-- MAINTENANCE SCHEDULE
-- ────────────────────
-- Nightly  : SELECT fn_aggregate_ad_stats();
-- Nightly  : SELECT fn_auto_close_applications();
-- Weekly   : SELECT fn_purge_old_ad_events(90);
-- Monthly  : SELECT fn_purge_old_post_views(365);
-- Quarterly: CREATE new post_views_YYYY_qN and ad_events_YYYY_qN partitions
-- ═══════════════════════════════════════════════════════════════

-- ── Atomic page-view counter (callable by anon via RPC) ───────
CREATE OR REPLACE FUNCTION fn_increment_post_view(
  p_post_id  UUID,
  p_referrer TEXT DEFAULT NULL,
  p_device   TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only count views for published posts
  IF NOT EXISTS (
    SELECT 1 FROM posts WHERE id = p_post_id AND status = 'published'
  ) THEN RETURN; END IF;

  INSERT INTO post_views (post_id, referrer, device)
  VALUES (p_post_id, p_referrer, p_device);

  UPDATE posts
  SET view_count = view_count + 1
  WHERE id = p_post_id;
END;
$$;
COMMENT ON FUNCTION fn_increment_post_view(UUID, TEXT, TEXT) IS
  'SECURITY DEFINER: atomically records a page view and increments view_count.
   Safe to call from the Supabase anon role via RPC.';

-- ── Nightly ad stats rollup ───────────────────────────────────
-- Idempotent: safe to re-run for the same date without double-counting.
-- Running totals are recomputed from ad_stats_daily (not incremented).
CREATE OR REPLACE FUNCTION fn_aggregate_ad_stats(
  for_date DATE DEFAULT CURRENT_DATE - 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Upsert daily aggregates from raw events
  INSERT INTO ad_stats_daily (ad_id, stat_date, impressions, clicks)
  SELECT
    ad_id,
    for_date,
    COUNT(*) FILTER (WHERE event_type = 'impression'),
    COUNT(*) FILTER (WHERE event_type = 'click')
  FROM   ad_events
  WHERE  occurred_at::DATE = for_date
  GROUP  BY ad_id
  ON CONFLICT (ad_id, stat_date) DO UPDATE
    SET impressions = EXCLUDED.impressions,
        clicks      = EXCLUDED.clicks;

  -- 2. Recompute running totals from the full ad_stats_daily history.
  --    This is idempotent — re-running for the same date won't double-count.
  UPDATE ads a
  SET    impression_count = COALESCE(agg.total_impressions, 0),
         click_count      = COALESCE(agg.total_clicks, 0)
  FROM (
    SELECT
      ad_id,
      SUM(impressions) AS total_impressions,
      SUM(clicks)      AS total_clicks
    FROM ad_stats_daily
    GROUP BY ad_id
  ) agg
  WHERE agg.ad_id = a.id;
END;
$$;
COMMENT ON FUNCTION fn_aggregate_ad_stats(DATE) IS
  'Rolls up ad_events into ad_stats_daily and recomputes running totals idempotently. Schedule: nightly.';

-- ── Purge raw ad events ───────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_purge_old_ad_events(
  older_than_days INT DEFAULT 90
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _n INT;
BEGIN
  DELETE FROM ad_events
  WHERE occurred_at < NOW() - make_interval(days => older_than_days);
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;
COMMENT ON FUNCTION fn_purge_old_ad_events(INT) IS
  'Deletes raw ad_events older than N days. Run after fn_aggregate_ad_stats. Schedule: weekly.';

-- ── Purge old page-view events ────────────────────────────────
CREATE OR REPLACE FUNCTION fn_purge_old_post_views(
  older_than_days INT DEFAULT 365
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _n INT;
BEGIN
  DELETE FROM post_views
  WHERE viewed_at < NOW() - make_interval(days => older_than_days);
  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;
COMMENT ON FUNCTION fn_purge_old_post_views(INT) IS
  'Deletes raw post_views older than N days. Schedule: monthly.';

-- ── Auto-close expired application windows ────────────────────
-- Transitions open jobs/exams to 'closed' when apply_end has passed.
CREATE OR REPLACE FUNCTION fn_auto_close_applications()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _n INT;
BEGIN
  UPDATE posts
  SET    application_status = 'closed'
  WHERE  status             = 'published'
    AND  application_status IN ('open', 'closing_soon')
    AND  (important_dates->>'apply_end') IS NOT NULL
    AND  (important_dates->>'apply_end')::DATE < CURRENT_DATE;

  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;
COMMENT ON FUNCTION fn_auto_close_applications() IS
  'Closes job/exam posts whose apply_end date has passed. Schedule: nightly.';

-- ── Mark "closing soon" (≤7 days remaining) ───────────────────
CREATE OR REPLACE FUNCTION fn_mark_closing_soon()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _n INT;
BEGIN
  UPDATE posts
  SET    application_status = 'closing_soon'
  WHERE  status             = 'published'
    AND  application_status = 'open'
    AND  (important_dates->>'apply_end') IS NOT NULL
    AND  (important_dates->>'apply_end')::DATE BETWEEN CURRENT_DATE AND CURRENT_DATE + 7;

  GET DIAGNOSTICS _n = ROW_COUNT;
  RETURN _n;
END;
$$;
COMMENT ON FUNCTION fn_mark_closing_soon() IS
  'Sets application_status = closing_soon for posts with ≤7 days left. Schedule: nightly (run before fn_auto_close_applications).';

-- ── Quarterly partition creator ────────────────────────────────
-- Call at the start of each quarter with the new year/quarter values.
CREATE OR REPLACE FUNCTION fn_create_quarterly_partitions(
  p_year INT,
  p_quarter INT   -- 1, 2, 3, or 4
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _start DATE;
  _end   DATE;
  _suffix TEXT;
BEGIN
  _start  := DATE(p_year || '-' || ((p_quarter - 1) * 3 + 1)::TEXT || '-01');
  _end    := _start + INTERVAL '3 months';
  _suffix := p_year::TEXT || '_q' || p_quarter::TEXT;

  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS post_views_%s PARTITION OF post_views FOR VALUES FROM (%L) TO (%L)',
    _suffix, _start, _end
  );
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS ad_events_%s PARTITION OF ad_events FOR VALUES FROM (%L) TO (%L)',
    _suffix, _start, _end
  );
END;
$$;
COMMENT ON FUNCTION fn_create_quarterly_partitions(INT, INT) IS
  'Creates post_views_YYYY_qN and ad_events_YYYY_qN partitions for the given quarter.
   Call at start of each quarter: SELECT fn_create_quarterly_partitions(2027, 1);';

-- ── QUERY REFERENCE ────────────────────────────────────────────
--
-- Full-text search (simple config — works for Hindi transliteration):
--   SELECT * FROM v_published_posts
--   WHERE  search_vector @@ plainto_tsquery('simple','ssc cgl 2025')
--   ORDER BY ts_rank(search_vector, plainto_tsquery('simple','ssc cgl 2025')) DESC
--   LIMIT 20;
--
-- Trigram / autocomplete (uses idx_posts_title_trgm):
--   SELECT id, title, slug FROM posts
--   WHERE  title_lower ILIKE '%ssc%' AND status = 'published'
--   ORDER BY view_count DESC LIMIT 10;
--
-- Published listing (uses idx_posts_type_pub):
--   SELECT * FROM v_published_posts
--   WHERE  type = 'job'
--   ORDER BY published_at DESC LIMIT 20;
--
-- Open jobs by state:
--   SELECT * FROM v_published_posts
--   WHERE  type = 'job' AND state_slug = 'uttar-pradesh'
--     AND  application_status = 'open'
--   ORDER BY published_at DESC LIMIT 20;
--
-- Trending:
--   SELECT * FROM v_trending_posts ORDER BY views_7d DESC LIMIT 10;
--
-- SEO audit worst-first:
--   SELECT * FROM v_seo_audit ORDER BY seo_score ASC, word_count ASC LIMIT 50;
--
-- Ad server (weighted selection):
--   SELECT * FROM v_active_ads
--   WHERE  zone_slug = 'sidebar-top'
--   ORDER BY weight DESC, random() LIMIT 1;
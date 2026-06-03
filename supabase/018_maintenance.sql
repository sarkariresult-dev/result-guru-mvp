-- ═══════════════════════════════════════════════════════════════
-- 018_maintenance.sql - Result Guru
-- Scheduled maintenance functions. Call via pg_cron or an
-- external scheduler (GitHub Actions, Inngest, etc.).
--
-- MAINTENANCE SCHEDULE
-- ────────────────────
-- Nightly  : SELECT fn_aggregate_ad_stats();
-- Nightly  : SELECT fn_auto_expire_ads();
-- Nightly  : SELECT fn_auto_close_applications();
-- Weekly   : SELECT fn_purge_old_ad_events(90);
-- Monthly  : SELECT fn_purge_old_ad_events(90);
-- Quarterly: CREATE new ad_events_YYYY_qN partitions
-- ═══════════════════════════════════════════════════════════════



-- ── Record Duration RPC ──────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_record_post_duration(
  p_post_id          UUID,
  p_duration_seconds INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE posts
  SET total_time_on_page = COALESCE(total_time_on_page, 0) + p_duration_seconds
  WHERE id = p_post_id;
END;
$$;
COMMENT ON FUNCTION fn_record_post_duration(UUID, INT) IS
  'SECURITY DEFINER: records reading duration for a post. Increments total_time_on_page.';

-- ── Nightly ad stats rollup ───────────────────────────────────
-- Idempotent: safe to re-run for the same date without double-counting.
-- Running totals are recomputed from ad_stats_daily (not incremented).
-- ── 2. Ad Stats Rollup ──────────────────────────────────────
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
  --    This is idempotent - re-running for the same date won't double-count.
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
REVOKE EXECUTE ON FUNCTION fn_aggregate_ad_stats(DATE) FROM anon, authenticated;

-- ── Purge raw ad events ───────────────────────────────────────
-- ── 3. Data Retention: Ad Events ────────────────────────────
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
REVOKE EXECUTE ON FUNCTION fn_purge_old_ad_events(INT) FROM anon, authenticated;

-- ── Auto-expire ads and campaigns ─────────────────────────────
-- ── 4. Ad Status Management ──────────────────────────────────
CREATE OR REPLACE FUNCTION fn_auto_expire_ads()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Expire ads that have passed their ends_at
  UPDATE ads
  SET    status = 'expired'
  WHERE  status = 'active'
    AND  ends_at < NOW();

  -- 2. Expire campaigns that have passed their end_date
  UPDATE ad_campaigns
  SET    status = 'expired'
  WHERE  status = 'active'
    AND  end_date < CURRENT_DATE;

  -- 3. Mark ads as active if they have reached their starts_at
  --    (Only if currently in draft/paused and within valid window)
  UPDATE ads
  SET    status = 'active'
  WHERE  status IN ('draft', 'paused')
    AND  starts_at <= NOW()
    AND  (ends_at IS NULL OR ends_at > NOW());
END;
$$;
COMMENT ON FUNCTION fn_auto_expire_ads() IS
  'Automatically updates ad and campaign statuses based on current date/time. Schedule: hourly or nightly.';
REVOKE EXECUTE ON FUNCTION fn_auto_expire_ads() FROM anon, authenticated;



-- NOTE: fn_auto_close_applications and fn_mark_closing_soon are DEPRECATED.
-- Application status is now dynamically calculated in views based on dates.

-- ── Quarterly partition creator ────────────────────────────────
-- Call at the start of each quarter with the new year/quarter values.
-- ── 5. Dynamic Partition Management ─────────────────────────
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
    'CREATE TABLE IF NOT EXISTS ad_events_%s PARTITION OF ad_events FOR VALUES FROM (%L) TO (%L)',
    _suffix, _start, _end
  );
  EXECUTE format('ALTER TABLE ad_events_%s ENABLE ROW LEVEL SECURITY', _suffix);
END;
$$;
COMMENT ON FUNCTION fn_create_quarterly_partitions(INT, INT) IS
  'Creates ad_events_YYYY_qN partitions for the given quarter.
   Call at start of each quarter: SELECT fn_create_quarterly_partitions(2027, 1);';
REVOKE EXECUTE ON FUNCTION fn_create_quarterly_partitions(INT, INT) FROM anon, authenticated;

-- ── QUERY REFERENCE ────────────────────────────────────────────
--
-- Full-text search (simple config - works for Hindi transliteration):
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

-- SEO audit worst-first:
--   SELECT * FROM v_seo_audit ORDER BY seo_score ASC, word_count ASC LIMIT 50;
--
-- Ad server (weighted selection):
--   SELECT * FROM v_active_ads
--   WHERE  zone_slug = 'sidebar-top'
--   ORDER BY weight DESC, random() LIMIT 1;
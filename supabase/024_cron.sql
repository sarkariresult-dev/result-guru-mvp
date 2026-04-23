-- ═══════════════════════════════════════════════════════════════
-- 024_cron.sql - Result Guru
-- Scheduled jobs via pg_cron.
-- Wraps all job registrations in a single DO block for safety.
-- ═══════════════════════════════════════════════════════════════

DO $$
-- ── 1. pg_cron Job Registrations ────────────────────────────
BEGIN
  -- Unschedule existing jobs first (wrapped in exception handlers for fresh DBs)
  BEGIN PERFORM cron.unschedule('aggregate_ad_stats');       EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM cron.unschedule('auto_close_applications');  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM cron.unschedule('mark_closing_soon');        EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM cron.unschedule('purge_old_ad_events');      EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM cron.unschedule('purge_old_post_views');     EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM cron.unschedule('refresh_trending');         EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM cron.unschedule('ensure_partitions');        EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN PERFORM cron.unschedule('purge_search_queries');     EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Nightly jobs
  PERFORM cron.schedule('aggregate_ad_stats', '0 2 * * *', 'SELECT fn_aggregate_ad_stats()');

  -- Materialized view refresh (every 15 minutes)
  PERFORM cron.schedule('refresh_trending', '*/15 * * * *', 'SELECT fn_refresh_trending()');

  -- Weekly / Monthly cleanup jobs
  PERFORM cron.schedule('purge_old_ad_events',   '0 4 * * 0', 'SELECT fn_purge_old_ad_events(90)');
  PERFORM cron.schedule('purge_old_post_views',  '0 5 1 * *', 'SELECT fn_purge_old_post_views(365)');
  PERFORM cron.schedule('purge_search_queries',  '0 3 * * 0', 'SELECT fn_purge_old_search_queries(90)');

  -- Quarterly partition creation (1st of Jan, Apr, Jul, Oct at midnight)
  PERFORM cron.schedule('ensure_partitions', '0 0 1 1,4,7,10 *', 'SELECT fn_ensure_future_partitions()');

END $$;

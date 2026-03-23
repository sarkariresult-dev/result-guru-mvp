-- ═══════════════════════════════════════════════════════════════
-- 024_cron.sql - Result Guru
-- Scheduled jobs via pg_cron.
-- Wraps all job registrations in a single DO block for safety.
-- ═══════════════════════════════════════════════════════════════

DO $$
-- ── 1. pg_cron Job Registrations ────────────────────────────
BEGIN
  -- Unschedule all existing jobs first to ensure a clean slate
  PERFORM cron.unschedule('aggregate_ad_stats');
  PERFORM cron.unschedule('auto_close_applications');
  PERFORM cron.unschedule('mark_closing_soon');
  PERFORM cron.unschedule('purge_old_ad_events');
  PERFORM cron.unschedule('purge_old_post_views');

  -- Nightly jobs
  PERFORM cron.schedule('aggregate_ad_stats',      '0 2 * * *', 'SELECT fn_aggregate_ad_stats()');

  -- Weekly / Monthly cleanup jobs
  PERFORM cron.schedule('purge_old_ad_events',   '0 4 * * 0', 'SELECT fn_purge_old_ad_events(90)');
  PERFORM cron.schedule('purge_old_post_views',  '0 5 1 * *', 'SELECT fn_purge_old_post_views(365)');

END $$;

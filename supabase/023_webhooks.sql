-- ═══════════════════════════════════════════════════════════════
-- 023_webhooks.sql - Result Guru
-- Trigger to send a webhook to Next.js /api/revalidate when posts change.
-- Needs `pg_net` extension enabled on Supabase.
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA public;

-- ── 1. Next.js Revalidation Webhook ─────────────────────────
CREATE OR REPLACE FUNCTION trigger_revalidate_posts()
RETURNS TRIGGER AS $$
DECLARE
  app_url TEXT := current_setting('app.settings.url', true);
  revalidate_secret TEXT := current_setting('app.settings.revalidate_secret', true);
  payload JSONB;
BEGIN
  IF app_url IS NULL OR revalidate_secret IS NULL THEN
    RAISE LOG 'Net trigger skipped: app.settings.url or app.settings.revalidate_secret is not set.';
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'secret', revalidate_secret,
    'tag', 'posts'
  );

  PERFORM net.http_post(
    url := app_url || '/api/revalidate',
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_revalidate_posts ON posts;

CREATE TRIGGER trg_revalidate_posts
  AFTER INSERT OR UPDATE OF title, slug, status, application_start_date, application_end_date, published_at
  OR DELETE
  ON posts
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_revalidate_posts();

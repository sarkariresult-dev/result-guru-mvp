-- ═══════════════════════════════════════════════════════════════
-- 023_webhooks.sql — Result Guru
-- Trigger to send a webhook to Next.js /api/revalidate when posts change.
-- Needs `pg_net` extension enabled on Supabase.
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA public;

CREATE OR REPLACE FUNCTION trigger_revalidate_posts()
RETURNS TRIGGER AS $$
DECLARE
  app_url TEXT := current_setting('app.settings.url', true);
  revalidate_secret TEXT := current_setting('app.settings.revalidate_secret', true);
  payload JSONB;
BEGIN
  -- If settings are not configured, do nothing
  IF app_url IS NULL OR revalidate_secret IS NULL THEN
    RAISE LOG 'Net trigger skipped: app.settings.url or app.settings.revalidate_secret is not set.';
    RETURN NEW;
  END IF;

  -- Create JSON payload {"secret": "...", "tag": "posts"}
  payload := jsonb_build_object(
    'secret', revalidate_secret,
    'tag', 'posts'
  );

  -- Call the Next.js API endpoint securely using pg_net
  PERFORM net.http_post(
    url := app_url || '/api/revalidate',
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it already exists
DROP TRIGGER IF EXISTS trg_revalidate_posts ON posts;

-- Create the trigger on the posts table
CREATE TRIGGER trg_revalidate_posts
  AFTER INSERT OR UPDATE OF title, slug, status, application_status, published_at
  OR DELETE
  ON posts
  FOR EACH STATEMENT  -- Using statement level so it only triggers once per bulk action
  EXECUTE FUNCTION trigger_revalidate_posts();

-- ────────────────────────────────────────────────────────────
-- DEPLOYMENT INSTRUCTIONS:
-- After running this SQL script, you MUST run these two commands
-- in your Supabase SQL Editor to set the required env variables:
--
-- ALTER DATABASE postgres SET "app.settings.url" TO 'https://resultguru.co.in';
-- ALTER DATABASE postgres SET "app.settings.revalidate_secret" TO 'YOUR_REVALIDATE_SECRET';
-- ────────────────────────────────────────────────────────────

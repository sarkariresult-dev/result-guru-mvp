-- ═══════════════════════════════════════════════════════════════
-- 003_helper_functions.sql - Result Guru
-- Utility functions used globally across triggers and API.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Generic updated_at timestamp trigger ──────────────────
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
COMMENT ON FUNCTION fn_update_timestamp() IS
  'Sets updated_at = NOW() on every UPDATE. Attach to any table with an updated_at column.';

-- ── 2. Accent-insensitive wrapper ────────────────────────────
CREATE OR REPLACE FUNCTION stable_unaccent(txt TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE PARALLEL SAFE STRICT
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN unaccent(txt);
END;
$$;

-- ── 3. Strip HTML tags ───────────────────────────────────────
CREATE OR REPLACE FUNCTION strip_html(raw_html TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE PARALLEL SAFE STRICT
SET search_path = public
AS $$
BEGIN
  RETURN regexp_replace(
    regexp_replace(COALESCE(raw_html, ''), '<[^>]*>', ' ', 'g'),
    '\s+', ' ', 'g'
  );
END;
$$;

-- ── 4. Admin check ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   users
    WHERE  auth_user_id = auth.uid()
      AND  role         = 'admin'
  );
$$;

-- ── 5. Author-or-admin check ─────────────────────────────────
CREATE OR REPLACE FUNCTION fn_is_author_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   users
    WHERE  auth_user_id = auth.uid()
      AND  role IN ('admin', 'author')
  );
$$;

-- ── 6. Storage public URL builder ────────────────────────────
CREATE OR REPLACE FUNCTION storage_public_url(bucket TEXT, file_path TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    current_setting('app.settings.supabase_url', true)
    || '/storage/v1/object/public/'
    || bucket || '/' || file_path;
$$;
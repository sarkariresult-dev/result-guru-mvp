-- ═══════════════════════════════════════════════════════════════
-- 003_helper_functions.sql - Result Guru
-- Pure utility functions used by triggers and queries.
-- All are IMMUTABLE / STABLE so they are safe in indexes.
-- ═══════════════════════════════════════════════════════════════

-- ── Accent-insensitive wrapper ───────────────────────────────
-- unaccent() is STABLE not IMMUTABLE; wrapping it lets us call
-- it safely inside trigger bodies and index expressions.
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

COMMENT ON FUNCTION stable_unaccent(TEXT) IS
  'STABLE wrapper for unaccent(); safe in trigger bodies and query predicates.';

-- ── Strip HTML tags ──────────────────────────────────────────
-- Used by the word-count trigger to measure body text length.
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

COMMENT ON FUNCTION strip_html(TEXT) IS
  'Strips HTML tags and collapses whitespace. Used for word-count calculation in triggers.';

-- ── Admin check (bypasses RLS in security-definer contexts) ──
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

COMMENT ON FUNCTION fn_is_admin() IS
  'Returns TRUE when the calling Supabase auth user has role=admin in public.users.';

-- ── Author-or-admin check ────────────────────────────────────
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

COMMENT ON FUNCTION fn_is_author_or_admin() IS
  'Returns TRUE when the calling auth user has role admin or author.';

-- ── Storage public URL builder ───────────────────────────────
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

COMMENT ON FUNCTION storage_public_url(TEXT, TEXT) IS
  'Builds the public Supabase Storage URL for a given bucket + path.';
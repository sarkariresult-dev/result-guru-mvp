-- ═══════════════════════════════════════════════════════════════
-- 006_users.sql — Result Guru
-- CMS user accounts, mirroring Supabase Auth (auth.users).
-- Includes JWT role claims sync for zero-DB-query middleware.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Links to auth.users — NULL until the auth account is created
  auth_user_id  UUID        UNIQUE,
  email         TEXT        UNIQUE NOT NULL,
  name          TEXT        NOT NULL,
  avatar_url    TEXT,
  role          user_role   NOT NULL DEFAULT 'user',
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  -- Granular permission overrides (future use — role covers 99% of cases)
  permissions   JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE users IS
  'CMS admin / author accounts. auth_user_id maps to Supabase Auth.
   Row is auto-created by fn_handle_new_auth_user trigger.
   Role is synced to JWT app_metadata via fn_sync_role_to_claims.';


-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  JWT ROLE CLAIMS                                             ║
-- ║  Stores user_role in auth.users.raw_app_meta_data so the     ║
-- ║  proxy (middleware) can read role from the JWT token with     ║
-- ║  zero database queries.                                      ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ── Sync role to JWT claims on INSERT or role UPDATE ─────────
CREATE OR REPLACE FUNCTION fn_sync_role_to_claims()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.auth_user_id IS NOT NULL THEN
    UPDATE auth.users
    SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
                            || jsonb_build_object('user_role', NEW.role::TEXT)
    WHERE id = NEW.auth_user_id;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_sync_role_to_claims() IS
  'Syncs public.users.role → auth.users.raw_app_meta_data.user_role
   so the JWT token contains the role claim. Zero-cost reads in proxy.';

DROP TRIGGER IF EXISTS on_user_role_change ON users;
CREATE TRIGGER on_user_role_change
  AFTER INSERT OR UPDATE OF role
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION fn_sync_role_to_claims();

COMMENT ON TRIGGER on_user_role_change ON users IS
  'Fires after INSERT or role UPDATE to sync user_role into JWT claims.';


-- ── Auto-create public.users when Supabase Auth account is made ──
CREATE OR REPLACE FUNCTION fn_handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the public.users row (the on_user_role_change trigger
  -- will then sync the default 'user' role into JWT claims)
  INSERT INTO public.users (auth_user_id, email, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    'user'
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  -- Also set the claim directly on the auth user for immediate effect
  -- (guarantees the claim is present even if trigger order varies)
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
                          || '{"user_role": "user"}'::jsonb
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_handle_new_auth_user() IS
  'Inserts a public.users row when auth.users gets a new record,
   and sets the default user_role claim in the JWT.';

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION fn_handle_new_auth_user();
EXCEPTION WHEN duplicate_object THEN NULL; END$$;


-- ── Backfill: sync role claims for all existing users ────────
-- Safe to re-run; only updates rows where claim is missing or stale.
CREATE OR REPLACE FUNCTION fn_backfill_role_claims()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count BIGINT := 0;
BEGIN
  UPDATE auth.users au
  SET raw_app_meta_data = COALESCE(au.raw_app_meta_data, '{}'::jsonb)
                          || jsonb_build_object('user_role', u.role::TEXT)
  FROM public.users u
  WHERE u.auth_user_id = au.id
    AND (
      au.raw_app_meta_data ->> 'user_role' IS DISTINCT FROM u.role::TEXT
    );

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

COMMENT ON FUNCTION fn_backfill_role_claims() IS
  'One-time backfill: syncs user_role into JWT claims for all existing users.
   Safe to re-run. Returns number of rows updated.
   Usage: SELECT fn_backfill_role_claims();';

-- ── Sync last_login_at from auth.users on every sign-in ───────
CREATE OR REPLACE FUNCTION fn_handle_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the last session timestamp changed, sync it to the profile
  IF (TG_OP = 'UPDATE' AND NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at) 
     OR (TG_OP = 'INSERT' AND NEW.last_sign_in_at IS NOT NULL) THEN
    UPDATE public.users
    SET last_login_at = NEW.last_sign_in_at
    WHERE auth_user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_handle_user_login() IS
  'Syncs auth.users.last_sign_in_at → public.users.last_login_at on every login.';

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_login
    AFTER INSERT OR UPDATE OF last_sign_in_at
    ON auth.users
    FOR EACH ROW EXECUTE FUNCTION fn_handle_user_login();
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ═══════════════════════════════════════════════════════════════
-- 020_storage.sql — Result Guru
-- Supabase Storage buckets + RLS policies.
--
-- STORAGE STRATEGY
-- ────────────────
-- ✅ STORED HERE:
--    posts/       — featured images, notification PDFs, inline images
--    avatars/     — user profile pictures
--    organizations/ — org logos
--    site-assets/ — OG images, logos, favicon, PWA icons
--
-- ❌ NOT STORED (zero storage cost):
--    Syllabus     — posts of type='syllabus' with syllabus_sections JSONB;
--                   PDF generated client-side on demand (html2pdf.js).
--    Previous papers — stored as external URLs in previous_year_papers JSONB.
--    Answer keys  — external URL in answer_key_link column.
--    Admit cards  — external URL in admit_card_link column.
--    Results      — external URL in result_link column.
--    Org official link — organizations.official_url (external, never stored).
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- 1. BUCKETS
-- ────────────────────────────────────────────────────────────

-- Post media: images + notification PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts', 'posts', TRUE,
  5242880,  -- 5 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp',
    'image/gif', 'image/svg+xml',
    'application/pdf'
  ]
) ON CONFLICT (id) DO NOTHING;

-- User avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', TRUE,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Organization logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organizations', 'organizations', TRUE,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Static site assets (OG images, favicons, PWA icons, logo)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets', 'site-assets', TRUE,
  10485760, -- 10 MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml',
    'image/x-icon', 'image/vnd.microsoft.icon'
  ]
) ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 2. POLICIES — posts bucket
-- ────────────────────────────────────────────────────────────

CREATE POLICY "posts_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

-- Authors upload into their own UID folder: posts/{uid}/filename
CREATE POLICY "posts_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'posts'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Authors update / delete their own files; admins update any
CREATE POLICY "posts_auth_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'posts'
    AND auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR fn_is_admin()
    )
  );

CREATE POLICY "posts_auth_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'posts'
    AND auth.role() = 'authenticated'
    AND (
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR fn_is_admin()
    )
  );

-- ────────────────────────────────────────────────────────────
-- 3. POLICIES — avatars bucket
-- ────────────────────────────────────────────────────────────

CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users upload / manage only their own avatar: avatars/{uid}/...
CREATE POLICY "avatars_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars_auth_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars_auth_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ────────────────────────────────────────────────────────────
-- 4. POLICIES — organizations bucket (admin-only write)
-- ────────────────────────────────────────────────────────────

CREATE POLICY "orgs_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'organizations');

CREATE POLICY "orgs_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'organizations' AND fn_is_admin());

CREATE POLICY "orgs_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'organizations' AND fn_is_admin());

CREATE POLICY "orgs_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'organizations' AND fn_is_admin());

-- ────────────────────────────────────────────────────────────
-- 5. POLICIES — site-assets bucket (admin-only write)
-- ────────────────────────────────────────────────────────────

CREATE POLICY "site_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "site_assets_admin_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND fn_is_admin());

CREATE POLICY "site_assets_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND fn_is_admin());

CREATE POLICY "site_assets_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND fn_is_admin());

-- ────────────────────────────────────────────────────────────
-- FOLDER CONVENTION (for reference — enforced by app layer)
-- ────────────────────────────────────────────────────────────
--
-- posts/{auth_user_id}/{post_slug}/featured.webp
-- posts/{auth_user_id}/{post_slug}/notification.pdf
-- posts/{auth_user_id}/{post_slug}/inline-{uuid}.webp
--
-- avatars/{auth_user_id}/avatar.webp
--
-- organizations/{org_slug}/logo.webp
-- organizations/{org_slug}/logo.svg
--
-- site-assets/og/og-default.png
-- site-assets/og/og-{page}.png
-- site-assets/icons/favicon-32x32.png
-- site-assets/icons/apple-touch-icon.png
-- site-assets/logos/logo-light.svg
-- site-assets/logos/logo-dark.svg
--
-- PUBLIC URL PATTERN (via storage_public_url() function):
--   {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
-- ════════════════════════════════════════════════════════════
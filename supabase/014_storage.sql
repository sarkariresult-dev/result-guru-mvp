-- ═══════════════════════════════════════════════════════════════
-- 014_storage.sql - Result Guru
-- Supabase Storage buckets + RLS policies.
-- ═══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts', 'posts', TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', TRUE,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organizations', 'organizations', TRUE,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets', 'site-assets', TRUE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories', 'stories', TRUE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ── 2. Access Control Policies ──────────────────────────────
-- Posts Bucket
DROP POLICY IF EXISTS "posts_public_read" ON storage.objects;
CREATE POLICY "posts_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
DROP POLICY IF EXISTS "posts_auth_upload" ON storage.objects;
CREATE POLICY "posts_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS "posts_auth_update" ON storage.objects;
CREATE POLICY "posts_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'posts' AND auth.role() = 'authenticated' AND ((storage.foldername(name))[1] = auth.uid()::TEXT OR fn_is_admin()));
DROP POLICY IF EXISTS "posts_auth_delete" ON storage.objects;
CREATE POLICY "posts_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'posts' AND auth.role() = 'authenticated' AND ((storage.foldername(name))[1] = auth.uid()::TEXT OR fn_is_admin()));

DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "avatars_auth_upload" ON storage.objects;
CREATE POLICY "avatars_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS "avatars_auth_update" ON storage.objects;
CREATE POLICY "avatars_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
DROP POLICY IF EXISTS "avatars_auth_delete" ON storage.objects;
CREATE POLICY "avatars_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

DROP POLICY IF EXISTS "orgs_public_read" ON storage.objects;
CREATE POLICY "orgs_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'organizations');
DROP POLICY IF EXISTS "orgs_admin_upload" ON storage.objects;
CREATE POLICY "orgs_admin_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'organizations' AND fn_is_admin());
DROP POLICY IF EXISTS "orgs_admin_update" ON storage.objects;
CREATE POLICY "orgs_admin_update" ON storage.objects FOR UPDATE USING (bucket_id = 'organizations' AND fn_is_admin());
DROP POLICY IF EXISTS "orgs_admin_delete" ON storage.objects;
CREATE POLICY "orgs_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'organizations' AND fn_is_admin());

DROP POLICY IF EXISTS "site_assets_public_read" ON storage.objects;
CREATE POLICY "site_assets_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
DROP POLICY IF EXISTS "site_assets_admin_upload" ON storage.objects;
CREATE POLICY "site_assets_admin_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND fn_is_admin());
DROP POLICY IF EXISTS "site_assets_admin_update" ON storage.objects;
CREATE POLICY "site_assets_admin_update" ON storage.objects FOR UPDATE USING (bucket_id = 'site-assets' AND fn_is_admin());
DROP POLICY IF EXISTS "site_assets_admin_delete" ON storage.objects;
CREATE POLICY "site_assets_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'site-assets' AND fn_is_admin());

DROP POLICY IF EXISTS "stories_public_read" ON storage.objects;
CREATE POLICY "stories_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'stories');
DROP POLICY IF EXISTS "stories_auth_upload" ON storage.objects;
CREATE POLICY "stories_auth_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'stories' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] LIKE 'author-%');
DROP POLICY IF EXISTS "stories_auth_update" ON storage.objects;
CREATE POLICY "stories_auth_update" ON storage.objects FOR UPDATE USING (bucket_id = 'stories' AND auth.role() = 'authenticated' AND ((storage.foldername(name))[1] LIKE 'author-%' OR fn_is_admin()));
DROP POLICY IF EXISTS "stories_auth_delete" ON storage.objects;
CREATE POLICY "stories_auth_delete" ON storage.objects FOR DELETE USING (bucket_id = 'stories' AND auth.role() = 'authenticated' AND ((storage.foldername(name))[1] LIKE 'author-%' OR fn_is_admin()));

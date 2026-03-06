-- ═══════════════════════════════════════════════════════════════
-- 016_rls.sql — Result Guru
-- Row Level Security (RLS) policies.
-- Principle of least privilege: anon gets read-only on public
-- data; authors manage their own content; admins manage all.
-- ═══════════════════════════════════════════════════════════════

-- ── Enable RLS on all tables ──────────────────────────────────
ALTER TABLE posts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags               ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_qualifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_internal_links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views              ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_campaigns            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_stats_daily          ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_affiliate_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE media                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_templates        ENABLE ROW LEVEL SECURITY;
-- Reference tables (taxonomy)
ALTER TABLE tags                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE states                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations           ENABLE ROW LEVEL SECURITY;

-- ── Helper macro: service_role bypass ────────────────────────
-- All tables have a service_role full-access policy so Edge
-- Functions and server-side jobs can always operate freely.

-- ────────────────────────────────────────────────────────────
-- REFERENCE TABLES — public read, admin write
-- ────────────────────────────────────────────────────────────

CREATE POLICY "ref_public_read" ON tags           FOR SELECT USING (TRUE);
CREATE POLICY "ref_public_read" ON states         FOR SELECT USING (TRUE);
CREATE POLICY "ref_public_read" ON categories     FOR SELECT USING (TRUE);
CREATE POLICY "ref_public_read" ON qualifications FOR SELECT USING (TRUE);
CREATE POLICY "ref_public_read" ON organizations  FOR SELECT USING (TRUE);

CREATE POLICY "ref_admin_write" ON tags           FOR ALL USING (fn_is_admin());
CREATE POLICY "ref_admin_write" ON states         FOR ALL USING (fn_is_admin());
CREATE POLICY "ref_admin_write" ON categories     FOR ALL USING (fn_is_admin());
CREATE POLICY "ref_admin_write" ON qualifications FOR ALL USING (fn_is_admin());
CREATE POLICY "ref_admin_write" ON organizations  FOR ALL USING (fn_is_admin());

CREATE POLICY "ref_service_role" ON tags           FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "ref_service_role" ON states         FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "ref_service_role" ON categories     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "ref_service_role" ON qualifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "ref_service_role" ON organizations  FOR ALL USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- POSTS
-- ────────────────────────────────────────────────────────────

-- Anyone can read published posts (noindex controls search-engine meta tag, not page access).
-- Noindex pages must still render to users; exclude them only from sitemaps.
CREATE POLICY "posts_public_read"
  ON posts FOR SELECT
  USING (status = 'published');

-- Authors / admins can read ALL posts (including drafts)
CREATE POLICY "posts_staff_read"
  ON posts FOR SELECT
  USING (fn_is_author_or_admin());

-- Authors can create posts
CREATE POLICY "posts_author_insert"
  ON posts FOR INSERT
  WITH CHECK (fn_is_author_or_admin());

-- Authors update their own posts; admins update any post
CREATE POLICY "posts_author_update"
  ON posts FOR UPDATE
  USING (
    author_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    OR fn_is_admin()
  );

-- Authors delete their own posts; admins delete any post
CREATE POLICY "posts_author_delete"
  ON posts FOR DELETE
  USING (
    author_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
    OR fn_is_admin()
  );

CREATE POLICY "posts_service_role"
  ON posts FOR ALL USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- POST JUNCTION TABLES
-- ────────────────────────────────────────────────────────────

CREATE POLICY "post_tags_public_read"    ON post_tags            FOR SELECT USING (TRUE);
CREATE POLICY "post_tags_staff_write"    ON post_tags            FOR ALL    USING (fn_is_author_or_admin());
CREATE POLICY "post_tags_service"        ON post_tags            FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "post_quals_public_read"   ON post_qualifications  FOR SELECT USING (TRUE);
CREATE POLICY "post_quals_staff_write"   ON post_qualifications  FOR ALL    USING (fn_is_author_or_admin());
CREATE POLICY "post_quals_service"       ON post_qualifications  FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "int_links_public_read"    ON post_internal_links  FOR SELECT USING (TRUE);
CREATE POLICY "int_links_staff_write"    ON post_internal_links  FOR ALL    USING (fn_is_author_or_admin());
CREATE POLICY "int_links_service"        ON post_internal_links  FOR ALL    USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- USERS
-- ────────────────────────────────────────────────────────────

CREATE POLICY "users_read_own"      ON users FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "users_admin_read"    ON users FOR SELECT USING (fn_is_admin());
CREATE POLICY "users_update_own"    ON users FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "users_admin_update"  ON users FOR UPDATE USING (fn_is_admin());
CREATE POLICY "users_insert_any"    ON users FOR INSERT WITH CHECK (TRUE);  -- fn_handle_new_auth_user
CREATE POLICY "users_service"       ON users FOR ALL   USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- PAGE VIEWS — insert-only for anon
-- ────────────────────────────────────────────────────────────

CREATE POLICY "post_views_anon_insert"   ON post_views FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "post_views_service_read"  ON post_views FOR SELECT USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- ADVERTISING
-- ────────────────────────────────────────────────────────────

CREATE POLICY "ads_public_read"        ON ads           FOR SELECT USING (status = 'active');
CREATE POLICY "ads_service"            ON ads           FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "campaigns_service"      ON ad_campaigns  FOR ALL    USING (auth.role() = 'service_role');

-- Anon can fire events (impression / click tracking)
CREATE POLICY "ad_events_anon_insert"  ON ad_events     FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "ad_events_service_read" ON ad_events     FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "ad_stats_service"       ON ad_stats_daily FOR ALL   USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- AFFILIATE
-- ────────────────────────────────────────────────────────────

CREATE POLICY "aff_products_public_read"
  ON affiliate_products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "aff_products_service"
  ON affiliate_products FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "post_aff_public_read"
  ON post_affiliate_products FOR SELECT USING (TRUE);
CREATE POLICY "post_aff_service"
  ON post_affiliate_products FOR ALL USING (auth.role() = 'service_role');

-- Anon can record clicks
CREATE POLICY "aff_clicks_anon_insert"
  ON affiliate_clicks FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "aff_clicks_service_read"
  ON affiliate_clicks FOR SELECT USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- SUBSCRIBERS
-- ────────────────────────────────────────────────────────────

-- Anyone can subscribe
CREATE POLICY "subscribers_anon_insert"
  ON subscribers FOR INSERT WITH CHECK (TRUE);
-- Unsubscribe via token is handled securely on the server-side
-- via the Service Role Key bypassing RLS completely.
CREATE POLICY "subscribers_service"
  ON subscribers FOR ALL USING (auth.role() = 'service_role');

-- ────────────────────────────────────────────────────────────
-- MEDIA / SCHEMA TEMPLATES / TOPICS / BROADCASTS
-- ────────────────────────────────────────────────────────────

CREATE POLICY "media_public_read"    ON media            FOR SELECT USING (TRUE);
CREATE POLICY "media_service"        ON media            FOR ALL    USING (auth.role() = 'service_role');
CREATE POLICY "media_staff_write"    ON media            FOR ALL    USING (fn_is_author_or_admin());

CREATE POLICY "schema_tpl_pub_read"  ON schema_templates FOR SELECT USING (is_active = TRUE);
CREATE POLICY "schema_tpl_service"   ON schema_templates FOR ALL    USING (auth.role() = 'service_role');

CREATE POLICY "topics_service"       ON topics           FOR ALL    USING (auth.role() = 'service_role');
CREATE POLICY "topics_admin"         ON topics           FOR ALL    USING (fn_is_admin());

CREATE POLICY "broadcasts_service"   ON broadcasts       FOR ALL    USING (auth.role() = 'service_role');
CREATE POLICY "broadcasts_admin"     ON broadcasts       FOR ALL    USING (fn_is_admin());
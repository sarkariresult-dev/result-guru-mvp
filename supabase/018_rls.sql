-- ═══════════════════════════════════════════════════════════════
-- 018_rls.sql - Result Guru
-- Row Level Security (RLS) policies.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Enable RLS on all tables ─────────────────────────────
ALTER TABLE posts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags               ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_qualifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_internal_links     ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views              ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                   ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE tags                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE states                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations           ENABLE ROW LEVEL SECURITY;

ALTER TABLE ad_zones                ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_networks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_rules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitemap_config          ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_stories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_story_slides        ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN ALTER TABLE topics ENABLE ROW LEVEL SECURITY; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- ── 2. Reference Tables (States, Orgs, etc.) ───────────────
-- Public Read, Admin Write
DROP POLICY IF EXISTS "ref_public_read" ON tags;
CREATE POLICY "ref_public_read" ON tags           FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "ref_public_read" ON states;
CREATE POLICY "ref_public_read" ON states         FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "ref_public_read" ON categories;
CREATE POLICY "ref_public_read" ON categories     FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "ref_public_read" ON qualifications;
CREATE POLICY "ref_public_read" ON qualifications FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "ref_public_read" ON organizations;
CREATE POLICY "ref_public_read" ON organizations  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "ref_public_read" ON ad_zones;
CREATE POLICY "ref_public_read" ON ad_zones       FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "ref_public_read" ON affiliate_networks;
CREATE POLICY "ref_public_read" ON affiliate_networks FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "ref_admin_write" ON tags;
CREATE POLICY "ref_admin_write" ON tags           FOR ALL USING (fn_is_admin());
DROP POLICY IF EXISTS "ref_admin_write" ON states;
CREATE POLICY "ref_admin_write" ON states         FOR ALL USING (fn_is_admin());
DROP POLICY IF EXISTS "ref_admin_write" ON categories;
CREATE POLICY "ref_admin_write" ON categories     FOR ALL USING (fn_is_admin());
DROP POLICY IF EXISTS "ref_admin_write" ON qualifications;
CREATE POLICY "ref_admin_write" ON qualifications FOR ALL USING (fn_is_admin());
DROP POLICY IF EXISTS "ref_admin_write" ON organizations;
CREATE POLICY "ref_admin_write" ON organizations  FOR ALL USING (fn_is_admin());
DROP POLICY IF EXISTS "ref_admin_write" ON ad_zones;
CREATE POLICY "ref_admin_write" ON ad_zones       FOR ALL USING (fn_is_admin());
DROP POLICY IF EXISTS "ref_admin_write" ON affiliate_networks;
CREATE POLICY "ref_admin_write" ON affiliate_networks FOR ALL USING (fn_is_admin());

-- ── 3. SEO & Redirects ──────────────────────────────────────
DROP POLICY IF EXISTS "seo_settings_public_read" ON seo_settings;
CREATE POLICY "seo_settings_public_read" ON seo_settings FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "seo_settings_admin_write" ON seo_settings;
CREATE POLICY "seo_settings_admin_write" ON seo_settings FOR ALL USING (fn_is_admin());

DROP POLICY IF EXISTS "sitemap_public_read" ON sitemap_config;
CREATE POLICY "sitemap_public_read" ON sitemap_config FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "sitemap_admin_write" ON sitemap_config;
CREATE POLICY "sitemap_admin_write" ON sitemap_config FOR ALL USING (fn_is_admin());

DROP POLICY IF EXISTS "redirects_public_read" ON redirects;
CREATE POLICY "redirects_public_read" ON redirects FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "redirects_admin_write" ON redirects;
CREATE POLICY "redirects_admin_write" ON redirects FOR ALL USING (fn_is_admin());

DROP POLICY IF EXISTS "advertisers_admin" ON advertisers;
CREATE POLICY "advertisers_admin" ON advertisers FOR ALL USING (fn_is_admin());
DROP POLICY IF EXISTS "affiliate_rules_admin" ON affiliate_rules;
CREATE POLICY "affiliate_rules_admin" ON affiliate_rules FOR ALL USING (fn_is_admin());
DROP POLICY IF EXISTS "search_queries_anon_insert" ON search_queries;
CREATE POLICY "search_queries_anon_insert"  ON search_queries FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "search_queries_service_read" ON search_queries;
CREATE POLICY "search_queries_service_read" ON search_queries FOR SELECT USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "search_queries_admin_read" ON search_queries;
CREATE POLICY "search_queries_admin_read" ON search_queries FOR SELECT USING (fn_is_admin());

-- ── 4. Posts & Core Content ─────────────────────────────────
DROP POLICY IF EXISTS "posts_public_read" ON posts;
CREATE POLICY "posts_public_read" ON posts FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "posts_staff_read" ON posts;
CREATE POLICY "posts_staff_read" ON posts FOR SELECT USING (fn_is_author_or_admin());
DROP POLICY IF EXISTS "posts_author_insert" ON posts;
CREATE POLICY "posts_author_insert" ON posts FOR INSERT WITH CHECK (fn_is_author_or_admin());
DROP POLICY IF EXISTS "posts_author_update" ON posts;
CREATE POLICY "posts_author_update" ON posts FOR UPDATE USING (author_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR fn_is_admin());
DROP POLICY IF EXISTS "posts_author_delete" ON posts;
CREATE POLICY "posts_author_delete" ON posts FOR DELETE USING (author_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR fn_is_admin());
DROP POLICY IF EXISTS "posts_service_role" ON posts;
CREATE POLICY "posts_service_role" ON posts FOR ALL USING (auth.role() = 'service_role');

-- ── 5. Web Stories ──────────────────────────────────────────
DROP POLICY IF EXISTS "web_stories_public_read" ON web_stories;
CREATE POLICY "web_stories_public_read" ON web_stories FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "web_stories_staff_read" ON web_stories;
CREATE POLICY "web_stories_staff_read" ON web_stories FOR SELECT USING (fn_is_author_or_admin());
DROP POLICY IF EXISTS "web_stories_author_insert" ON web_stories;
CREATE POLICY "web_stories_author_insert" ON web_stories FOR INSERT WITH CHECK (fn_is_author_or_admin());
DROP POLICY IF EXISTS "web_stories_author_update" ON web_stories;
CREATE POLICY "web_stories_author_update" ON web_stories FOR UPDATE USING (author_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR fn_is_admin());
DROP POLICY IF EXISTS "web_stories_author_delete" ON web_stories;
CREATE POLICY "web_stories_author_delete" ON web_stories FOR DELETE USING (author_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR fn_is_admin());
DROP POLICY IF EXISTS "web_stories_service_role" ON web_stories;
CREATE POLICY "web_stories_service_role" ON web_stories FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "web_story_slides_public_read" ON web_story_slides;
CREATE POLICY "web_story_slides_public_read" ON web_story_slides FOR SELECT USING (EXISTS (SELECT 1 FROM web_stories WHERE web_stories.id = web_story_slides.story_id AND web_stories.status = 'published'));
DROP POLICY IF EXISTS "web_story_slides_staff_write" ON web_story_slides;
CREATE POLICY "web_story_slides_staff_write" ON web_story_slides FOR ALL USING (fn_is_author_or_admin());
DROP POLICY IF EXISTS "web_story_slides_service" ON web_story_slides;
CREATE POLICY "web_story_slides_service" ON web_story_slides FOR ALL USING (auth.role() = 'service_role');

-- Post Junctions
DROP POLICY IF EXISTS "post_tags_public_read" ON post_tags;
CREATE POLICY "post_tags_public_read"    ON post_tags            FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "post_tags_staff_write" ON post_tags;
CREATE POLICY "post_tags_staff_write"    ON post_tags            FOR ALL    USING (fn_is_author_or_admin());
DROP POLICY IF EXISTS "post_tags_service" ON post_tags;
CREATE POLICY "post_tags_service"        ON post_tags            FOR ALL    USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "post_quals_public_read" ON post_qualifications;
CREATE POLICY "post_quals_public_read"   ON post_qualifications  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "post_quals_staff_write" ON post_qualifications;
CREATE POLICY "post_quals_staff_write"   ON post_qualifications  FOR ALL    USING (fn_is_author_or_admin());
DROP POLICY IF EXISTS "post_quals_service" ON post_qualifications;
CREATE POLICY "post_quals_service"       ON post_qualifications  FOR ALL    USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "int_links_public_read" ON post_internal_links;
CREATE POLICY "int_links_public_read"    ON post_internal_links  FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "int_links_staff_write" ON post_internal_links;
CREATE POLICY "int_links_staff_write"    ON post_internal_links  FOR ALL    USING (fn_is_author_or_admin());
DROP POLICY IF EXISTS "int_links_service" ON post_internal_links;
CREATE POLICY "int_links_service"        ON post_internal_links  FOR ALL    USING (auth.role() = 'service_role');

-- ── 6. Users & Auth ─────────────────────────────────────────
DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own"      ON users FOR SELECT USING (auth.uid() = auth_user_id);
DROP POLICY IF EXISTS "users_admin_read" ON users;
CREATE POLICY "users_admin_read"    ON users FOR SELECT USING (fn_is_admin());
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own"    ON users FOR UPDATE USING (auth.uid() = auth_user_id);
DROP POLICY IF EXISTS "users_admin_update" ON users;
CREATE POLICY "users_admin_update"  ON users FOR UPDATE USING (fn_is_admin());
DROP POLICY IF EXISTS "users_insert_any" ON users;
CREATE POLICY "users_insert_any"    ON users FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "users_service" ON users;
CREATE POLICY "users_service"       ON users FOR ALL   USING (auth.role() = 'service_role');

-- Page Views
DROP POLICY IF EXISTS "post_views_anon_insert" ON post_views;
CREATE POLICY "post_views_anon_insert"   ON post_views FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "post_views_service_read" ON post_views;
CREATE POLICY "post_views_service_read"  ON post_views FOR SELECT USING (auth.role() = 'service_role');

-- ── 7. Advertising & Analytics ──────────────────────────────
DROP POLICY IF EXISTS "ads_public_read" ON ads;
CREATE POLICY "ads_public_read"        ON ads           FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "ads_service" ON ads;
CREATE POLICY "ads_service"            ON ads           FOR ALL    USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "campaigns_service" ON ad_campaigns;
CREATE POLICY "campaigns_service"      ON ad_campaigns  FOR ALL    USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "ad_events_anon_insert" ON ad_events;
CREATE POLICY "ad_events_anon_insert"  ON ad_events     FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "ad_events_service_read" ON ad_events;
CREATE POLICY "ad_events_service_read" ON ad_events     FOR SELECT USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "ad_stats_service" ON ad_stats_daily;
CREATE POLICY "ad_stats_service"       ON ad_stats_daily FOR ALL   USING (auth.role() = 'service_role');

-- ── 8. Affiliate & Subscribers ──────────────────────────────
DROP POLICY IF EXISTS "aff_products_public_read" ON affiliate_products;
CREATE POLICY "aff_products_public_read" ON affiliate_products FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "aff_products_service" ON affiliate_products;
CREATE POLICY "aff_products_service" ON affiliate_products FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "post_aff_public_read" ON post_affiliate_products;
CREATE POLICY "post_aff_public_read" ON post_affiliate_products FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "post_aff_service" ON post_affiliate_products;
CREATE POLICY "post_aff_service" ON post_affiliate_products FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "aff_clicks_anon_insert" ON affiliate_clicks;
CREATE POLICY "aff_clicks_anon_insert" ON affiliate_clicks FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "aff_clicks_service_read" ON affiliate_clicks;
CREATE POLICY "aff_clicks_service_read" ON affiliate_clicks FOR SELECT USING (auth.role() = 'service_role');

-- Subscribers
DROP POLICY IF EXISTS "subscribers_anon_insert" ON subscribers;
CREATE POLICY "subscribers_anon_insert" ON subscribers FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "subscribers_service" ON subscribers;
CREATE POLICY "subscribers_service" ON subscribers FOR ALL USING (auth.role() = 'service_role');

-- Broadcasts & Media
DROP POLICY IF EXISTS "media_public_read" ON media;
CREATE POLICY "media_public_read"    ON media            FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "media_service" ON media;
CREATE POLICY "media_service"        ON media            FOR ALL    USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "media_staff_write" ON media;
CREATE POLICY "media_staff_write"    ON media            FOR ALL    USING (fn_is_author_or_admin());
DROP POLICY IF EXISTS "broadcasts_service" ON broadcasts;
CREATE POLICY "broadcasts_service"   ON broadcasts       FOR ALL    USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "broadcasts_admin" ON broadcasts;
CREATE POLICY "broadcasts_admin"     ON broadcasts       FOR ALL    USING (fn_is_admin());

-- Topics
DO $$ BEGIN CREATE POLICY "topics_service" ON topics FOR ALL USING (auth.role() = 'service_role'); EXCEPTION WHEN undefined_table THEN NULL; END $$;

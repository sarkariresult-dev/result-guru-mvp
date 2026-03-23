-- ═══════════════════════════════════════════════════════════════
-- 016_indexes.sql - Result Guru
-- All indexes. Created after all tables exist.
-- ═══════════════════════════════════════════════════════════════

-- ── Post & Taxonomy Indexes ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_type_status ON posts(type, status);
CREATE INDEX IF NOT EXISTS idx_posts_state ON posts(state_slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_org ON posts(organization_id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_app_dates ON posts(application_start_date, application_end_date) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_seo_score ON posts(seo_score ASC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_posts_expires ON posts(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_noindex ON posts(id) WHERE noindex = TRUE;
CREATE INDEX IF NOT EXISTS idx_posts_content_updated ON posts(content_updated_at DESC) WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_posts_type_pub ON posts(type, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_state_type_pub ON posts(state_slug, type, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_type_appdates_pub ON posts(type, application_start_date, application_end_date, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_org_type_pub ON posts(organization_id, type, published_at DESC) WHERE status = 'published';

-- ── Search & Discovery Indexes ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_posts_fts ON posts USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_posts_title_trgm ON posts USING gin(title_lower gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_posts_qualification ON posts USING gin(qualification);
CREATE INDEX IF NOT EXISTS idx_posts_related_ids ON posts USING gin(related_post_ids);

CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag  ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug   ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_type   ON tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active, post_count DESC);
CREATE INDEX IF NOT EXISTS idx_orgs_slug  ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_state ON organizations(state_slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug   ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ── Advertising & Analytics Indexes ─────────────────────────
CREATE INDEX IF NOT EXISTS idx_ads_zone        ON ads(zone_id);
CREATE INDEX IF NOT EXISTS idx_ads_campaign    ON ads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ads_status      ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_active_zone ON ads(zone_id, weight DESC) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ad_events_ad ON ad_events(ad_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_events_at ON ad_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_stats_ad_date ON ad_stats_daily(ad_id, stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON ad_campaigns(status, start_date, end_date);

-- ── Affiliate & Affiliate Analytics Indexes ─────────────────
CREATE INDEX IF NOT EXISTS idx_aff_products_type ON affiliate_products(product_type);
CREATE INDEX IF NOT EXISTS idx_aff_products_active ON affiliate_products(is_active, display_priority DESC);
CREATE INDEX IF NOT EXISTS idx_aff_products_featured ON affiliate_products(is_featured, display_priority DESC) WHERE is_active = TRUE AND is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_aff_products_keywords ON affiliate_products USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_aff_products_exams ON affiliate_products USING gin(relevant_exams);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_product ON affiliate_clicks(product_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_aff_post ON post_affiliate_products(post_id);

CREATE INDEX IF NOT EXISTS idx_internal_links_source ON post_internal_links(source_id);
CREATE INDEX IF NOT EXISTS idx_internal_links_target ON post_internal_links(target_id);

CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_at ON post_views(viewed_at DESC);

-- ── SEO, Redirects & Subscriber Indexes ─────────────────────
CREATE INDEX IF NOT EXISTS idx_redirects_from ON redirects(from_path) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_redirects_chained ON redirects(id) WHERE is_chained = TRUE;
CREATE INDEX IF NOT EXISTS idx_search_queries_at ON search_queries(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_trgm ON search_queries USING gin(query gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_subscribers_email  ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_token  ON subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_media_bucket ON media(bucket);
CREATE INDEX IF NOT EXISTS idx_media_mime   ON media(mime_type);

-- ═══════════════════════════════════════════════════════════════
-- 015_indexes.sql — Result Guru
-- All indexes. Created after all tables exist.
-- Every index has a comment explaining which query it serves.
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────
-- POSTS — scalar
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_posts_slug
  ON posts(slug);
  -- SELECT * FROM posts WHERE slug = :slug (detail page lookup)

CREATE INDEX IF NOT EXISTS idx_posts_type_status
  ON posts(type, status);
  -- Base filter for all listing queries

CREATE INDEX IF NOT EXISTS idx_posts_state
  ON posts(state_slug)
  WHERE status = 'published';
  -- State filter pages (/state/uttar-pradesh)

CREATE INDEX IF NOT EXISTS idx_posts_org
  ON posts(organization_id)
  WHERE status = 'published';
  -- Organization pages (/org/upsc)

CREATE INDEX IF NOT EXISTS idx_posts_category
  ON posts(category_id)
  WHERE status = 'published';
  -- Category pages (/category/banking)

CREATE INDEX IF NOT EXISTS idx_posts_author
  ON posts(author_id);
  -- CMS author dashboard

CREATE INDEX IF NOT EXISTS idx_posts_published_at
  ON posts(published_at DESC)
  WHERE status = 'published';
  -- Latest posts feeds

CREATE INDEX IF NOT EXISTS idx_posts_app_status
  ON posts(application_status)
  WHERE status = 'published';
  -- "Open Applications" filter

CREATE INDEX IF NOT EXISTS idx_posts_view_count
  ON posts(view_count DESC)
  WHERE status = 'published';
  -- "Most popular" sidebar widget

CREATE INDEX IF NOT EXISTS idx_posts_seo_score
  ON posts(seo_score ASC)
  WHERE status = 'published';
  -- SEO audit — worst-scoring posts first

CREATE INDEX IF NOT EXISTS idx_posts_scheduled
  ON posts(scheduled_at)
  WHERE status = 'scheduled';
  -- Scheduler worker query

CREATE INDEX IF NOT EXISTS idx_posts_expires
  ON posts(expires_at)
  WHERE expires_at IS NOT NULL;
  -- Expiry worker query

CREATE INDEX IF NOT EXISTS idx_posts_noindex
  ON posts(id)
  WHERE noindex = TRUE;
  -- Audit: published-but-noindexed posts

CREATE INDEX IF NOT EXISTS idx_posts_content_updated
  ON posts(content_updated_at DESC)
  WHERE status = 'published';
  -- Stale-content audit (posts not updated in >180 days)

-- ────────────────────────────────────────────────────────────
-- POSTS — compound (covers common listing query shapes)
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_posts_type_pub
  ON posts(type, published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_posts_state_type_pub
  ON posts(state_slug, type, published_at DESC)
  WHERE status = 'published';
  -- /state/uttar-pradesh?type=job

CREATE INDEX IF NOT EXISTS idx_posts_type_appstatus_pub
  ON posts(type, application_status, published_at DESC)
  WHERE status = 'published';
  -- Jobs filtered by application_status (open, closing_soon)

CREATE INDEX IF NOT EXISTS idx_posts_org_type_pub
  ON posts(organization_id, type, published_at DESC)
  WHERE status = 'published';
  -- /org/upsc?type=result

-- ────────────────────────────────────────────────────────────
-- POSTS — full-text and fuzzy search
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_posts_fts
  ON posts USING gin(search_vector);
  -- plainto_tsquery / phraseto_tsquery full-text search

CREATE INDEX IF NOT EXISTS idx_posts_title_trgm
  ON posts USING gin(title_lower gin_trgm_ops);
  -- title ILIKE '%ssc%' trigram autocomplete

-- ────────────────────────────────────────────────────────────
-- POSTS — JSONB / array columns
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_posts_qualification
  ON posts USING gin(qualification);
  -- ?qualification @> ARRAY['graduation']

CREATE INDEX IF NOT EXISTS idx_posts_related_ids
  ON posts USING gin(related_post_ids);
  -- Reverse lookup: find posts that link to a given post

CREATE INDEX IF NOT EXISTS idx_posts_important_dates
  ON posts USING gin(important_dates);
  -- JSONB containment queries on date fields

CREATE INDEX IF NOT EXISTS idx_posts_vacancy
  ON posts USING gin(vacancy_details);
  -- JSONB containment on vacancy structure

-- ────────────────────────────────────────────────────────────
-- TAXONOMY
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag  ON post_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_tags_slug   ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_type   ON tags(tag_type);
CREATE INDEX IF NOT EXISTS idx_tags_active ON tags(is_active, post_count DESC);

CREATE INDEX IF NOT EXISTS idx_orgs_slug  ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_orgs_state ON organizations(state_slug);

CREATE INDEX IF NOT EXISTS idx_categories_slug   ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ────────────────────────────────────────────────────────────
-- ADVERTISING
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_ads_zone        ON ads(zone_id);
CREATE INDEX IF NOT EXISTS idx_ads_campaign    ON ads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ads_status      ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_active_zone
  ON ads(zone_id, weight DESC)
  WHERE status = 'active';
  -- Ad server query: get active ads by zone, weighted

CREATE INDEX IF NOT EXISTS idx_ad_events_ad
  ON ad_events(ad_id, occurred_at DESC);
  -- Per-ad event history

CREATE INDEX IF NOT EXISTS idx_ad_events_at
  ON ad_events(occurred_at DESC);
  -- Nightly aggregation window

CREATE INDEX IF NOT EXISTS idx_ad_stats_ad_date
  ON ad_stats_daily(ad_id, stat_date DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_dates
  ON ad_campaigns(status, start_date, end_date);
  -- Active campaign lookup

-- ────────────────────────────────────────────────────────────
-- AFFILIATE
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_aff_products_type
  ON affiliate_products(product_type);
CREATE INDEX IF NOT EXISTS idx_aff_products_active
  ON affiliate_products(is_active, display_priority DESC);
CREATE INDEX IF NOT EXISTS idx_aff_products_featured
  ON affiliate_products(is_featured, display_priority DESC)
  WHERE is_active = TRUE AND is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_aff_products_keywords
  ON affiliate_products USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_aff_products_exams
  ON affiliate_products USING gin(relevant_exams);
CREATE INDEX IF NOT EXISTS idx_aff_clicks_product
  ON affiliate_clicks(product_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_aff_post
  ON post_affiliate_products(post_id);

-- ────────────────────────────────────────────────────────────
-- INTERNAL LINKS
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_internal_links_source
  ON post_internal_links(source_id);
  -- "Links from this post" query

CREATE INDEX IF NOT EXISTS idx_internal_links_target
  ON post_internal_links(target_id);
  -- "Posts linking to this post" (backlink audit)

-- ────────────────────────────────────────────────────────────
-- POST VIEWS
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_post_views_post
  ON post_views(post_id, viewed_at DESC);
  -- Per-post view history

CREATE INDEX IF NOT EXISTS idx_post_views_at
  ON post_views(viewed_at DESC);
  -- Trending / recent views window

-- ────────────────────────────────────────────────────────────
-- SEO / REDIRECTS / SEARCH
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_redirects_from
  ON redirects(from_path)
  WHERE is_active = TRUE;
  -- Middleware lookup on every request

CREATE INDEX IF NOT EXISTS idx_redirects_chained
  ON redirects(id)
  WHERE is_chained = TRUE;
  -- Audit: find all chained redirects

CREATE INDEX IF NOT EXISTS idx_search_queries_at
  ON search_queries(searched_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_queries_trgm
  ON search_queries USING gin(query gin_trgm_ops);
  -- "Did you mean…" autocomplete from real user queries

-- ────────────────────────────────────────────────────────────
-- SUBSCRIBERS / MEDIA / TOPICS
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_subscribers_email  ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_token  ON subscribers(unsubscribe_token);

CREATE INDEX IF NOT EXISTS idx_media_bucket ON media(bucket);
CREATE INDEX IF NOT EXISTS idx_media_mime   ON media(mime_type);

CREATE INDEX IF NOT EXISTS idx_topics_queue
  ON topics(processed, priority DESC, created_at DESC)
  WHERE processed = FALSE;
  -- AI worker: next topic to process
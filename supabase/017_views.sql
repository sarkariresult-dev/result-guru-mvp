-- ═══════════════════════════════════════════════════════════════
-- 017_views.sql - Result Guru
-- All read-optimised views. Every view has NO ORDER BY -
-- callers add ORDER BY + LIMIT to keep query plans flexible.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. v_published_posts ────────────────────────────────────
DROP VIEW IF EXISTS v_published_posts CASCADE;
CREATE VIEW v_published_posts AS
SELECT
  p.id, p.type, p.status,
  CASE
    WHEN p.application_start_date IS NULL AND p.application_end_date IS NULL THEN 'none'
    WHEN p.application_start_date > CURRENT_TIMESTAMP THEN 'upcoming'
    WHEN p.application_end_date < CURRENT_TIMESTAMP THEN 'closed'
    WHEN p.application_end_date IS NOT NULL AND p.application_end_date <= CURRENT_TIMESTAMP + INTERVAL '7 days' THEN 'closing_soon'
    WHEN p.application_start_date <= CURRENT_TIMESTAMP AND (p.application_end_date IS NULL OR p.application_end_date > CURRENT_TIMESTAMP) THEN 'open'
    ELSE 'none'
  END AS application_status,
  p.application_start_date, p.application_end_date,
  p.title, p.slug, p.excerpt, p.content,
  
  p.state_slug, s.name AS state_name,
  p.organization_id, p.org_name, p.org_short_name,
  o.official_url AS org_official_url, o.logo_url AS org_logo_url,
  p.qualification, p.category_id,
  c.name AS category_name, c.slug AS category_slug,
  
  p.featured_image, p.featured_image_alt, p.featured_image_width, p.featured_image_height, p.notification_pdf,
  p.admit_card_link, p.result_link, p.answer_key_link,
  p.faq, p.related_post_ids,
  
  p.meta_title, p.meta_description, p.meta_keywords, p.focus_keyword, p.secondary_keywords,
  p.canonical_url, p.robots_directive, p.noindex, p.structured_data_type, p.schema_json,
  p.hreflang, p.breadcrumb_override,
  
  p.og_title, p.og_description, p.og_image, p.og_image_width, p.og_image_height,
  p.twitter_title, p.twitter_description, p.twitter_card_type,
  
  p.seo_score, p.word_count, p.reading_time_min, p.view_count, p.share_count,
  p.author_id, p.published_at, p.updated_at, p.content_updated_at, p.last_reviewed_at, p.expires_at
FROM      posts         p
LEFT JOIN states        s ON s.slug = p.state_slug
LEFT JOIN organizations o ON o.id   = p.organization_id
LEFT JOIN categories    c ON c.id   = p.category_id
WHERE p.status = 'published';

-- ── 2. v_active_ads ─────────────────────────────────────────
DROP VIEW IF EXISTS v_active_ads CASCADE;
CREATE VIEW v_active_ads AS
SELECT
  a.id, a.zone_id, a.ad_type, a.name, a.image_url, a.image_alt, a.html_code,
  a.text_headline, a.text_description, a.destination_url, a.destination_url_params,
  a.open_in_new_tab, a.rel_attribute, a.width, a.height, a.weight, a.is_marked_ad,
  az.slug AS zone_slug, az.position AS zone_position, az.appears_on, az.appears_on_post_types, az.is_mobile, az.is_desktop,
  c.target_states, c.target_post_types, c.target_qualifications, c.target_devices
FROM      ads          a
JOIN      ad_zones     az ON az.id = a.zone_id
LEFT JOIN ad_campaigns c  ON c.id  = a.campaign_id
WHERE a.status = 'active' AND az.is_active = TRUE
  AND (c.id IS NULL OR (c.status = 'active' AND c.start_date <= CURRENT_DATE AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)))
  AND (a.starts_at IS NULL OR a.starts_at <= NOW())
  AND (a.ends_at   IS NULL OR a.ends_at   >= NOW());

-- ── 3. v_trending_posts ─────────────────────────────────────
DROP VIEW IF EXISTS v_trending_posts CASCADE;
CREATE VIEW v_trending_posts AS
SELECT
  pv.post_id, COUNT(*) AS views_7d,
  p.title, p.slug, p.type, p.state_slug, p.org_name,
  p.featured_image, p.featured_image_alt, p.published_at
FROM      post_views pv
JOIN      posts      p  ON p.id = pv.post_id
WHERE pv.viewed_at > NOW() - INTERVAL '7 days' AND p.status = 'published'
GROUP BY pv.post_id, p.title, p.slug, p.type, p.state_slug, p.org_name, p.featured_image, p.featured_image_alt, p.published_at;

-- ── 4. v_featured_affiliate_products ────────────────────────
DROP VIEW IF EXISTS v_featured_affiliate_products CASCADE;
CREATE VIEW v_featured_affiliate_products AS
SELECT
  ap.*, an.name AS network_name, an.affiliate_id, an.tracking_param, an.base_url AS network_base_url
FROM      affiliate_products ap
LEFT JOIN affiliate_networks  an ON an.id = ap.network_id
WHERE ap.is_active = TRUE AND ap.is_featured = TRUE;

-- ── 5. v_seo_audit ──────────────────────────────────────────
DROP VIEW IF EXISTS v_seo_audit CASCADE;
CREATE VIEW v_seo_audit AS
SELECT
  p.id, p.type, p.slug, p.title, p.status,
  p.seo_score, p.word_count, p.reading_time_min,
  p.published_at, p.content_updated_at, p.last_reviewed_at,
  (p.meta_title IS NULL) AS missing_meta_title,
  (p.meta_description IS NULL) AS missing_meta_desc,
  (p.focus_keyword IS NULL) AS missing_focus_keyword,
  (p.featured_image IS NULL) AS missing_featured_image,
  (p.featured_image IS NOT NULL AND p.featured_image_alt IS NULL) AS missing_image_alt,
  (COALESCE(p.word_count, 0) < 300) AS thin_content,
  (p.noindex = TRUE) AS is_noindexed,
  (p.og_image IS NULL AND p.featured_image IS NULL) AS missing_og_image,
  (char_length(COALESCE(p.meta_title,'')) > 60) AS meta_title_too_long,
  (char_length(COALESCE(p.meta_description,'')) > 160) AS meta_desc_too_long,
  (jsonb_array_length(COALESCE(p.faq,'[]')) = 0) AS missing_faq,
  (p.last_reviewed_at IS NULL OR p.last_reviewed_at < NOW() - INTERVAL '180 days') AS needs_review,
  (p.content_updated_at IS NULL OR p.content_updated_at < NOW() - INTERVAL '365 days') AS content_stale,
  EXISTS (SELECT 1 FROM redirects r WHERE r.from_path = '/' || p.type::TEXT || '/' || p.slug AND r.is_active = TRUE) AS has_active_redirect
FROM posts p
WHERE p.status = 'published';

-- ── 6. v_redirect_chains ────────────────────────────────────
DROP VIEW IF EXISTS v_redirect_chains CASCADE;
CREATE VIEW v_redirect_chains AS
SELECT
  r1.from_path  AS original_from, r1.to_path AS intermediate_url, r2.to_path AS final_destination,
  r1.type AS first_hop_code, r2.type AS second_hop_code
FROM  redirects r1
JOIN  redirects r2 ON r2.from_path = r1.to_path AND r2.is_active = TRUE
WHERE r1.is_active = TRUE;

-- ── 7. v_posts_attention ────────────────────────────────────
DROP VIEW IF EXISTS v_posts_attention CASCADE;
CREATE VIEW v_posts_attention AS
SELECT
  v.id, v.type, v.slug, v.title, v.seo_score, v.application_status, v.expires_at,
  CASE
    WHEN v.expires_at IS NOT NULL AND v.expires_at < NOW() THEN 'expired'
    WHEN v.application_status = 'open' THEN 'apply_closed'
    WHEN v.seo_score < 40 THEN 'low_seo'
    WHEN v.last_reviewed_at < NOW() - INTERVAL '180 days' OR v.last_reviewed_at IS NULL THEN 'stale'
    ELSE 'other'
  END AS attention_reason,
  v.updated_at
FROM v_published_posts v
WHERE (v.expires_at IS NOT NULL AND v.expires_at < NOW()) OR (v.application_status = 'open') OR v.seo_score < 40 OR v.last_reviewed_at IS NULL OR v.last_reviewed_at < NOW() - INTERVAL '180 days';

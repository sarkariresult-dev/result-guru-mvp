-- ═══════════════════════════════════════════════════════════════
-- 014_views.sql - Result Guru
-- All read-optimised views. Every view has NO ORDER BY -
-- callers add ORDER BY + LIMIT to keep query plans flexible.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. v_published_posts ────────────────────────────────────
DROP VIEW IF EXISTS v_published_posts CASCADE;
CREATE VIEW v_published_posts WITH (security_invoker = true) AS
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
  p.primary_link,
  p.faq, p.related_post_ids,
  
  p.meta_title, p.meta_description, p.meta_keywords, p.focus_keyword, p.secondary_keywords,
  p.canonical_url, p.robots_directive, p.noindex, p.structured_data_type, p.schema_json,
  p.hreflang, p.breadcrumb_override,
  
  p.og_title, p.og_description, p.og_image, p.og_image_width, p.og_image_height,
  p.twitter_title, p.twitter_description, p.twitter_card_type,
  
  p.seo_score, p.word_count, p.reading_time_min, p.view_count, p.total_time_on_page, p.share_count,
  p.author_id,
  u.name AS author_name,
  u.avatar_url AS author_avatar_url,
  u.bio AS author_bio,
  u.credentials AS author_credentials,
  u.years_of_experience AS author_years_of_experience,
  u.social_links AS author_social_links,
  p.published_at, p.updated_at, p.content_updated_at, p.last_reviewed_at, p.expires_at, p.needs_human_review,
  p.search_vector,

  -- Optimization: Inline tags to avoid N+1 queries in application code
  (
    SELECT COALESCE(jsonb_agg(t), '[]'::jsonb)
    FROM (
      SELECT tag.id, tag.name, tag.slug, tag.tag_type
      FROM post_tags pt
      JOIN tags tag ON tag.id = pt.tag_id
      WHERE pt.post_id = p.id
      ORDER BY tag.name ASC
    ) t
  ) AS tags

FROM      posts         p
LEFT JOIN states        s ON s.slug = p.state_slug
LEFT JOIN organizations o ON o.id   = p.organization_id
LEFT JOIN categories    c ON c.id   = p.category_id
LEFT JOIN users         u ON u.id   = p.author_id
WHERE p.status = 'published';

-- ── 2. v_active_ads ─────────────────────────────────────────
DROP VIEW IF EXISTS v_active_ads CASCADE;
CREATE VIEW v_active_ads WITH (security_invoker = true) AS
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



-- ── 4. Affiliate Views ──────────────────────────────────────
DROP VIEW IF EXISTS v_featured_affiliate CASCADE;
CREATE VIEW v_featured_affiliate WITH (security_invoker = true) AS
SELECT *
FROM   affiliate
WHERE  is_active = TRUE AND is_featured = TRUE;

DROP VIEW IF EXISTS v_admin_affiliate CASCADE;
CREATE VIEW v_admin_affiliate WITH (security_invoker = true) AS
SELECT * FROM affiliate;



-- ── 7. v_posts_attention ────────────────────────────────────
DROP VIEW IF EXISTS v_posts_attention CASCADE;
CREATE VIEW v_posts_attention WITH (security_invoker = true) AS
SELECT
  v.id, v.type, v.slug, v.title, v.seo_score, v.application_status, v.expires_at,
  CASE
    WHEN v.expires_at IS NOT NULL AND v.expires_at < NOW() THEN 'expired'
    WHEN v.application_status = 'closed' THEN 'apply_closed'
    WHEN v.seo_score < 40 THEN 'low_seo'
    WHEN v.last_reviewed_at < NOW() - INTERVAL '180 days' OR v.last_reviewed_at IS NULL THEN 'stale'
    ELSE 'other'
  END AS attention_reason,
  v.updated_at
FROM v_published_posts v
WHERE (v.expires_at IS NOT NULL AND v.expires_at < NOW()) OR (v.application_status = 'open') OR v.seo_score < 40 OR v.last_reviewed_at IS NULL OR v.last_reviewed_at < NOW() - INTERVAL '180 days';

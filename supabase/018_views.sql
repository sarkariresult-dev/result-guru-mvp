-- ═══════════════════════════════════════════════════════════════
-- 018_views.sql — Result Guru
-- All read-optimised views. Every view has NO ORDER BY —
-- callers add ORDER BY + LIMIT to keep query plans flexible.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Published posts (main public listing) ──────────────────
-- Joins state + organization so the API layer needs no extra joins.
-- official_url comes from here — it was removed from posts table.
DROP VIEW IF EXISTS v_published_posts CASCADE;
CREATE VIEW v_published_posts AS
SELECT
  -- Identity
  p.id, p.type, p.status, p.application_status,
  -- Content
  p.title, p.slug, p.excerpt, p.content,
  -- Taxonomy
  p.state_slug,
  s.name            AS state_name,
  p.organization_id,
  p.org_name,
  p.org_short_name,
  o.official_url    AS org_official_url,   -- ← Surfaced from org table
  o.logo_url        AS org_logo_url,
  p.qualification,
  p.category_id,
  c.name            AS category_name,
  c.slug            AS category_slug,
  -- Media
  p.featured_image,
  p.featured_image_alt,
  p.featured_image_width,
  p.featured_image_height,
  p.notification_pdf,
  -- Key links
  p.admit_card_link,
  p.result_link,
  p.answer_key_link,
  -- Structured content (JSONB)
  p.important_dates,
  p.application_fee,
  p.vacancy_details,
  p.eligibility,
  p.selection_process,
  p.how_to_apply,
  p.pay_scale,
  p.total_vacancies,
  p.syllabus_sections,
  p.exam_pattern_data,
  p.previous_year_papers,
  p.preparation_tips,
  p.cut_off_marks,
  p.faq,
  p.related_post_ids,
  -- SEO
  p.meta_title, p.meta_description, p.meta_keywords,
  p.focus_keyword, p.secondary_keywords,
  p.canonical_url, p.robots_directive, p.noindex,
  p.structured_data_type, p.schema_json,
  p.hreflang, p.breadcrumb_override,
  -- OG / Twitter
  p.og_title, p.og_description, p.og_image,
  p.og_image_width, p.og_image_height,
  p.twitter_title, p.twitter_description, p.twitter_card_type,
  -- Metrics
  p.seo_score, p.word_count, p.reading_time_min,
  p.view_count, p.share_count,
  -- Timestamps
  p.author_id, p.published_at, p.updated_at,
  p.content_updated_at, p.last_reviewed_at, p.expires_at
FROM      posts         p
LEFT JOIN states        s ON s.slug = p.state_slug
LEFT JOIN organizations o ON o.id   = p.organization_id
LEFT JOIN categories    c ON c.id   = p.category_id
WHERE p.status = 'published';

COMMENT ON VIEW v_published_posts IS
  'All published posts with denormalised state / org / category fields.
   official_url surfaced from organizations.official_url — NOT stored on posts.
   Add ORDER BY + LIMIT in every query; no ORDER BY here.';

-- ── 2. Active ads (ad server view) ───────────────────────────
DROP VIEW IF EXISTS v_active_ads CASCADE;
CREATE VIEW v_active_ads AS
SELECT
  a.id, a.zone_id, a.ad_type, a.name,
  a.image_url, a.image_alt,
  a.html_code,
  a.text_headline, a.text_description,
  a.destination_url, a.destination_url_params,
  a.open_in_new_tab, a.rel_attribute,
  a.width, a.height,
  a.weight, a.is_marked_ad,
  -- Zone context
  az.slug             AS zone_slug,
  az.position         AS zone_position,
  az.appears_on,
  az.appears_on_post_types,
  az.is_mobile,
  az.is_desktop,
  -- Campaign targeting
  c.target_states,
  c.target_post_types,
  c.target_qualifications,
  c.target_devices
FROM      ads          a
JOIN      ad_zones     az ON az.id = a.zone_id
LEFT JOIN ad_campaigns c  ON c.id  = a.campaign_id
WHERE
  a.status      = 'active'
  AND az.is_active = TRUE
  AND (
    c.id IS NULL
    OR (
      c.status     = 'active'
      AND c.start_date <= CURRENT_DATE
      AND (c.end_date IS NULL OR c.end_date >= CURRENT_DATE)
    )
  )
  AND (a.starts_at IS NULL OR a.starts_at <= NOW())
  AND (a.ends_at   IS NULL OR a.ends_at   >= NOW());

COMMENT ON VIEW v_active_ads IS
  'Eligible active ads with zone and campaign targeting context.
   Ad server: ORDER BY weight DESC, random() for weighted randomisation.';

-- ── 3. Trending posts (last 7 days) ──────────────────────────
DROP VIEW IF EXISTS v_trending_posts CASCADE;
CREATE VIEW v_trending_posts AS
SELECT
  pv.post_id,
  COUNT(*)        AS views_7d,
  p.title, p.slug, p.type,
  p.state_slug, p.org_name,
  p.featured_image, p.featured_image_alt,
  p.published_at
FROM      post_views pv
JOIN      posts      p  ON p.id = pv.post_id
WHERE
  pv.viewed_at > NOW() - INTERVAL '7 days'
  AND p.status = 'published'
GROUP BY
  pv.post_id, p.title, p.slug, p.type,
  p.state_slug, p.org_name,
  p.featured_image, p.featured_image_alt,
  p.published_at;

COMMENT ON VIEW v_trending_posts IS
  'Aggregated 7-day view counts. Caller: ORDER BY views_7d DESC LIMIT 10.';

-- ── 4. Featured affiliate products ───────────────────────────
DROP VIEW IF EXISTS v_featured_affiliate_products CASCADE;
CREATE VIEW v_featured_affiliate_products AS
SELECT
  ap.*,
  an.name           AS network_name,
  an.affiliate_id,
  an.tracking_param,
  an.base_url       AS network_base_url
FROM      affiliate_products ap
LEFT JOIN affiliate_networks  an ON an.id = ap.network_id
WHERE ap.is_active = TRUE AND ap.is_featured = TRUE;

COMMENT ON VIEW v_featured_affiliate_products IS
  'Active featured affiliate products with network info.
   Caller: ORDER BY display_priority DESC LIMIT N.';

-- ── 5. SEO audit dashboard ────────────────────────────────────
DROP VIEW IF EXISTS v_seo_audit CASCADE;
CREATE VIEW v_seo_audit AS
SELECT
  p.id, p.type, p.slug, p.title, p.status,
  p.seo_score, p.word_count, p.reading_time_min,
  p.published_at, p.content_updated_at, p.last_reviewed_at,
  -- Issue flags
  (p.meta_title IS NULL)                                          AS missing_meta_title,
  (p.meta_description IS NULL)                                    AS missing_meta_desc,
  (p.focus_keyword IS NULL)                                       AS missing_focus_keyword,
  (p.featured_image IS NULL)                                      AS missing_featured_image,
  (p.featured_image IS NOT NULL AND p.featured_image_alt IS NULL) AS missing_image_alt,
  (COALESCE(p.word_count, 0) < 300)                               AS thin_content,
  (p.noindex = TRUE)                                              AS is_noindexed,
  (p.og_image IS NULL AND p.featured_image IS NULL)               AS missing_og_image,
  (char_length(COALESCE(p.meta_title,'')) > 60)                   AS meta_title_too_long,
  (char_length(COALESCE(p.meta_description,'')) > 160)            AS meta_desc_too_long,
  (jsonb_array_length(COALESCE(p.faq,'[]')) = 0)                  AS missing_faq,
  (p.last_reviewed_at IS NULL
   OR p.last_reviewed_at < NOW() - INTERVAL '180 days')           AS needs_review,
  (p.content_updated_at IS NULL
   OR p.content_updated_at < NOW() - INTERVAL '365 days')         AS content_stale,
  EXISTS (
    SELECT 1 FROM redirects r
    WHERE  r.from_path = '/' || p.type::TEXT || '/' || p.slug
      AND  r.is_active = TRUE
  )                                                               AS has_active_redirect
FROM posts p
WHERE p.status = 'published';

COMMENT ON VIEW v_seo_audit IS
  'Per-post SEO health flags. Use: ORDER BY seo_score ASC LIMIT 50 for worst-first triage.';

-- ── 6. Redirect chain report ──────────────────────────────────
DROP VIEW IF EXISTS v_redirect_chains CASCADE;
CREATE VIEW v_redirect_chains AS
SELECT
  r1.from_path  AS original_from,
  r1.to_path    AS intermediate_url,
  r2.to_path    AS final_destination,
  r1.type       AS first_hop_code,
  r2.type       AS second_hop_code
FROM  redirects r1
JOIN  redirects r2
  ON  r2.from_path = r1.to_path
 AND  r2.is_active = TRUE
WHERE r1.is_active = TRUE;

COMMENT ON VIEW v_redirect_chains IS
  'Two-hop redirect chains. Every row is a chain — fix by pointing original_from to final_destination directly.';

-- ── 7. Posts needing attention (CMS dashboard widget) ────────
DROP VIEW IF EXISTS v_posts_attention CASCADE;
CREATE VIEW v_posts_attention AS
SELECT
  p.id, p.type, p.slug, p.title, p.seo_score,
  p.application_status, p.expires_at,
  -- Why it needs attention
  CASE
    WHEN p.expires_at IS NOT NULL AND p.expires_at < NOW()            THEN 'expired'
    WHEN p.application_status = 'open'
         AND (p.important_dates->>'apply_end') IS NOT NULL
         AND (p.important_dates->>'apply_end')::DATE < CURRENT_DATE   THEN 'apply_closed'
    WHEN p.seo_score < 40                                             THEN 'low_seo'
    WHEN p.last_reviewed_at < NOW() - INTERVAL '180 days'
         OR p.last_reviewed_at IS NULL                                THEN 'stale'
    ELSE 'other'
  END AS attention_reason,
  p.updated_at
FROM posts p
WHERE
  p.status = 'published'
  AND (
    (p.expires_at IS NOT NULL AND p.expires_at < NOW())
    OR (
      p.application_status = 'open'
      AND (p.important_dates->>'apply_end')::DATE < CURRENT_DATE
    )
    OR p.seo_score < 40
    OR p.last_reviewed_at IS NULL
    OR p.last_reviewed_at < NOW() - INTERVAL '180 days'
  );

COMMENT ON VIEW v_posts_attention IS
  'Published posts that need editor attention: expired, apply-closed, low SEO score, or stale.
   Shown as a dashboard widget in the CMS.';
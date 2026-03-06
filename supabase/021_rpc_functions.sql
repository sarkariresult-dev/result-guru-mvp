-- ═══════════════════════════════════════════════════════════════════════════
-- 021_rpc_functions.sql — RPC helper functions
-- ═══════════════════════════════════════════════════════════════════════════
-- C4: fn_total_view_count / fn_author_view_count — SUM view_count in SQL
-- C5: fn_posts_by_tag — joined query replacing unbounded IN clause
-- ═══════════════════════════════════════════════════════════════════════════

-- ── C4: Total view count for all published posts ──────────────────────────

CREATE OR REPLACE FUNCTION fn_total_view_count()
RETURNS BIGINT
LANGUAGE sql STABLE
AS $$
    SELECT COALESCE(SUM(view_count), 0)
    FROM posts
    WHERE status = 'published';
$$;

COMMENT ON FUNCTION fn_total_view_count() IS
  'Returns the total view_count of all published posts. O(1) via index scan.';

-- ── C4: Total view count for a specific author ────────────────────────────

CREATE OR REPLACE FUNCTION fn_author_view_count(p_author_id UUID)
RETURNS BIGINT
LANGUAGE sql STABLE
AS $$
    SELECT COALESCE(SUM(view_count), 0)
    FROM posts
    WHERE author_id = p_author_id
      AND status = 'published';
$$;

COMMENT ON FUNCTION fn_author_view_count(UUID) IS
  'Returns the total view_count of all published posts by a specific author.';

-- ── C5: Paginated posts by tag via JOIN (replaces unbounded IN) ───────────

CREATE OR REPLACE FUNCTION fn_posts_by_tag(
    p_tag_id  UUID,
    p_limit   INT  DEFAULT 12,
    p_offset  INT  DEFAULT 0
)
RETURNS TABLE (
    id                 UUID,
    type               TEXT,
    application_status TEXT,
    title              TEXT,
    slug               TEXT,
    excerpt            TEXT,
    state_slug         TEXT,
    state_name         TEXT,
    org_name           TEXT,
    org_short_name     TEXT,
    org_logo_url       TEXT,
    category_slug      TEXT,
    category_name      TEXT,
    qualification      TEXT[],
    total_vacancies    INT,
    featured_image     TEXT,
    featured_image_alt TEXT,
    important_dates    JSONB,
    view_count         INT,
    reading_time_min   SMALLINT,
    published_at       TIMESTAMPTZ,
    updated_at         TIMESTAMPTZ
)
LANGUAGE sql STABLE
AS $$
    SELECT
        vp.id,
        vp.type::TEXT,
        vp.application_status::TEXT,
        vp.title,
        vp.slug,
        vp.excerpt,
        vp.state_slug,
        vp.state_name,
        vp.org_name,
        vp.org_short_name,
        vp.org_logo_url,
        vp.category_slug,
        vp.category_name,
        vp.qualification,
        vp.total_vacancies,
        vp.featured_image,
        vp.featured_image_alt,
        vp.important_dates,
        vp.view_count,
        vp.reading_time_min,
        vp.published_at,
        vp.updated_at
    FROM post_tags pt
    JOIN v_published_posts vp ON vp.id = pt.post_id
    WHERE pt.tag_id = p_tag_id
    ORDER BY vp.published_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

COMMENT ON FUNCTION fn_posts_by_tag(UUID, INT, INT) IS
  'Returns paginated published posts for a given tag via JOIN.
   Replaces the app-layer two-query pattern (fetch IDs → IN query).';

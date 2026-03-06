-- ═══════════════════════════════════════════════════════════════
-- 002_enums.sql — Result Guru
-- All custom enum types. Idempotent — safe to re-run.
-- ═══════════════════════════════════════════════════════════════

-- ── Post type ────────────────────────────────────────────────
-- Each type drives which JSONB sections are rendered on the
-- frontend and which sitemap priority / changefreq is applied.
DO $$ BEGIN
  CREATE TYPE post_type AS ENUM (
    'job',            -- Recruitment notification (main type)
    'result',         -- Exam / selection result
    'admit',          -- Admit card / hall ticket
    'answer_key',     -- Official / provisional answer key
    'cut_off',        -- Category-wise cut-off marks
    'syllabus',       -- Exam syllabus (structured sections)
    'exam_pattern',   -- Paper pattern, marking scheme
    'previous_paper', -- Past-year question papers
    'scheme',         -- Government scheme / yojana
    'exam',           -- Upcoming exam notification
    'admission',      -- College / university admission
    'notification'    -- General government notice / circular
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── Content lifecycle ────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE post_status AS ENUM (
    'draft',       -- Being authored
    'review',      -- Pending editorial review
    'scheduled',   -- Will publish at scheduled_at
    'published',   -- Live
    'archived'     -- Hidden; retained for internal links / redirects
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── Application window status (job / exam / admission) ───────
DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'upcoming',      -- Not yet open
    'open',          -- Apply now
    'closing_soon',  -- ≤ 7 days remaining
    'closed',        -- Window passed
    'result_out',    -- Result declared
    'na'             -- Not applicable for this post type
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── Ad lifecycle ─────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE ad_status AS ENUM (
    'draft',
    'active',
    'paused',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── Ad creative format ───────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE ad_type AS ENUM (
    'display_image',   -- Image banner
    'display_html',    -- Raw HTML / Generic snippet
    'text_link',       -- Styled text advertisement
    'affiliate_card'   -- Product card (drives affiliate_products)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── Named placement zones ────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE ad_zone_position AS ENUM (
    'header_top',
    'below_header',
    'sidebar_top',
    'sidebar_sticky',
    'below_dates_box',
    'below_fee_box',
    'mid_content',
    'below_content',
    'above_faq',
    'below_faq',
    'above_related',
    'listing_between_cards',
    'footer_top',
    'popup',
    'floating_bottom'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── Affiliate product category ───────────────────────────────
DO $$ BEGIN
  CREATE TYPE affiliate_product_type AS ENUM (
    'book',
    'test_series',
    'course',
    'stationery',
    'tool',
    'software',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── Redirect HTTP code ───────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE redirect_type AS ENUM (
    '301',   -- Permanent — passes PageRank
    '302',   -- Temporary — no PageRank transfer
    '410'    -- Gone — tells Google to deindex immediately
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── CMS user role ────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin',    -- Full CMS access
    'author',   -- Create / edit own posts
    'user'      -- Public account (newsletter, bookmarks)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;
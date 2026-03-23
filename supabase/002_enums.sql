-- ═══════════════════════════════════════════════════════════════
-- 002_enums.sql - Result Guru
-- Custom DB enums for driving content architecture.
-- ═══════════════════════════════════════════════════════════════

-- ── Post Content Enums ──────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE post_type AS ENUM (
    'job',
    'result',
    'admit',
    'answer_key',
    'cut_off',
    'syllabus',
    'exam_pattern',
    'previous_paper',
    'scheme',
    'exam',
    'admission',
    'scholarship',
    'notification'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

DO $$ BEGIN
  CREATE TYPE post_status AS ENUM (
    'draft',
    'review',
    'scheduled',
    'published',
    'archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- application_status Enum REMOVED.
-- Status is dynamically computed via posts.application_start_date and posts.application_end_date.

-- ── Advertising Enums ───────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE ad_status AS ENUM (
    'draft',
    'active',
    'paused',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

DO $$ BEGIN
  CREATE TYPE ad_type AS ENUM (
    'display_image',
    'display_html',
    'text_link',
    'affiliate_card'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

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

-- ── Affiliate & Redirect Enums ───────────────────────────────
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

DO $$ BEGIN
  CREATE TYPE redirect_type AS ENUM (
    '301',
    '302',
    '410'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── User Access Enums ────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin',
    'author',
    'user'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;
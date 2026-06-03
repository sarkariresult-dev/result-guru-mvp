-- ═══════════════════════════════════════════════════════════════
-- 008_affiliate.sql - Result Guru
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS affiliate (
  id                      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Classification
  category                affiliate_category NOT NULL DEFAULT 'other',

  name                    TEXT          NOT NULL,
  slug                    TEXT          UNIQUE NOT NULL,
  description             TEXT,
  short_description       TEXT,
  
  -- Media
  image_url               TEXT          NOT NULL,
  image_alt               TEXT,
  product_url             TEXT          NOT NULL,
  
  -- Pricing
  mrp                     NUMERIC(10,2),
  selling_price           NUMERIC(10,2),
  
  -- Visibility
  is_active               BOOLEAN       NOT NULL DEFAULT TRUE,
  is_featured             BOOLEAN       NOT NULL DEFAULT FALSE,
  display_priority        SMALLINT      NOT NULL DEFAULT 0,
  
  -- UI Badges
  badge_text              TEXT,
  badge_color             TEXT,

  -- Ratings & FAQ
  rating                  NUMERIC(2,1)  DEFAULT NULL,
  rating_count            INTEGER       DEFAULT 0,
  faq                     JSONB         DEFAULT '[]',

  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes defined centrally in 013_indexes.sql

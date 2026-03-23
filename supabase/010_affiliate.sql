-- ═══════════════════════════════════════════════════════════════
-- 010_affiliate.sql - Result Guru
-- Affiliate product catalogue with auto-matching rules.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Affiliate Networks ───────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_networks (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT          NOT NULL,
  slug            TEXT          UNIQUE NOT NULL,
  base_url        TEXT,
  tracking_param  TEXT,
  affiliate_id    TEXT,
  commission_rate NUMERIC(5,2)  CHECK (commission_rate IS NULL OR commission_rate BETWEEN 0 AND 100),
  cookie_days     SMALLINT      NOT NULL DEFAULT 30 CHECK (cookie_days >= 0),
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── 2. Affiliate Product Library ────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_products (
  id                      UUID                   PRIMARY KEY DEFAULT uuid_generate_v4(),
  network_id              UUID                   REFERENCES affiliate_networks(id) ON DELETE SET NULL,
  product_type            affiliate_product_type NOT NULL,
  name                    TEXT                   NOT NULL,
  slug                    TEXT                   UNIQUE NOT NULL,
  description             TEXT,
  short_description       TEXT,
  author_publisher        TEXT,
  edition                 TEXT,
  language                TEXT                   NOT NULL DEFAULT 'Hindi/English',
  isbn                    TEXT,
  mrp                     NUMERIC(8,2)           CHECK (mrp IS NULL OR mrp >= 0),
  selling_price           NUMERIC(8,2)           CHECK (selling_price IS NULL OR selling_price >= 0),
  discount_percent        SMALLINT               CHECK (discount_percent IS NULL OR discount_percent BETWEEN 0 AND 100),
  image_url               TEXT                   NOT NULL,
  image_alt               TEXT,
  product_url             TEXT                   NOT NULL,
  affiliate_url           TEXT,
  affiliate_product_id    TEXT,
  relevant_exams          TEXT[],
  relevant_subjects       TEXT[],
  relevant_post_types     post_type[],
  relevant_states         TEXT[],
  relevant_qualifications TEXT[],
  keywords                TEXT[],
  display_priority        SMALLINT               NOT NULL DEFAULT 0,
  badge_text              TEXT,
  badge_color             TEXT,
  is_active               BOOLEAN                NOT NULL DEFAULT TRUE,
  is_featured             BOOLEAN                NOT NULL DEFAULT FALSE,
  stock_status            TEXT                   NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','out_of_stock','discontinued')),
  click_count             INT                    NOT NULL DEFAULT 0,
  meta_title              TEXT,
  meta_description        TEXT                   CHECK (meta_description IS NULL OR char_length(meta_description) <= 165),
  created_at              TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ            NOT NULL DEFAULT NOW()
);

-- ── 3. Post-to-Product Relationships ───────────────────────
CREATE TABLE IF NOT EXISTS post_affiliate_products (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID        NOT NULL REFERENCES posts(id)              ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES affiliate_products(id) ON DELETE CASCADE,
  sort_order SMALLINT    NOT NULL DEFAULT 0,
  added_by   UUID        REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, product_id)
);

-- ── 4. Smart Matching Rules ─────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_rules (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT        NOT NULL,
  description         TEXT,
  match_post_type     post_type,
  match_state         TEXT        REFERENCES states(slug) ON DELETE SET NULL,
  match_org_slug      TEXT        REFERENCES organizations(slug) ON DELETE SET NULL,
  match_qualification TEXT,
  match_keyword       TEXT,
  match_category_id   UUID        REFERENCES categories(id) ON DELETE SET NULL,
  product_ids         UUID[],
  product_tags        TEXT[],
  max_products        SMALLINT    NOT NULL DEFAULT 4 CHECK (max_products BETWEEN 1 AND 20),
  sort_by             TEXT        NOT NULL DEFAULT 'priority' CHECK (sort_by IN ('priority','price_asc','random')),
  is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
  priority            SMALLINT    NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Analytics: Product Clicks ────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id         BIGSERIAL   PRIMARY KEY,
  product_id UUID        NOT NULL REFERENCES affiliate_products(id) ON DELETE CASCADE,
  post_id    UUID,
  device     TEXT,
  referrer   TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. Seed Default Networks ────────────────────────────────
INSERT INTO affiliate_networks (slug, name, base_url, tracking_param, cookie_days) VALUES
  ('amazon',   'Amazon Associates India', 'https://www.amazon.in',     'tag',   24),
  ('flipkart', 'Flipkart Affiliate',      'https://www.flipkart.com',  'affid', 30)
ON CONFLICT (slug) DO NOTHING;

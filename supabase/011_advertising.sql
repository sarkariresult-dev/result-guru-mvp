-- ═══════════════════════════════════════════════════════════════
-- 011_advertising.sql — Result Guru
-- Full ad management: zones → campaigns → ads → events → daily stats.
-- ═══════════════════════════════════════════════════════════════

-- ── Ad placement zones ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_zones (
  id                    UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                  TEXT             UNIQUE NOT NULL,
  name                  TEXT             NOT NULL,
  position              ad_zone_position NOT NULL,
  description           TEXT,
  -- Dimensions
  width                 SMALLINT,
  height                SMALLINT,
  allowed_sizes         JSONB            NOT NULL DEFAULT '[]',         -- [{w,h}]
  -- Targeting
  appears_on            TEXT[]           NOT NULL DEFAULT ARRAY['all'], -- page contexts
  appears_on_post_types post_type[],
  is_mobile             BOOLEAN          NOT NULL DEFAULT TRUE,
  is_desktop            BOOLEAN          NOT NULL DEFAULT TRUE,
  -- State
  is_active             BOOLEAN          NOT NULL DEFAULT TRUE,
  sort_order            SMALLINT         NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE ad_zones IS
  'Named placement slots on the site. Each creative (ads) belongs to a zone.';

-- ── Advertisers ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advertisers (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  email      TEXT,
  phone      TEXT,
  company    TEXT,
  notes      TEXT,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE advertisers IS 'Ad buyers. Optional — direct ad inserts may skip this table.';

-- ── Campaigns ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id     UUID          REFERENCES advertisers(id) ON DELETE SET NULL,
  name              TEXT          NOT NULL,
  description       TEXT,
  -- Budget
  budget            NUMERIC(10,2) CHECK (budget IS NULL OR budget >= 0),
  daily_budget      NUMERIC(10,2) CHECK (daily_budget IS NULL OR daily_budget >= 0),
  -- Schedule
  start_date        DATE          NOT NULL,
  end_date          DATE,
  status            ad_status     NOT NULL DEFAULT 'draft',
  -- Targeting
  target_states         TEXT[],
  target_post_types     post_type[],
  target_qualifications TEXT[],
  target_devices        TEXT[]    NOT NULL DEFAULT ARRAY['mobile','desktop'],
  -- Running totals (updated by fn_aggregate_ad_stats)
  total_impressions BIGINT        NOT NULL DEFAULT 0,
  total_clicks      BIGINT        NOT NULL DEFAULT 0,
  total_spend       NUMERIC(10,2) NOT NULL DEFAULT 0,
  -- Timestamps
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_campaign_end_after_start CHECK (end_date IS NULL OR end_date >= start_date)
);
COMMENT ON TABLE ad_campaigns IS
  'Links advertisers to a set of ad creatives with budgets and audience targeting.';

-- ── Ad creatives ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads (
  id                     UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id            UUID          REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  zone_id                UUID          NOT NULL REFERENCES ad_zones(id) ON DELETE RESTRICT,
  name                   TEXT          NOT NULL,
  ad_type                ad_type       NOT NULL,
  status                 ad_status     NOT NULL DEFAULT 'draft',
  -- Creative content (one or more depending on ad_type)
  image_url              TEXT,
  image_alt              TEXT,
  html_code              TEXT,
  text_headline          TEXT,
  text_description       TEXT,
  destination_url        TEXT,
  destination_url_params TEXT,                                       -- UTM params appended
  -- Display
  width                  SMALLINT,
  height                 SMALLINT,
  open_in_new_tab        BOOLEAN       NOT NULL DEFAULT TRUE,
  rel_attribute          TEXT          NOT NULL DEFAULT 'nofollow sponsored',
  weight                 SMALLINT      NOT NULL DEFAULT 100 CHECK (weight BETWEEN 0 AND 1000),
  display_order          SMALLINT      NOT NULL DEFAULT 0,
  is_marked_ad           BOOLEAN       NOT NULL DEFAULT TRUE,        -- "Sponsored" label shown
  -- Schedule
  starts_at              TIMESTAMPTZ,
  ends_at                TIMESTAMPTZ,
  -- Counters (incremented by fn_aggregate_ad_stats nightly)
  impression_count       BIGINT        NOT NULL DEFAULT 0,
  click_count            BIGINT        NOT NULL DEFAULT 0,
  ctr                    NUMERIC(7,6) GENERATED ALWAYS AS (
                           CASE WHEN impression_count > 0
                                THEN click_count::NUMERIC / impression_count
                                ELSE 0
                           END
                         ) STORED,
  -- Timestamps
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_ad_ends_after_starts CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);
COMMENT ON TABLE ads IS
  'Individual ad creatives. ctr is a GENERATED column. Campaign targeting
   supplements zone targeting at query time.';

-- ── Raw ad events (partitioned) ───────────────────────────────
CREATE SEQUENCE IF NOT EXISTS ad_events_id_seq;

CREATE TABLE IF NOT EXISTS ad_events (
  id          BIGINT      NOT NULL DEFAULT nextval('ad_events_id_seq'),
  ad_id       UUID        NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  zone_id     UUID        REFERENCES ad_zones(id) ON DELETE SET NULL,
  event_type  TEXT        NOT NULL CHECK (event_type IN ('impression','click')),
  post_id     UUID,                                                  -- Page where event fired
  device      TEXT        CHECK (device IN ('mobile','desktop','tablet',NULL)),
  country     TEXT        NOT NULL DEFAULT 'IN',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (occurred_at);

-- Quarterly partitions
CREATE TABLE IF NOT EXISTS ad_events_2025_q1
  PARTITION OF ad_events FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS ad_events_2025_q2
  PARTITION OF ad_events FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE IF NOT EXISTS ad_events_2025_q3
  PARTITION OF ad_events FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE IF NOT EXISTS ad_events_2025_q4
  PARTITION OF ad_events FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');
CREATE TABLE IF NOT EXISTS ad_events_2026_q1
  PARTITION OF ad_events FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS ad_events_2026_q2
  PARTITION OF ad_events FOR VALUES FROM ('2026-04-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS ad_events_2026_q3
  PARTITION OF ad_events FOR VALUES FROM ('2026-07-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS ad_events_2026_q4
  PARTITION OF ad_events FOR VALUES FROM ('2026-10-01') TO ('2027-01-01');
CREATE TABLE IF NOT EXISTS ad_events_default
  PARTITION OF ad_events DEFAULT;

COMMENT ON TABLE ad_events IS
  'Raw impression/click events. Aggregated nightly into ad_stats_daily.
   Purge raw events after 90 days with fn_purge_old_ad_events().';

-- ── Pre-aggregated daily stats ────────────────────────────────
CREATE TABLE IF NOT EXISTS ad_stats_daily (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id       UUID    NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  stat_date   DATE    NOT NULL,
  impressions INT     NOT NULL DEFAULT 0,
  clicks      INT     NOT NULL DEFAULT 0,
  UNIQUE (ad_id, stat_date)
);
COMMENT ON TABLE ad_stats_daily IS
  'Daily aggregate of ad_events. Populated by fn_aggregate_ad_stats() nightly.';

-- ── Seed ad zones ─────────────────────────────────────────────
INSERT INTO ad_zones
  (slug, name, position, width, height, appears_on, is_active, sort_order)
VALUES
  ('below-header-desktop',   'Below Header — Leaderboard 728×90',      'below_header',          728, 90,  ARRAY['all'],                                           TRUE,  10),
  ('below-header-mobile',    'Below Header — Mobile 320×50',           'below_header',          320, 50,  ARRAY['all'],                                           TRUE,  11),
  ('sidebar-top',            'Sidebar Top Rectangle 300×250',          'sidebar_top',           300, 250, ARRAY['post_detail'],                                   TRUE,  20),
  ('sidebar-sticky',         'Sidebar Sticky 300×600',                 'sidebar_sticky',        300, 600, ARRAY['post_detail'],                                   TRUE,  21),
  ('below-dates-box',        'Below Dates Box 300×250',                'below_dates_box',       300, 250, ARRAY['post_detail'],                                   TRUE,  30),
  ('mid-content',            'Mid Content Rectangle 300×250',          'mid_content',           300, 250, ARRAY['post_detail'],                                   TRUE,  40),
  ('below-content',          'Below Content Leaderboard 728×90',       'below_content',         728, 90,  ARRAY['post_detail'],                                   TRUE,  50),
  ('listing-between-cards',  'Between Cards — Listing Pages 320×100',  'listing_between_cards', 320, 100, ARRAY['job_listing','result_listing','admit_listing'],  TRUE,  60),
  ('above-faq',              'Above FAQ Leaderboard 728×90',           'above_faq',             728, 90,  ARRAY['post_detail'],                                   TRUE,  70),
  ('footer-top',             'Footer Leaderboard 728×90',              'footer_top',            728, 90,  ARRAY['all'],                                           TRUE,  80),
  ('floating-bottom-mobile', 'Floating Bottom Bar Mobile 320×50',      'floating_bottom',       320, 50,  ARRAY['all'],                                           FALSE, 90)
ON CONFLICT (slug) DO NOTHING;
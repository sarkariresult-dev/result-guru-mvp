-- ═══════════════════════════════════════════════════════════════
-- 024_web_stories.sql - Result Guru
-- Google Web Stories (AMP) database schema
--
-- DESIGN DECISIONS:
-- ✅ Separate from `posts` to isolate AMP-specific requirements.
-- ✅ `web_story_slides` uses `position` for ordering.
-- ✅ Supports `cta_link` (Call To Action / Swipe Up).
-- ═══════════════════════════════════════════════════════════════

-- 1. Web Stories (Main Table)
CREATE TABLE IF NOT EXISTS web_stories (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT        NOT NULL,
  slug            TEXT        UNIQUE NOT NULL,
  cover_image     TEXT        NOT NULL, -- URL or storage path (required for Discover)
  publisher_logo  TEXT,                 -- Fallback to site config if null
  status          post_status NOT NULL DEFAULT 'draft',
  
  -- SEO & Meta
  meta_title      TEXT,
  meta_desc       TEXT,
  author_id       UUID        REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE web_stories IS 'Google Web Stories (AMP formats). Requires minimum 4 slides to be valid in Discover.';

-- 2. Web Story Slides (Child Table)
CREATE TABLE IF NOT EXISTS web_story_slides (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id        UUID        NOT NULL REFERENCES web_stories(id) ON DELETE CASCADE,
  position        INT         NOT NULL DEFAULT 0,
  
  -- Visuals
  bg_image        TEXT        NOT NULL, -- 9:16 portrait image URL/path
  bg_color        TEXT        DEFAULT '#000000',
  
  -- Content (Text overlaid on image)
  headline        TEXT,
  description     TEXT,
  text_color      TEXT        DEFAULT '#ffffff',
  
  -- Swipe Up (Call to action)
  cta_text        TEXT,       -- e.g. "Apply Now", "Read Full Job"
  cta_link        TEXT,       -- The URL to open on swipe
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (story_id, position) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE web_story_slides IS 'Individual 9:16 portrait slides for a Web Story. Ordered by position.';

-- 3. Trigger for updated_at
CREATE TRIGGER trg_web_stories_updated_at
  BEFORE UPDATE ON web_stories
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

CREATE TRIGGER trg_web_story_slides_updated_at
  BEFORE UPDATE ON web_story_slides
  FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- 4. RLS Policies
ALTER TABLE web_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_story_slides ENABLE ROW LEVEL SECURITY;

-- Public read access for published stories
CREATE POLICY "Public can view published web_stories" 
  ON web_stories FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view slides of published stories" 
  ON web_story_slides FOR SELECT USING (
    EXISTS (SELECT 1 FROM web_stories WHERE id = web_story_slides.story_id AND status = 'published')
  );

-- Staff full access (Admin full access, Authors manage own)
CREATE POLICY "Staff can manage web_stories" 
  ON web_stories FOR ALL 
  USING (
    fn_is_admin() 
    OR (fn_is_author_or_admin() AND author_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  )
  WITH CHECK (fn_is_author_or_admin());

CREATE POLICY "Staff can manage web_story_slides" 
  ON web_story_slides FOR ALL 
  USING (
    fn_is_admin() 
    OR (
      fn_is_author_or_admin() 
      AND EXISTS (
        SELECT 1 FROM web_stories 
        WHERE id = web_story_slides.story_id 
        AND author_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
      )
    )
  )
  WITH CHECK (fn_is_author_or_admin());


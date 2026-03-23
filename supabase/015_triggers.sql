-- ═══════════════════════════════════════════════════════════════
-- 015_triggers.sql - Result Guru
-- All trigger functions and their attachments.
-- ═══════════════════════════════════════════════════════════════

-- fn_update_timestamp has been moved to 003_helper_functions.sql
DO $$ BEGIN CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN CREATE TRIGGER trg_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN CREATE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON ad_campaigns FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN CREATE TRIGGER trg_affiliate_updated_at BEFORE UPDATE ON affiliate_products FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN CREATE TRIGGER trg_web_stories_updated_at BEFORE UPDATE ON web_stories FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN CREATE TRIGGER trg_web_story_slides_updated_at BEFORE UPDATE ON web_story_slides FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── 2. Maintain search_vector + title_lower ─────────────────────────
CREATE OR REPLACE FUNCTION fn_update_search_fields()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
DECLARE _text TEXT;
BEGIN
  _text := unaccent(COALESCE(NEW.title, '')) || ' ' || unaccent(COALESCE(NEW.excerpt, '')) || ' ' || unaccent(COALESCE(NEW.org_name, '')) || ' ' || unaccent(COALESCE(NEW.focus_keyword, '')) || ' ' || unaccent(COALESCE(array_to_string(NEW.secondary_keywords,' '),'')) || ' ' || unaccent(COALESCE(array_to_string(NEW.meta_keywords, ' '),''));
  NEW.search_vector := to_tsvector('simple', _text);
  NEW.title_lower   := lower(COALESCE(NEW.title, ''));
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_posts_search_fields
    BEFORE INSERT OR UPDATE OF title, excerpt, org_name, focus_keyword, secondary_keywords, meta_keywords
    ON posts FOR EACH ROW EXECUTE FUNCTION fn_update_search_fields();
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── 3. Word count + reading time + content_updated_at ─────────────
CREATE OR REPLACE FUNCTION fn_calculate_post_metrics()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
DECLARE _wc INT;
BEGIN
  _wc := COALESCE(array_length(string_to_array(trim(strip_html(NEW.content)), ' '), 1), 0);
  NEW.word_count       := _wc;
  NEW.reading_time_min := GREATEST(1, ROUND(_wc::NUMERIC / 200));
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.content IS DISTINCT FROM OLD.content) THEN
    NEW.content_updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_posts_metrics BEFORE INSERT OR UPDATE OF content ON posts FOR EACH ROW EXECUTE FUNCTION fn_calculate_post_metrics();
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── 4. SEO score (0–100 composite) ─────────────────────────────────
CREATE OR REPLACE FUNCTION fn_calculate_seo_score()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
DECLARE _s INT := 0;
BEGIN
  IF char_length(COALESCE(NEW.title,'')) BETWEEN 20 AND 70 THEN _s := _s + 20; ELSIF NEW.title IS NOT NULL THEN _s := _s + 10; END IF;
  IF char_length(COALESCE(NEW.meta_description,'')) BETWEEN 100 AND 160 THEN _s := _s + 15; ELSIF NEW.meta_description IS NOT NULL THEN _s := _s + 7;  END IF;
  IF char_length(COALESCE(NEW.meta_title,'')) BETWEEN 30 AND 60 THEN _s := _s + 10; ELSIF NEW.meta_title IS NOT NULL THEN _s := _s + 5;  END IF;
  IF NEW.focus_keyword IS NOT NULL THEN _s := _s + 10; END IF;
  IF NEW.featured_image IS NOT NULL AND NEW.featured_image_alt IS NOT NULL THEN _s := _s + 10; ELSIF NEW.featured_image IS NOT NULL THEN _s := _s + 5;  END IF;
  IF COALESCE(NEW.word_count, 0) >= 800  THEN _s := _s + 10; ELSIF COALESCE(NEW.word_count, 0) >= 300 THEN _s := _s + 5;  END IF;
  IF NEW.excerpt IS NOT NULL THEN _s := _s + 5; END IF;
  IF NEW.faq IS NOT NULL AND jsonb_array_length(NEW.faq) > 0 THEN _s := _s + 5; END IF;
  IF NEW.og_image IS NOT NULL OR NEW.featured_image IS NOT NULL THEN _s := _s + 5; END IF;
  IF char_length(COALESCE(NEW.slug,'')) <= 75 THEN _s := _s + 5; END IF;
  IF array_length(NEW.secondary_keywords, 1) > 0 THEN _s := _s + 5; END IF;
  NEW.seo_score := LEAST(100, _s);
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_posts_seo_score
    BEFORE INSERT OR UPDATE OF title, meta_title, meta_description, focus_keyword, featured_image, featured_image_alt, excerpt, faq, og_image, slug, secondary_keywords, word_count
    ON posts FOR EACH ROW EXECUTE FUNCTION fn_calculate_seo_score();
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── 5. Auto-set published_at on first publish ─────────────────────
CREATE OR REPLACE FUNCTION fn_set_published_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status <> 'published') THEN
      NEW.published_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN CREATE TRIGGER trg_posts_published_at BEFORE INSERT OR UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION fn_set_published_at(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN CREATE TRIGGER trg_web_stories_published_at BEFORE INSERT OR UPDATE ON web_stories FOR EACH ROW EXECUTE FUNCTION fn_set_published_at(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── 6. Sync post_qualifications ───────────────────────────────────
CREATE OR REPLACE FUNCTION fn_sync_post_qualifications()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
BEGIN
  DELETE FROM post_qualifications WHERE post_id = NEW.id AND qualification_slug <> ALL(COALESCE(NEW.qualification, '{}'));
  IF NEW.qualification IS NOT NULL AND array_length(NEW.qualification, 1) > 0 THEN
    INSERT INTO post_qualifications (post_id, qualification_slug) SELECT NEW.id, unnest(NEW.qualification) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NULL;
END;
$$;

DO $$ BEGIN CREATE TRIGGER trg_sync_post_qualifications AFTER INSERT OR UPDATE OF qualification ON posts FOR EACH ROW EXECUTE FUNCTION fn_sync_post_qualifications(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── 7. tags.post_count counter ────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_tag_post_count()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE tags SET post_count = post_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE tags SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.tag_id; END IF;
  RETURN NULL;
END;
$$;

DO $$ BEGIN CREATE TRIGGER trg_tag_count_insert AFTER INSERT ON post_tags FOR EACH ROW EXECUTE FUNCTION fn_update_tag_post_count(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;
DO $$ BEGIN CREATE TRIGGER trg_tag_count_delete AFTER DELETE ON post_tags FOR EACH ROW EXECUTE FUNCTION fn_update_tag_post_count(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── 8. Internal link counter on posts ─────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_internal_link_count()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN UPDATE posts SET internal_links_count = internal_links_count + 1 WHERE id = NEW.source_id;
  ELSIF TG_OP = 'DELETE' THEN UPDATE posts SET internal_links_count = GREATEST(0, internal_links_count - 1) WHERE id = OLD.source_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.source_id <> OLD.source_id THEN
    UPDATE posts SET internal_links_count = GREATEST(0, internal_links_count - 1) WHERE id = OLD.source_id;
    UPDATE posts SET internal_links_count = internal_links_count + 1 WHERE id = NEW.source_id;
  END IF;
  RETURN NULL;
END;
$$;

DO $$ BEGIN CREATE TRIGGER trg_internal_link_count AFTER INSERT OR UPDATE OR DELETE ON post_internal_links FOR EACH ROW EXECUTE FUNCTION fn_update_internal_link_count(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── 9. Redirect chain detection ───────────────────────────────────
CREATE OR REPLACE FUNCTION fn_detect_redirect_chain()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
BEGIN
  NEW.is_chained := (NEW.to_path IS NOT NULL AND EXISTS (SELECT 1 FROM redirects WHERE from_path = NEW.to_path AND is_active = TRUE AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)));
  RETURN NEW;
END;
$$;

DO $$ BEGIN CREATE TRIGGER trg_redirect_chain_check BEFORE INSERT OR UPDATE ON redirects FOR EACH ROW EXECUTE FUNCTION fn_detect_redirect_chain(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- ── 10. Denormalise org fields when post.organization_id changes ──
CREATE OR REPLACE FUNCTION fn_denorm_org_fields()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY INVOKER SET search_path = public AS $$
DECLARE _org organizations%ROWTYPE;
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.org_name := NULL; NEW.org_short_name := NULL; RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.organization_id IS DISTINCT FROM OLD.organization_id) THEN
    SELECT * INTO _org FROM organizations WHERE id = NEW.organization_id;
    NEW.org_name := _org.name; NEW.org_short_name := _org.short_name;
  END IF;
  RETURN NEW;
END;
$$;

DO $$ BEGIN CREATE TRIGGER trg_posts_denorm_org BEFORE INSERT OR UPDATE OF organization_id ON posts FOR EACH ROW EXECUTE FUNCTION fn_denorm_org_fields(); EXCEPTION WHEN duplicate_object THEN NULL; END$$;

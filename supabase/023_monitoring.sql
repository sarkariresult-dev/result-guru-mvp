-- ═══════════════════════════════════════════════════════════════
-- 023_monitoring.sql - Result Guru
-- Adds monitoring sources, jobs, tracking logs, updates, and snapshots.
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Create organization_sources ─────────────────────────
CREATE TABLE IF NOT EXISTS organization_sources (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  url             TEXT        NOT NULL,
  selector        TEXT,
  source_type     TEXT        DEFAULT 'webpage',
  is_active       BOOLEAN     DEFAULT true,
  last_hash       TEXT,
  last_checked_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, url)
);

CREATE INDEX IF NOT EXISTS idx_org_sources_org_id ON organization_sources(organization_id);

-- ── 2. Create monitoring_jobs ───────────────────────────────
CREATE TABLE IF NOT EXISTS monitoring_jobs (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id        TEXT        NOT NULL UNIQUE,
  status          TEXT        NOT NULL DEFAULT 'running', 
  trigger_type    TEXT        NOT NULL,                  
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  total_sources   INTEGER     NOT NULL DEFAULT 0,
  processed_count INTEGER     NOT NULL DEFAULT 0,
  updates_count   INTEGER     NOT NULL DEFAULT 0,
  errors_count    INTEGER     NOT NULL DEFAULT 0,
  muffled_count   INTEGER     NOT NULL DEFAULT 0,
  total_orgs      INTEGER     DEFAULT 0,
  processed_orgs  INTEGER     DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_monitoring_jobs_started_at ON monitoring_jobs(started_at DESC);

-- ── 3. Create monitoring_logs ──────────────────
CREATE TABLE IF NOT EXISTS monitoring_logs (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_id           UUID        REFERENCES monitoring_jobs(id) ON DELETE CASCADE,
  source_id        UUID        REFERENCES organization_sources(id) ON DELETE CASCADE,
  source_url       TEXT        NOT NULL,
  checked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status           TEXT        NOT NULL, -- 'no_change', 'updated', 'error'
  error_message    TEXT,
  raw_diff         TEXT,
  content_hash     TEXT,
  draft_post_id    UUID        REFERENCES posts(id) ON DELETE SET NULL,
  response_code    INTEGER,
  duration_ms      INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_logs_org_id ON monitoring_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_job_id ON monitoring_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_source_id ON monitoring_logs(source_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_draft_post ON monitoring_logs(draft_post_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_logs_checked_at ON monitoring_logs(checked_at DESC);

-- ── 4. Create monitoring_source_snapshots ──────────────────────
CREATE TABLE IF NOT EXISTS monitoring_source_snapshots (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id       UUID        NOT NULL REFERENCES organization_sources(id) ON DELETE CASCADE,
  content_hash    TEXT        NOT NULL,
  content_text    TEXT,       
  storage_path    TEXT,       
  captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_source_id ON monitoring_source_snapshots(source_id);

-- ── 5. Create monitoring_updates ───────────────────────────────
CREATE TABLE IF NOT EXISTS monitoring_updates (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_id       UUID        NOT NULL REFERENCES organization_sources(id) ON DELETE CASCADE,
  job_id          UUID        REFERENCES monitoring_jobs(id) ON DELETE SET NULL,
  title           TEXT,
  summary         TEXT,
  source_url      TEXT        NOT NULL,
  old_snapshot_id UUID        REFERENCES monitoring_source_snapshots(id) ON DELETE SET NULL,
  new_snapshot_id UUID        REFERENCES monitoring_source_snapshots(id) ON DELETE SET NULL,
  draft_post_id   UUID        REFERENCES posts(id) ON DELETE SET NULL,
  status          TEXT        DEFAULT 'new', -- 'new', 'reviewed', 'published', 'ignored'
  detected_at     TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_updates_org_id ON monitoring_updates(organization_id);
CREATE INDEX IF NOT EXISTS idx_updates_source_id ON monitoring_updates(source_id);
CREATE INDEX IF NOT EXISTS idx_updates_job_id ON monitoring_updates(job_id);
CREATE INDEX IF NOT EXISTS idx_updates_old_snapshot ON monitoring_updates(old_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_updates_new_snapshot ON monitoring_updates(new_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_updates_draft_post ON monitoring_updates(draft_post_id);
CREATE INDEX IF NOT EXISTS idx_updates_status ON monitoring_updates(status);

-- ── 6. Create monitoring_notifications ─────────────────────────
CREATE TABLE IF NOT EXISTS monitoring_notifications (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  update_id       UUID        NOT NULL REFERENCES monitoring_updates(id) ON DELETE CASCADE,
  channel         TEXT        NOT NULL, -- 'telegram', 'email', 'push'
  status          TEXT        DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_notifications_update_id ON monitoring_notifications(update_id);

-- ── 7. Create monitoring_events (for Job Details Timeline) ─────
CREATE TABLE IF NOT EXISTS monitoring_events (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id          UUID        NOT NULL REFERENCES monitoring_jobs(id) ON DELETE CASCADE,
  event_type      TEXT        NOT NULL, -- 'job_started', 'org_started', 'source_scanned', etc.
  message         TEXT,
  metadata        JSONB       DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_events_job_id ON monitoring_events(job_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_events_created_at ON monitoring_events(created_at DESC);

-- ── 8. Enable RLS and Configure Policies ───────────────────────
ALTER TABLE monitoring_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_source_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_events ENABLE ROW LEVEL SECURITY;

-- Select policies: Admin and Author roles can read
DROP POLICY IF EXISTS "jobs_staff_read" ON monitoring_jobs;
CREATE POLICY "jobs_staff_read" ON monitoring_jobs FOR SELECT USING (fn_is_author_or_admin());

DROP POLICY IF EXISTS "logs_staff_read" ON monitoring_logs;
CREATE POLICY "logs_staff_read" ON monitoring_logs FOR SELECT USING (fn_is_author_or_admin());

DROP POLICY IF EXISTS "org_sources_staff_read" ON organization_sources;
CREATE POLICY "org_sources_staff_read" ON organization_sources FOR SELECT USING (fn_is_author_or_admin());

DROP POLICY IF EXISTS "snapshots_staff_read" ON monitoring_source_snapshots;
CREATE POLICY "snapshots_staff_read" ON monitoring_source_snapshots FOR SELECT USING (fn_is_author_or_admin());

DROP POLICY IF EXISTS "updates_staff_read" ON monitoring_updates;
CREATE POLICY "updates_staff_read" ON monitoring_updates FOR SELECT USING (fn_is_author_or_admin());

DROP POLICY IF EXISTS "notifications_staff_read" ON monitoring_notifications;
CREATE POLICY "notifications_staff_read" ON monitoring_notifications FOR SELECT USING (fn_is_author_or_admin());

DROP POLICY IF EXISTS "events_staff_read" ON monitoring_events;
CREATE POLICY "events_staff_read" ON monitoring_events FOR SELECT USING (fn_is_author_or_admin());

-- Write policies: Admin only
DROP POLICY IF EXISTS "jobs_admin_write" ON monitoring_jobs;
CREATE POLICY "jobs_admin_write" ON monitoring_jobs FOR ALL USING (fn_is_admin());

DROP POLICY IF EXISTS "logs_admin_write" ON monitoring_logs;
CREATE POLICY "logs_admin_write" ON monitoring_logs FOR ALL USING (fn_is_admin());

DROP POLICY IF EXISTS "org_sources_admin_write" ON organization_sources;
CREATE POLICY "org_sources_admin_write" ON organization_sources FOR ALL USING (fn_is_admin());

DROP POLICY IF EXISTS "snapshots_admin_write" ON monitoring_source_snapshots;
CREATE POLICY "snapshots_admin_write" ON monitoring_source_snapshots FOR ALL USING (fn_is_admin());

DROP POLICY IF EXISTS "updates_admin_write" ON monitoring_updates;
CREATE POLICY "updates_admin_write" ON monitoring_updates FOR ALL USING (fn_is_admin());

DROP POLICY IF EXISTS "notifications_admin_write" ON monitoring_notifications;
CREATE POLICY "notifications_admin_write" ON monitoring_notifications FOR ALL USING (fn_is_admin());

DROP POLICY IF EXISTS "events_admin_write" ON monitoring_events;
CREATE POLICY "events_admin_write" ON monitoring_events FOR ALL USING (fn_is_admin());

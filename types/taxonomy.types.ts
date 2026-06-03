// =============================================================
// taxonomy.types.ts - Result Guru
// Mirrors 004_taxonomy.sql - states, qualifications,
// organizations, categories, tags.
// =============================================================

// ── State ──────────────────────────────────────────────────
export interface State {
    slug: string
    name: string
    abbr: string | null
    is_active: boolean
    sort_order: number
    // SEO
    meta_title: string | null
    meta_description: string | null
    meta_robots: string
    h1_override: string | null
    intro_html: string | null
    created_at: string
}

export type StateSlug = string  // e.g. "uttar-pradesh", "central"

// ── Qualification ──────────────────────────────────────────
export interface Qualification {
    slug: string
    name: string
    short_name: string | null
    sort_order: number
    is_active: boolean
    // SEO
    meta_title: string | null
    meta_description: string | null
    meta_robots: string
    created_at: string
}

// ── Organization Source ────────────────────────────────────
export interface OrganizationSource {
    id: string
    organization_id: string
    name: string
    url: string
    selector: string | null
    source_type: string
    is_active: boolean
    last_hash: string | null
    last_checked_at: string | null
    created_at: string
    updated_at: string
}

// ── Monitoring Job ─────────────────────────────────────────
export interface MonitoringJob {
    id: string
    short_id: string
    status: 'running' | 'completed' | 'failed'
    trigger_type: 'manual' | 'cron' | 'manual_single'
    started_at: string
    completed_at: string | null
    total_sources: number
    processed_count: number
    updates_count: number
    errors_count: number
    muffled_count: number
    total_orgs: number
    processed_orgs: number
}

// ── Monitoring Log ─────────────────────────────────────────
export interface MonitoringLog {
    id: string
    organization_id: string
    job_id: string | null
    source_id: string | null
    source_url: string
    checked_at: string
    status: 'no_change' | 'updated' | 'error'
    error_message: string | null
    raw_diff: string | null
    content_hash: string | null
    draft_post_id: string | null
    response_code: number | null
    duration_ms: number | null
    created_at: string
    organizations?: { name: string; short_name: string | null } | { name: string; short_name: string | null }[] | null
}

// ── Monitoring Snapshot ────────────────────────────────────
export interface MonitoringSourceSnapshot {
    id: string
    source_id: string
    content_hash: string
    content_text: string | null
    storage_path: string | null
    captured_at: string
}

// ── Monitoring Update ──────────────────────────────────────
export interface MonitoringUpdate {
    id: string
    organization_id: string
    source_id: string
    job_id: string | null
    title: string | null
    summary: string | null
    source_url: string
    old_snapshot_id: string | null
    new_snapshot_id: string | null
    draft_post_id: string | null
    status: 'new' | 'reviewed' | 'published' | 'ignored'
    detected_at: string
    created_at: string
    updated_at: string
}

// ── Monitoring Notification ────────────────────────────────
export interface MonitoringNotification {
    id: string
    update_id: string
    channel: string
    status: 'pending' | 'sent' | 'failed'
    sent_at: string | null
    created_at: string
}

// ── Monitoring Event ───────────────────────────────────────
export interface MonitoringEvent {
    id: string
    job_id: string
    event_type: string
    message: string | null
    metadata: Record<string, unknown>
    created_at: string
}

// ── Organization ───────────────────────────────────────────
export interface Organization {
    id: string
    slug: string
    name: string
    short_name: string | null
    state_slug: string | null
    /** Canonical source URL - shown on post pages, NOT stored on posts */
    official_url: string | null
    logo_url: string | null
    description: string | null
    is_active: boolean
    sources: OrganizationSource[]
    // SEO
    meta_title: string | null
    meta_description: string | null
    meta_robots: string
    schema_json: Record<string, unknown> | null
    created_at: string
}

// ── Category ───────────────────────────────────────────────
export interface Category {
    id: string
    slug: string
    name: string
    parent_id: string | null
    description: string | null
    icon: string | null
    sort_order: number
    is_active: boolean
    // SEO
    meta_title: string | null
    meta_description: string | null
    meta_robots: string
    h1_override: string | null
    intro_html: string | null
    created_at: string
}

export interface CategoryWithParent extends Category {
    parent?: Category | null
}

export interface CategoryWithChildren extends Category {
    children: Category[]
}

// ── Tag ────────────────────────────────────────────────────
export interface Tag {
    id: string
    slug: string
    name: string
    description: string | null
    tag_type: string        // 'general' | 'job' | 'exam' | 'result' | ...
    post_count: number
    is_active: boolean
    canonical_tag_id: string | null
    // SEO
    meta_title: string | null
    meta_description: string | null
    meta_robots: string
    created_at: string
}

// ── Taxonomy summary (used in dropdowns / filters) ─────────
export interface TaxonomySummary {
    states: Pick<State, 'slug' | 'name' | 'abbr'>[]
    qualifications: Pick<Qualification, 'slug' | 'name' | 'short_name'>[]
    categories: Pick<Category, 'id' | 'slug' | 'name' | 'parent_id'>[]
    organizations: Pick<Organization, 'id' | 'slug' | 'name' | 'short_name' | 'logo_url'>[]
    tags: Pick<Tag, 'id' | 'slug' | 'name' | 'tag_type' | 'post_count'>[]
}
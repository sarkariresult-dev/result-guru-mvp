// =============================================================
// taxonomy.types.ts — Result Guru
// Mirrors 004_taxonomy.sql — states, qualifications,
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

// ── Organization ───────────────────────────────────────────
export interface Organization {
    id: string
    slug: string
    name: string
    short_name: string | null
    state_slug: string | null
    /** Canonical source URL — shown on post pages, NOT stored on posts */
    official_url: string | null
    logo_url: string | null
    description: string | null
    is_active: boolean
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
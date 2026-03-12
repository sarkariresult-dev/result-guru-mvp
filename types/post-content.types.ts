// =============================================================
// post-content.types.ts - Result Guru
// Typed shapes for every JSONB column on the posts table.
// These are the most important types - they drive all frontend
// post-detail rendering.
// =============================================================



// ── FAQ ────────────────────────────────────────────────────
// Column: posts.faq
// Used by: any post type
export interface FaqItem {
    q: string   // Question
    a: string   // Answer (may contain HTML)
}

export type Faq = FaqItem[]

// ── Hreflang ──────────────────────────────────────────────
// Column: posts.hreflang
export interface HreflangEntry {
    lang: string    // BCP-47 e.g. "hi-IN", "en-IN"
    url: string
}

export type Hreflang = HreflangEntry[]

// ── Breadcrumb Override ────────────────────────────────────
// Column: posts.breadcrumb_override
export interface BreadcrumbItem {
    label: string
    href: string
}

export type BreadcrumbOverride = BreadcrumbItem[]

// ── Aggregate: all JSONB content columns ──────────────────
export interface PostStructuredContent {
    faq: Faq
}
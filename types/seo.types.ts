// =============================================================
// seo.types.ts - Result Guru
// Mirrors 013_seo.sql - settings, redirects, search analytics,
// sitemap config.
// =============================================================

import type { RedirectType, ChangeFreq } from './enums'

// ── Global SEO settings ────────────────────────────────────
export interface SeoSettings {
    site_name: string
    site_tagline: string
    site_url: string
    default_og_image: string
    default_og_image_width: string
    default_og_image_height: string
    twitter_handle: string

    google_tag_id: string
    google_verification: string
    bing_verification: string
    robots_global: string
    robots_pagination: string
    robots_search: string
    sitemap_posts_per_index: string
    sitemap_ping_google: string
    website_schema_json: string   // JSON string
    organization_schema_json: string   // JSON string
    [key: string]: string
}

export interface SeoSettingRow {
    key: string
    value: string | null
    description: string | null
    updated_at: string
}

// ── URL redirect ───────────────────────────────────────────
export interface Redirect {
    id: string
    from_path: string
    to_path: string | null
    type: RedirectType
    hits: number
    is_active: boolean
    /** TRUE when to_path itself has a redirect (chain) - set by trigger */
    is_chained: boolean
    note: string | null
    created_at: string
}

// ── v_redirect_chains row ──────────────────────────────────
export interface RedirectChainRow {
    original_from: string
    intermediate_url: string
    final_destination: string
    first_hop_code: RedirectType
    second_hop_code: RedirectType
}

// ── Search query log ───────────────────────────────────────
export interface SearchQueryLog {
    id: number
    query: string
    results_count: number
    post_clicked: string | null
    device: string | null
    searched_at: string
}

// ── Sitemap config row ─────────────────────────────────────
export interface SitemapConfig {
    id: string
    url_pattern: string
    changefreq: ChangeFreq
    priority: number        // 0.0–1.0
    include: boolean
    note: string | null
}

// ── Structured page metadata ───────────────────────────────
// What the frontend assembles for <head> rendering
export interface PageMetadata {
    title: string
    description: string
    canonical: string
    robots: string
    og: {
        title: string
        description: string
        image: string
        image_width: number
        image_height: number
        type: string
        url: string
        site_name: string
        locale: string
    }
    twitter: {
        card: string
        title: string
        description: string
        image: string
        site: string
    }
    schema_json?: Record<string, unknown>
    hreflang?: { lang: string; url: string }[]
}



// ── Redirect create payload ────────────────────────────────
export interface CreateRedirectPayload {
    from_path: string
    to_path?: string | null
    type?: RedirectType
    note?: string
}

// ── Internal search request / response ────────────────────
export interface SearchRequest {
    query: string
    type?: string
    state_slug?: string
    page?: number
    limit?: number
}

export interface SearchSuggestion {
    query: string
    count: number
}
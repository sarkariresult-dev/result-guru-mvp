// =============================================================
// post.types.ts - Result Guru
// Mirrors 007_posts.sql and the v_published_posts view.
// =============================================================

import type {
    PostType,
    PostStatus,
    ApplicationStatus,
    TwitterCardType,
} from './enums'
import type {
    Faq,
    Hreflang,
    BreadcrumbOverride,
} from './post-content.types'
import type { InternalLinkType } from './enums'

// ── Base post (mirrors DB columns) ────────────────────────
export interface Post {
    // Identity
    id: string
    type: PostType
    status: PostStatus
    application_start_date: string | null
    application_end_date: string | null

    // Content
    title: string
    slug: string
    excerpt: string | null
    content: string | null

    // Taxonomy
    state_slug: string | null
    organization_id: string | null
    /** Denormalised org display name */
    org_name: string | null
    /** Denormalised org short name */
    org_short_name: string | null
    qualification: string[] | null   // qualification slugs
    category_id: string | null

    // Media
    featured_image: string | null
    featured_image_alt: string | null
    featured_image_width: number | null
    featured_image_height: number | null
    notification_pdf: string | null    // Storage path - build URL via helper

    // Key links (external URLs, type-specific)
    admit_card_link: string | null
    result_link: string | null
    answer_key_link: string | null

    // Structured content (JSONB)

    faq: Faq
    related_post_ids: string[] | null

    // SEO
    meta_title: string | null
    meta_description: string | null
    meta_keywords: string[] | null
    focus_keyword: string | null
    secondary_keywords: string[] | null
    canonical_url: string | null     // NULL = self-canonical
    robots_directive: string
    noindex: boolean
    structured_data_type: string
    schema_json: Record<string, unknown> | null
    hreflang: Hreflang
    breadcrumb_override: BreadcrumbOverride

    // Open Graph / Twitter
    og_title: string | null
    og_description: string | null
    og_image: string | null
    og_image_width: number
    og_image_height: number
    twitter_title: string | null
    twitter_description: string | null
    twitter_card_type: TwitterCardType

    // Computed metrics (trigger-maintained)
    seo_score: number            // 0–100
    word_count: number
    reading_time_min: number
    internal_links_count: number
    last_reviewed_at: string | null
    content_updated_at: string | null

    // Publishing
    author_id: string | null
    published_at: string | null
    scheduled_at: string | null
    expires_at: string | null

    // Analytics
    view_count: number
    share_count: number

    // Timestamps
    created_at: string
    updated_at: string

    // Search (internal - usually not returned to clients)
    search_vector?: unknown
    title_lower?: string | null
}

// ── v_published_posts (view - adds joined fields) ─────────
// This is the shape returned by the Supabase view.
// Use this for all public-facing queries.
export interface PublishedPost extends Post {
    // From states JOIN
    state_name: string | null
    // From organizations JOIN
    org_official_url: string | null     // ← organisations.official_url
    org_logo_url: string | null
    // From categories JOIN
    category_name: string | null
    category_slug: string | null
    
    // Computed from application_start_date and application_end_date in v_published_posts
    application_status: ApplicationStatus
}

// ── Post card (lightweight - used in listing pages) ───────
export type PostCard = Pick<
    PublishedPost,
    | 'id'
    | 'type'
    | 'application_status'
    | 'title'
    | 'slug'
    | 'excerpt'
    | 'state_slug'
    | 'state_name'
    | 'org_name'
    | 'org_short_name'
    | 'org_logo_url'
    | 'category_slug'
    | 'category_name'
    | 'qualification'
    | 'featured_image'
    | 'featured_image_alt'
    | 'view_count'
    | 'reading_time_min'
    | 'application_start_date'
    | 'application_end_date'
    | 'published_at'
    | 'updated_at'
>

/** @deprecated Use PostCard */
export type PostSummary = PostCard

// ── Post detail (full data - used on detail pages) ────────
export type PostDetail = PublishedPost & {
    tags?: PostTagEntry[]
    author?: { id: string; name: string; avatar_url: string | null } | null
    affiliates?: PostAffiliateProductEntry[]
}

// ── Post SEO head data ─────────────────────────────────────
export type PostSeoHead = Pick<
    PublishedPost,
    | 'title'
    | 'slug'
    | 'type'
    | 'meta_title'
    | 'meta_description'
    | 'meta_keywords'
    | 'focus_keyword'
    | 'canonical_url'
    | 'robots_directive'
    | 'noindex'
    | 'og_title'
    | 'og_description'
    | 'og_image'
    | 'og_image_width'
    | 'og_image_height'
    | 'twitter_title'
    | 'twitter_description'
    | 'twitter_card_type'
    | 'schema_json'
    | 'structured_data_type'
    | 'hreflang'
    | 'breadcrumb_override'
    | 'published_at'
    | 'content_updated_at'
>

// ── Post tag (joined from post_tags + tags) ────────────────
export interface PostTagEntry {
    post_id: string
    tag_id: string
    tag: {
        slug: string
        name: string
        tag_type: string
    }
}

// ── Post affiliate product (joined) ───────────────────────
export interface PostAffiliateProductEntry {
    post_id: string
    product_id: string
    sort_order: number
    product: {
        id: string
        name: string
        slug: string
        image_url: string
        image_alt: string | null
        mrp: number | null
        selling_price: number | null
        discount_percent: number | null
        affiliate_url: string | null
        product_url: string
        badge_text: string | null
        badge_color: string | null
        stock_status: string
    }
}

// ── Internal link ──────────────────────────────────────────
export interface PostInternalLink {
    id: string
    source_id: string
    target_id: string
    anchor_text: string | null
    link_type: InternalLinkType
    created_at: string
    // Joined
    target?: Pick<Post, 'id' | 'title' | 'slug' | 'type'>
}

// ── Create / update payloads ───────────────────────────────
export type CreatePostPayload = Omit<
    Post,
    | 'id'
    | 'seo_score'
    | 'word_count'
    | 'reading_time_min'
    | 'internal_links_count'
    | 'content_updated_at'
    | 'view_count'
    | 'share_count'
    | 'created_at'
    | 'updated_at'
    | 'search_vector'
    | 'title_lower'
    | 'org_name'         // auto-populated by trigger
    | 'org_short_name'   // auto-populated by trigger
> & {
    tag_ids?: string[]
    application_status?: ApplicationStatus   // Optional for client convenience, ignored by DB
}

export type UpdatePostPayload = Partial<CreatePostPayload>

// ── Filters (listing pages + CMS) ─────────────────────────
export interface PostFilters {
    type?: PostType | PostType[]
    status?: PostStatus | PostStatus[]
    application_status?: ApplicationStatus | ApplicationStatus[]
    state_slug?: string
    organization_id?: string
    category_id?: string
    category_slug?: string
    tag_slugs?: string[]
    qualification?: string
    search?: string
    author_id?: string
    noindex?: boolean
    /** ISO date string - published_at >= this */
    published_after?: string
    /** ISO date string - published_at <= this */
    published_before?: string
}

export interface PostSortOptions {
    field: 'published_at' | 'view_count' | 'seo_score' | 'updated_at'
    order: 'asc' | 'desc'
}

// ── v_seo_audit row ────────────────────────────────────────
export interface SeoAuditRow {
    id: string
    type: PostType
    slug: string
    title: string
    status: PostStatus
    seo_score: number
    word_count: number
    reading_time_min: number
    published_at: string | null
    content_updated_at: string | null
    last_reviewed_at: string | null
    // Issue flags
    missing_meta_title: boolean
    missing_meta_desc: boolean
    missing_focus_keyword: boolean
    missing_featured_image: boolean
    missing_image_alt: boolean
    thin_content: boolean
    is_noindexed: boolean
    missing_og_image: boolean
    meta_title_too_long: boolean
    meta_desc_too_long: boolean
    missing_faq: boolean
    needs_review: boolean
    content_stale: boolean
    has_active_redirect: boolean
}

// ── v_posts_attention row ──────────────────────────────────
export interface PostAttentionRow {
    id: string
    type: PostType
    slug: string
    title: string
    seo_score: number
    application_status: ApplicationStatus
    expires_at: string | null
    attention_reason: 'expired' | 'apply_closed' | 'low_seo' | 'stale' | 'other'
    updated_at: string
}

// ── v_trending_posts row ───────────────────────────────────
export interface TrendingPostRow {
    post_id: string
    views_7d: number
    title: string
    slug: string
    type: PostType
    state_slug: string | null
    org_name: string | null
    featured_image: string | null
    featured_image_alt: string | null
    published_at: string | null
}

// ── Sitemap entry ──────────────────────────────────────────
export interface SitemapPostEntry {
    slug: string
    type: PostType
    updated_at: string
}
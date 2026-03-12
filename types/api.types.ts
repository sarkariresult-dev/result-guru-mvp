// =============================================================
// api.types.ts - Result Guru
// API response envelopes, request/query types, route params,
// and Supabase client helpers.
// =============================================================

import type { PostType, PostStatus, ApplicationStatus } from './enums'
import type { PostCard, PostDetail, PostFilters, PostSortOptions } from './post.types'
import type { PublishedPost, SeoAuditRow, TrendingPostRow, PostAttentionRow } from './post.types'
import type { AffiliateProductCard } from './affiliate.types'
import type { ActiveAd, AdRenderContext } from './advertising.types'
import type { TaxonomySummary } from './taxonomy.types'
import type { DashboardStats } from './analytics.types'

// ─────────────────────────────────────────────────────────────
// CORE RESPONSE ENVELOPES
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    data?: T
    error?: string | { message: string; code?: string }
    success?: boolean
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    hasMore: boolean
}

export interface CursorPaginatedResponse<T> {
    data: T[]
    next_cursor: string | null
    has_more: boolean
    total?: number
}

// ─────────────────────────────────────────────────────────────
// NEXT.JS ROUTE PARAMS & SEARCH PARAMS
// ─────────────────────────────────────────────────────────────

/** /[type]/[slug] - post detail page */
export interface PostPageParams {
    params: Promise<{ type: string; slug: string }>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** /states/[state] - states filter page */
export interface StatePageParams {
    params: Promise<{ state: string }>
}

/** /organizations/[organization] - organisation page */
export interface OrgPageParams {
    params: Promise<{ organization: string }>
}

/** /tags/[tag] - tag page */
export interface TagPageParams {
    params: Promise<{ tag: string }>
}

/** /categories/[category] - category page */
export interface CategoryPageParams {
    params: Promise<{ category: string }>
}

/** /states/[state]/[category] - state + category filter page */
export interface StateCategoryPageParams {
    params: Promise<{ state: string; category: string }>
}

/** /search - search results */
export interface SearchPageSearchParams {
    searchParams: Promise<{
        q?: string
        type?: string
        state?: string
        page?: string
        limit?: string
    }>
}

// ─────────────────────────────────────────────────────────────
// POST API
// ─────────────────────────────────────────────────────────────

/** GET /api/posts */
export interface GetPostsQuery extends PostFilters {
    page?: number
    limit?: number
    sort?: PostSortOptions['field']
    order?: PostSortOptions['order']
}

/** GET /api/posts/[slug] */
export type GetPostResponse = ApiResponse<PostDetail>

/** GET /api/posts (listing) */
export type GetPostsResponse = PaginatedResponse<PostCard>

/** POST /api/posts */
export type CreatePostResponse = ApiResponse<{ id: string; slug: string }>

/** PATCH /api/posts/[id] */
export type UpdatePostResponse = ApiResponse<{ id: string; updated_at: string }>

/** DELETE /api/posts/[id] */
export type DeletePostResponse = ApiResponse<{ id: string }>

// ─────────────────────────────────────────────────────────────
// SEARCH API
// ─────────────────────────────────────────────────────────────

export interface SearchQuery {
    q: string
    type?: PostType
    state?: string
    page?: number
    limit?: number
}

export interface SearchResult {
    posts: PostCard[]
    total: number
    page: number
    limit: number
    hasMore: boolean
    suggestions?: string[]
    took_ms?: number
}

export type GetSearchResponse = ApiResponse<SearchResult>

// ─────────────────────────────────────────────────────────────
// HOMEPAGE / LISTING DATA
// ─────────────────────────────────────────────────────────────

export interface HomePageData {
    latest_jobs: PostCard[]
    latest_results: PostCard[]
    latest_admit_cards: PostCard[]
    latest_answer_keys: PostCard[]
    trending: TrendingPostRow[]
    open_applications: PostCard[]
    closing_soon: PostCard[]
    featured_affiliates: AffiliateProductCard[]
}

export type GetHomePageResponse = ApiResponse<HomePageData>

export interface ListingPageData {
    posts: PostCard[]
    total: number
    page: number
    limit: number
    hasMore: boolean
    facets?: ListingFacets
}

export interface ListingFacets {
    by_state: FacetEntry[]
    by_org: FacetEntry[]
    by_qual: FacetEntry[]
    by_status: FacetEntry[]
}

export interface FacetEntry {
    value: string
    label: string
    count: number
}

// ─────────────────────────────────────────────────────────────
// AD API
// ─────────────────────────────────────────────────────────────

/** GET /api/ads - fetch ads for a zone/context */
export type GetAdsQuery = AdRenderContext

export type GetAdsResponse = ApiResponse<ActiveAd[]>

/** POST /api/ads/events - record impression or click */
export interface RecordAdEventPayload {
    ad_id: string
    zone_id?: string
    event_type: 'impression' | 'click'
    post_id?: string
    device?: string
}

export type RecordAdEventResponse = ApiResponse<void>

// ─────────────────────────────────────────────────────────────
// TAXONOMY API
// ─────────────────────────────────────────────────────────────

export type GetTaxonomyResponse = ApiResponse<TaxonomySummary>

// ─────────────────────────────────────────────────────────────
// CMS / ADMIN API
// ─────────────────────────────────────────────────────────────

export type GetDashboardStatsResponse = ApiResponse<DashboardStats>

export type GetSeoAuditResponse = PaginatedResponse<SeoAuditRow>

export type GetAttentionPostsResponse = ApiResponse<PostAttentionRow[]>

// ─────────────────────────────────────────────────────────────
// NEWSLETTER API
// ─────────────────────────────────────────────────────────────

export interface SubscribeRequest {
    email: string
    name?: string
    phone?: string
    whatsapp_opt_in?: boolean
}

export type SubscribeResponse = ApiResponse<{ id: string; email: string }>

export type UnsubscribeResponse = ApiResponse<void>

// ─────────────────────────────────────────────────────────────
// PAGE VIEW API
// ─────────────────────────────────────────────────────────────

export interface RecordViewRequest {
    post_id: string
    referrer?: string
    device?: string
}

export type RecordViewResponse = ApiResponse<void>

// ─────────────────────────────────────────────────────────────
// SUPABASE CLIENT HELPERS
// ─────────────────────────────────────────────────────────────

/** Generic Supabase query result normalised to ApiResponse */
export type SupabaseResult<T> = {
    data: T | null
    error: { message: string; code?: string } | null
}

/** Utility to map Supabase result → ApiResponse */
export function supabaseToApiResponse<T>(
    result: SupabaseResult<T>
): ApiResponse<T> {
    if (result.error) return { success: false, error: result.error }
    return { success: true, data: result.data ?? undefined }
}

/** Supabase paginated query result */
export interface SupabasePaginatedResult<T> {
    data: T[] | null
    count: number | null
    error: { message: string } | null
}

/** Pagination query params helper */
export interface PaginationParams {
    page?: number
    limit?: number
}

export function toPaginationRange(
    params: PaginationParams
): { from: number; to: number } {
    const page = Math.max(1, params.page ?? 1)
    const limit = Math.min(100, Math.max(1, params.limit ?? 20))
    const from = (page - 1) * limit
    const to = from + limit - 1
    return { from, to }
}

// ─────────────────────────────────────────────────────────────
// NEXT.JS METADATA HELPERS
// ─────────────────────────────────────────────────────────────

export interface DynamicMetadataContext {
    type: PostType | string
    slug: string
    post?: Pick<
        PublishedPost,
        | 'title'
        | 'meta_title'
        | 'meta_description'
        | 'og_image'
        | 'og_image_width'
        | 'og_image_height'
        | 'twitter_card_type'
        | 'canonical_url'
        | 'robots_directive'
        | 'noindex'
        | 'published_at'
        | 'content_updated_at'
    >
}

// ─────────────────────────────────────────────────────────────
// GENERIC UTILITY TYPES
// ─────────────────────────────────────────────────────────────

/** Make all nested properties optional - useful for patch payloads */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** Narrow an API response to its data when success is guaranteed */
export type UnwrapData<T extends ApiResponse<unknown>> =
    T extends ApiResponse<infer D> ? NonNullable<D> : never

/** ISO 8601 date string */
export type ISODateString = string

/** UUID v4 string */
export type UUID = string

/** Slug string (lowercase alphanumeric + hyphens) */
export type Slug = string
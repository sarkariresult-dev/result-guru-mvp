// =============================================================
// analytics.types.ts - Result Guru
// Mirrors 008_post_analytics.sql and analytics-related views.
// =============================================================

import type { DeviceType, PostType } from './enums'

// ── Raw page view event ────────────────────────────────────
export interface PostView {
    id: string
    post_id: string
    viewed_at: string
    referrer: string | null
    device: DeviceType | null
    country: string
    session_id: string | null
}

// ── Record view payload (RPC: fn_increment_post_view) ─────
export interface RecordPageViewPayload {
    post_id: string
    referrer?: string | null
    device?: DeviceType | null
}

// ── Post analytics aggregate ───────────────────────────────
export interface PostAnalytics {
    post_id: string
    total_views: number
    views_7d: number
    views_30d: number
    views_90d: number
    avg_daily: number
}

// ── Site-wide analytics snapshot ──────────────────────────
export interface SiteAnalyticsSnapshot {
    date: string
    total_views: number
    unique_sessions: number
    top_posts: TopPostAnalytics[]
    views_by_type: ViewsByType[]
    views_by_state: ViewsByState[]
    views_by_device: ViewsByDevice[]
}

export interface TopPostAnalytics {
    post_id: string
    title: string
    slug: string
    type: PostType
    views: number
    reading_time: number
}

export interface ViewsByType {
    type: PostType
    views: number
}

export interface ViewsByState {
    state_slug: string
    state_name: string
    views: number
}

export interface ViewsByDevice {
    device: DeviceType | null
    views: number
}

// ── Search analytics ───────────────────────────────────────
export interface SearchAnalytics {
    total_searches: number
    zero_results: number
    top_queries: TopSearchQuery[]
    trending: string[]
}

export interface TopSearchQuery {
    query: string
    count: number
    avg_results: number
    click_through: number    // % of searches that led to a click
}

// ── Dashboard stats ────────────────────────────────────────
export interface DashboardStats {
    posts: {
        total: number
        published: number
        draft: number
        review: number
        scheduled: number
    }
    views: {
        total: number
        today: number
        week: number
        month: number
    }
    ads: {
        active: number
        impressions_today: number
        clicks_today: number
    }
    seo: {
        avg_score: number
        low_score_count: number    // posts with score < 40
        needs_review: number
    }
}
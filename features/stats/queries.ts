import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { createStaticClient } from '@/lib/supabase/static'
import type { PostCard } from '@/types/post.types'

// ── Types ──────────────────────────────────────────────────────────────────

export interface PostTypeCounts {
    type: string
    total_count: number
    open_count: number
    latest_published: string | null
}

/** Map of post_type → PostCard[] returned by fn_homepage_sections() */
export type HomepageSections = Record<string, PostCard[]>

// ── Cached queries ─────────────────────────────────────────────────────────

/**
 * Fetch post counts grouped by type from the `mv_post_type_counts`
 * materialized view via the `fn_post_counts_by_type()` RPC.
 *
 * Returns O(1) data - the MV is refreshed every 15 min by pg_cron.
 * Falls back gracefully to an empty array on error so the homepage
 * renders with zero-state UI instead of crashing.
 */
export async function getPostCountsByType(): Promise<PostTypeCounts[]> {
    'use cache'
    cacheLife('minutes')
    cacheTag('stats', 'post-counts')

    const supabase = createStaticClient()

    // Try fetching from the materialized view via RPC first (O(1))
    const { data, error } = await supabase.rpc('fn_post_counts_by_type' as any)

    // If RPC succeeds and returns data, use it.
    if (!error && data && (data as any[]).length > 0) {
        return data as PostTypeCounts[]
    }

    // FALLBACK: If the materialized view is empty or RPC fails, fetch raw counts
    // from the posts table. This ensures the homepage stats are ALWAYS functional.
    const { data: fallbackData, error: rawError } = await supabase
        .from('v_published_posts')
        .select('type, application_status, published_at')

    if (rawError || !fallbackData) {
        return []
    }

    const rawCounts = fallbackData as any[]

    // Group and aggregate manually
    const map = new Map<string, PostTypeCounts>()
    
    rawCounts.forEach((p) => {
        const type = p.type as string
        const current = map.get(type) || {
            type,
            total_count: 0,
            open_count: 0,
            latest_published: null as string | null
        }

        current.total_count++
        if (p.application_status === 'open') {
            current.open_count++
        }

        // Keep track of latest published date
        if (p.published_at && (!current.latest_published || p.published_at > current.latest_published)) {
            current.latest_published = p.published_at
        }

        map.set(type, current)
    })

    return Array.from(map.values())
}

/**
 * Fetch all homepage content sections in ONE database roundtrip.
 *
 * Calls `fn_homepage_sections(limit)` which returns a JSONB object:
 * `{ "job": [...], "result": [...], "admit": [...], ... }`
 *
 * Replaces 5–6 separate `getRecentPosts()` calls, reducing TTFB by 200-400ms.
 * Falls back to empty object on error - each section renders its empty state.
 */
export async function getHomepageSections(limit = 6): Promise<HomepageSections> {
    'use cache'
    cacheLife('minutes')
    cacheTag('posts', 'homepage-sections')

    const supabase = createStaticClient()

    const { data, error } = await supabase.rpc('fn_homepage_sections' as any, {
        p_limit: limit,
    } as any)

    if (error) {
        return {}
    }

    return (data ?? {}) as HomepageSections
}

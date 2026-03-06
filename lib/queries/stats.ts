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
 * Returns O(1) data — the MV is refreshed every 15 min by pg_cron.
 * Falls back gracefully to an empty array on error so the homepage
 * renders with zero-state UI instead of crashing.
 */
export async function getPostCountsByType(): Promise<PostTypeCounts[]> {
    'use cache'
    cacheLife('minutes')
    cacheTag('stats', 'post-counts')

    const supabase = createStaticClient()

    const { data, error } = await supabase.rpc('fn_post_counts_by_type' as any)

    if (error) {
        console.error('[stats] fn_post_counts_by_type RPC failed:', error.message)
        return []
    }

    return (data ?? []) as PostTypeCounts[]
}

/**
 * Fetch all homepage content sections in ONE database roundtrip.
 *
 * Calls `fn_homepage_sections(limit)` which returns a JSONB object:
 * `{ "job": [...], "result": [...], "admit": [...], ... }`
 *
 * Replaces 5–6 separate `getRecentPosts()` calls, reducing TTFB by 200-400ms.
 * Falls back to empty object on error — each section renders its empty state.
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
        console.error('[stats] fn_homepage_sections RPC failed:', error.message)
        return {}
    }

    return (data ?? {}) as HomepageSections
}

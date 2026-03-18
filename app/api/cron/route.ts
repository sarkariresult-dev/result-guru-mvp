import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import { pushToGoogleIndexingApi } from '@/lib/seo/indexing'
import { SITE, ROUTE_PREFIXES, type PostTypeKey } from '@/config/site'
import { withErrorHandling, successResponse, errorResponse } from '@/lib/api-response'

export const GET = withErrorHandling(async (request: Request) => {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return errorResponse('Unauthorized', 401)
    }

    const supabase = await createServerClient()

    // ── Phase 2: Auto-publish scheduled posts ───────────────────
    // Query posts where status='scheduled' and scheduled_at has passed
    const { data: scheduledPosts, error: scheduleError } = await supabase
        .from('posts')
        .select('id, slug, type, scheduled_at')
        .eq('status', 'scheduled')
        .lte('scheduled_at', new Date().toISOString())

    let publishedCount = 0

    if (!scheduleError && scheduledPosts && scheduledPosts.length > 0) {
        const ids = scheduledPosts.map((p: { id: string }) => p.id)

        // Batch update all due posts to published
        const { error: updateError } = await supabase
            .from('posts')
            .update({
                status: 'published',
                published_at: new Date().toISOString(),
            })
            .in('id', ids)

        if (!updateError) {
            publishedCount = ids.length

            // Revalidate sitemap once for all published posts
            revalidateTag('sitemap', undefined as any)
            revalidateTag('posts', undefined as any)

            // Fire-and-forget Indexing API for each newly published post
            for (const post of scheduledPosts) {
                const typeKey = post.type as PostTypeKey
                if (ROUTE_PREFIXES[typeKey] && post.slug) {
                    const postUrl = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${post.slug}`
                    pushToGoogleIndexingApi(postUrl, 'URL_UPDATED').catch(() => { })
                }
            }
        } else {
            console.error('Failed to publish scheduled posts:', updateError)
        }
    }

    // ── Refresh materialized views (existing logic) ─────────────
    // Call the RPC functions defined in 021_rpc_functions.sql and 022_db_optimizations.sql
    const [trendingRes, typeStatsRes, siteStatsRes] = await Promise.all([
        supabase.rpc('fn_refresh_trending'),
        supabase.rpc('fn_refresh_type_counts'),
        supabase.rpc('fn_refresh_site_stats')
    ])

    if (trendingRes.error || typeStatsRes.error || siteStatsRes.error) {
        console.error('Cron refresh partial error:', {
            trending: trendingRes.error,
            typeCounts: typeStatsRes.error,
            siteStats: siteStatsRes.error
        })
        return errorResponse('Failed to refresh some materialized views', 500)
    }

    // ── Phase 3: Flag stale content ─────────────────────────────
    // Posts not updated in 90+ days lose freshness signals - flag for review
    const staleThreshold = new Date()
    staleThreshold.setDate(staleThreshold.getDate() - 90)

    const { data: stalePosts } = await supabase
        .from('posts')
        .select('id')
        .eq('status', 'published')
        .lt('content_updated_at', staleThreshold.toISOString())
        .is('robots_directive', null) // Only flag posts not already marked
        .limit(100)

    let staleFlaggedCount = 0
    if (stalePosts && stalePosts.length > 0) {
        const staleIds = stalePosts.map((p: { id: string }) => p.id)
        const { error: staleError } = await supabase
            .from('posts')
            .update({ robots_directive: 'noindex,follow' })
            .in('id', staleIds)

        if (!staleError) {
            staleFlaggedCount = staleIds.length
            console.log(`Cron: flagged ${staleFlaggedCount} stale posts as noindex`)
        }
    }

    return successResponse({
        message: 'Cron completed successfully',
        publishedCount,
        staleFlaggedCount,
        viewsRefreshed: true,
    })
})

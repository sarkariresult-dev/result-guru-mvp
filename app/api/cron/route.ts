import { createServerClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'
import { pushToGoogleIndexingApi } from '@/lib/seo/indexing'
import { SITE, ROUTE_PREFIXES, type PostTypeKey } from '@/config/site'
import { withErrorHandling, successResponse, errorResponse } from '@/lib/api-response'
import { PostStatus } from '@/types/enums'

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
        .eq('status', PostStatus.Scheduled)
        .eq('needs_human_review', false)
        .lte('scheduled_at', new Date().toISOString())

    let publishedCount = 0

    if (!scheduleError && scheduledPosts && scheduledPosts.length > 0) {
        const ids = scheduledPosts.map((p: { id: string }) => p.id)

        // Batch update all due posts to published
        const { error: updateError } = await supabase
            .from('posts')
            .update({
                status: PostStatus.Published,
                published_at: new Date().toISOString(),
            })
            .in('id', ids)

        if (!updateError) {
            publishedCount = ids.length

            // Revalidate sitemap once for all published posts
            revalidateTag('sitemap')
            revalidateTag('posts')

            // Fire-and-forget Indexing API for each newly published post
            for (const post of scheduledPosts) {
                const typeKey = post.type as PostTypeKey
                if (ROUTE_PREFIXES[typeKey] && post.slug) {
                    const postUrl = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${post.slug}`
                    pushToGoogleIndexingApi(postUrl, 'URL_UPDATED').catch(() => { })
                }
            }
        } else {
            void 0;
        }
    }

    // ── Refresh materialized views (existing logic) ─────────────
    // fn_refresh_trending handles all MVs: mv_trending_posts, mv_post_type_counts, mv_site_stats
    const refreshRes = await supabase.rpc('fn_refresh_trending')

    if (refreshRes.error) {
        void 0;
        return errorResponse('Failed to refresh materialized views', 500)
    }

    // ── Phase 3: Stale content detection (informational only) ────
    // Posts not updated in 90+ days lose freshness — log count for dashboard
    // SAFETY: Never auto-noindex published content. Use v_posts_attention for editorial review.
    const staleThreshold = new Date()
    staleThreshold.setDate(staleThreshold.getDate() - 90)

    const { count: staleCount } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', PostStatus.Published)
        .lt('content_updated_at', staleThreshold.toISOString())

    const staleFlaggedCount = staleCount ?? 0

    return successResponse({
        message: 'Cron completed successfully',
        publishedCount,
        staleFlaggedCount,
        viewsRefreshed: true,
    })
})

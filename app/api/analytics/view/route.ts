import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { viewLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/analytics/view
 * Records a post page-view with referrer & device metadata.
 * Called by usePageView hook - fire-and-forget.
 *
 * Uses fn_increment_post_view() which atomically:
 *   1. Inserts a row into post_views
 *   2. Increments posts.view_count
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit: Prevents single IPs from spamming view counts
        const ip = getClientIp(request)
        const rl = await viewLimiter.limit(ip)
        if (!rl.success) return rateLimitResponse(rl.reset)
        const body = await request.json()
        const { post_id, referrer, device } = body

        if (!post_id) {
            return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
        }

        const supabase = await createServerClient()

        // fn_increment_post_view is SECURITY DEFINER - safe for anon role.
        // It inserts into post_views AND increments view_count atomically.
        const { error } = await supabase.rpc('fn_increment_post_view', {
            p_post_id: post_id,
            p_referrer: referrer || null,
            p_device: device || null,
        })

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

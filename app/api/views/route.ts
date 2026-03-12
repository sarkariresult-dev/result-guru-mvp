import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { viewLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/views
 * Simple view counter - uses fn_increment_post_view() RPC.
 * Accepts { postId } or { post_id } for backward compatibility.
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit: 30 req/min per IP
        const ip = getClientIp(request)
        const rl = await viewLimiter.limit(ip)
        if (!rl.success) return rateLimitResponse(rl.reset)
        const body = await request.json()
        const postId = body.postId ?? body.post_id

        if (!postId) {
            return NextResponse.json({ error: 'postId is required' }, { status: 400 })
        }

        const supabase = await createServerClient()

        // fn_increment_post_view(p_post_id, p_referrer, p_device)
        const { error } = await supabase.rpc('fn_increment_post_view', {
            p_post_id: postId,
            p_referrer: null,
            p_device: null,
        })

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

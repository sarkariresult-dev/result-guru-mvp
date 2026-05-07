import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * POST /api/analytics/beacon
 * Records reading duration for a post.
 * Called by PostAnalyticsBeacon component via navigator.sendBeacon.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { postId, duration } = body

        if (!postId || typeof duration !== 'number') {
            return NextResponse.json({ error: 'postId and duration are required' }, { status: 400 })
        }

        const supabase = await createServerClient()

        // fn_record_post_duration is SECURITY DEFINER - safe for anon role.
        const { error } = await supabase.rpc('fn_record_post_duration', {
            p_post_id: postId,
            p_duration_seconds: duration,
        })

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch (e: unknown) {
        console.error('Beacon error:', e)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generalLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/ads/track
 * Records an ad impression or click event into ad_events.
 * Legacy alias for /api/ads/event - both are identical.
 *
 * Body: { ad_id, event_type, zone_id, post_id?, device? }
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit tracking endpoints strictly to prevent metrics spam
        const ip = getClientIp(request)
        const rl = await generalLimiter.limit(ip)
        if (!rl.success) return rateLimitResponse(rl.reset)

        const body = await request.json()
        const { ad_id, event_type, zone_id, post_id, device } = body

        if (!ad_id || !event_type || !zone_id) {
            return NextResponse.json(
                { error: 'ad_id, event_type, and zone_id are required' },
                { status: 400 },
            )
        }

        const supabase = await createServerClient()

        const { error } = await supabase.from('ad_events').insert({
            ad_id,
            zone_id,
            event_type,
            post_id: post_id ?? null,
            device: device ?? null,
        })

        if (error) throw error
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generalLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { withErrorHandling, successResponse, errorResponse } from '@/lib/api-response'

/**
 * POST /api/ads/event
 * Records an ad impression or click event into ad_events.
 *
 * Body: { ad_id, event_type, zone_id, post_id?, device? }
 *   - zone_id is the UUID FK to ad_zones.id (required)
 *   - event_type is 'impression' | 'click'
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
    // Rate limit: General API limit
    const ip = getClientIp(request)
    const rl = await generalLimiter.limit(ip)
    if (!rl.success) return rateLimitResponse(rl.reset)

    const body = await request.json()
    const { ad_id, event_type, zone_id, post_id, device } = body

    if (!ad_id || !event_type || !zone_id) {
        return errorResponse('ad_id, event_type, and zone_id are required', 400)
    }

    const supabase = await createServerClient()

    // ad_events columns: ad_id, zone_id (UUID FK), event_type, post_id, device, country
    const { error } = await supabase.from('ad_events').insert({
        ad_id,
        zone_id,
        event_type,
        post_id: post_id ?? null,
        device: device ?? null,
    })

    if (error) throw error
    return successResponse(null)
})

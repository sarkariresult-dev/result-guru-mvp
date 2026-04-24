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
    const supabase = await createServerClient()

    // Support both single event (legacy) and batched events
    const events = body.events || [body]

    if (!Array.isArray(events) || events.length === 0) {
        return errorResponse('Valid events array or single event object is required', 400)
    }

    // Validate and prepare events
    const rows = events
        .filter((ev: { adId?: string; ad_id?: string }) => ev.adId || ev.ad_id)
        .map((ev: { 
            adId?: string; 
            ad_id?: string; 
            zoneId?: string; 
            zone_id?: string; 
            eventType?: string; 
            event_type?: string; 
            postId?: string; 
            post_id?: string; 
            device?: string; 
            occurredAt?: string; 
            occurred_at?: string; 
        }) => ({
            ad_id: ev.adId || ev.ad_id,
            zone_id: ev.zoneId || ev.zone_id,
            event_type: ev.eventType || ev.event_type,
            post_id: ev.postId || ev.post_id || null,
            device: ev.device || null,
            occurred_at: ev.occurredAt || ev.occurred_at || new Date().toISOString()
        }))

    if (rows.length === 0) {
        return errorResponse('No valid events provided', 400)
    }

    const { error } = await supabase.from('ad_events').insert(rows)

    if (error) throw error
    return successResponse(null)
})

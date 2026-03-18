import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generalLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { withErrorHandling, successResponse, errorResponse } from '@/lib/api-response'

/**
 * POST /api/affiliate/click
 * Records an affiliate product click for tracking & commission attribution.
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
    // Rate limit to prevent click farming/abuse
    const ip = getClientIp(request)
    const rl = await generalLimiter.limit(ip)
    if (!rl.success) return rateLimitResponse(rl.reset)

    const body = await request.json()
    const { product_id, post_id, device, referrer } = body

    if (!product_id) {
        return errorResponse('product_id is required', 400)
    }

    const supabase = await createServerClient()

    const { error } = await supabase.from('affiliate_clicks').insert({
        product_id,
        post_id: post_id ?? null,
        device: device ?? null,
        referrer: referrer ?? null,
    })

    if (error) throw error

    return successResponse(null)
})

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generalLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/affiliate/click
 * Records an affiliate product click for tracking & commission attribution.
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit to prevent click farming/abuse
        const ip = getClientIp(request)
        const rl = await generalLimiter.limit(ip)
        if (!rl.success) return rateLimitResponse(rl.reset)

        const body = await request.json()
        const { product_id, post_id, device, referrer } = body

        if (!product_id) {
            return NextResponse.json(
                { error: 'product_id is required' },
                { status: 400 }
            )
        }

        const supabase = await createServerClient()

        await supabase.from('affiliate_clicks').insert({
            product_id,
            post_id: post_id ?? null,
            device: device ?? null,
            referrer: referrer ?? null,
        })

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

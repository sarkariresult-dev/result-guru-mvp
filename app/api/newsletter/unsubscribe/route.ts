import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generalLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { withErrorHandling, successResponse, errorResponse } from '@/lib/api-response'

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe using a one-click token.
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
    // Rate limit: 60 req/min per IP (prevents token brute-forcing)
    const ip = getClientIp(request)

    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
        return errorResponse('Unsubscribe token is required', 400)
    }

    // Use service role key to securely bypass RLS since we just dropped the insecure anon policy
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    // Wait for rate limiter result now
    const rl = await generalLimiter.limit(ip)
    if (!rl.success) return rateLimitResponse(rl.reset)

    const { data, error } = await supabase
        .from('subscribers')
        .update({
            status: 'unsubscribed',
            unsubscribed_at: new Date().toISOString(),
        })
        .eq('unsubscribe_token', token)
        .eq('status', 'active')
        .select('id')
        .maybeSingle()

    if (error) {
        throw error
    }

    if (!data) {
        return errorResponse('Invalid or already used token', 404)
    }

    return successResponse({
        message: 'You have been unsubscribed successfully.',
    })
})

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generalLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe using a one-click token.
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit: 60 req/min per IP (prevents token brute-forcing)
        const ip = getClientIp(request)

        const body = await request.json()
        const { token } = body

        if (!token || typeof token !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Unsubscribe token is required' },
                { status: 400 }
            )
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
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        if (!data) {
            return NextResponse.json(
                { success: false, error: 'Invalid or already used token' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'You have been unsubscribed successfully.',
        })
    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        )
    }
}

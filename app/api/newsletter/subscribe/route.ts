import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { subscribeLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/newsletter/subscribe
 * Subscribe a user to the newsletter. Upserts on email.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Rate Limit Check (5 per minute per IP)
        const ip = getClientIp(request)
        const rl = await subscribeLimiter.limit(ip)
        if (!rl.success) return rateLimitResponse(rl.reset)
        const body = await request.json()
        const { email, name, phone, whatsapp_opt_in } = body

        if (!email || typeof email !== 'string') {
            return NextResponse.json(
                { success: false, error: 'Valid email is required' },
                { status: 400 }
            )
        }

        const normalizedEmail = email.toLowerCase().trim()
        const supabase = await createServerClient()

        // Check if already subscribed
        const { data: existing } = await supabase
            .from('subscribers')
            .select('id, status')
            .eq('email', normalizedEmail)
            .maybeSingle()

        if (existing && existing.status === 'active') {
            return NextResponse.json({
                success: true,
                already_subscribed: true,
                message: 'You are already subscribed!',
            })
        }

        // Upsert subscriber
        const { data, error } = await supabase
            .from('subscribers')
            .upsert(
                {
                    email: normalizedEmail,
                    name: name ?? null,
                    phone: phone ?? null,
                    whatsapp_opt_in: whatsapp_opt_in ?? false,
                    status: 'active',
                    unsubscribed_at: null,
                },
                { onConflict: 'email' }
            )
            .select('id, email')
            .single()

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: { id: data.id, email: data.email },
            message: 'Successfully subscribed!',
        })
    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal error' },
            { status: 500 }
        )
    }
}

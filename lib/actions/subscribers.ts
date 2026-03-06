'use server'

import { createServerClient } from '@/lib/supabase/server'

// ── Subscribe ──────────────────────────────────────────────
export async function subscribe(payload: {
    email: string
    whatsapp_opt_in?: boolean
    phone?: string
    preferences?: Record<string, unknown>
}) {
    const supabase = await createServerClient()

    // Use upsert so duplicate email simply updates preferences
    const { error } = await supabase
        .from('subscribers')
        .upsert(
            {
                email: payload.email.toLowerCase().trim(),
                phone: payload.phone ?? null,
                whatsapp_opt_in: payload.whatsapp_opt_in ?? false,
                preferences: payload.preferences ?? {},
                status: 'active',
            },
            { onConflict: 'email' }
        )

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true }
}

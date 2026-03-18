'use server'

import { createServerClient } from '@/lib/supabase/server'

export type SubscribeState = {
    success: boolean
    message?: string
    error?: string
}

export async function subscribe(
    prevState: SubscribeState | null,
    formData: FormData
): Promise<SubscribeState> {
    const supabase = await createServerClient()
    
    const email = formData.get('email')?.toString().toLowerCase().trim()
    const phone = formData.get('phone')?.toString() ?? null
    const whatsapp_opt_in = formData.get('whatsapp_opt_in') === 'true'
    
    let preferences = {}
    try {
        const prefString = formData.get('preferences')?.toString()
        if (prefString) preferences = JSON.parse(prefString)
    } catch { /* ignore parse errors */ }

    if (!email) {
        return { success: false, error: 'Email is required' }
    }

    // Use upsert so duplicate email simply updates preferences
    const { error } = await supabase
        .from('subscribers')
        .upsert(
            {
                email,
                phone,
                whatsapp_opt_in,
                preferences,
                status: 'active',
            },
            { onConflict: 'email' }
        )

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, message: 'Thank you for subscribing!' }
}

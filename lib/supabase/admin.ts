import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client using the SERVICE_ROLE key.
 * Bypasses RLS — use only in trusted server-side code (cron jobs, webhooks).
 *
 * Do NOT expose to client-side code.
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
        )
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

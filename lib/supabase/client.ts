import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/config/env'

/**
 * Browser-side Supabase client.
 * Uses the public anon key — safe to call from client components.
 */
export function createClient() {
    return createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )
}

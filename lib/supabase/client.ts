import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/config/env'

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Browser-side Supabase client.
 * Uses the public anon key - safe to call from client components.
 * Singleton pattern ensures only one instance is created on the client,
 * preventing LockManager contention.
 */
export function createClient() {
    if (client) return client;

    client = createBrowserClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )

    return client;
}

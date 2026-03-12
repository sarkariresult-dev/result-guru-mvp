import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * Cookie-free Supabase client for use inside `'use cache'` scopes.
 *
 * Next.js 16 forbids calling `cookies()` (a dynamic data source) inside
 * `'use cache'` functions. This client uses the public anon key WITHOUT
 * touching cookies - making it safe for cached server queries.
 *
 * ▸ Use `createStaticClient()` in any function annotated with `'use cache'`.
 * ▸ Use `createServerClient()`  for auth-gated or mutating operations.
 *
 * The anon key + RLS still apply - only publicly visible rows are returned.
 */
let _client: ReturnType<typeof createClient> | null = null

export function createStaticClient() {
    // Reuse a single instance across the module lifetime (per cold-start).
    // Safe because this client carries no per-request state (no cookies).
    if (!_client) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!url || !key) {
            throw new Error(
                'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
            )
        }

        _client = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            global: {
                fetch: async (reqUrl, options) => {
                    // WORKAROUND: Next.js 15 `use cache` aggressively intercepts and sometimes
                    // drops streaming POST requests (which Supabase uses for RPCs).
                    // We clone the options and force no-store at the fetch level to let
                    // the outer `use cache` boundary handle the caching instead of the fetch layer.
                    const fetchOptions = { ...options }
                    if (fetchOptions.method === 'POST') {
                        fetchOptions.cache = 'no-store'
                    }

                    try {
                        return await fetch(reqUrl, fetchOptions)
                    } catch (error: any) {
                        throw error
                    }
                }
            }
        })
    }

    return _client
}

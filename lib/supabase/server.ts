import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client (RSC / API routes / Server Actions).
 * Reads & writes auth cookies using the Next.js `cookies()` API.
 *
 * Always `await` the return value — `cookies()` is async in Next.js 15+.
 */
export async function createServerClient() {
    const cookieStore = await cookies()

    return _createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options),
                        )
                    } catch {
                        // `cookies().set()` throws in RSC — safe to ignore.
                        // The middleware (proxy.ts) will refresh cookies.
                    }
                },
            },
        },
    )
}

/**
 * Admin Supabase client (BYPASSES RLS).
 * Use ONLY in server-side logic where full access is strictly required.
 * Never expose the service_role key to the client.
 */
export async function createAdminClient() {
    return _createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll: () => [],
                setAll: () => { },
            },
        },
    )
}

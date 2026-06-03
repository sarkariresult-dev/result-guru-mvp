import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/config/env'

/**
 * Auth callback handler - /callback
 *
 * Supabase redirects here after:
 * 1. Email verification (sign-up confirmation)
 * 2. Google OAuth sign-in
 * 3. Password reset (recovery)
 * 4. Magic link sign-in (future)
 *
 * Flow:
 * - Reads the `code` query param from Supabase redirect
 * - Exchanges it for a session (sets auth cookies)
 * - For recovery type, redirects to /reset-password
 * - Otherwise redirects to the `redirect_to` / `next` param or falls back to /user
 *
 * Uses raw @supabase/ssr client (not the shared createServerClient)
 * because we need to set cookies on the NextResponse object directly.
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') ?? requestUrl.searchParams.get('redirect_to')
    const errorParam = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')

    /* ── Handle OAuth/email errors from Supabase ── */
    if (errorParam) {
        void 0;
        const loginUrl = new URL('/login', requestUrl.origin)
        loginUrl.searchParams.set(
            'error',
            errorDescription ?? 'Authentication failed. Please try again.',
        )
        return NextResponse.redirect(loginUrl)
    }

    /* ── Exchange code for session ── */
    if (code) {
        // Keep track of cookies to set on the final response
        const cookiesToSetList: { name: string; value: string; options: any }[] = []

        const supabase = createServerClient(
            env.NEXT_PUBLIC_SUPABASE_URL,
            env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll: () => request.cookies.getAll(),
                    setAll: (cookiesToSet) => {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            request.cookies.set(name, value)
                            cookiesToSetList.push({ name, value, options })
                        })
                    },
                },
            },
        )

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            void 0;
            const loginUrl = new URL('/login', requestUrl.origin)
            loginUrl.searchParams.set('error', 'Session expired. Please sign in again.')
            return NextResponse.redirect(loginUrl)
        }

        /* Determine redirect destination */
        let destination: string
        if (type === 'recovery') {
            destination = '/reset-password'
        } else if (next && next.startsWith('/') && !next.startsWith('//')) {
            destination = next
        } else {
            destination = '/user'
            if (data.session?.user) {
                const { data: dbUser } = await supabase
                    .from('users')
                    .select('role')
                    .eq('auth_user_id', data.session.user.id)
                    .single()

                if (dbUser?.role === 'admin') destination = '/admin'
                else if (dbUser?.role === 'author') destination = '/author'
            }
        }

        const redirectUrl = new URL(destination, requestUrl.origin)
        const response = NextResponse.redirect(redirectUrl)

        // Apply all gathered cookies to the final response
        cookiesToSetList.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
        })

        return response
    }

    /* ── No code present - redirect to login ── */
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
}

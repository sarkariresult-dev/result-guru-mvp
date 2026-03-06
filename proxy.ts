import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16 Proxy — runs on every matched request (Node.js runtime).
 *
 * Replaces the deprecated `middleware.ts` convention.
 *
 * Responsibilities:
 *  1. Refresh Supabase auth session (keeps cookies alive)
 *  2. Protect dashboard routes (/admin, /author, /user) — redirect to login
 *  3. Enforce role-based access — redirect to correct dashboard
 *  4. Redirect authenticated users away from /login, /register
 *
 * Performance optimisations (v2):
 *  ✅ Public pages: ZERO auth calls — only syncs cookies if a session exists
 *  ✅ Dashboard / auth pages: Reads role from JWT app_metadata — ZERO DB queries
 *  ✅ Stray auth code interception unchanged
 */
export default async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // ── Intercept stray auth codes ──────────────────────────
    // Supabase may redirect to the root or wrong page with ?code=
    // if the Redirect URLs aren't configured correctly in the dashboard.
    // Catch them and forward to /callback with all params preserved.
    if (pathname !== '/callback' && request.nextUrl.searchParams.has('code')) {
        const callbackUrl = new URL('/callback', request.url)
        request.nextUrl.searchParams.forEach((value, key) => {
            callbackUrl.searchParams.set(key, value)
        })
        return NextResponse.redirect(callbackUrl)
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (
                    cookiesToSet: Array<{
                        name: string
                        value: string
                        options?: Record<string, unknown>
                    }>
                ) => {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // ── Determine route type ────────────────────────────────
    const isDashboard =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/author') ||
        pathname.startsWith('/user')

    const isAuthPage = pathname === '/login' || pathname === '/register'

    // ── PUBLIC PAGES: Skip auth entirely ────────────────────
    // No getUser() call = no Supabase Auth API roundtrip.
    // Cookie refresh happens automatically via the Supabase client's
    // `setAll` callback when cookies need updating — we just need to
    // trigger a lightweight session read if auth cookies exist.
    if (!isDashboard && !isAuthPage) {
        // Only refresh cookies when an auth session cookie is present.
        // This avoids any auth work for unauthenticated visitors (99% of traffic).
        const hasAuthCookie = request.cookies
            .getAll()
            .some((c) => c.name.startsWith('sb-'))

        if (hasAuthCookie) {
            // getSession() reads from cookies — no API call to Supabase Auth.
            // This refreshes expired tokens via the setAll callback above.
            await supabase.auth.getSession()
        }

        return supabaseResponse
    }

    // ── PROTECTED & AUTH PAGES: Validate user ───────────────
    // getUser() hits Supabase Auth to validate the JWT token.
    // This is required for security on dashboard and auth routes.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // ── Protected dashboard routes ──────────────────────────
    if (isDashboard) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Read role from JWT app_metadata — ZERO database queries.
        // Set by fn_sync_role_to_claims() trigger in 023_jwt_role_claims.sql
        const role = (user.app_metadata?.user_role as string) ?? 'user'
        const correctDashboard = `/${role}`

        // Redirect to correct dashboard if user is on the wrong one
        if (!pathname.startsWith(correctDashboard)) {
            return NextResponse.redirect(
                new URL(correctDashboard, request.url)
            )
        }

        // Pass user role via header so dashboard layout can skip any additional lookups
        supabaseResponse.headers.set('x-user-role', role)
        supabaseResponse.headers.set('x-user-auth-id', user.id)
    }

    // ── Redirect authenticated users away from auth pages ───
    if (isAuthPage && user) {
        // Read role from JWT app_metadata — ZERO database queries.
        const role = (user.app_metadata?.user_role as string) ?? 'user'
        return NextResponse.redirect(new URL(`/${role}`, request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all routes except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, sitemap.xml, robots.txt
         * - Public assets (images, fonts, icons)
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|site\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
    ],
}

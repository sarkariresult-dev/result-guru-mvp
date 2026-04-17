import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// The URL for our preferred canonical domain
const CANONICAL_DOMAIN = 'www.resultguru.co.in'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const hostHeader = request.headers.get('host') || ''
    const hostname = hostHeader.split(':')[0]

    // 1. Canonical Redirect (301)
    if (hostname === 'resultguru.co.in') {
        const url = request.nextUrl.clone()
        url.hostname = CANONICAL_DOMAIN
        url.port = '' 
        url.protocol = 'https:'
        return NextResponse.redirect(url, 301)
    }

    // 2. Supabase Session Management (Server Client for Proxy)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return parseCookieHeader(request.headers.get('Cookie') ?? '').map(c => ({
                        name: c.name,
                        value: c.value ?? ''
                    }))
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // This refreshes the session if it exists/expired and handles it in the background
    // making downstream layouts (RSC) significantly faster.
    await supabase.auth.getUser()

    return response
}

// Ensure the proxy runs on relevant document routes, skipping static resources
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (public files)
         * - files residing in /images directly
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|images/).*)',
    ],
}

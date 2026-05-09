import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { PublicUser } from '@/types/user.types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
    // Short-circuit for anonymous visitors (~95% of traffic).
    // Avoid the Supabase auth roundtrip when no auth cookie exists.
    let serverUser: PublicUser | null = null
    const cookieStore = await cookies()
    const hasAuthCookie = cookieStore.getAll().some(c => c.name.startsWith('sb-'))

    if (hasAuthCookie) {
        const supabase = await createServerClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
            const { data } = await supabase
                .from('users')
                .select('id, name, avatar_url, role')
                .eq('auth_user_id', authUser.id)
                .single()
            
            if (data) serverUser = data as PublicUser
        }
    }

    return (
        <>
            {/* Skip-to-content link - hidden until focused (keyboard users) */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-9999 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
            >
                Skip to main content
            </a>

            <Header initialUser={serverUser} />

            <main id="main-content" className="flex-1">
                {children}
            </main>

            <Footer />
        </>
    )
}

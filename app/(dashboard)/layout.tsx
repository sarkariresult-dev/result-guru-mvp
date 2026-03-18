import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'
import { adminNavGroups, authorNavGroups, userNavGroups } from '@/components/layout/Sidebar'
import type { PublicUser } from '@/types/user.types'

// Dashboard pages must never be indexed by search engines
export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    // proxy.ts already validated auth + role and will redirect if not logged in.
    // We only need to fetch the profile for the dashboard shell UI.
    const supabase = await createServerClient()

    // This call is still needed to get the auth user ID for the profile query,
    // but since proxy already refreshed the session, this reads from the validated cookie
    // and does NOT trigger a network roundtrip to Supabase Auth in most cases.
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/login')

    const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url, role')
        .eq('auth_user_id', authUser.id)
        .single()

    if (error) {
        console.error('[DashboardLayout] Failed to fetch user profile:', error.message)
    }

    const dbUser = data as { id: string; name: string; avatar_url: string | null; role: string } | null

    const profile: PublicUser = {
        id: dbUser?.id ?? authUser.id,
        name: dbUser?.name ?? authUser.email ?? 'User',
        avatar_url: dbUser?.avatar_url ?? null,
        role: (dbUser?.role as PublicUser['role']) ?? 'user',
    }

    const navGroups =
        profile.role === 'admin'
            ? adminNavGroups
            : profile.role === 'author'
                ? authorNavGroups
                : userNavGroups

    return (
        <div className="flex min-h-screen bg-background">
            <DashboardShell user={profile} navGroups={navGroups}>
                <main id="main-content" className="flex-1">
                    {children}
                </main>
            </DashboardShell>
        </div>
    )
}
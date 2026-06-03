import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/features/dashboard/components/DashboardShell'

import type { PublicUser } from '@/types/user.types'

// Dashboard pages must never be indexed by search engines
export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

// Extend Vercel Serverless timeout to 5 minutes to prevent 504 Gateway Timeouts during heavy AI content generation.
export const maxDuration = 300

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
        .select('id, name, avatar_url, role, bio')
        .eq('auth_user_id', authUser.id)
        .single()

    if (error) {

    }

    const dbUser = data as { id: string; name: string; avatar_url: string | null; role: string; bio: string | null } | null

    const profile: PublicUser = {
        id: dbUser?.id ?? authUser.id,
        name: dbUser?.name ?? authUser.email ?? 'User',
        avatar_url: dbUser?.avatar_url ?? null,
        role: (dbUser?.role as PublicUser['role']) ?? 'user',
        bio: dbUser?.bio ?? null,
    }

    let draftsQuery = supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'draft')
        .eq('needs_human_review', true)

    if (profile.role === 'author') {
        draftsQuery = draftsQuery.eq('author_id', profile.id)
    }

    const { count: pendingDraftsCount } = await draftsQuery

    return (
        <div className="flex min-h-screen bg-background">
            <DashboardShell user={profile} pendingDraftsCount={pendingDraftsCount}>
                <main id="main-content" className="flex-1">
                    {children}
                </main>
            </DashboardShell>
        </div>
    )
}

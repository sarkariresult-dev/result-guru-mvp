import 'server-only'
import { createServerClient } from '@/lib/supabase/server'

// ── Types ──────────────────────────────────────────────────────────────────

export interface DashboardStats {
    totalPosts: number
    publishedPosts: number
    totalViews: number
    totalUsers: number
    totalSubscribers: number
    recentPostsCount: number  // last 7 days
}

export interface AuthorStats {
    totalPosts: number
    publishedPosts: number
    totalViews: number
    draftPosts: number
}

export interface TopPost {
    id: string
    title: string
    slug: string
    type: string
    view_count: number
    published_at: string | null
}

// ── Admin dashboard stats ──────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createServerClient()

    // D1/D5: Use fn_site_stats() — single RPC reads from mv_site_stats
    // Falls back to individual queries if MV doesn't exist yet
    const { data: mvStats, error: mvError } = await supabase.rpc('fn_site_stats')

    if (!mvError && mvStats && Array.isArray(mvStats) && mvStats.length > 0) {
        const s = mvStats[0]
        return {
            totalPosts: Number(s.total_posts) ?? 0,
            publishedPosts: Number(s.published_posts) ?? 0,
            totalViews: Number(s.total_views) ?? 0,
            totalUsers: Number(s.total_users) ?? 0,
            totalSubscribers: Number(s.total_subscribers) ?? 0,
            recentPostsCount: Number(s.recent_posts_7d) ?? 0,
        }
    }

    // Fallback: individual queries (before MV is deployed)
    const [postsRes, publishedRes, usersRes, subsRes, recentRes, viewsRes] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.rpc('fn_total_view_count'),
    ])

    const totalViews = (viewsRes.data as number | null) ?? 0

    return {
        totalPosts: postsRes.count ?? 0,
        publishedPosts: publishedRes.count ?? 0,
        totalViews,
        totalUsers: usersRes.count ?? 0,
        totalSubscribers: subsRes.count ?? 0,
        recentPostsCount: recentRes.count ?? 0,
    }
}

// ── Top posts by views ─────────────────────────────────────────────────────

export async function getTopPosts(limit = 10): Promise<TopPost[]> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('posts')
        .select('id, title, slug, type, view_count, published_at')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .limit(limit)

    return (data ?? []) as TopPost[]
}

// ── Author-specific stats ──────────────────────────────────────────────────

export async function getAuthorStats(authorId: string): Promise<AuthorStats> {
    const supabase = await createServerClient()

    const [totalRes, publishedRes, draftRes, viewsRes] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', authorId),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', authorId).eq('status', 'published'),
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('author_id', authorId).eq('status', 'draft'),
        supabase.rpc('fn_author_view_count', { p_author_id: authorId }),
    ])

    const totalViews = (viewsRes.data as number | null) ?? 0

    return {
        totalPosts: totalRes.count ?? 0,
        publishedPosts: publishedRes.count ?? 0,
        totalViews,
        draftPosts: draftRes.count ?? 0,
    }
}

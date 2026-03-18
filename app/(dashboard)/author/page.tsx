import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, Eye, TrendingUp, PenLine, Plus, ArrowRight } from 'lucide-react'
import { getAuthorStats } from '@/lib/queries/analytics'
import { getAuthorPosts } from '@/features/posts/queries'
import { StatsCard } from '@/features/dashboard/components/StatsCard'
import { POST_TYPE_CONFIG, POST_STATUS_CONFIG } from '@/config/constants'
import Link from 'next/link'
import type { PostTypeKey } from '@/config/site'
import type { PostStatus } from '@/types/enums'

export default async function AuthorDashboardPage() {
    const supabase = await createServerClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) redirect('/login')

    const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single()

    if (!dbUser) redirect('/login')
    const authorId = dbUser.id as string

    const [stats, { data: recentPosts }] = await Promise.all([
        getAuthorStats(authorId),
        getAuthorPosts(authorId, { limit: 5 }),
    ])

    const publishRate = stats.totalPosts > 0
        ? Math.round((stats.publishedPosts / stats.totalPosts) * 100)
        : 0

    return (
        <div className="space-y-8">
            {/* Header with quick action */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Author Dashboard</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        Your content performance at a glance.
                    </p>
                </div>
                <Link
                    href="/author/posts/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                    <Plus className="size-4" />
                    New Post
                </Link>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Posts"
                    value={stats.totalPosts}
                    description="All content you've created"
                    icon={FileText}
                />
                <StatsCard
                    title="Published"
                    value={stats.publishedPosts}
                    description={`${publishRate}% publish rate`}
                    icon={TrendingUp}
                />
                <StatsCard
                    title="Drafts"
                    value={stats.draftPosts}
                    description="Awaiting completion"
                    icon={PenLine}
                />
                <StatsCard
                    title="Total Views"
                    value={stats.totalViews.toLocaleString()}
                    description="Across all published posts"
                    icon={Eye}
                />
            </div>

            {/* Recent posts */}
            <section className="rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                    <h2 className="font-semibold">Recent Posts</h2>
                    <Link
                        href="/author/posts"
                        className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                    >
                        View all <ArrowRight className="size-3.5" />
                    </Link>
                </div>

                {recentPosts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                        <FileText className="size-10 text-foreground-subtle" />
                        <div>
                            <p className="font-medium text-foreground">No posts yet</p>
                            <p className="mt-1 text-sm text-foreground-muted">
                                Create your first post to get started.
                            </p>
                        </div>
                        <Link
                            href="/author/posts/new"
                            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                        >
                            <Plus className="size-4" />
                            Create Post
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {recentPosts.map((post) => {
                            const typeConf = POST_TYPE_CONFIG[post.type as PostTypeKey]
                            const statusConf = POST_STATUS_CONFIG[post.status as PostStatus]

                            return (
                                <Link
                                    key={post.id}
                                    href={`/author/posts/${post.id}/edit`}
                                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-background-subtle sm:px-6"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {post.title}
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                            {typeConf && (
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${typeConf.color} ${typeConf.textColor}`}>
                                                    {typeConf.label}
                                                </span>
                                            )}
                                            {statusConf && (
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConf.color} ${statusConf.textColor}`}>
                                                    {statusConf.label}
                                                </span>
                                            )}
                                            <span className="text-xs text-foreground-subtle">
                                                {new Date(post.updated_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-sm tabular-nums text-foreground-muted">
                                        {post.view_count.toLocaleString()} views
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </section>
        </div>
    )
}

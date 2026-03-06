import Link from 'next/link'
import { FileText, Users, Bell, TrendingUp, Eye, ArrowRight, Clock } from 'lucide-react'
import { getDashboardStats, getTopPosts } from '@/lib/queries/analytics'
import { getAdminPosts } from '@/lib/queries/posts'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { POST_TYPE_CONFIG, POST_STATUS_CONFIG } from '@/config/constants'
import type { PostTypeKey } from '@/config/site'
import type { PostStatus } from '@/types/enums'

export default async function AdminDashboardPage() {
    const [stats, topPosts, { data: recentPosts }] = await Promise.all([
        getDashboardStats(),
        getTopPosts(5),
        getAdminPosts({ limit: 7, status: undefined }),
    ])

    const publishRate = stats.totalPosts > 0
        ? Math.round((stats.publishedPosts / stats.totalPosts) * 100)
        : 0

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        Overview of Result Guru at a glance.
                    </p>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <StatsCard
                    title="Total Posts"
                    value={stats.totalPosts}
                    description={`${publishRate}% published`}
                    icon={FileText}
                />
                <StatsCard
                    title="Published"
                    value={stats.publishedPosts}
                    description="Live on the site"
                    icon={TrendingUp}
                />
                <StatsCard
                    title="Total Views"
                    value={stats.totalViews.toLocaleString()}
                    description="All published posts"
                    icon={Eye}
                />
                <StatsCard
                    title="Users"
                    value={stats.totalUsers}
                    description="Registered accounts"
                    icon={Users}
                />
                <StatsCard
                    title="Subscribers"
                    value={stats.totalSubscribers}
                    description="Active newsletter"
                    icon={Bell}
                />
                <StatsCard
                    title="Recent (7d)"
                    value={stats.recentPostsCount}
                    description="Posts this week"
                    icon={Clock}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top performing posts */}
                <section className="rounded-xl border border-border bg-surface">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                        <h2 className="font-semibold">Top Performing Posts</h2>
                        <Link
                            href="/admin/posts"
                            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                        >
                            All posts <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                    {topPosts.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-foreground-muted">
                            No published posts yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {topPosts.map((post) => {
                                const typeConf = POST_TYPE_CONFIG[post.type as PostTypeKey]
                                return (
                                    <Link
                                        key={post.id}
                                        href={`/admin/posts/${post.id}`}
                                        className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-background-subtle sm:px-6"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{post.title}</p>
                                            {typeConf && (
                                                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${typeConf.color} ${typeConf.textColor}`}>
                                                    {typeConf.label}
                                                </span>
                                            )}
                                        </div>
                                        <span className="shrink-0 text-sm tabular-nums text-brand-600 font-medium">
                                            {post.view_count.toLocaleString()}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* Recent posts activity */}
                <section className="rounded-xl border border-border bg-surface">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                        <h2 className="font-semibold">Recent Activity</h2>
                        <Link
                            href="/admin/posts"
                            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                        >
                            View all <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                    {recentPosts.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-foreground-muted">
                            No posts created yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {recentPosts.map((post) => {
                                const typeConf = POST_TYPE_CONFIG[post.type as PostTypeKey]
                                const statusConf = POST_STATUS_CONFIG[post.status as PostStatus]
                                return (
                                    <Link
                                        key={post.id}
                                        href={`/admin/posts/${post.id}`}
                                        className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-background-subtle sm:px-6"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{post.title}</p>
                                            <div className="mt-1 flex items-center gap-2">
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
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-xs text-foreground-subtle">
                                            {new Date(post.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

import Link from 'next/link'
import { AlertTriangle, CheckCircle2, XCircle, Search, ArrowRight, FileWarning } from 'lucide-react'
import { getSeoAuditPosts, getPostsNeedingAttention, getSeoScoreDistribution } from '@/lib/queries/seo'

export default async function AdminSeoPage() {
    const [distribution, auditPosts, attentionPosts] = await Promise.all([
        getSeoScoreDistribution(),
        getSeoAuditPosts(30),
        getPostsNeedingAttention(20),
    ])

    const scoreColor = (score: number) =>
        score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'

    const scoreBg = (score: number) =>
        score >= 70 ? 'bg-green-100' : score >= 40 ? 'bg-yellow-100' : 'bg-red-100'

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">SEO Dashboard</h1>
                <p className="mt-1 text-sm text-foreground-muted">
                    Content health overview powered by the SEO audit engine.
                </p>
            </div>

            {/* Score Distribution Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <CheckCircle2 className="size-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{distribution.good}</p>
                            <p className="text-xs text-foreground-muted">Good (70–100)</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100">
                            <AlertTriangle className="size-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-yellow-600">{distribution.warning}</p>
                            <p className="text-xs text-foreground-muted">Needs Work (40–69)</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                            <XCircle className="size-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{distribution.critical}</p>
                            <p className="text-xs text-foreground-muted">Critical (0–39)</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Search className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{distribution.total}</p>
                            <p className="text-xs text-foreground-muted">Total Audited</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Score bar visualization */}
            {distribution.total > 0 && (
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Score Distribution</h2>
                    <div className="flex h-4 w-full overflow-hidden rounded-full">
                        {distribution.good > 0 && (
                            <div
                                className="bg-green-500 transition-all"
                                style={{ width: `${(distribution.good / distribution.total) * 100}%` }}
                                title={`Good: ${distribution.good}`}
                            />
                        )}
                        {distribution.warning > 0 && (
                            <div
                                className="bg-yellow-400 transition-all"
                                style={{ width: `${(distribution.warning / distribution.total) * 100}%` }}
                                title={`Warning: ${distribution.warning}`}
                            />
                        )}
                        {distribution.critical > 0 && (
                            <div
                                className="bg-red-500 transition-all"
                                style={{ width: `${(distribution.critical / distribution.total) * 100}%` }}
                                title={`Critical: ${distribution.critical}`}
                            />
                        )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-foreground-muted">
                        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500" /> Good {Math.round((distribution.good / distribution.total) * 100)}%</span>
                        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-yellow-400" /> Warning {Math.round((distribution.warning / distribution.total) * 100)}%</span>
                        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> Critical {Math.round((distribution.critical / distribution.total) * 100)}%</span>
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* SEO Audit Issues Table */}
                <section className="rounded-xl border border-border bg-surface">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                        <h2 className="font-semibold flex items-center gap-2">
                            <FileWarning className="size-4 text-red-500" />
                            SEO Issues
                        </h2>
                        <span className="text-xs text-foreground-muted">{auditPosts.length} posts</span>
                    </div>
                    {auditPosts.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-foreground-muted">
                            All posts are SEO-healthy! 🎉
                        </div>
                    ) : (
                        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                            {auditPosts.map((post) => {
                                const issues: string[] = []
                                if (post.missing_meta_title) issues.push('No meta title')
                                if (post.missing_meta_description) issues.push('No meta desc')
                                if (post.missing_featured_image) issues.push('No image')
                                if (post.thin_content) issues.push('Thin content')
                                if (post.missing_focus_keyword) issues.push('No keyword')
                                if (post.missing_alt_text) issues.push('No alt text')

                                return (
                                    <Link
                                        key={post.id}
                                        href={`/admin/posts/${post.id}`}
                                        className="flex items-start justify-between gap-3 px-5 py-3 transition-colors hover:bg-background-subtle sm:px-6"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{post.title}</p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {issues.map((issue) => (
                                                    <span
                                                        key={issue}
                                                        className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                                                    >
                                                        {issue}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreBg(post.seo_score ?? 0)} ${scoreColor(post.seo_score ?? 0)}`}>
                                            {post.seo_score ?? 0}
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* Posts Needing Attention */}
                <section className="rounded-xl border border-border bg-surface">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                        <h2 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="size-4 text-yellow-500" />
                            Needs Attention
                        </h2>
                        <Link
                            href="/admin/posts"
                            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
                        >
                            All posts <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                    {attentionPosts.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-foreground-muted">
                            No posts need immediate attention.
                        </div>
                    ) : (
                        <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                            {attentionPosts.map((post) => {
                                const reasons: string[] = []
                                if (post.is_expired) reasons.push('Expired')
                                if (post.is_stale) reasons.push('Stale')
                                if (post.low_seo) reasons.push('Low SEO')
                                if (post.low_engagement) reasons.push('Low engagement')

                                return (
                                    <Link
                                        key={post.id}
                                        href={`/admin/posts/${post.id}`}
                                        className="flex items-start justify-between gap-3 px-5 py-3 transition-colors hover:bg-background-subtle sm:px-6"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{post.title}</p>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {reasons.map((reason) => (
                                                    <span
                                                        key={reason}
                                                        className="rounded-full bg-yellow-50 border border-yellow-200 px-2 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400"
                                                    >
                                                        {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="shrink-0 text-xs text-foreground-subtle">
                                            {post.updated_at
                                                ? new Date(post.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                                : '-'}
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

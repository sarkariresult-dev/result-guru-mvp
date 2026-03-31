import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPostById } from '@/features/posts/queries'
import { PostActions } from '@/features/dashboard/components/PostActions'
import { POST_TYPE_CONFIG, POST_STATUS_CONFIG, APPLICATION_STATUS_CONFIG } from '@/config/constants'
import { ArrowLeft, ExternalLink, Eye, Clock, FileText } from 'lucide-react'
import { ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'
import { PostStatus, ApplicationStatus } from '@/types/enums'

import { calculateApplicationStatus } from '@/lib/utils'

export default async function AdminPostDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const post = await getPostById(id)
    if (!post) redirect('/admin/posts')

    const typeConf = POST_TYPE_CONFIG[post.type as PostTypeKey]
    const statusConf = POST_STATUS_CONFIG[post.status as PostStatus]
    
    // Explicitly calculate status since it's not a DB column anymore
    const calculatedStatus = calculateApplicationStatus(post.application_start_date, post.application_end_date)
    const appStatusConf = APPLICATION_STATUS_CONFIG[calculatedStatus as ApplicationStatus]

    // Build public URL for published posts
    const prefix = ROUTE_PREFIXES[post.type as PostTypeKey]
    const publicUrl = post.status === 'published' && prefix
        ? `${prefix}/${post.slug}`
        : null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                    <Link
                        href="/admin/posts"
                        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-muted transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back to Posts
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{post.title}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {typeConf && (
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${typeConf.color} ${typeConf.textColor}`}>
                                {typeConf.label}
                            </span>
                        )}
                        {statusConf && (
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConf.color} ${statusConf.textColor}`}>
                                {statusConf.label}
                            </span>
                        )}
                        {appStatusConf && calculatedStatus !== ApplicationStatus.NA && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${appStatusConf.color} ${appStatusConf.textColor}`}>
                                {appStatusConf.pulse && <span className={`inline-block size-1.5 rounded-full ${appStatusConf.dotColor} animate-pulse`} />}
                                {appStatusConf.label}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {publicUrl && (
                        <Link
                            href={publicUrl}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle"
                        >
                            <ExternalLink className="size-3.5" />
                            View Live
                        </Link>
                    )}
                    <Link
                        href={`/author/posts/${post.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                    >
                        Edit Post
                    </Link>
                    <PostActions postId={post.id} status={post.status} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Content section */}
                    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                            Content
                        </h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-foreground-muted">Title</dt>
                                <dd className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                    {post.title}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-foreground-muted">Slug</dt>
                                <dd className="mt-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm">
                                    {post.slug}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-foreground-muted">Excerpt</dt>
                                <dd className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                                    {post.excerpt || <span className="text-foreground-subtle italic">No excerpt</span>}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>

                {/* Sidebar meta */}
                <div className="space-y-6">
                    {/* Post info */}
                    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                            Post Info
                        </h2>
                        <dl className="space-y-3 text-sm">
                            <InfoRow label="Status">
                                {statusConf ? (
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusConf.color} ${statusConf.textColor}`}>
                                        {statusConf.label}
                                    </span>
                                ) : post.status}
                            </InfoRow>
                            <InfoRow label="Type">
                                {typeConf ? (
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeConf.color} ${typeConf.textColor}`}>
                                        {typeConf.label}
                                    </span>
                                ) : post.type}
                            </InfoRow>
                            <InfoRow label="Application">
                                {appStatusConf && calculatedStatus !== ApplicationStatus.NA
                                    ? appStatusConf.label
                                    : '-'}
                            </InfoRow>
                            <InfoRow label="Views">
                                <span className="inline-flex items-center gap-1">
                                    <Eye className="size-3.5 text-foreground-subtle" />
                                    {(post.view_count ?? 0).toLocaleString()}
                                </span>
                            </InfoRow>
                            <InfoRow label="SEO Score">
                                <SeoScoreBar score={post.seo_score ?? 0} />
                            </InfoRow>
                            <InfoRow label="Word Count">
                                <span className="inline-flex items-center gap-1">
                                    <FileText className="size-3.5 text-foreground-subtle" />
                                    {post.word_count ?? 0}
                                </span>
                            </InfoRow>
                            <InfoRow label="Reading Time">
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="size-3.5 text-foreground-subtle" />
                                    {post.reading_time_min ?? 0} min
                                </span>
                            </InfoRow>
                            {post.published_at && (
                                <InfoRow label="Published">
                                    {new Date(post.published_at).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                    })}
                                </InfoRow>
                            )}
                            <InfoRow label="Updated">
                                {new Date(post.updated_at).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })}
                            </InfoRow>
                            <InfoRow label="Created">
                                {new Date(post.created_at).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                })}
                            </InfoRow>
                        </dl>
                    </section>

                    {/* SEO meta */}
                    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                            SEO
                        </h2>
                        <dl className="space-y-3 text-sm">
                            <div>
                                <dt className="text-foreground-muted">Meta Title</dt>
                                <dd className="mt-1 wrap-break-word">{post.meta_title || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-foreground-muted">Meta Description</dt>
                                <dd className="mt-1 wrap-break-word text-xs">{post.meta_description || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-foreground-muted">Focus Keyword</dt>
                                <dd className="mt-1">{post.focus_keyword || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-foreground-muted">Canonical URL</dt>
                                <dd className="mt-1 truncate text-xs font-mono">{post.canonical_url || '-'}</dd>
                            </div>
                        </dl>
                    </section>

                    {/* Taxonomy */}
                    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                            Taxonomy
                        </h2>
                        <dl className="space-y-3 text-sm">
                            <InfoRow label="State">{post.state_slug ?? '-'}</InfoRow>
                            <InfoRow label="Organization">{post.org_name ?? '-'}</InfoRow>
                            <div>
                                <dt className="text-foreground-muted">Qualifications</dt>
                                <dd className="mt-1 flex flex-wrap gap-1">
                                    {(post.qualification ?? []).length > 0
                                        ? (post.qualification as string[]).map((q: string) => (
                                            <span key={q} className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                {q}
                                            </span>
                                        ))
                                        : '-'}
                                </dd>
                            </div>
                        </dl>
                    </section>

                </div>
            </div>
        </div>
    )
}

/* ── Helper components ───────────────────────────────────── */

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <dt className="text-foreground-muted">{label}</dt>
            <dd className="text-right font-medium">{children}</dd>
        </div>
    )
}

function SeoScoreBar({ score }: { score: number }) {
    const color =
        score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
    const textColor =
        score >= 80 ? 'text-green-700' : score >= 50 ? 'text-yellow-700' : 'text-red-700'
    return (
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-background-subtle">
                <div className={`h-full origin-left transition-transform ${color}`} style={{ transform: `scaleX(${Math.min(score, 100) / 100})` }} />
            </div>
            <span className={`text-xs font-medium ${textColor}`}>{score}/100</span>
        </div>
    )
}

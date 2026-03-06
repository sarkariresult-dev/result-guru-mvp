import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAuthorPosts } from '@/lib/queries/posts'
import { PostActions } from '@/components/dashboard/PostActions'
import { POST_TYPE_CONFIG, POST_STATUS_CONFIG, PAGINATION } from '@/config/constants'
import { Plus, Search, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PostTypeKey } from '@/config/site'
import type { PostStatus } from '@/types/enums'

const STATUS_FILTERS = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'In Review' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
] as const

export default async function AuthorPostsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; status?: string; search?: string }>
}) {
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

    const params = await searchParams
    const page = Math.max(1, parseInt(params.page ?? '1', 10))
    const status = params.status ?? ''
    const search = params.search?.trim() ?? ''

    const { data: posts, count } = await getAuthorPosts(authorId, {
        page,
        status: status || undefined,
        search: search || undefined,
    })

    const totalPages = Math.ceil(count / PAGINATION.ADMIN_LIMIT)

    /** Build URL preserving current filters */
    function buildUrl(overrides: Record<string, string | undefined>) {
        const p = new URLSearchParams()
        const merged = { status, search, page: String(page), ...overrides }
        for (const [k, v] of Object.entries(merged)) {
            if (v && v !== '' && !(k === 'page' && v === '1')) p.set(k, v)
        }
        const qs = p.toString()
        return `/author/posts${qs ? `?${qs}` : ''}`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">My Posts</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count} {count === 1 ? 'post' : 'posts'} total
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

            {/* Search bar */}
            <form action="/author/posts" method="GET" className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
                <input
                    type="search"
                    name="search"
                    defaultValue={search}
                    placeholder="Search posts by title…"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-foreground-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                {status && <input type="hidden" name="status" value={status} />}
            </form>

            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((f) => {
                    const isActive = status === f.value
                    return (
                        <Link
                            key={f.value}
                            href={buildUrl({ status: f.value || undefined, page: '1' })}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                isActive
                                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                                    : 'border-border text-foreground-muted hover:border-brand-300 hover:text-foreground'
                            }`}
                        >
                            {f.label}
                        </Link>
                    )
                })}
            </div>

            {/* Posts table (desktop) / cards (mobile) */}
            {posts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
                    <FileText className="size-10 text-foreground-subtle" />
                    <p className="font-medium text-foreground">
                        {search ? 'No posts match your search' : 'No posts found'}
                    </p>
                    <p className="text-sm text-foreground-muted">
                        {search
                            ? 'Try a different search term or clear filters.'
                            : 'Create your first post to get started.'}
                    </p>
                    {!search && (
                        <Link
                            href="/author/posts/new"
                            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                        >
                            <Plus className="size-4" />
                            Create Post
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-background-subtle">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Title</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Type</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Views</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">SEO</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Updated</th>
                                    <th className="px-4 py-3 text-right font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {posts.map((post) => {
                                    const typeConf = POST_TYPE_CONFIG[post.type as PostTypeKey]
                                    const statusConf = POST_STATUS_CONFIG[post.status as PostStatus]

                                    return (
                                        <tr key={post.id} className="transition-colors hover:bg-background-subtle">
                                            <td className="max-w-xs px-4 py-3">
                                                <Link
                                                    href={`/author/posts/${post.id}/edit`}
                                                    className="truncate font-medium text-foreground hover:text-brand-600"
                                                    title={post.title}
                                                >
                                                    {post.title}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                {typeConf ? (
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeConf.color} ${typeConf.textColor}`}>
                                                        {typeConf.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-foreground-muted">{post.type}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {statusConf ? (
                                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusConf.color} ${statusConf.textColor}`}>
                                                        {statusConf.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-foreground-muted">{post.status}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums text-foreground-muted">
                                                {post.view_count.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <SeoScore score={post.seo_score} />
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-subtle">
                                                {new Date(post.updated_at).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <PostActions postId={post.id} status={post.status} />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                        {posts.map((post) => {
                            const typeConf = POST_TYPE_CONFIG[post.type as PostTypeKey]
                            const statusConf = POST_STATUS_CONFIG[post.status as PostStatus]

                            return (
                                <div
                                    key={post.id}
                                    className="rounded-xl border border-border bg-surface p-4"
                                >
                                    <Link
                                        href={`/author/posts/${post.id}/edit`}
                                        className="line-clamp-2 font-medium text-foreground hover:text-brand-600"
                                    >
                                        {post.title}
                                    </Link>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
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
                                            {post.view_count.toLocaleString()} views
                                        </span>
                                        <span className="text-xs text-foreground-subtle">
                                            SEO: {post.seo_score}/100
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs text-foreground-subtle">
                                            {new Date(post.updated_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                        <PostActions postId={post.id} status={post.status} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav className="flex items-center justify-between" aria-label="Pagination">
                            <p className="text-sm text-foreground-muted">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                {page > 1 ? (
                                    <Link
                                        href={buildUrl({ page: String(page - 1) })}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle"
                                    >
                                        <ChevronLeft className="size-4" />
                                        Previous
                                    </Link>
                                ) : (
                                    <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50">
                                        <ChevronLeft className="size-4" />
                                        Previous
                                    </span>
                                )}
                                {page < totalPages ? (
                                    <Link
                                        href={buildUrl({ page: String(page + 1) })}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle"
                                    >
                                        Next
                                        <ChevronRight className="size-4" />
                                    </Link>
                                ) : (
                                    <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50">
                                        Next
                                        <ChevronRight className="size-4" />
                                    </span>
                                )}
                            </div>
                        </nav>
                    )}
                </>
            )}
        </div>
    )
}

/* ── SEO score indicator ─────────────────────────────────── */

function SeoScore({ score }: { score: number }) {
    const color =
        score >= 80
            ? 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
            : score >= 50
              ? 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400'

    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
            {score}
        </span>
    )
}

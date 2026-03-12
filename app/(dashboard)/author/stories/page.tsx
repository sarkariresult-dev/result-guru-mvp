import { Suspense } from 'react'
import { getStories } from '@/lib/queries/stories'
import { WebStoryList } from '@/components/dashboard/stories/WebStoryList'
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PAGINATION } from '@/config/constants'

export const metadata = {
    title: 'Stories | Result Guru Author',
}

const STATUS_FILTERS = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
] as const

export default async function AuthorWebStoriesPage({ searchParams }: {
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

    const { data: stories, count } = await getStories({
        page,
        status: status || undefined,
        search: search || undefined,
        authorId: authorId,
        limit: PAGINATION.ADMIN_LIMIT
    })

    const totalPages = Math.ceil(count / PAGINATION.ADMIN_LIMIT)

    function buildUrl(overrides: Record<string, string | undefined>) {
        const p = new URLSearchParams()
        const merged = { status, search, page: String(page), ...overrides }
        for (const [k, v] of Object.entries(merged)) {
            if (v && v !== '' && !(k === 'page' && v === '1')) p.set(k, v)
        }
        const qs = p.toString()
        return `/author/stories${qs ? `?${qs}` : ''}`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Stories</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count} {count === 1 ? 'story' : 'stories'} total
                    </p>
                </div>
                <Link
                    href="/author/stories/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                    <Plus className="size-4" />
                    New Story
                </Link>
            </div>

            {/* Search bar */}
            <form action="/author/stories" method="GET" className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
                <input
                    type="search"
                    name="search"
                    defaultValue={search}
                    placeholder="Search stories by title…"
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
                            href={buildUrl({ status: f.value, page: '1' })}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                                    : 'border-border text-foreground-muted hover:border-brand-300 hover:text-foreground'
                                }`}
                        >
                            {f.label}
                        </Link>
                    )
                })}
            </div>

            {/* List */}
            <Suspense fallback={<div className="h-60 rounded-xl border border-border bg-surface animate-pulse" />}>
                <WebStoryList stories={stories} baseUrl="/author/stories" isAdmin={false} />
            </Suspense>

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
        </div>
    )
}

import Link from 'next/link'
import { getAdminCategories, getCategoryOptions } from '@/features/taxonomy/queries'
import { CategoriesClient } from '@/features/taxonomy/components/CategoriesClient'
import { PAGINATION } from '@/config/constants'
import { Search, FolderTree, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_FILTERS = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
] as const

export default async function AdminCategoriesPage({ searchParams }: {
    searchParams: Promise<{ page?: string; active?: string; q?: string }>
}) {
    const params = await searchParams
    const page = Math.max(1, parseInt(params.page ?? '1', 10))
    const active = params.active ?? ''
    const search = params.q?.trim() ?? ''

    const [{ data: categories, count }, parentOptions] = await Promise.all([
        getAdminCategories({ page, active: active || undefined, search: search || undefined }),
        getCategoryOptions(),
    ])

    const totalPages = Math.ceil(count / PAGINATION.ADMIN_LIMIT)

    function buildUrl(overrides: Record<string, string | undefined>) {
        const p = new URLSearchParams()
        const merged = { active, q: search, page: String(page), ...overrides }
        for (const [k, v] of Object.entries(merged)) {
            if (v && v !== '' && !(k === 'page' && v === '1')) p.set(k, v)
        }
        const qs = p.toString()
        return `/admin/categories${qs ? `?${qs}` : ''}`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <CategoriesClient count={count} categories={categories} parentOptions={parentOptions}>
                {/* Controls row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Search */}
                    <form action="/admin/categories" method="GET" className="relative w-full max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
                        <input
                            type="search"
                            name="q"
                            defaultValue={search}
                            placeholder="Search categories by name…"
                            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-foreground-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        />
                        {active && <input type="hidden" name="active" value={active} />}
                    </form>

                    {/* Filters */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 shrink-0">
                        {/* Status pills */}
                        <div className="flex flex-wrap gap-2">
                            {STATUS_FILTERS.map((f) => {
                                const isActive = active === f.value
                                return (
                                    <Link
                                        key={f.value}
                                        href={buildUrl({ active: f.value || undefined, page: '1' })}
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
                    </div>
                </div>

                {/* Empty State */}
                {categories.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
                        <FolderTree className="size-10 text-foreground-subtle" />
                        <p className="font-medium text-foreground">
                            {search ? 'No categories match your search' : 'No categories found'}
                        </p>
                        <p className="text-sm text-foreground-muted">
                            {search ? 'Try a different search term.' : 'Create your first category to get started.'}
                        </p>
                    </div>
                ) : null}
            </CategoriesClient>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="flex items-center justify-between" aria-label="Pagination">
                    <p className="text-sm text-foreground-muted">
                        Page {page} of {totalPages}
                        <span className="ml-1 text-foreground-subtle">({count} categories)</span>
                    </p>
                    <div className="flex items-center gap-2">
                        {page > 1 ? (
                            <Link
                                href={buildUrl({ page: String(page - 1) })}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle"
                            >
                                <ChevronLeft className="size-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </Link>
                        ) : (
                            <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50">
                                <ChevronLeft className="size-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </span>
                        )}
                        {page < totalPages ? (
                            <Link
                                href={buildUrl({ page: String(page + 1) })}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="size-4" />
                            </Link>
                        ) : (
                            <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50">
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="size-4" />
                            </span>
                        )}
                    </div>
                </nav>
            )}
        </div>
    )
}

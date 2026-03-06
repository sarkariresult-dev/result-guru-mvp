import Link from 'next/link'
import { searchPosts } from '@/lib/queries/posts'
import { PostGrid } from '@/components/posts/PostGrid'
import { SearchBar } from '@/components/shared/SearchBar'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { AdZone } from '@/components/ads/AdZone'
import { buildPageMetadata } from '@/lib/metadata'
import { ROUTE_PREFIXES } from '@/config/site'
import { Search, ServerCrash, Briefcase, FileText, CreditCard, Key } from 'lucide-react'

export const metadata = buildPageMetadata({
    title: 'Search',
    description: 'Search government jobs, results, admit cards, answer keys, syllabus, and exam updates across India.',
    path: '/search',
    noindex: true,
})

/* ── Popular search suggestions ──────────────────────────────────── */

const POPULAR_SEARCHES = [
    { label: 'SSC CGL 2026', query: 'SSC CGL 2026' },
    { label: 'Railway RRB', query: 'Railway RRB' },
    { label: 'UPSC CSE', query: 'UPSC CSE' },
    { label: 'Bank PO', query: 'Bank PO' },
    { label: 'State PSC', query: 'State PSC' },
    { label: 'Defence Jobs', query: 'Defence Jobs' },
]

const QUICK_LINKS = [
    { label: 'Sarkari Jobs', href: ROUTE_PREFIXES.job, icon: Briefcase },
    { label: 'Results', href: ROUTE_PREFIXES.result, icon: FileText },
    { label: 'Admit Cards', href: ROUTE_PREFIXES.admit, icon: CreditCard },
    { label: 'Answer Keys', href: ROUTE_PREFIXES.answer_key, icon: Key },
]

interface Props {
    searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
    const { q } = await searchParams
    const trimmedQuery = q?.trim() ?? ''

    let posts: Awaited<ReturnType<typeof searchPosts>> = []
    let fetchError = false

    if (trimmedQuery) {
        try {
            posts = await searchPosts(trimmedQuery)
        } catch {
            fetchError = true
        }
    }

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            <Breadcrumb items={[{ label: 'Search' }]} />

            <div className="mt-4 mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {trimmedQuery ? `Search Results` : 'Search'}
                </h1>
                {trimmedQuery && (
                    <p className="mt-2 text-foreground-muted">
                        Showing results for &ldquo;<span className="font-medium text-foreground">{trimmedQuery}</span>&rdquo;
                    </p>
                )}
            </div>

            <SearchBar className="mb-8 max-w-xl" />

            {trimmedQuery ? (
                fetchError ? (
                    <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                        <div className="mb-4 rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                            <ServerCrash className="size-8 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">Search Error</h3>
                        <p className="text-foreground-muted max-w-md">
                            Could not process your search right now. Please try again in a moment.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="mb-6 text-sm text-foreground-muted">
                            {posts.length} result{posts.length !== 1 ? 's' : ''} found
                        </p>

                        {posts.length > 0 ? (
                            <>
                                <PostGrid posts={posts} />
                                <AdZone zoneSlug="below_content" className="mt-8" />
                            </>
                        ) : (
                            <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                                <div className="mb-4 rounded-full bg-background-subtle p-4">
                                    <Search className="size-8 text-foreground-muted" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">No results found</h3>
                                <p className="text-foreground-muted max-w-md mb-6">
                                    We couldn&apos;t find anything matching &ldquo;{trimmedQuery}&rdquo;. Try different keywords or check your spelling.
                                </p>

                                {/* Suggestions */}
                                <div className="text-sm text-foreground-muted">
                                    <p className="font-medium text-foreground mb-3">Try searching for:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {POPULAR_SEARCHES.map((s) => (
                                            <Link
                                                key={s.query}
                                                href={`/search?q=${encodeURIComponent(s.query)}`}
                                                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-background-subtle hover:text-foreground transition-colors"
                                            >
                                                {s.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )
            ) : (
                <div className="space-y-10">
                    {/* Initial search state */}
                    <div className="flex min-h-62.5 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                        <div className="mb-4 rounded-full bg-background-subtle p-4">
                            <Search className="size-8 text-foreground-muted" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">Search for anything</h3>
                        <p className="text-foreground-muted max-w-md mb-6">
                            Find government jobs, results, admit cards, and more using the search bar above.
                        </p>

                        {/* Popular searches */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {POPULAR_SEARCHES.map((s) => (
                                <Link
                                    key={s.query}
                                    href={`/search?q=${encodeURIComponent(s.query)}`}
                                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 dark:hover:bg-brand-950/30 dark:hover:text-brand-400 dark:hover:border-brand-800 transition-colors"
                                >
                                    {s.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick category links */}
                    <div>
                        <h2 className="mb-4 text-lg font-bold text-foreground">Browse by Category</h2>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {QUICK_LINKS.map((link) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-brand-300 hover:shadow-sm dark:hover:border-brand-700"
                                    >
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                                            <Icon className="size-5" />
                                        </div>
                                        <span className="font-medium text-foreground group-hover:text-brand-600 transition-colors text-sm">
                                            {link.label}
                                        </span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE } from '@/config/site'
import { formatTitle } from '@/lib/metadata'
import { getPosts, getPostsCount } from '@/features/posts/queries'
import { getCategories } from '@/lib/queries/taxonomy'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { PAGINATION } from '@/config/constants'
import { ChevronRight, ChevronLeft, Folder } from 'lucide-react'

interface Props {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}

/* ── Metadata ────────────────────────────────────────────────────── */

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { slug } = await params
    const resolvedSearchParams = await searchParams
    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1
    const limit = PAGINATION.DEFAULT_LIMIT

    const categories = await getCategories()
    const category = categories.find((c) => c.slug === slug)
    if (!category) return {}

    const totalCountRes = await getPostsCount({ category_slug: slug }).catch(() => 0)
    const totalPages = Math.ceil(totalCountRes / limit)

    const baseTitle = page > 1 ? `${category.name} Updates - Page ${page}` : `${category.name} Latest Updates`
    const title = formatTitle(baseTitle)
    const description = `Browse all the latest updates computationally tagged under the ${category.name} category. Find relevant notifications on ${SITE.name}.`
    const url = `${SITE.url}/category/${slug}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    const baseMetadata: Metadata = {
        title,
        description,
        alternates: {
            canonical,
        },
        robots: {
            index: page === 1,
            follow: true,
            nocache: false,
            googleBot: {
                index: page === 1,
                follow: true,
            },
        },
        openGraph: {
            type: 'website',
            images: [{ url: SITE.defaultOgImage, width: SITE.defaultOgWidth, height: SITE.defaultOgHeight }],
        },
        twitter: {
            card: SITE.twitter.cardType,
            title,
            description,
            site: SITE.twitter.handle,
        },
    }

    if (page > 1 || page < totalPages) {
        baseMetadata.alternates = {
            ...baseMetadata.alternates,
            ...(page > 1 && { prev: page === 2 ? url : `${url}?page=${page - 1}` }),
            ...(page < totalPages && { next: `${url}?page=${page + 1}` }),
        }
    }

    return baseMetadata
}

/* ── Pagination helpers ──────────────────────────────────────────── */

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    if (!pages.includes(total)) pages.push(total)
    return pages
}

/* ── Component ───────────────────────────────────────────────────── */

export default async function CategoryArchivePage({ params, searchParams }: Props) {
    const { slug } = await params
    const resolvedSearchParams = await searchParams
    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1
    const limit = PAGINATION.DEFAULT_LIMIT

    const categories = await getCategories()
    const category = categories.find((c) => c.slug === slug)
    if (!category) notFound()

    let posts: Awaited<ReturnType<typeof getPosts>> = []
    let totalCount = 0
    let fetchError = false

    try {
        ;[posts, totalCount] = await Promise.all([
            getPosts({ category_slug: slug }, page, limit),
            getPostsCount({ category_slug: slug }),
        ])
    } catch {
        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)
    const basePath = `/category/${slug}`

    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Header section */}
            <header className="border-b border-border bg-linear-to-br from-brand-50 to-white pt-24 pb-12 dark:from-brand-950/20 dark:to-background">
                <div className="container mx-auto max-w-5xl px-4 text-center">
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/40">
                        <Folder className="size-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <h1 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        {category.name} Updates
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground-muted">
                        Browse all the latest notifications and updates dynamically tagged under {category.name}.
                    </p>
                </div>
            </header>

            {/* Main content */}
            <main className="container mx-auto flex-1 max-w-5xl px-4 py-8" id="main-content">
                {fetchError ? (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center text-destructive">
                        <p>We&apos;re having trouble loading posts right now. Please try again later.</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-surface">
                            <Folder className="size-6 text-foreground-muted" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-foreground">No posts found</h2>
                        <p className="mt-2 max-w-sm text-sm text-foreground-muted">
                            We haven&apos;t published any {category.name} updates yet. Check back soon!
                        </p>
                        <Link
                            href="/"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
                        >
                            Back to Home
                        </Link>
                    </div>
                ) : (
                    <PostGrid posts={posts} />
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav className="mt-12 flex items-center justify-center gap-1 sm:gap-2" aria-label="Pagination Navigation">
                        {page > 1 ? (
                            <Link
                                href={page === 2 ? basePath : `${basePath}?page=${page - 1}`}
                                className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-hover"
                                rel="prev"
                            >
                                <ChevronLeft className="size-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm font-medium text-foreground-muted opacity-50">
                                <ChevronLeft className="size-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1 px-2">
                            {getPageNumbers(page, totalPages).map((p, i) =>
                                p === '...' ? (
                                    <span key={`dots-${i}`} className="px-2 text-foreground-muted">
                                        ...
                                    </span>
                                ) : (
                                    <Link
                                        key={p}
                                        href={p === 1 ? basePath : `${basePath}?page=${p}`}
                                        className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition ${p === page
                                            ? 'bg-brand-600 text-white'
                                            : 'text-foreground hover:bg-surface-hover'
                                            }`}
                                        aria-current={p === page ? 'page' : undefined}
                                    >
                                        {p}
                                    </Link>
                                ),
                            )}
                        </div>

                        {page < totalPages ? (
                            <Link
                                href={`${basePath}?page=${page + 1}`}
                                className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:bg-surface-hover"
                                rel="next"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="size-4" />
                            </Link>
                        ) : (
                            <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-background px-3 py-2 text-sm font-medium text-foreground-muted opacity-50">
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="size-4" />
                            </div>
                        )}
                    </nav>
                )}
            </main>
        </div>
    )
}

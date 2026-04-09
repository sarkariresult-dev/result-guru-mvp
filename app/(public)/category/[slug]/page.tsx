import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SITE } from '@/config/site'
import { formatTitle } from '@/lib/metadata'
import { getPosts, getPostsCount } from '@/features/posts/queries'
import { getCategories } from '@/lib/queries/taxonomy'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { PAGINATION } from '@/config/constants'
import { ChevronRight, ChevronLeft, Folder, AlertCircle, ArrowRight } from 'lucide-react'

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
            {/* 1. Immersive Brand Hero */}
            <header className="relative bg-slate-50 border-b border-border/50 pt-12 pb-16 sm:pt-20 sm:pb-32 dark:bg-slate-950/20 overflow-hidden">
                {/* Background Decorative Element */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
                    <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent-500/5 blur-[100px]" />
                </div>

                <div className="container relative mx-auto max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 dark:bg-brand-900/30 dark:border-brand-800/50 mb-6 group transition-colors">
                            <div className="size-2 rounded-full bg-brand-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">Section Archive</span>
                        </div>

                        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-fluid-4xl lg:text-7xl mb-6 leading-[1.1]">
                            <span className="text-gradient-brand">{category.name}</span> <br className="hidden lg:block" />
                            Latest Updates
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-foreground-muted leading-relaxed font-medium">
                            Explore all verified government notifications, results, and admit cards organized under India&apos;s most trusted {category.name} database.
                        </p>
                    </div>
                </div>
            </header>

            {/* 2. Main content Archive */}
            <main className="container mx-auto flex-1 max-w-7xl px-4 py-12 sm:py-20" id="main-content">
                {fetchError ? (
                    <div className="rounded-4xl border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive sm:p-12">
                        <AlertCircle className="size-12 mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-black mb-2">Sync Interrupted</h2>
                        <p className="font-medium">We&apos;re having trouble loading {category.name} updates right now. Please try again later.</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-border bg-slate-50/50 py-24 px-8 text-center dark:bg-slate-900/10">
                        <div className="flex size-20 items-center justify-center rounded-4xl bg-white border border-border shadow-sm mb-8 dark:bg-slate-900">
                            <Folder className="size-8 text-brand-500 opacity-50" />
                        </div>
                        <h2 className="text-2xl font-black text-foreground mb-3">No Updates Found</h2>
                        <p className="max-w-md text-foreground-muted font-medium leading-relaxed mb-10">
                            We haven&apos;t published any verified {category.name} updates in this specific archive yet. They will appear here instantly once declared official.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 rounded-2xl bg-brand-600 px-8 py-4 text-base font-black text-white transition-all shadow-xl shadow-brand-500/20 hover:bg-brand-700 active:scale-95"
                        >
                            Explore Site Map
                            <ArrowRight className="size-5" />
                        </Link>
                    </div>
                ) : (
                    <PostGrid posts={posts} />
                )}

                {/* 3. Professional Pagination Navigation */}
                {totalPages > 1 && (
                    <nav className="mt-20 flex flex-col items-center gap-8" aria-label="Archive Pagination">
                        <div className="flex items-center gap-2">
                            {page > 1 ? (
                                <Link
                                    href={page === 2 ? basePath : `${basePath}?page=${page - 1}`}
                                    className="group flex size-12 items-center justify-center rounded-2xl border border-border bg-white text-foreground transition-all hover:border-brand-500/50 hover:text-brand-600 hover:shadow-lg dark:bg-slate-900"
                                    rel="prev"
                                    aria-label="Previous Page"
                                >
                                    <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
                                </Link>
                            ) : (
                                <div className="flex size-12 items-center justify-center rounded-2xl border border-border/50 bg-slate-50 text-foreground-muted opacity-30 dark:bg-slate-900/50" aria-disabled="true">
                                    <ChevronLeft className="size-5" />
                                </div>
                            )}

                            <div className="flex items-center gap-1.5 px-2">
                                {getPageNumbers(page, totalPages).map((p, i) =>
                                    p === '...' ? (
                                        <span key={`dots-${i}`} className="px-3 text-foreground-muted font-bold">
                                            ...
                                        </span>
                                    ) : (
                                        <Link
                                            key={p}
                                            href={p === 1 ? basePath : `${basePath}?page=${p}`}
                                            className={`flex size-12 items-center justify-center rounded-2xl text-sm font-black transition-all ${p === page
                                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 scale-105'
                                                : 'text-foreground-muted hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800'
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
                                    className="group flex size-12 items-center justify-center rounded-2xl border border-border bg-white text-foreground transition-all hover:border-brand-500/50 hover:text-brand-600 hover:shadow-lg dark:bg-slate-900"
                                    rel="next"
                                    aria-label="Next Page"
                                >
                                    <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            ) : (
                                <div className="flex size-12 items-center justify-center rounded-2xl border border-border/50 bg-slate-50 text-foreground-muted opacity-30 dark:bg-slate-900/50" aria-disabled="true">
                                    <ChevronRight className="size-5" />
                                </div>
                            )}
                        </div>
                        
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground-muted/60">
                            Showing Page {page} of {totalPages}
                        </p>
                    </nav>
                )}
            </main>
        </div>
    )
}

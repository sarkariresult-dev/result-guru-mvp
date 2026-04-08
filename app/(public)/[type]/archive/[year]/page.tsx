import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPosts, getPostsCount } from '@/features/posts/queries'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { PAGINATION } from '@/config/constants'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import { POST_TYPE_CONFIG } from '@/config/constants'
import type { PostTypeKey } from '@/config/site'
import { Calendar, ChevronLeft, ChevronRight, ServerCrash, FileX2 } from 'lucide-react'
import { slugToKey, humanise } from '@/lib/utils'
import type { PostCard } from '@/types/post.types'
import { TaxonomyRibbon } from '@/features/taxonomy/components/TaxonomyRibbon'
import { Suspense } from 'react'

// ── Types ─────────────────────────────────────────────────────────

interface Props {
    params: Promise<{ type: string; year: string }>
    searchParams: Promise<{ page?: string }>
}

// ── Validate year ─────────────────────────────────────────────────

function isValidYear(year: string): boolean {
    const y = parseInt(year, 10)
    return !isNaN(y) && y >= 2020 && y <= 2027
}

// ── Static Params ─────────────────────────────────────────────────

export async function generateStaticParams() {
    const currentYear = 2026
    const years = [currentYear, currentYear - 1]
    const topTypes = ['job', 'result', 'admit-card', 'answer-key', 'syllabus']

    if (process.env.NODE_ENV === 'development') {
        return [{ type: 'job', year: String(currentYear) }]
    }

    const params: { type: string; year: string }[] = []
    years.forEach(y => {
        topTypes.forEach(type => {
            params.push({ type, year: String(y) })
        })
    })

    return params.length > 0 ? params : [{ type: 'job', year: String(currentYear) }]
}

// ── Metadata ──────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { type, year } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey] || !isValidYear(year)) return {}

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))

    const typeName = POST_TYPE_CONFIG[typeKey].heading
    const currentYear = 2026
    const yearNum = parseInt(year, 10)

    // CTR-Optimized titles
    let baseTitle: string
    let description: string

    if (yearNum === currentYear) {
        baseTitle = `${typeName} ${year}: All Latest Updates & Notifications`
        description = `Complete list of ${typeName.toLowerCase()} for ${year}. Get latest notifications, eligibility, dates & direct application links. Updated daily.`
    } else {
        baseTitle = `${typeName} ${year}: Previous Year Archive`
        description = `Archive of all ${typeName.toLowerCase()} from ${year}. Browse past results, notifications & recruitment records for reference.`
    }

    baseTitle = page > 1 ? `${baseTitle} (Page ${page})` : baseTitle
    const url = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/archive/${year}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    return {
        title: baseTitle,
        description,
        alternates: { canonical },
        openGraph: {
            title: baseTitle,
            description,
            url: canonical,
            siteName: SITE.name,
            type: 'website',
        },
    }
}

// ── Pagination helpers ────────────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    if (total > 1) pages.push(total)
    return pages
}

// ── Page ───────────────────────────────────────────────────────────

export default async function TypeByYearPage({ params, searchParams }: Props) {
    const { type, year } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey] || !isValidYear(year)) notFound()

    const yearNum = parseInt(year, 10)
    const yearStart = `${year}-01-01T00:00:00+05:30`
    const yearEnd = `${year}-12-31T23:59:59+05:30`

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT
    const currentYear = 2026

    let posts: PostCard[] = []
    let totalCount = 0
    let fetchError = false

    try {
        const [[p, c]] = await Promise.all([
            Promise.all([
                getPosts({
                    type: typeKey as unknown as import('@/types/enums').PostType,
                    published_after: yearStart,
                    published_before: yearEnd,
                }, page, limit),
                getPostsCount({
                    type: typeKey as unknown as import('@/types/enums').PostType,
                    published_after: yearStart,
                    published_before: yearEnd,
                }),
            ])
        ])
        posts = p
        totalCount = c
    } catch {
        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)
    const basePath = `${ROUTE_PREFIXES[typeKey]}/archive/${year}`
    const config = POST_TYPE_CONFIG[typeKey]

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: config.heading, url: `${SITE.url}${ROUTE_PREFIXES[typeKey]}` },
        { name: `${year}`, url: `${SITE.url}${basePath}` },
    ])

    /* CollectionPage JSON-LD */
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${config.heading} ${year}`,
        description: `All ${config.heading.toLowerCase()} published in ${year}.`,
        url: `${SITE.url}${basePath}`,
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
        ...(totalCount > 0 && {
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: totalCount,
                itemListElement: posts.slice(0, 10).map((post, i) => ({
                    '@type': 'ListItem',
                    position: (page - 1) * limit + i + 1,
                    url: `${SITE.url}${ROUTE_PREFIXES[post.type as PostTypeKey] || `/${post.type}`}/${post.slug}`,
                    name: post.title,
                })),
            },
        }),
    }

    /* Year navigation */
    const prevYear = yearNum > 2020 ? yearNum - 1 : null
    const nextYear = yearNum < currentYear ? yearNum + 1 : null
    const prevUrl = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
    const nextUrl = page < totalPages ? `${basePath}?page=${page + 1}` : null

    return (
        <>
            {prevUrl && <link rel="prev" href={`${SITE.url}${prevUrl}`} />}
            {nextUrl && <link rel="next" href={`${SITE.url}${nextUrl}`} />}

            <JsonLd data={[breadcrumbJsonLd, collectionJsonLd]} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: config.heading, href: ROUTE_PREFIXES[typeKey] },
                        { label: year },
                    ]}
                />

                <div className="mb-8 mt-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
                        <Calendar className="size-8 text-brand-600" />
                        {config.heading} {year}
                    </h1>
                    <p className="mt-4 max-w-3xl text-lg font-medium text-foreground-muted leading-relaxed">
                        {yearNum === currentYear
                            ? `Browse all ${config.heading.toLowerCase()} for ${year}. Updated daily with the latest official notifications.`
                            : `Archive of ${config.heading.toLowerCase()} from ${year} for reference and preparation.`
                        }
                    </p>
                    {totalCount > 0 && (
                        <p className="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400">
                            Showing page {page} of {totalPages} &middot; {totalCount.toLocaleString('en-IN')} updates in {year}
                        </p>
                    )}
                </div>

                {/* ── Main content grid ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
                    
                    {/* ── Left Sidebar (Filter Discovery) ── */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-8">
                            {/* Year navigation (Archive Specific) */}
                            <section>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground-subtle">
                                    Browse by Year
                                </h3>
                                <div className="flex flex-col gap-1.5">
                                    {prevYear && (
                                        <Link
                                            href={`${ROUTE_PREFIXES[typeKey]}/archive/${prevYear}`}
                                            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-all hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/20"
                                        >
                                            {config.heading} {prevYear}
                                        </Link>
                                    )}
                                    {nextYear && (
                                        <Link
                                            href={`${ROUTE_PREFIXES[typeKey]}/archive/${nextYear}`}
                                            className="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 bg-brand-50 dark:bg-brand-900/40 transition-all hover:bg-brand-100"
                                        >
                                            {config.heading} {nextYear}
                                        </Link>
                                    )}
                                </div>
                            </section>

                            <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-background-muted" />}>
                                <TaxonomyRibbon typeSlug={type} layout="sidebar" />
                            </Suspense>
                            
                            <AdZone zoneSlug="sidebar_top" postType={typeKey} />
                        </div>
                    </aside>

                    {/* ── Main Column ── */}
                    <div className="space-y-8">
                        {/* Mobile-only Ribbons */}
                        <div className="space-y-4 lg:hidden">
                            <div className="flex flex-wrap gap-2">
                                {prevYear && (
                                    <Link
                                        href={`${ROUTE_PREFIXES[typeKey]}/archive/${prevYear}`}
                                        className="whitespace-nowrap rounded-lg border border-border bg-background-subtle px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
                                    >
                                        {config.heading} {prevYear}
                                    </Link>
                                )}
                                {nextYear && (
                                    <Link
                                        href={`${ROUTE_PREFIXES[typeKey]}/archive/${nextYear}`}
                                        className="whitespace-nowrap rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-all hover:bg-brand-100 active:scale-95"
                                    >
                                        {config.heading} {nextYear}
                                    </Link>
                                )}
                            </div>
                            <Suspense fallback={null}>
                                <TaxonomyRibbon typeSlug={type} layout="ribbon" />
                            </Suspense>
                        </div>

                        <AdZone zoneSlug="below_header" postType={typeKey} className="mb-4" />

                        {/* Posts grid */}
                        {fetchError ? (
                            <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                                <div className="mb-4 rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                                    <ServerCrash className="size-8 text-red-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h3>
                                <p className="text-foreground-muted max-w-md">Could not load the latest updates.</p>
                            </div>
                        ) : posts.length > 0 ? (
                            <PostGrid posts={posts} priority={2} />
                        ) : (
                            <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                                <div className="mb-4 rounded-full bg-background-subtle p-4">
                                    <FileX2 className="size-8 text-foreground-muted" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">No updates in {year}</h3>
                                <p className="max-w-md text-foreground-muted">
                                    No {config.heading.toLowerCase()} published for {year} yet.
                                </p>
                                <Link
                                    href={ROUTE_PREFIXES[typeKey]}
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                                >
                                    View Latest {config.heading}
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && !fetchError && (
                            <nav className="mt-12 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                                {page > 1 ? (
                                    <Link href={`${basePath}?page=${page - 1}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle">
                                        <ChevronLeft className="size-4" /><span className="hidden sm:inline">Previous</span>
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed">
                                        <ChevronLeft className="size-4" /><span className="hidden sm:inline">Previous</span>
                                    </span>
                                )}

                                {getPageNumbers(page, totalPages).map((p, i) =>
                                    p === '...' ? (
                                        <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-foreground-subtle">&hellip;</span>
                                    ) : (
                                        <Link key={p} href={`${basePath}?page=${p}`} className={`inline-flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${p === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-border text-foreground hover:bg-background-subtle'}`} aria-current={p === page ? 'page' : undefined}>
                                            {p}
                                        </Link>
                                    )
                                )}

                                {page < totalPages ? (
                                    <Link href={`${basePath}?page=${page + 1}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle">
                                        <span className="hidden sm:inline">Next</span><ChevronRight className="size-4" />
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed">
                                        <span className="hidden sm:inline">Next</span><ChevronRight className="size-4" />
                                    </span>
                                )}
                            </nav>
                        )}
                    </div>
                </div>

                <AdZone zoneSlug="below_content" postType={typeKey} className="mt-8" />
            </div>
        </>
    )
}

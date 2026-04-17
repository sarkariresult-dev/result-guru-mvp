import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getStateBySlug, getStates } from '@/lib/queries/states'
import { getPosts, getPostsCount } from '@/features/posts/queries'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { PAGINATION } from '@/config/constants'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import { POST_TYPE_CONFIG } from '@/config/constants'
import { PostType } from '@/types/enums'
import type { PostTypeKey } from '@/config/site'
import { Icons } from '@/lib/icons'
import { buildListingTitle, buildListingMeta } from '@/lib/metadata'
import { slugToKey, humanise } from '@/lib/utils'
import type { PostCard } from '@/types/post.types'
import { TaxonomyRibbon } from '@/features/taxonomy/components/TaxonomyRibbon'
import { Suspense } from 'react'

// ── Types ─────────────────────────────────────────────────────────

interface Props {
    params: Promise<{ type: string; stateSlug: string }>
    searchParams: Promise<{ page?: string }>
}

// ── Static Params ─────────────────────────────────────────────────

export async function generateStaticParams() {
    // Generate top combinations at build time
    try {
        const states = await getStates().catch(() => [])
        const topTypes = ['job', 'result', 'admit-card', 'syllabus', 'answer-key']

        // Return a subset during development to avoid huge build times
        if (process.env.NODE_ENV === 'development') {
            return topTypes.map(type => ({ type, stateSlug: 'uttar-pradesh' }))
        }

        const params: { type: string; stateSlug: string }[] = []
        states.forEach(state => {
            topTypes.forEach(type => {
                params.push({ type, stateSlug: state.slug })
            })
        })

        // Ensure at least one result for build-time validation in Next.js 16
        if (params.length === 0) {
            return [{ type: 'job', stateSlug: 'uttar-pradesh' }]
        }

        return params
    } catch {
        return [{ type: 'job', stateSlug: 'uttar-pradesh' }]
    }
}

// ── Metadata ──────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { type, stateSlug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey]) return {}

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const year = 2026

    let stateRecord: Awaited<ReturnType<typeof getStateBySlug>> = null
    try {
        stateRecord = await getStateBySlug(stateSlug)
    } catch {
        return {}
    }

    if (!stateRecord) return {}

    const title = buildListingTitle(typeKey as PostTypeKey, {
        page,
        stateName: stateRecord.name
    })
    const description = buildListingMeta(typeKey as PostTypeKey, {
        page,
        stateName: stateRecord.name
    })
    const url = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/in/${stateSlug}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    const totalCount = await getPostsCount({
        type: typeKey as PostType,
        state_slug: stateSlug
    }).catch(() => 0)
    const totalPages = Math.ceil(totalCount / PAGINATION.DEFAULT_LIMIT)

    const baseMetadata: Metadata = {
        title,
        description,
        alternates: {
            canonical,
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

export default async function TypeInStatePage({ params, searchParams }: Props) {
    const { type, stateSlug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey]) notFound()

    let stateRecord: Awaited<ReturnType<typeof getStateBySlug>> = null
    try {
        stateRecord = await getStateBySlug(stateSlug)
    } catch {
        notFound()
    }

    if (!stateRecord || !stateRecord.is_active) notFound()

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT
    const year = 2026

    let posts: PostCard[] = []
    let totalCount = 0
    let fetchError = false

    try {
        const [[p, c]] = await Promise.all([
            Promise.all([
                getPosts({ type: typeKey as PostType, state_slug: stateSlug }, page, limit),
                getPostsCount({ type: typeKey as PostType, state_slug: stateSlug }),
            ])
        ])
        posts = p
        totalCount = c
    } catch {
        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)
    const basePath = `${ROUTE_PREFIXES[typeKey]}/in/${stateSlug}`
    const config = POST_TYPE_CONFIG[typeKey]

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'States', url: `${SITE.url}/states` },
        { name: stateRecord.name, url: `${SITE.url}/states/${stateSlug}` },
        { name: config.heading, url: `${SITE.url}${basePath}` },
    ])

    /* CollectionPage JSON-LD */
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${stateRecord.name} ${config.heading} ${year}`,
        description: `Latest ${config.heading.toLowerCase()} for the state of ${stateRecord.name}.`,
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

    const prevUrl = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
    const nextUrl = page < totalPages ? `${basePath}?page=${page + 1}` : null

    return (
        <>
            <JsonLd data={[breadcrumbJsonLd, collectionJsonLd]} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'States', href: '/states' },
                        { label: stateRecord.name, href: `/states/${stateSlug}` },
                        { label: humanise(type) },
                    ]}
                />

                <div className="mb-8 mt-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
                        <Icons.MapPin className="size-8 text-brand-600" />
                        {stateRecord.name} {config.heading}
                    </h1>
                    <div className="mt-4 flex flex-col gap-3">
                        <p className="max-w-3xl text-lg font-medium text-foreground-muted leading-relaxed">
                            Looking for the latest {config.heading.toLowerCase()} in {stateRecord.name}?
                            We bring you verified updates, eligibility criteria, and direct links for all {year} opportunities.
                        </p>
                    </div>
                    {totalCount > 0 && (
                        <p className="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400">
                            Showing page {page} of {totalPages} &middot; {totalCount.toLocaleString('en-IN')} updates
                        </p>
                    )}
                </div>

                {/* ── Main content grid ── */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
                    
                    {/* ── Left Sidebar (Filter Discovery) ── */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-8">
                            <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-background-muted" />}>
                                <TaxonomyRibbon typeSlug={type} layout="sidebar" />
                            </Suspense>
                            
                            <AdZone zoneSlug="sidebar_top" postType={typeKey} />
                        </div>
                    </aside>

                    {/* ── Main Column ── */}
                    <div className="space-y-8">
                        {/* Mobile-only Ribbon (Hidden on Desktop) */}
                        <div className="lg:hidden">
                            <Suspense fallback={null}>
                                <TaxonomyRibbon typeSlug={type} layout="ribbon" />
                            </Suspense>
                        </div>

                        <AdZone zoneSlug="below_header" postType={typeKey} className="mb-4" />

                        {/* Posts grid */}
                        {fetchError ? (
                            <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                                <div className="mb-4 rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                                    <Icons.AlertCircle className="size-8 text-red-600" />
                                </div>
                                <h2 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h2>
                                <p className="max-w-md text-foreground-muted">
                                    Could not load the latest updates.
                                </p>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                    {stateRecord.name} {config.heading} List
                                </h2>
                                <PostGrid posts={posts} priority={2} />
                            </div>
                        ) : (
                            <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                                <div className="mb-4 rounded-full bg-background-subtle p-4">
                                    <Icons.Info className="size-8 text-foreground-muted" />
                                </div>
                                <h2 className="mb-2 text-lg font-semibold text-foreground">No updates yet</h2>
                                <p className="max-w-md text-foreground-muted">
                                    There are no {config.heading.toLowerCase()} available for {stateRecord.name} right now.
                                </p>
                                <Link
                                    href={`/states/${stateSlug}`}
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                                >
                                    View All {stateRecord.name} Updates
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && !fetchError && (
                            <nav className="mt-12 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                                {page > 1 ? (
                                    <Link
                                        href={`${basePath}?page=${page - 1}`}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
                                    >
                                        <Icons.ChevronLeft className="size-4" />
                                        <span className="hidden sm:inline">Previous</span>
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed">
                                        <Icons.ChevronLeft className="size-4" />
                                        <span className="hidden sm:inline">Previous</span>
                                    </span>
                                )}

                                {getPageNumbers(page, totalPages).map((p, i) =>
                                    p === '...' ? (
                                        <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-foreground-subtle">&hellip;</span>
                                    ) : (
                                        <Link
                                            key={p}
                                            href={`${basePath}?page=${p}`}
                                            className={`inline-flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${p === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-border text-foreground hover:bg-background-subtle'}`}
                                            aria-current={p === page ? 'page' : undefined}
                                        >
                                            {p}
                                        </Link>
                                    )
                                )}

                                {page < totalPages ? (
                                    <Link
                                        href={`${basePath}?page=${page + 1}`}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <Icons.ChevronRight className="size-4" />
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed">
                                        <span className="hidden sm:inline">Next</span>
                                        <Icons.ChevronRight className="size-4" />
                                    </span>
                                )}
                            </nav>
                        )}
                    </div>
                </div>

                {/* Guide Section */}
                <div className="mt-16 border-t border-border pt-12">
                    <section className="prose prose-slate dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-bold text-foreground">Guide to {stateRecord.name} {config.heading}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">How to apply in {stateRecord.name}?</h3>
                                <p className="text-foreground-muted">
                                    Candidates looking for {config.heading.toLowerCase()} in {stateRecord.name} should verify their residency and qualification requirements. Most state-level notifications require a valid domicile of {stateRecord.name}. We provide direct links to official state portals for easy application.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Reliable Updates</h3>
                                <p className="text-foreground-muted">
                                    Result Guru tracks all major departments within {stateRecord.name} to bring you real-time alerts. From {config.heading.toLowerCase()} results to new vacancies, we ensure every piece of information is sourced directly from verified government channels.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                <AdZone zoneSlug="below_content" postType={typeKey} className="mt-8" />
            </div>
        </>
    )
}

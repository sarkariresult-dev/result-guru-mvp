import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getQualifications, getQualificationBySlug } from '@/lib/queries/taxonomy'
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
import { GraduationCap, FileText, ChevronLeft, ChevronRight, ServerCrash, FileX2 } from 'lucide-react'
import { slugToKey, humanise } from '@/lib/utils'
import type { PostCard } from '@/types/post.types'
import { TaxonomyRibbon } from '@/features/taxonomy/components/TaxonomyRibbon'
import { Suspense } from 'react'

// ── Types ─────────────────────────────────────────────────────────

interface Props {
    params: Promise<{ type: string; qualificationSlug: string }>
    searchParams: Promise<{ page?: string }>
}

// ── Static Params ─────────────────────────────────────────────────

export async function generateStaticParams() {
    // Generate top combinations at build time
    try {
        const quals = await getQualifications().catch(() => [])
        const topTypes = ['job', 'result', 'admit-card', 'syllabus']
        
        if (process.env.NODE_ENV === 'development') {
            return topTypes.map(type => ({ type, qualificationSlug: '10th-pass' }))
        }

        const params: { type: string; qualificationSlug: string }[] = []
        quals.forEach(q => {
            topTypes.forEach(type => {
                params.push({ type, qualificationSlug: q.slug })
            })
        })

        // Ensure at least one result for build-time validation in Next.js 16
        if (params.length === 0) {
            return [{ type: 'job', qualificationSlug: '10th-pass' }]
        }

        return params
    } catch {
        return [{ type: 'job', qualificationSlug: '10th-pass' }]
    }
}

// ── Metadata ──────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { type, qualificationSlug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey]) return {}

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const year = 2026

    let qualRecord = null
    try {
        qualRecord = await getQualificationBySlug(qualificationSlug)
    } catch {
        return {}
    }

    if (!qualRecord) return {}
  
    const typeName = POST_TYPE_CONFIG[typeKey].heading
    const qualName = qualRecord.short_name || qualRecord.name
    
    // CTR Optimized Title: 🔥 10th Pass Govt Jobs 2026: Latest Vacancies
    let baseTitle = `${qualName} ${typeName} ${year} - Latest Updates`
    let description = `Find the latest ${typeName.toLowerCase()} requiring ${qualName} in ${year}. Get verified notifications, direct links, and eligibility details.`

    // Add CTR urgency and emoji
    if (typeKey === 'job') {
        baseTitle = `${qualName} Govt Jobs ${year}: Apply for Latest Vacancies`
        description = `Looking for ${qualName} Government Jobs in ${year}? Get the newest recruitment notifications, eligibility criteria, and direct application links for all jobs requiring ${qualRecord.name}.`
    } else if (typeKey === 'result') {
        baseTitle = `${qualName} Sarkari Result ${year} [LIVE]: Merit List & Cut Off`
    } else if (typeKey === 'admit') {
        baseTitle = `${qualName} Admit Cards ${year}: Download Hall Tickets`
    } else if (typeKey === 'scholarship') {
        baseTitle = `${qualName} Scholarships ${year}: Apply Online`
        description = `Find the best government scholarships and fellowships for ${qualName} students in ${year}.`
    }

    baseTitle = page > 1 ? `${baseTitle} (Page ${page})` : baseTitle
    const url = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/for/${qualificationSlug}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    const totalCount = await getPostsCount({ 
        type: typeKey as unknown as import('@/types/enums').PostType, 
        qualification: qualRecord.slug // Searching JSONB array using contains mapped to qualification parameter
    }).catch(() => 0)
    
    const totalPages = Math.ceil(totalCount / PAGINATION.DEFAULT_LIMIT)

    const baseMetadata: Metadata = {
        title: baseTitle,
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

export default async function TypeForQualificationPage({ params, searchParams }: Props) {
    const { type, qualificationSlug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey]) notFound()

    let qualRecord = null
    try {
        qualRecord = await getQualificationBySlug(qualificationSlug)
    } catch {
        notFound()
    }

    if (!qualRecord) notFound()

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT
    const year = 2026

    let posts: PostCard[] = []
    let totalCount = 0
    let fetchError = false

    try {
        const pType = typeKey as unknown as import('@/types/enums').PostType
        const [[p, c]] = await Promise.all([
            Promise.all([
                getPosts({ type: pType, qualification: qualRecord.slug }, page, limit),
                getPostsCount({ type: pType, qualification: qualRecord.slug }),
            ])
        ])
        posts = p
        totalCount = c
    } catch {
        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)
    const basePath = `${ROUTE_PREFIXES[typeKey]}/for/${qualificationSlug}`
    const config = POST_TYPE_CONFIG[typeKey]
    const qualName = qualRecord.short_name || qualRecord.name

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: qualName, url: `${SITE.url}/qualification/${qualificationSlug}` },
        { name: config.heading, url: `${SITE.url}${basePath}` },
    ])

    /* CollectionPage JSON-LD */
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${qualName} ${config.heading} ${year}`,
        description: `Latest ${config.heading.toLowerCase()} requiring ${qualRecord.name}.`,
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
            {prevUrl && <link rel="prev" href={`${SITE.url}${prevUrl}`} />}
            {nextUrl && <link rel="next" href={`${SITE.url}${nextUrl}`} />}

            <JsonLd data={[breadcrumbJsonLd, collectionJsonLd]} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'Qualifications', href: '#' },
                        { label: qualName, href: '#' }, // Ideally links to qualification hub if it exists
                        { label: humanise(type) },
                    ]}
                />

                <div className="mb-8 mt-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
                        <GraduationCap className="size-8 text-brand-600" />
                        {qualName} {config.heading}
                    </h1>
                    <div className="mt-4 flex flex-col gap-3">
                        <p className="max-w-3xl text-lg font-medium text-foreground-muted leading-relaxed">
                            Looking for the latest {config.heading.toLowerCase()} for {qualRecord.name} candidates? 
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
                                    <ServerCrash className="size-8 text-red-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h3>
                                <p className="max-w-md text-foreground-muted">
                                    Could not load the latest updates.
                                </p>
                            </div>
                        ) : posts.length > 0 ? (
                            <PostGrid posts={posts} priority={2} />
                        ) : (
                            <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                                <div className="mb-4 rounded-full bg-background-subtle p-4">
                                    <FileX2 className="size-8 text-foreground-muted" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">No updates yet</h3>
                                <p className="max-w-md text-foreground-muted">
                                    There are no {config.heading.toLowerCase()} available for {qualName} right now.
                                </p>
                                <Link
                                    href="/"
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                                >
                                    View All Updates
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
                                        <ChevronLeft className="size-4" />
                                        <span className="hidden sm:inline">Previous</span>
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed">
                                        <ChevronLeft className="size-4" />
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
                                        <ChevronRight className="size-4" />
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed">
                                        <span className="hidden sm:inline">Next</span>
                                        <ChevronRight className="size-4" />
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

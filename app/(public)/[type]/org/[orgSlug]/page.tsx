import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getOrganizationBySlug, getOrganizations } from '@/lib/queries/organizations'
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
import { Icons } from '@/lib/icons'
import { buildListingTitle, buildListingMeta } from '@/lib/metadata'
import { slugToKey, humanise } from '@/lib/utils'
import type { PostCard } from '@/types/post.types'
import { TaxonomyRibbon } from '@/features/taxonomy/components/TaxonomyRibbon'
import { Suspense } from 'react'

// ── Types ─────────────────────────────────────────────────────────

interface Props {
    params: Promise<{ type: string; orgSlug: string }>
    searchParams: Promise<{ page?: string }>
}

// ── Static Params ─────────────────────────────────────────────────

export async function generateStaticParams() {
    try {
        const orgs = await getOrganizations().catch(() => [])
        const topTypes = ['job', 'result', 'admit-card', 'syllabus', 'answer-key']

        if (process.env.NODE_ENV === 'development') {
            return [{ type: 'job', orgSlug: 'ssc' }]
        }

        // Only generate params for orgs that are likely to have posts
        const params: { type: string; orgSlug: string }[] = []
        orgs.slice(0, 30).forEach(org => {
            topTypes.forEach(type => {
                params.push({ type, orgSlug: org.slug })
            })
        })

        if (params.length === 0) {
            return [{ type: 'job', orgSlug: 'ssc' }]
        }

        return params
    } catch {
        return [{ type: 'job', orgSlug: 'ssc' }]
    }
}

// ── Metadata ──────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { type, orgSlug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey]) return {}

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const year = 2026

    let orgRecord: Awaited<ReturnType<typeof getOrganizationBySlug>> = null
    try {
        orgRecord = await getOrganizationBySlug(orgSlug)
    } catch {
        return {}
    }

    if (!orgRecord) return {}

    const title = buildListingTitle(typeKey as PostTypeKey, {
        page,
        orgName: orgRecord.name,
        orgShortName: orgRecord.short_name || undefined
    })
    const description = buildListingMeta(typeKey as PostTypeKey, {
        page,
        orgName: orgRecord.name
    })
    const url = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/org/${orgSlug}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    const totalCount = await getPostsCount({
        type: typeKey as unknown as import('@/types/enums').PostType,
        organization_id: orgRecord.id
    }).catch(() => 0)
    const totalPages = Math.ceil(totalCount / PAGINATION.DEFAULT_LIMIT)

    const baseMetadata: Metadata = {
        title,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: SITE.name,
            type: 'website',
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

export default async function TypeByOrgPage({ params, searchParams }: Props) {
    const { type, orgSlug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey]) notFound()

    let orgRecord: Awaited<ReturnType<typeof getOrganizationBySlug>> = null
    try {
        orgRecord = await getOrganizationBySlug(orgSlug)
    } catch {
        notFound()
    }

    if (!orgRecord || !orgRecord.is_active) notFound()

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
                getPosts({ type: typeKey as unknown as import('@/types/enums').PostType, organization_id: orgRecord.id }, page, limit),
                getPostsCount({ type: typeKey as unknown as import('@/types/enums').PostType, organization_id: orgRecord.id }),
            ])
        ])
        posts = p
        totalCount = c
    } catch {
        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)
    const basePath = `${ROUTE_PREFIXES[typeKey]}/org/${orgSlug}`
    const config = POST_TYPE_CONFIG[typeKey]
    const orgDisplay = orgRecord.short_name || orgRecord.name

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Organizations', url: `${SITE.url}/organizations` },
        { name: orgRecord.name, url: `${SITE.url}/organizations/${orgSlug}` },
        { name: config.heading, url: `${SITE.url}${basePath}` },
    ])

    /* CollectionPage JSON-LD */
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${orgDisplay} ${config.heading} ${year}`,
        description: `Latest ${config.heading.toLowerCase()} from ${orgRecord.name} (${orgDisplay}).`,
        url: `${SITE.url}${basePath}`,
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
        about: {
            '@type': 'Organization',
            name: orgRecord.name,
            ...(orgRecord.official_url && { url: orgRecord.official_url }),
        },
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

    /* Cross-type navigation — show other types for this org */
    const otherTypes = (Object.keys(POST_TYPE_CONFIG) as PostTypeKey[])
        .filter(k => k !== typeKey)
        .slice(0, 6)

    const prevUrl = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
    const nextUrl = page < totalPages ? `${basePath}?page=${page + 1}` : null

    return (
        <>
            <JsonLd data={[breadcrumbJsonLd, collectionJsonLd]} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'Organizations', href: '/organizations' },
                        { label: orgRecord.name, href: `/organizations/${orgSlug}` },
                        { label: humanise(type) },
                    ]}
                />

                <div className="mb-8 mt-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
                        <Icons.Briefcase className="size-8 text-brand-600" />
                        {orgDisplay} {config.heading} {year}
                    </h1>
                    <div className="mt-4 flex flex-col gap-3">
                        <p className="max-w-3xl text-lg font-medium text-foreground-muted leading-relaxed">
                            Find the latest {config.heading.toLowerCase()} from {orgRecord.name} ({orgDisplay}).
                            All updates verified with official notifications and direct links.
                        </p>
                        {orgRecord.official_url && (
                            <a
                                href={orgRecord.official_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                            >
                                <Icons.ExternalLink className="size-3.5" />
                                Official Website: {orgRecord.official_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            </a>
                        )}
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
                            {/* Cross-type navigation (Org Specific) */}
                            <section>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-foreground-subtle">
                                    More {orgDisplay} Updates
                                </h3>
                                <div className="flex flex-col gap-1.5">
                                    {otherTypes.map(t => (
                                        <Link
                                            key={t}
                                            href={`${ROUTE_PREFIXES[t]}/org/${orgSlug}`}
                                            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-all hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/20"
                                        >
                                            {POST_TYPE_CONFIG[t].label}
                                        </Link>
                                    ))}
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
                                {otherTypes.map(t => (
                                    <Link
                                        key={t}
                                        href={`${ROUTE_PREFIXES[t]}/org/${orgSlug}`}
                                        className="whitespace-nowrap rounded-lg border border-border bg-background-subtle px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
                                    >
                                        {POST_TYPE_CONFIG[t].label}
                                    </Link>
                                ))}
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
                                    Current {orgDisplay} Notifications
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
                                    There are no {config.heading.toLowerCase()} from {orgDisplay} right now.
                                </p>
                                <Link
                                    href={`/organizations/${orgSlug}`}
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                                >
                                    View All {orgDisplay} Updates
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
                        <h2 className="text-2xl font-bold text-foreground">About Recruitment at {orgDisplay}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">{orgRecord.name} Selection Process</h3>
                                <p className="text-foreground-muted">
                                    The {orgRecord.name} ({orgDisplay}) follows a rigorous selection procedure for its various posts. Usually involving multiple rounds of examinations and interviews, staying updated with their latest {config.heading.toLowerCase()} is crucial for any serious candidate. We provide direct access to the official portals and verified notifications.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Verification & Accuracy</h3>
                                <p className="text-foreground-muted">
                                    At Result Guru, we prioritize the accuracy of our {orgDisplay} updates. Every {config.heading.toLowerCase()} link on this page is cross-referenced with {orgRecord.official_url || 'official records'} to ensure you never fall for misinformation. Check back daily for real-time alerts.
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

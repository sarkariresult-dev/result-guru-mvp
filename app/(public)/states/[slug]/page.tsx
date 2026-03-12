import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getStateBySlug } from '@/lib/queries/states'
import { getPosts, getPostsCount } from '@/lib/queries/posts'
import { sanitizeHtml } from '@/lib/sanitize'
import { PostGrid } from '@/components/posts/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { PAGINATION } from '@/config/constants'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'
import { MapPin, FileText, ChevronLeft, ChevronRight, ServerCrash } from 'lucide-react'
import type { PostCard } from '@/types/post.types'

/* ── Types ───────────────────────────────────────────────────────── */

interface Props {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string }>
}

/* ── Metadata ────────────────────────────────────────────────────── */

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { slug } = await params
    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    let stateRecord: Awaited<ReturnType<typeof getStateBySlug>> = null

    try {
        stateRecord = await getStateBySlug(slug)
    } catch {
        return {}
    }

    if (!stateRecord) return {}

    const title = page > 1 ? `${stateRecord.name} - Page ${page} - Sarkari Updates 2026` : (stateRecord.meta_title ?? `${stateRecord.name} - Latest Govt Jobs, Results & Updates 2026`)
    const description = stateRecord.meta_description ?? `Find all the latest government jobs, exam results, admit cards, and recruitment notifications in ${stateRecord.name}. Updated daily with official information.`
    const url = `${SITE.url}/states/${slug}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    // Fetch total count for prev/next calculation
    const totalCount = await getPostsCount({ state_slug: slug }).catch(() => 0)
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
            locale: SITE.locale,
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

    // Add prev/next alternates
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
    if (total > 1) pages.push(total)
    return pages
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function StateProfilePage({ params, searchParams }: Props) {
    const { slug } = await params

    let stateRecord: Awaited<ReturnType<typeof getStateBySlug>> = null
    try {
        stateRecord = await getStateBySlug(slug)
    } catch {
        notFound()
    }

    if (!stateRecord || !stateRecord.is_active) notFound()

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT

    let posts: PostCard[] = []
    let totalCount = 0
    let fetchError = false

    try {
        ;[posts, totalCount] = await Promise.all([
            getPosts({ state_slug: slug }, page, limit),
            getPostsCount({ state_slug: slug }),
        ])
    } catch {
        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'States', url: `${SITE.url}/states` },
        { name: stateRecord.name, url: `${SITE.url}/states/${slug}` },
    ])

    /* CollectionPage JSON-LD */
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${stateRecord.name} Government Jobs, Results & Updates`,
        description: `Latest government jobs, exam results, and notifications from the state of ${stateRecord.name}.`,
        url: `${SITE.url}/states/${slug}`,
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

    /* ── Build rel="prev" / rel="next" for paginated pages ──────── */
    const basePath = `/states/${slug}`
    const prevUrl = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
    const nextUrl = page < totalPages ? `${basePath}?page=${page + 1}` : null

    return (
        <>
            {/* Pagination link relations for crawlers */}
            {prevUrl && <link rel="prev" href={`${SITE.url}${prevUrl}`} />}
            {nextUrl && <link rel="next" href={`${SITE.url}${nextUrl}`} />}

            <JsonLd data={[breadcrumbJsonLd, collectionJsonLd]} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'States', href: '/states' },
                        { label: stateRecord.name },
                    ]}
                />

                {/* State profile header */}
                <div className="mb-8 mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="bg-brand-50 dark:bg-brand-950/20 px-6 py-8 sm:px-10 sm:py-10">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900 border border-brand-200 dark:border-brand-800 shadow-sm text-brand-600 dark:text-brand-400">
                                <MapPin className="size-10" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    {stateRecord.h1_override ?? stateRecord.name}
                                </h1>
                                <p className="mt-3 max-w-2xl text-foreground-muted leading-relaxed">
                                    Browse all the latest government jobs, exam results, admit cards, and
                                    vital notifications from {stateRecord.name}.
                                </p>
                                {totalCount > 0 && (
                                    <p className="mt-3 text-sm text-foreground-subtle">
                                        {totalCount.toLocaleString('en-IN')} posts available
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* State intro HTML (SEO content from CMS) */}
                        {stateRecord.intro_html && (
                            <div
                                className="mt-6 prose prose-sm prose-brand dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(stateRecord.intro_html) }}
                            />
                        )}
                    </div>
                </div>

                <AdZone zoneSlug="below_header" className="mb-8" />

                {/* Posts section */}
                <div className="mb-6 flex items-center gap-3">
                    <FileText className="size-5 text-brand-600" />
                    <h2 className="text-xl font-bold text-foreground">
                        Latest Updates in {stateRecord.name}
                    </h2>
                </div>

                {fetchError ? (
                    <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                        <div className="mb-4 rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                            <ServerCrash className="size-8 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h3>
                        <p className="max-w-md text-sm text-foreground-muted">
                            Could not load the latest posts for {stateRecord.name}. Please try again in a moment.
                        </p>
                    </div>
                ) : posts.length > 0 ? (
                    <PostGrid posts={posts} priority={3} />
                ) : (
                    <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-background-subtle">
                            <MapPin className="size-7 text-foreground-muted" />
                        </div>
                        <h3 className="mb-1 text-lg font-semibold text-foreground">No updates yet</h3>
                        <p className="max-w-md text-sm text-foreground-muted">
                            We haven&apos;t published any posts for {stateRecord.name} recently. Check back soon!
                        </p>
                        <Link
                            href="/states"
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                        >
                            Browse All States
                        </Link>
                    </div>
                )}

                {/* Pagination - numbered pages */}
                {totalPages > 1 && !fetchError && (
                    <nav className="mt-12 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                        {page > 1 ? (
                            <Link
                                href={`/states/${slug}?page=${page - 1}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="size-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed" aria-disabled="true">
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
                                    href={`/states/${slug}?page=${p}`}
                                    className={`inline-flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${p === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-border text-foreground hover:bg-background-subtle'
                                        }`}
                                    aria-current={p === page ? 'page' : undefined}
                                    aria-label={`Page ${p}`}
                                >
                                    {p}
                                </Link>
                            )
                        )}

                        {page < totalPages ? (
                            <Link
                                href={`/states/${slug}?page=${page + 1}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
                                aria-label="Next page"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="size-4" />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed" aria-disabled="true">
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="size-4" />
                            </span>
                        )}
                    </nav>
                )}

                <AdZone zoneSlug="below_content" className="mt-8" />
            </div>
        </>
    )
}

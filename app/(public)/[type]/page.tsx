import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPosts, getPostsCount } from '@/features/posts/queries'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { POST_TYPE_CONFIG, PAGINATION } from '@/config/constants'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { slugToKey, keyToSlug, humanise } from '@/lib/utils'
import { ChevronLeft, ChevronRight, FileX2, ServerCrash } from 'lucide-react'

/** All valid URL slugs for generateStaticParams */
const ALL_SLUGS = Object.keys(POST_TYPE_CONFIG).map(keyToSlug)




/* ── Types ───────────────────────────────────────────────────────── */

interface Props {
    params: Promise<{ type: string }>
    searchParams: Promise<{ page?: string }>
}

/* ── Static params ───────────────────────────────────────────────── */

export async function generateStaticParams() {
    return ALL_SLUGS.map((type) => ({ type }))
}

/* ── Metadata ────────────────────────────────────────────────────── */

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { type } = await params
    const resolvedSearchParams = await searchParams
    const typeKey = slugToKey(type)
    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1
    const limit = PAGINATION.DEFAULT_LIMIT

    if (!typeKey || !(typeKey in POST_TYPE_CONFIG)) return {}
    const config = POST_TYPE_CONFIG[typeKey as PostTypeKey]

    // Fetch total count to determine total pages for 'next' link
    const totalCountRes = await getPostsCount({ type: typeKey as unknown as import('@/types/enums').PostType }).catch(() => 0)
    const totalPages = Math.ceil(totalCountRes / limit)

    const year = new Date().getFullYear()
    const title = page > 1 
        ? `${config.heading} ${year} - Page ${page} | Latest Updates | ${SITE.name}` 
        : `Latest ${config.heading} ${year} - Check Notification & Apply Online | ${SITE.name}`
    const description = `Get the latest ${config.heading.toLowerCase()} for ${year}. Check official notifications, eligibility, and direct links to apply. ${config.description} across India.`
    const url = `${SITE.url}/${type}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    // Compute standard metadata
    const baseMetadata: Metadata = {
        title,
        description,
        alternates: {
            canonical,
        },
        robots: {
            index: page === 1, // Only index the first page
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
            title: `${config.heading} - Latest Update`,
            description: config.description,
            site: SITE.twitter.handle,
        },
    }

    // Add prev/next alternates if applicable
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

function getSEOIntro(typeKey: string, heading: string): string {
    const year = new Date().getFullYear()
    switch (typeKey) {
        case 'job':
            return `Looking for the latest ${heading} in ${year}? Result Guru brings you comprehensive updates on government vacancies, including eligibility criteria, age limits, and direct application links. Stay ahead with our daily updated job notifications from various sectors including Railway, Banking, SSC, and defense.`
        case 'result':
            return `Check your ${heading} for current and previous examinations. We provide direct links to official results, merit lists, and cut-off marks as soon as they are declared by the respective boards. Never miss an update on your hard-earned results.`
        case 'admit':
            return `Download your ${heading} easily. Find direct links to download hall tickets for SSC, UPSC, Banking, and state-level exams. We ensure you have the right information to access your exam center on time.`
        case 'answer-key':
        case 'answer_key':
            return `Verify your performance with the official ${heading}. Access direct links to preliminary and final answer keys for major examinations to estimate your score before the final results.`
        case 'syllabus':
            return `Prepare effectively with the latest ${heading}. Download updated exam patterns and detailed subject-wise syllabus in PDF format for all major competitive exams in India.`
        case 'admission':
            return `Find the best educational opportunities with our ${heading} updates. Get information on entrance exams, counseling dates, and application procedures for top universities and colleges.`
        case 'scholarship':
            return `Unlock financial aid for your studies. Explore the latest ${heading} programs offered by central and state governments, as well as private organizations, with clear eligibility and application steps.`
        case 'scheme':
            return `Empower yourself with information on ${heading}s. Learn about government initiatives for farmers, students, women, and various sectors, including how to apply and check status.`
        default:
            return `Stay updated with the latest ${heading} ${year}. We provide accurate information and direct links to official notifications to help you stay informed.`
    }
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function PostListingPage({ params, searchParams }: Props) {
    const { type } = await params
    const typeKey = slugToKey(type)
    if (!typeKey) notFound()

    const config = POST_TYPE_CONFIG[typeKey]
    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT

    let posts: Awaited<ReturnType<typeof getPosts>> = []
    let totalCount = 0
    let fetchError = false

    try {
        // Parallelize fetching for faster page load
        const [[p, c]] = await Promise.all([
            Promise.all([
                getPosts({ type: typeKey as unknown as import('@/types/enums').PostType }, page, limit),
                getPostsCount({ type: typeKey as unknown as import('@/types/enums').PostType }),
            ])
        ])
        posts = p
        totalCount = c
    } catch (error) {
        console.error('Fetch Error:', error)
        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)
    const basePath = `/${type}`

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: config.heading, url: `${SITE.url}${basePath}` },
    ])

    /* CollectionPage JSON-LD for richer SERP snippets */
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: config.heading,
        description: config.description,
        url: `${SITE.url}${basePath}`,
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
        ...(totalCount > 0 && {
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: totalCount,
                itemListElement: posts.slice(0, 10).map((post, i) => ({
                    '@type': 'ListItem',
                    position: (page - 1) * limit + i + 1,
                    url: `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${post.slug}`,
                    name: post.title,
                })),
            },
        }),
    }

    /* ── Build rel="prev" / rel="next" for paginated pages ──────── */
    const prevUrl = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
    const nextUrl = page < totalPages ? `${basePath}?page=${page + 1}` : null

    return (
        <>
            {/* Pagination link relations for crawlers (Bing, Yandex, etc.) */}
            {prevUrl && <link rel="prev" href={`${SITE.url}${prevUrl}`} />}
            {nextUrl && <link rel="next" href={`${SITE.url}${nextUrl}`} />}

            <JsonLd data={[breadcrumbJsonLd, collectionJsonLd]} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb items={[{ label: humanise(type) }]} />

                {/* Header */}
                <div className="mb-8 mt-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {config.heading}
                    </h1>
                    <div className="mt-4 flex flex-col gap-3">
                        <p className="max-w-3xl text-lg font-medium text-foreground-muted leading-relaxed">
                            {getSEOIntro(typeKey, config.heading)}
                        </p>
                        <p className="max-w-2xl text-base text-foreground-subtle">
                            {config.description}. Updated daily across India.
                        </p>
                    </div>
                    {totalCount > 0 && (
                        <p className="mt-4 text-sm font-semibold text-brand-600 dark:text-brand-400">
                            Showing page {page} of {totalPages} &middot; {totalCount.toLocaleString('en-IN')} latest updates
                        </p>
                    )}
                </div>

                <AdZone zoneSlug="below_header" postType={typeKey} className="mb-8" />

                {/* Posts grid */}
                {fetchError ? (
                    <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                        <div className="mb-4 rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                            <ServerCrash className="size-8 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h3>
                        <p className="text-foreground-muted max-w-md">
                            Could not load {config.heading.toLowerCase()} posts. Please try again in a moment.
                        </p>
                    </div>
                ) : posts.length > 0 ? (
                    <PostGrid posts={posts} priority={3} />
                ) : (
                    <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                        <div className="mb-4 rounded-full bg-background-subtle p-4">
                            <FileX2 className="size-8 text-foreground-muted" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">No posts yet</h3>
                        <p className="mt-2 text-sm text-foreground-muted max-w-md">
                            There are no {config.heading.toLowerCase()} posts available right now. Check back soon for updates!
                        </p>
                        <Link
                            href="/"
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                )}

                {/* Pagination - numbered pages with ellipsis */}
                {totalPages > 1 && !fetchError && (
                    <nav className="mt-12 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                        {/* Previous */}
                        {page > 1 ? (
                            <Link
                                href={`${basePath}?page=${page - 1}`}
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

                        {/* Page numbers */}
                        {getPageNumbers(page, totalPages).map((p, i) =>
                            p === '...' ? (
                                <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-foreground-subtle">
                                    &hellip;
                                </span>
                            ) : (
                                <Link
                                    key={p}
                                    href={`${basePath}?page=${p}`}
                                    className={`inline-flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${p === page
                                        ? 'border-brand-600 bg-brand-600 text-white'
                                        : 'border-border text-foreground hover:bg-background-subtle'
                                        }`}
                                    aria-current={p === page ? 'page' : undefined}
                                    aria-label={`Page ${p}`}
                                >
                                    {p}
                                </Link>
                            )
                        )}

                        {/* Next */}
                        {page < totalPages ? (
                            <Link
                                href={`${basePath}?page=${page + 1}`}
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

                <AdZone zoneSlug="below_content" postType={typeKey} className="mt-8" />
            </div>
        </>
    )
}
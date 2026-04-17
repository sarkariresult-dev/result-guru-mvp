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
import { buildListingTitle, buildListingMeta } from '@/lib/metadata'
import { slugToKey, keyToSlug, humanise } from '@/lib/utils'
import { Icons } from '@/lib/icons'

import { TaxonomyRibbon } from '@/features/taxonomy/components/TaxonomyRibbon'
import { Suspense } from 'react'

/** All valid URL slugs for generateStaticParams */
const ALL_SLUGS = Object.keys(POST_TYPE_CONFIG).map(keyToSlug)

interface Props {
    params: Promise<{ type: string }>
    searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
    return ALL_SLUGS.map((type) => ({ type }))
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { type } = await params
    const resolvedSearchParams = await searchParams
    const typeKey = slugToKey(type)
    const page = resolvedSearchParams.page ? parseInt(resolvedSearchParams.page) : 1
    const limit = PAGINATION.DEFAULT_LIMIT

    if (!typeKey || !(typeKey in POST_TYPE_CONFIG)) return {}

    const totalCountRes = await getPostsCount({ type: typeKey as unknown as import('@/types/enums').PostType }).catch(() => 0)
    const totalPages = Math.ceil(totalCountRes / limit)

    const title = buildListingTitle(typeKey as PostTypeKey, { page })
    const description = buildListingMeta(typeKey as PostTypeKey, { page })

    const url = `${SITE.url}/${type}`
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
            title,
            description,
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
    const year = 2026
    switch (typeKey) {
        case 'job':
            return `Find the best ${heading} for ${year}. We list active vacancies with clear details on age, qualifications, and how to apply. Browse daily updates from SSC, UPSC, Banking, and more.`
        case 'result':
            return `Check your ${heading} here. We provide direct links to merit lists and cut-off marks for major exams. Stay informed as soon as results are declared.`
        case 'admit':
            return `Download your ${heading} quickly. Follow our links to get hall tickets for government exams. We provide all the info you need for your exam day.`
        case 'answer-key':
        case 'answer_key':
            return `View the official ${heading} for your exams. Compare your answers and estimate your score before the final results are out.`
        case 'syllabus':
            return `Get the latest ${heading} and exam patterns. Download PDF guides for all major competitive exams to help your preparation.`
        case 'admission':
            return `Learn about ${heading} dates and procedures. We track entrance exams and counseling for top colleges across India.`
        case 'scholarship':
            return `Find ${heading} opportunities. Check eligibility and apply for government aids to support your education.`
        case 'scheme':
            return `Explore ${heading} initiatives. Learn how students and farmers can benefit from these government programs.`
        default:
            return `Latest ${heading} updates for ${year}. Find verified notifications and official links to stay on track with your goals.`
    }
}

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
        const [[p, c]] = await Promise.all([
            Promise.all([
                getPosts({ type: typeKey as unknown as import('@/types/enums').PostType }, page, limit),
                getPostsCount({ type: typeKey as unknown as import('@/types/enums').PostType }),
            ])
        ])
        posts = p
        totalCount = c
    } catch (error) {

        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)
    const basePath = `/${type}`

    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: config.heading, url: `${SITE.url}${basePath}` },
    ])

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

    const prevUrl = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
    const nextUrl = page < totalPages ? `${basePath}?page=${page + 1}` : null

    return (
        <>
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
                            {config.description}. Updated daily.
                        </p>
                    </div>
                </div>

                {/* Main and Sidebar Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
                    
                    {/* Left Sidebar */}
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 space-y-8">
                            <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-background-muted" />}>
                                <TaxonomyRibbon typeSlug={type} layout="sidebar" />
                            </Suspense>
                            <AdZone zoneSlug="sidebar_top" postType={typeKey} />
                        </div>
                    </aside>

                    {/* Main Column */}
                    <div className="space-y-8">
                        {/* Mobile Ribbon */}
                        <div className="lg:hidden">
                            <Suspense fallback={null}>
                                <TaxonomyRibbon typeSlug={type} layout="ribbon" />
                            </Suspense>
                        </div>

                        <AdZone zoneSlug="below_header" postType={typeKey} className="mb-4" />

                        {/* Content */}
                        {fetchError ? (
                            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                                <div className="mb-4 rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                                    <Icons.AlertCircle className="size-8 text-red-600" />
                                </div>
                                <h2 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h2>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                                    Current {config.heading} Updates
                                </h2>
                                <PostGrid posts={posts} priority={2} />
                            </div>
                        ) : (
                            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                                <div className="mb-4 rounded-full bg-background-subtle p-4">
                                    <Icons.Info className="size-8 text-foreground-muted" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">No updates found</h3>
                                <Link href="/" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700">Go to Homepage</Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && !fetchError && (
                            <nav className="mt-12 flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
                                {page > 1 ? (
                                    <Link href={page === 2 ? basePath : `${basePath}?page=${page - 1}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle">
                                        <Icons.ChevronLeft className="size-4" /><span className="hidden sm:inline">Previous</span>
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed">
                                        <Icons.ChevronLeft className="size-4" /><span className="hidden sm:inline">Previous</span>
                                    </span>
                                )}

                                {getPageNumbers(page, totalPages).map((p, i) =>
                                    p === '...' ? (
                                        <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-foreground-subtle">&hellip;</span>
                                    ) : (
                                        <Link key={p} href={p === 1 ? basePath : `${basePath}?page=${p}`} className={`inline-flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${p === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-border text-foreground hover:bg-background-subtle'}`} aria-current={p === page ? 'page' : undefined}>
                                            {p}
                                        </Link>
                                    )
                                )}

                                {page < totalPages ? (
                                    <Link href={`${basePath}?page=${page + 1}`} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle">
                                        <span className="hidden sm:inline">Next</span><Icons.ChevronRight className="size-4" />
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50 cursor-not-allowed">
                                        <span className="hidden sm:inline">Next</span><Icons.ChevronRight className="size-4" />
                                    </span>
                                )}
                            </nav>
                        )}
                    </div>
                </div>

                <div className="mt-16 border-t border-border pt-12">
                    <section className="prose prose-slate dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-bold text-foreground">Aspirant Guide for {config.heading}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">How to stay updated?</h3>
                                <p className="text-foreground-muted">
                                    We track official portals like SSC, UPSC, and State Boards daily. Bookmark this page to get the fastest updates on {config.heading.toLowerCase()} notifications. Every link we provide is cross-verified for accuracy.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Why choose Result Guru?</h3>
                                <p className="text-foreground-muted">
                                    Our platform simplifies complex government notifications. We provide direct apply links, simplified eligibility summaries, and important dates in a clean dashboard format, helping you focus on your exam preparation.
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
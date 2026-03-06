import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getTagBySlug, getPostsByTag, getPostsCountByTag } from '@/lib/queries/tags'
import { PostGrid } from '@/components/posts/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { SITE } from '@/config/site'
import { PAGINATION } from '@/config/constants'
import { Tag, ChevronLeft, ChevronRight, ServerCrash, Hash } from 'lucide-react'
import type { PostCard } from '@/types/post.types'

/* ── Types ───────────────────────────────────────────────────────── */

interface Props {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string }>
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function humanise(slug: string): string {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
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

/* ── Metadata ────────────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    let tag: Awaited<ReturnType<typeof getTagBySlug>> = null

    try {
        tag = await getTagBySlug(slug)
    } catch {
        return {}
    }

    if (!tag) return {}

    const title = tag.meta_title ?? `${tag.name} — Latest Government Jobs, Results & Updates 2026`
    const description = tag.meta_description ?? `Browse all posts tagged "${tag.name}". Find the latest Sarkari Jobs, exam results, admit cards, and notifications related to ${tag.name}.`
    const url = `${SITE.url}/tag/${slug}`

    return {
        title,
        description,
        alternates: { canonical: url },
        ...(tag.meta_robots && tag.meta_robots !== 'index,follow' && { robots: tag.meta_robots }),
        openGraph: {
            title,
            description,
            url,
            siteName: SITE.name,
            locale: SITE.locale,
            type: 'website',
            images: [{ url: SITE.defaultOgImage, width: SITE.defaultOgWidth, height: SITE.defaultOgHeight }],
        },
        twitter: {
            card: SITE.twitter.cardType,
            site: SITE.twitter.handle,
            title,
            description,
        },
    }
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function TagPage({ params, searchParams }: Props) {
    const { slug } = await params

    let tag: Awaited<ReturnType<typeof getTagBySlug>> = null
    try {
        tag = await getTagBySlug(slug)
    } catch {
        notFound()
    }

    if (!tag || !tag.is_active) notFound()

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT

    let posts: PostCard[] = []
    let totalCount = 0
    let fetchError = false

    try {
        ;[posts, totalCount] = await Promise.all([
            getPostsByTag(tag.id, page, limit),
            getPostsCountByTag(tag.id),
        ])
    } catch {
        fetchError = true
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / limit))

    /* ── JSON-LD ──────────────────────────────────────────────── */

    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: tag.name, url: `${SITE.url}/tag/${slug}` },
    ])

    const collectionJsonLd = totalCount > 0
        ? {
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `${tag.name} — Posts`,
              url: `${SITE.url}/tag/${slug}`,
              description: tag.description ?? `All posts tagged with ${tag.name}`,
              numberOfItems: totalCount,
          }
        : null

    return (
        <>
            <JsonLd data={collectionJsonLd ? [breadcrumbJsonLd, collectionJsonLd] : breadcrumbJsonLd} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb items={[{ label: tag.name }]} />

                {/* Header */}
                <div className="mb-8 mt-4 max-w-3xl">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                            <Hash className="size-3" />
                            {tag.tag_type !== 'general' ? humanise(tag.tag_type) : 'Tag'}
                        </span>
                        {totalCount > 0 && (
                            <span className="text-sm text-foreground-subtle">
                                {totalCount.toLocaleString('en-IN')} post{totalCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {tag.name}
                    </h1>
                    {tag.description && (
                        <p className="mt-3 text-lg text-foreground-muted leading-relaxed">
                            {tag.description}
                        </p>
                    )}
                </div>

                <AdZone zoneSlug="below_header" className="mb-8" />

                {/* Posts */}
                {fetchError ? (
                    <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <ServerCrash className="size-8 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h3>
                        <p className="max-w-sm text-sm text-foreground-muted">
                            Could not load posts. Please try again in a moment.
                        </p>
                    </div>
                ) : posts.length > 0 ? (
                    <>
                        <PostGrid posts={posts} priority={3} />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
                                {page > 1 && (
                                    <Link
                                        href={`/tag/${slug}?page=${page - 1}`}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-background-subtle transition-colors"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="size-4" /> Prev
                                    </Link>
                                )}
                                {getPageNumbers(page, totalPages).map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-foreground-subtle">
                                            &hellip;
                                        </span>
                                    ) : (
                                        <Link
                                            key={p}
                                            href={`/tag/${slug}?page=${p}`}
                                            aria-current={p === page ? 'page' : undefined}
                                            className={`inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                                p === page
                                                    ? 'bg-brand-600 text-white shadow-sm'
                                                    : 'border border-border bg-surface text-foreground-muted hover:bg-background-subtle'
                                            }`}
                                        >
                                            {p}
                                        </Link>
                                    ),
                                )}
                                {page < totalPages && (
                                    <Link
                                        href={`/tag/${slug}?page=${page + 1}`}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-background-subtle transition-colors"
                                        aria-label="Next page"
                                    >
                                        Next <ChevronRight className="size-4" />
                                    </Link>
                                )}
                            </nav>
                        )}
                    </>
                ) : (
                    <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-background-subtle">
                            <Tag className="size-8 text-foreground-muted" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">No posts yet</h3>
                        <p className="max-w-sm text-sm text-foreground-muted">
                            No posts have been tagged with &ldquo;{tag.name}&rdquo; yet. Check back soon!
                        </p>
                        <Link
                            href="/"
                            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                )}

                <AdZone zoneSlug="below_content" className="mt-10" />
            </div>
        </>
    )
}

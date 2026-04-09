import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getTagBySlug, getPostsByTag, getPostsCountByTag } from '@/lib/queries/tags'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { SITE } from '@/config/site'
import { formatTitle } from '@/lib/metadata'
import { PAGINATION } from '@/config/constants'
import { Tag, ChevronLeft, ChevronRight, ServerCrash, Hash, ShieldCheck, Sparkles } from 'lucide-react'
import type { PostCard } from '@/types/post.types'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

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
  
    const baseTitle = tag.meta_title ?? `${tag.name} | Latest Govt Jobs, Results & Updates 2026`
    const title = formatTitle(baseTitle)
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
            name: `${tag.name} - Posts`,
            url: `${SITE.url}/tag/${slug}`,
            description: tag.description ?? `All posts tagged with ${tag.name}`,
            numberOfItems: totalCount,
        }
        : null

    return (
        <div className="flex flex-col">
            <JsonLd data={collectionJsonLd ? [breadcrumbJsonLd, collectionJsonLd] : breadcrumbJsonLd} />

            {/* Immersive Hub Header */}
            <div className="relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-b border-border">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
                    <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-brand-400/5 blur-[100px]" />
                </div>

                <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-20 relative text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Hash className="size-3.5" />
                        {tag.tag_type !== 'general' ? humanise(tag.tag_type) : 'Official'} Archive
                    </div>

                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl max-w-4xl mb-6">
                        <span className="bg-linear-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent capitalize">{tag.name}</span>
                    </h1>

                    <p className="max-w-2xl text-lg sm:text-xl text-foreground-muted leading-relaxed mb-10 text-balance">
                        {tag.description ?? `Access real-time exam results, admit cards, and job notifications tagged with ${tag.name} on a single platform.`}
                    </p>

                    <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-950 border border-border shadow-sm text-sm font-bold text-foreground">
                             <ShieldCheck className="size-4 text-emerald-500" />
                             {totalCount.toLocaleString('en-IN')} Verified Updates
                         </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-12">
                <AdZone zoneSlug="below_header" className="mb-10" />

                {/* Posts */}
                {fetchError ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <ServerCrash className="size-8 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-foreground">Connection Error</h3>
                        <p className="max-w-sm text-sm text-foreground-muted">
                            Could not load posts. Please try again in a moment.
                        </p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="space-y-12">
                        <PostGrid posts={posts} priority={3} />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 pt-8">
                                {page > 1 && (
                                    <Link
                                        href={`/tag/${slug}?page=${page - 1}`}
                                        className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground transition-all hover:bg-slate-50 dark:hover:bg-slate-900 hover:-translate-x-0.5"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="size-4" /> Prev
                                    </Link>
                                )}
                                <div className="hidden sm:flex items-center gap-1.5">
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
                                                className={`inline-flex size-10 items-center justify-center rounded-xl text-sm font-black transition-all ${p === page
                                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 scale-110'
                                                        : 'border border-border bg-surface text-foreground-muted hover:bg-slate-50 dark:hover:bg-slate-900'
                                                    }`}
                                            >
                                                {p}
                                            </Link>
                                        ),
                                    )}
                                </div>
                                {page < totalPages && (
                                    <Link
                                        href={`/tag/${slug}?page=${page + 1}`}
                                        className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground transition-all hover:bg-slate-50 dark:hover:bg-slate-900 hover:translate-x-0.5"
                                        aria-label="Next page"
                                    >
                                        Next <ChevronRight className="size-4" />
                                    </Link>
                                )}
                            </nav>
                        )}
                    </div>
                ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
                            <Tag className="size-8 text-foreground-muted" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-foreground">No posts yet</h3>
                        <p className="max-w-sm text-sm text-foreground-muted">
                            No posts have been tagged with &ldquo;{tag.name}&rdquo; yet. Check back soon!
                        </p>
                        <Link
                            href="/"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-700 shadow-lg shadow-brand-600/20"
                        >
                            Go to Homepage
                        </Link>
                    </div>
                )}

                <AdZone zoneSlug="below_content" className="mt-16" />
            </div>

            {/* Standardized Institutional CTA */}
            <div className="mt-12">
                <InstitutionalCTA 
                    title={`Verified Updates for ${tag.name}`}
                    description="Stay informed with every significant development. Join our mission-focused community for real-time alerts on your favorite platforms."
                    primaryCTA={{ label: "Join Telegram Hub", href: "https://t.me/resultguru247" }}
                    secondaryCTA={{ text: "Prefer WhatsApp?", actionLabel: "Join Channel", href: "https://whatsapp.com/channel/0029Vb7XUqn1SWt7c9kqCV3I" }}
                />
            </div>
        </div>
    )
}

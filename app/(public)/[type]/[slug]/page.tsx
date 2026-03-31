import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getPostBySlug } from '@/features/posts/queries'
import { buildMetadata } from '@/lib/metadata'
import { buildJobPostingSchema, buildBreadcrumbSchema, buildFAQPageSchema, buildGovernmentServiceSchema, buildNewsArticleSchema, buildHowToSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { PostDetail } from '@/features/posts/components/PostDetail'
import { processContentHtml, extractHowToSteps } from '@/lib/content-processing'
import { sanitizeHtml } from '@/lib/sanitize'
import { RelatedPosts } from '@/features/posts/components/RelatedPosts'
import { PostDetailSkeleton } from '@/features/posts/components/PostCardSkeleton'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { TableOfContents } from '@/features/posts/components/TableOfContents'
import { OrgInfoBox } from '@/features/posts/components/OrgInfoBox'
import { AdZone, NewsletterForm } from '@/features/posts/components/PostPageClientParts'
import { POST_TYPE_CONFIG } from '@/config/constants'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'
import type { PublishedPost } from '@/types/post.types'
import type { FaqItem } from '@/types/post-content.types'
import { slugToKey, humanise, keyToSlug } from '@/lib/utils'
import { ExternalLink, Download, Bell, ListTree } from 'lucide-react'
import { PageViewTracker } from '@/features/analytics/components/PageViewTracker'



/* ── Types ───────────────────────────────────────────────────────── */

interface Props {
    params: Promise<{ type: string; slug: string }>
}

/* ── Static params (SSG + ISR for all published posts) ──────────── */

/**
 * Pre-render all published post pages at build time.
 * New posts published after build are rendered on-demand and cached.
 * Falls back to empty array if DB query fails (all pages on-demand).
 */
export async function generateStaticParams() {
    // In development mode, fetch a minimal set of paths to satisfy Next.js requirements
    // while keeping database overhead low.
    const limit = process.env.NODE_ENV === 'development' ? 1 : 100

    try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )
        const { data } = await supabase
            .from('v_published_posts')
            .select('slug, type')
            .order('published_at', { ascending: false })
            .limit(limit)

        if (!data) return []

        return data
            .filter((p: { slug: string | null; type: string | null }) => p.slug && p.type)
            .map((p: { slug: string; type: string }) => ({
                type: keyToSlug(p.type),
                slug: p.slug,
            }))
    } catch {
        // If DB is unreachable during build, fall back to on-demand rendering
        return []
    }
}

/* ── Metadata ────────────────────────────────────────────────────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { type, slug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey) return {}

    const post = await getPostBySlug(slug, typeKey)
    if (!post) return {}

    return buildMetadata(post as PublishedPost)
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function PostDetailPage({ params }: Props) {
    const { type, slug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey) notFound()

    const config = POST_TYPE_CONFIG[typeKey]
    const post = await getPostBySlug(slug, typeKey)
    if (!post) notFound()

    const publishedPost = post as PublishedPost

    /* ── JSON-LD ────────────────────────────────────────────────── */
    const jsonLdEntries: Record<string, unknown>[] = []

    if (typeKey === 'job') {
        jsonLdEntries.push(buildJobPostingSchema(publishedPost))
    }
    if (typeKey === 'scheme' || typeKey === 'scholarship') {
        jsonLdEntries.push(buildGovernmentServiceSchema(publishedPost))
    }

    jsonLdEntries.push(
        buildBreadcrumbSchema([
            { name: 'Home', url: SITE.url },
            { name: config.heading, url: `${SITE.url}/${type}` },
            ...(publishedPost.state_slug ? [{ name: publishedPost.state_name || humanise(publishedPost.state_slug), url: `${SITE.url}/states/${publishedPost.state_slug}` }] : []),
            { name: publishedPost.title, url: `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${slug}` },
        ])
    )

    const faq = publishedPost.faq as FaqItem[] | null
    if (faq && faq.length > 0) {
        jsonLdEntries.push(buildFAQPageSchema(faq))
    }

    /* ── HowTo Schema ────────────────────────────────────────── */
    const howToSteps = publishedPost.content ? extractHowToSteps(publishedPost.content) : []
    const canonicalUrl = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${slug}`

    if (howToSteps.length >= 3) {
        jsonLdEntries.push(
            buildHowToSchema(
                `How to Apply/Check ${publishedPost.title}`,
                howToSteps,
                canonicalUrl
            )
        )
    }

    jsonLdEntries.push(buildNewsArticleSchema(publishedPost as any))

    /* ── Extract TOC items for sidebar ───────────────────────── */
    const { tocItems } = publishedPost.content
        ? processContentHtml(sanitizeHtml(publishedPost.content))
        : { tocItems: [] as any[] }

    /* ── Fetch Dynamic Sidebar Silo Links ── */
    const { getPosts } = await import('@/features/posts/queries')
    const siloFilters: Record<string, string> = {}
    if (publishedPost.organization_id) {
        siloFilters.organization_id = publishedPost.organization_id
    } else if (publishedPost.state_slug) {
        siloFilters.state_slug = publishedPost.state_slug
    } else if (publishedPost.category_id) {
        siloFilters.category_id = publishedPost.category_id
    }
    const rawSiloPosts = await getPosts(siloFilters, 1, 6)
    const siloPosts = rawSiloPosts
        .filter(p => p.id !== publishedPost.id)
        .slice(0, 5)

    /* ── Quick action links ──────────────────────────────────── */
    const quickLinks: Array<{ href: string; label: string; icon: 'external' | 'download'; primary?: boolean }> = []
    if (publishedPost.org_official_url) {
        quickLinks.push({ href: publishedPost.org_official_url, label: 'Official Website', icon: 'external', primary: true })
    }
    if (publishedPost.notification_pdf) {
        quickLinks.push({ href: publishedPost.notification_pdf, label: 'Notification PDF', icon: 'download' })
    }
    if (publishedPost.admit_card_link) {
        quickLinks.push({ href: publishedPost.admit_card_link, label: 'Admit Card', icon: 'external' })
    }
    if (publishedPost.result_link) {
        quickLinks.push({ href: publishedPost.result_link, label: 'Result', icon: 'external' })
    }
    if (publishedPost.answer_key_link) {
        quickLinks.push({ href: publishedPost.answer_key_link, label: 'Answer Key', icon: 'external' })
    }

    return (
        <>
            <PageViewTracker postId={publishedPost.id} />
            <JsonLd data={jsonLdEntries} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: humanise(type), href: `/${type}` },
                        ...(publishedPost.state_slug ? [{ label: publishedPost.state_name || humanise(publishedPost.state_slug), href: `/states/${publishedPost.state_slug}` }] : []),
                        { label: publishedPost.title },
                    ]}
                />

                <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">

                    {/* ═══════════════════════════════════════════ MAIN CONTENT COLUMN ═══════════════════════════════════════════ */}
                    <article>
                        {/* Main post detail */}
                        <PostDetail post={publishedPost} slug={slug} url={canonicalUrl} />

                        {/* Below-content ad - streamed independently */}
                        <Suspense fallback={null}>
                            <AdZone zoneSlug="below_content" postType={typeKey} postId={publishedPost.id} className="mt-8" />
                        </Suspense>

                        {/* Related posts */}
                        <Suspense fallback={<PostDetailSkeleton />}>
                            <RelatedPosts
                                post={publishedPost}
                            />
                        </Suspense>
                    </article>

                    {/* ═══════════════════════════════════════════
                         RIGHT SIDEBAR
                        ═══════════════════════════════════════════ */}
                    <aside className="hidden lg:block space-y-6" aria-label="Post sidebar">

                        {/* ── Organization Info ─────────────────── */}
                        <OrgInfoBox
                            name={publishedPost.org_name}
                            shortName={publishedPost.org_short_name}
                            logoUrl={publishedPost.org_logo_url}
                            officialUrl={publishedPost.org_official_url}
                        />

                        {/* ── Quick Action Links ───────────────── */}
                        {quickLinks.length > 0 && (
                            <div className="py-2 space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-[0.05em] text-foreground-muted flex items-center gap-2">
                                    <ExternalLink className="size-4 text-brand-500" /> Key Resources
                                </h3>
                                <div className="flex flex-col gap-2.5">
                                    {quickLinks.map((link: { href: string; label: string; icon: 'external' | 'download'; primary?: boolean }, i: number) => (
                                        <a
                                            key={i}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${link.primary
                                                ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm hover:shadow-md'
                                                : 'border border-border text-foreground hover:bg-background-subtle'
                                                }`}
                                        >
                                            {link.icon === 'download' ? (
                                                <Download className="size-4 shrink-0" />
                                            ) : (
                                                <ExternalLink className="size-4 shrink-0" />
                                            )}
                                            <span className="truncate">{link.label}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── SEO Silo Links (Content Strategy) ── */}
                        {siloPosts.length > 0 && (
                            <div className="py-2 space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-[0.05em] text-foreground-muted flex items-center gap-2">
                                    <ListTree className="size-4 text-brand-500" /> More Related
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {siloPosts.map((p) => (
                                        <Link 
                                            key={p.id} 
                                            href={`${ROUTE_PREFIXES[p.type as PostTypeKey]}/${p.slug}`} 
                                            className="group flex flex-col gap-0.5"
                                        >
                                            <span className="text-sm font-bold text-foreground group-hover:text-brand-600 transition-colors line-clamp-2">
                                                {p.title}
                                            </span>
                                            <span className="text-[10px] font-bold text-foreground-subtle uppercase tracking-wider">
                                                {humanise(p.type)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Table of Contents ────────────────── */}
                        {tocItems.length >= 2 && (
                            <div className="sticky top-24">
                                <TableOfContents items={tocItems} />
                            </div>
                        )}

                        {/* ── Sidebar Ad ────────────────────────── */}
                        <Suspense fallback={null}>
                            <AdZone zoneSlug="sidebar_top" postType={typeKey} postId={publishedPost.id} />
                        </Suspense>

                        {/* ── Newsletter CTA ───────────────────── */}
                        <div className="py-2 space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-[0.05em] text-foreground-muted flex items-center gap-2">
                                <Bell className="size-4 text-brand-500" /> Staying Updated
                            </h3>
                            <div className="rounded-2xl bg-linear-to-br from-background-muted to-background p-5 border border-border/50">
                                <p className="text-xs text-foreground-muted leading-relaxed mb-4">
                                    Get instant alerts for new {config.heading.toLowerCase()} posts.
                                </p>
                                <NewsletterForm />
                            </div>
                        </div>

                        {/* ── Sticky Ad ─────────────────────────── */}
                        <Suspense fallback={null}>
                            <div className="sticky top-24">
                                <AdZone zoneSlug="sidebar_sticky" postType={typeKey} postId={publishedPost.id} sticky />
                            </div>
                        </Suspense>
                    </aside>
                </div>
            </div>
        </>
    )
}

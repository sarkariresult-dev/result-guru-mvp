import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getPostBySlug, getPosts } from '@/features/posts/queries'
import { buildMetadata } from '@/lib/metadata'
import { buildJobPostingSchema, buildBreadcrumbSchema, buildFAQPageSchema, buildGovernmentServiceSchema, buildNewsArticleSchema, buildHowToSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { PostDetail } from '@/features/posts/components/PostDetail'
import { processContentHtml, extractHowToSteps } from '@/lib/content-processing'
import { sanitizeHtml } from '@/lib/sanitize'
import { RelatedPosts } from '@/features/posts/components/RelatedPosts'
import { SmartRelatedPosts } from '@/features/posts/components/SmartRelatedPosts'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { TableOfContents } from '@/features/posts/components/TableOfContents'
import { AdZone } from '@/components/ads/AdZone'
import { SidebarProducts } from '@/features/affiliate/components/SidebarProducts'
import { PostCardSkeleton } from '@/features/posts/components/PostCardSkeleton'

import { POST_TYPE_CONFIG } from '@/config/constants'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'
import type { PublishedPost, PostDetail as PostDetailType } from '@/types/post.types'
import type { FaqItem } from '@/types/post-content.types'
import { slugToKey, humanise, keyToSlug } from '@/lib/utils'

import { LocalErrorBoundary } from '@/components/shared/LocalErrorBoundary'
import { getActiveAds } from '@/features/advertising/queries'
import { headers } from 'next/headers'

/* ── Types ───────────────────────────────────────────────────────── */

interface Props {
    params: Promise<{ type: string; slug: string }>
}

/* ── Static params (SSG + ISR for all published posts) ──────────── */

export async function generateStaticParams() {
    const limit = process.env.NODE_ENV === 'development' ? 1 : 500

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

        const params = (data || [])
            .filter((p: { slug: string | null; type: string | null }) => p.slug && p.type)
            .map((p: { slug: string; type: string }) => ({
                type: keyToSlug(p.type),
                slug: p.slug,
            }))

        if (params.length === 0) {
            return [{ type: 'job', slug: 'latest-vacancy' }]
        }

        return params
    } catch {
        return [{ type: 'job', slug: 'latest-vacancy' }]
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

    const publishedPost = post as PostDetailType
    const canonicalUrl = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${slug}`

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
            { name: publishedPost.title, url: canonicalUrl },
        ])
    )

    const faq = publishedPost.faq as FaqItem[] | null
    if (faq && faq.length > 0) {
        jsonLdEntries.push(buildFAQPageSchema(faq))
    }

    const howToSteps = publishedPost.content ? extractHowToSteps(publishedPost.content) : []
    if (howToSteps.length >= 3) {
        jsonLdEntries.push(
            buildHowToSchema(
                `How to Apply/Check ${publishedPost.title}`,
                howToSteps,
                canonicalUrl
            )
        )
    }

    jsonLdEntries.push(buildNewsArticleSchema(publishedPost))

    const { tocItems } = publishedPost.content
        ? processContentHtml(sanitizeHtml(publishedPost.content), {
            stateSlug: publishedPost.state_slug,
            stateName: publishedPost.state_name,
            orgSlug: publishedPost.org_short_name ? publishedPost.slug : null,
            orgName: publishedPost.org_name,
            orgShortName: publishedPost.org_short_name,
        })
        : { tocItems: [] }

    /* ── Fetch Dynamic Sidebar Silo Links & Ads (Parallel) ── */
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || ''
    const isMobile = /mobile/i.test(userAgent)
    const device = isMobile ? 'mobile' : 'desktop'

    const siloFilters: Record<string, string> = {}
    if (publishedPost.organization_id) {
        siloFilters.organization_id = publishedPost.organization_id
    } else if (publishedPost.state_slug) {
        siloFilters.state_slug = publishedPost.state_slug
    } else if (publishedPost.category_id) {
        siloFilters.category_id = publishedPost.category_id
    }

    const [rawSiloPosts, aboveContentAds, belowContentAds] = await Promise.all([
        getPosts(siloFilters, 1, 6),
        getActiveAds('above_content', { post_type: typeKey, post_id: publishedPost.id, device }),
        getActiveAds('below_content', { post_type: typeKey, post_id: publishedPost.id, device }),
    ])

    const siloPosts = rawSiloPosts
        .filter(p => p.id !== publishedPost.id)
        .slice(0, 5)

    return (
        <>
            <JsonLd data={jsonLdEntries} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: POST_TYPE_CONFIG[typeKey].heading, href: `/${type}` },
                        ...(publishedPost.state_slug ? [{ label: publishedPost.state_name || humanise(publishedPost.state_slug), href: `/states/${publishedPost.state_slug}` }] : []),
                        { label: publishedPost.title },
                    ]}
                />

                <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-[240px_1fr_240px]">
                    {/* LEFT WING — Navigation only, no ads */}
                    <aside className="hidden lg:block space-y-8" aria-label="Quick Navigation">
                        <LocalErrorBoundary name="LeftSidebar" silent>
                            <div className="sticky top-24 space-y-8">
                                {tocItems.length >= 2 && (
                                    <TableOfContents items={tocItems} />
                                )}
                            </div>
                        </LocalErrorBoundary>
                    </aside>

                    {/* CORE CONTENT */}
                    <article className="min-w-0">
                        <LocalErrorBoundary name="MainContent" silent>
                            <div className="mx-auto max-w-3xl space-y-10">
                                <AdZone zoneSlug="above_content" postType={typeKey} postId={publishedPost.id} initialAds={aboveContentAds} />
                                <PostDetail post={publishedPost} slug={slug} url={canonicalUrl} />
                                <div className="space-y-12">
                                    <AdZone zoneSlug="below_content" postType={typeKey} postId={publishedPost.id} initialAds={belowContentAds} />
                                    <Suspense fallback={
                                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}
                                        </div>
                                    }>
                                        <RelatedPosts post={publishedPost} />
                                    </Suspense>

                                    <Suspense fallback={
                                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                                            {[...Array(2)].map((_, i) => <PostCardSkeleton key={i} />)}
                                        </div>
                                    }>
                                        <SmartRelatedPosts postId={publishedPost.id} />
                                    </Suspense>
                                </div>
                            </div>
                        </LocalErrorBoundary>
                    </article>

                    {/* RIGHT WING */}
                    <aside className="hidden lg:block space-y-8" aria-label="Curated Resources">
                        <LocalErrorBoundary name="RightSidebar" silent>
                            <AdZone zoneSlug="sidebar_right_top" postType={typeKey} postId={publishedPost.id} />

                            <div className="space-y-8 sticky top-24">
                                <Suspense fallback={
                                    <div className="space-y-6">
                                        <div className="h-4 w-1/2 bg-background-subtle rounded-full animate-pulse" />
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="size-20 rounded-2xl bg-background-subtle animate-pulse" />
                                                <div className="flex-1 space-y-2 py-2">
                                                    <div className="h-3 w-full bg-background-subtle rounded-full animate-pulse" />
                                                    <div className="h-3 w-2/3 bg-background-subtle rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                }>
                                    <SidebarProducts category="books" limit={4} />
                                </Suspense>
                                <SidebarProducts category="stationery" limit={2} />
                                <SidebarProducts category="electronics" limit={2} />

                                {siloPosts.length > 0 && (
                                    <>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="h-px w-6 bg-brand-500" />
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-subtle">
                                                Intelligence Silo
                                            </h3>
                                        </div>
                                        <div className="space-y-6">
                                            {siloPosts.map((p) => (
                                                <Link
                                                    key={p.id}
                                                    href={`${ROUTE_PREFIXES[p.type as PostTypeKey]}/${p.slug}`}
                                                    className="group block transition-all"
                                                >
                                                    <div className="flex flex-col">
                                                        <h4 className="text-[11px] font-black text-foreground leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                                                            {p.title}
                                                        </h4>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mt-1.5 flex items-center gap-2">{humanise(p.type)}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </LocalErrorBoundary>
                    </aside>
                </div>
            </div>
        </>
    )
}

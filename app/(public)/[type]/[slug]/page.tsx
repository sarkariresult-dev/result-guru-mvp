import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Image from 'next/image'
import { getPostBySlug } from '@/lib/queries/posts'
import { buildMetadata } from '@/lib/metadata'
import { buildJobPostingSchema, buildBreadcrumbSchema, buildFAQPageSchema, buildGovernmentServiceSchema, buildNewsArticleSchema, buildHowToSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { PostDetail } from '@/components/posts/PostDetail'
import { processContentHtml, extractHowToSteps } from '@/lib/content-processing'
import { sanitizeHtml } from '@/lib/sanitize'
import { RelatedPosts } from '@/components/posts/RelatedPosts'
import { PostDetailSkeleton } from '@/components/posts/PostCardSkeleton'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { TableOfContents } from '@/components/posts/TableOfContents'
import { OrgInfoBox } from '@/components/posts/OrgInfoBox'
import { AdZone, NewsletterForm } from '@/components/posts/PostPageClientParts'
import { POST_TYPE_CONFIG } from '@/config/constants'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'
import type { PublishedPost } from '@/types/post.types'
import type { FaqItem } from '@/types/post-content.types'
import { slugToKey, humanise } from '@/lib/utils'
import { ExternalLink, Download, Bell } from 'lucide-react'

/* ── Types ───────────────────────────────────────────────────────── */

interface Props {
    params: Promise<{ type: string; slug: string }>
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
    if (typeKey === 'scheme') {
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
                            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-2.5">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted mb-3">Quick Links</h3>
                                {quickLinks.map((link: { href: string; label: string; icon: 'external' | 'download'; primary?: boolean }, i: number) => (
                                    <a
                                        key={i}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${link.primary
                                            ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand'
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
                        )}

                        {/* ── SEO Silo Links (Content Strategy) ── */}
                        {/* COUNCIL P1 (Area 8): Expanded from result-only to all types */}
                        {/* SARA: Cross-type internal linking builds topical authority */}
                        {(() => {
                            const SILO_LINKS: Record<string, { description: string; links: { href: string; label: string }[] }> = {
                                job: {
                                    description: 'Preparing for this recruitment? Explore related resources.',
                                    links: [
                                        { href: '/result', label: 'Check Latest Results →' },
                                        { href: '/admit-card', label: 'Download Admit Cards →' },
                                        { href: '/syllabus', label: 'Get Exam Syllabus →' },
                                    ],
                                },
                                result: {
                                    description: 'Preparing for the next stage or reviewing your performance?',
                                    links: [
                                        { href: '/answer-key', label: 'Browse Official Answer Keys →' },
                                        { href: '/syllabus', label: 'Download Latest Syllabus →' },
                                        { href: '/cut-off', label: 'Check Cut Off Marks →' },
                                    ],
                                },
                                admit: {
                                    description: 'Exam day preparation resources.',
                                    links: [
                                        { href: '/result', label: 'Check Exam Results →' },
                                        { href: '/answer-key', label: 'View Answer Keys →' },
                                        { href: '/exam-pattern', label: 'Review Exam Pattern →' },
                                    ],
                                },
                                answer_key: {
                                    description: 'Track your exam outcome.',
                                    links: [
                                        { href: '/result', label: 'Check Final Results →' },
                                        { href: '/cut-off', label: 'View Cut Off Marks →' },
                                    ],
                                },
                                syllabus: {
                                    description: 'Study resources for your exam preparation.',
                                    links: [
                                        { href: '/exam-pattern', label: 'Check Exam Pattern →' },
                                        { href: '/previous-paper', label: 'Download Previous Papers →' },
                                        { href: '/job', label: 'Browse Latest Jobs →' },
                                    ],
                                },
                                exam_pattern: {
                                    description: 'Master the exam format.',
                                    links: [
                                        { href: '/syllabus', label: 'Get Detailed Syllabus →' },
                                        { href: '/previous-paper', label: 'Practice with Past Papers →' },
                                    ],
                                },
                                previous_paper: {
                                    description: 'Enhance your preparation.',
                                    links: [
                                        { href: '/syllabus', label: 'Review Syllabus →' },
                                        { href: '/exam-pattern', label: 'Understand Exam Pattern →' },
                                    ],
                                },
                                cut_off: {
                                    description: 'Understand the selection criteria.',
                                    links: [
                                        { href: '/result', label: 'Check Final Results →' },
                                        { href: '/answer-key', label: 'Review Answer Keys →' },
                                    ],
                                },
                                scheme: {
                                    description: 'Explore government benefits.',
                                    links: [
                                        { href: '/job', label: 'Browse Government Jobs →' },
                                        { href: '/admission', label: 'Find Admissions →' },
                                    ],
                                },
                                admission: {
                                    description: 'Complete your admission journey.',
                                    links: [
                                        { href: '/result', label: 'Check Entrance Results →' },
                                        { href: '/syllabus', label: 'Get Entrance Syllabus →' },
                                    ],
                                },
                                notification: {
                                    description: 'Stay informed on government updates.',
                                    links: [
                                        { href: '/job', label: 'Browse Latest Jobs →' },
                                        { href: '/scheme', label: 'Explore Govt Schemes →' },
                                    ],
                                },
                                exam: {
                                    description: 'Prepare for your upcoming exam.',
                                    links: [
                                        { href: '/syllabus', label: 'Get Exam Syllabus →' },
                                        { href: '/exam-pattern', label: 'Review Exam Pattern →' },
                                        { href: '/admit-card', label: 'Download Admit Card →' },
                                    ],
                                },
                            }
                            const siloConfig = SILO_LINKS[typeKey]
                            if (!siloConfig) return null
                            return (
                                <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">Related Resources</h3>
                                    <p className="text-sm text-foreground-muted">
                                        {siloConfig.description}
                                    </p>
                                    <div className="flex flex-col gap-2">
                                        {siloConfig.links.map((link, i) => (
                                            <a key={i} href={link.href} className="text-brand-600 hover:underline text-sm font-medium">
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )
                        })()}

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
                        <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-linear-to-br from-brand-50 to-brand-100/50 dark:from-brand-950/30 dark:to-brand-900/20 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                                    <Bell className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">Get Notified</h3>
                            </div>
                            <p className="text-xs text-foreground-muted leading-relaxed mb-3">
                                Subscribe for instant alerts when new {config.heading.toLowerCase()} posts are published.
                            </p>
                            <NewsletterForm />
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

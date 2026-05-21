import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'
import { FAQAccordion } from './FAQAccordion'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'
import { PostImageOverlay } from './PostImageOverlay'
import { AdZone } from '@/components/ads/AdZone'
import { processContentHtml, replacePlaceholders } from '@/lib/content-processing'
import { POST_TYPE_CONFIG } from '@/config/constants'
import type { PostTypeKey } from '@/config/site'
import { PostDetail as PostDetailType, PostAffiliateProductEntry } from '@/types/post.types'
import type { FaqItem } from '@/types/post-content.types'
import { AuthorBox } from './AuthorBox'
import { ShareBar } from './ShareBar'
import { ActionCenter } from './ActionCenter'
import { ProductInjection } from '@/features/affiliate/components/ProductInjection'
import { InlineNewsletterCTA } from './InlineNewsletterCTA'
import { PostAnalyticsBeacon } from './PostAnalyticsBeacon'
import { LocalErrorBoundary } from '@/components/shared/LocalErrorBoundary'
import { Calendar, Clock, Tag, ShieldCheck } from 'lucide-react'
import { getActionLinkPageLabel } from '@/lib/seo/seo-analyzer'
import { cn } from '@/lib/utils'

/* ── Section IDs ─────────────────────────────────────────────── */

type SectionId =
    | 'summary'
    | 'dates'
    | 'content'
    | 'affiliates'
    | 'author'
    | 'faq'
    | 'tags'

/* ── Type-aware section ordering ─────────────────────────────── */
/* Org info, TOC, quick links, newsletter are now in the sidebar (page.tsx) */

const SECTION_ORDER: Record<string, SectionId[]> = {
    job: ['summary', 'dates', 'content', 'author', 'faq', 'tags'],
    notification: ['dates', 'content', 'author', 'faq', 'tags'],
    exam: ['dates', 'content', 'author', 'faq', 'tags'],
    result: ['content', 'author', 'faq', 'tags'],
    admit: ['content', 'author', 'faq', 'tags'],
    'answer-key': ['content', 'author', 'faq', 'tags'],
    answer_key: ['content', 'author', 'faq', 'tags'],
    'cut-off': ['content', 'author', 'faq', 'tags'],
    cut_off: ['content', 'author', 'faq', 'tags'],
    syllabus: ['content', 'author', 'faq', 'tags'],
    'exam-pattern': ['content', 'author', 'faq', 'tags'],
    exam_pattern: ['content', 'author', 'faq', 'tags'],
    'previous-paper': ['content', 'author', 'faq', 'tags'],
    previous_paper: ['content', 'author', 'faq', 'tags'],
    scheme: ['content', 'author', 'faq', 'tags'],
    admission: ['dates', 'content', 'author', 'faq', 'tags'],
    scholarship: ['dates', 'content', 'author', 'faq', 'tags'],
}

const DEFAULT_ORDER: SectionId[] = ['content', 'author', 'faq', 'tags']

/* ── Component ───────────────────────────────────────────────── */

interface PostDetailProps {
    post: PostDetailType
    slug: string
    url: string
}

export function PostDetail({ post, slug, url }: PostDetailProps) {
    const typeKey = post.type as PostTypeKey
    const typeMeta = POST_TYPE_CONFIG[typeKey]


    const faq = post.faq as FaqItem[] | null
    const affiliates = post.affiliates

    /* Process content HTML with absolute safety */
    let processedHtml = ''
    try {
        const { processedHtml: rawHtml } = post.content
            ? processContentHtml(sanitizeHtml(post.content))
            : { processedHtml: '' }

        const mappings = {
            officialWebsiteUrl: post.org_official_url,
            applyOnlineUrl: post.primary_link || post.org_official_url,
            notificationPdfUrl: post.notification_pdf,
        }
        processedHtml = replacePlaceholders(rawHtml, mappings)
    } catch (err) {

        // Extreme fallback: Try basic sanitization if complex processing failed
        try {
            processedHtml = post.content ? sanitizeHtml(post.content) : ''
        } catch {
            processedHtml = ''
        }
    }

    /* Tags are now aggregated in v_published_posts */
    const tags = post.tags

    /* Determine section order */
    const sectionOrder = SECTION_ORDER[post.type] || SECTION_ORDER[typeKey] || DEFAULT_ORDER

    /* ── Section renderer ──────────────────────────────────── */
    const renderSection = (section: SectionId): React.ReactNode => {
        switch (section) {


            case 'dates':
                if (!post.application_start_date && !post.application_end_date) return null
                return (
                    <div key="dates" className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-10 border-y border-border/50">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-2">Registration Window</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-foreground">{formatDate(post.application_start_date)}</span>
                                <span className="text-xs font-bold text-foreground-subtle uppercase">Start</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-2">Closing Deadline</p>
                            <div className="flex items-baseline gap-2">
                                <span className={cn(
                                    "text-2xl font-black",
                                    post.application_status === 'closing_soon' ? "text-orange-600 dark:text-orange-400" : "text-foreground"
                                )}>
                                    {formatDate(post.application_end_date)}
                                </span>
                                <span className="text-xs font-bold text-foreground-subtle uppercase">End</span>
                            </div>
                            {post.application_status === 'closing_soon' && (
                                <p className="text-[10px] font-black uppercase text-orange-600 animate-pulse mt-1">Closing Soon - Hurry!</p>
                            )}
                        </div>
                    </div>
                )

            case 'content':
                if (!processedHtml) return null
                return (
                    <div key="content" className="flex flex-col">
                        <div
                            className="prose-editorial prose dark:prose-invert prose-headings:font-black prose-headings:tracking-tighter prose-headings:scroll-mt-24 prose-a:text-brand-600 prose-a:font-black prose-a:no-underline hover:prose-a:underline prose-img:rounded-3xl prose-img:shadow-2xl prose-recruitment py-8"
                            dangerouslySetInnerHTML={{ __html: processedHtml }}
                            suppressHydrationWarning
                        />
                        <InlineNewsletterCTA />
                    </div>
                )

            case 'author':
                if (!post.author) return null
                return <AuthorBox key="author" author={post.author} />

            case 'faq':
                if (!faq || faq.length === 0) return null
                return <FAQAccordion key="faq" items={faq.map(f => ({ question: f.q, answer: f.a }))} />

            case 'tags':
                if (!tags || tags.length === 0) return null
                return (
                    <div key="tags" className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                        <Tag className="size-4 text-foreground-subtle" />
                        {tags.map((tag) => (
                            <Link
                                key={tag.id}
                                href={`/tag/${tag.slug}`}
                                className="rounded-full border border-border bg-background-subtle px-3 py-1 text-xs font-medium text-foreground-muted hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors dark:hover:bg-brand-900/20"
                            >
                                {tag.name}
                            </Link>
                        ))}
                    </div>
                )

            default:
                return null
        }
    }

    /* ── Build sections with inline ad zones ─────────────────── */
    const renderedSections: React.ReactNode[] = []
    let sectionCount = 0

    for (const section of sectionOrder) {
        const rendered = (
            <LocalErrorBoundary key={`section-${section}`} name={`PostSection-${section}`} silent>
                {renderSection(section)}
            </LocalErrorBoundary>
        )
        if (rendered) {
            renderedSections.push(rendered)
            sectionCount++

            // Insert contextual product injection after the first section (usually summary or dates)
            if (sectionCount === 1 && post.type === 'job') {
                renderedSections.push(
                    <ProductInjection
                        key="contextual-books"
                        category="books"
                        label="Top Recommended Book"
                        description="This guide is highly recommended for complete syllabus coverage."
                    />
                )
            }

            // Insert inline ad zone after every 3rd rendered section
            if (sectionCount % 3 === 0 && section !== 'tags') {
                renderedSections.push(
                    <AdZone
                        key={`ad-inline-${sectionCount}`}
                        zoneSlug={`inline_${sectionCount}`}
                        postType={typeKey}
                        postId={post.id}
                        className="my-2"
                    />
                )
            }
        }
    }

    return (
        <div className="space-y-8" suppressHydrationWarning>
            <PostAnalyticsBeacon postId={post.id} />
            <LocalErrorBoundary name="PostDetailMain" silent>
                {/* ── Header: Title, Org, Dates ────────────────────────── */}
                <header className="space-y-8 pt-4 pb-10 border-b border-border/50" suppressHydrationWarning>
                    {/* Organization Tag */}
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-brand-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400">
                            {post.org_name || 'Recruitment News'}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-black text-foreground sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight">
                        {post.title}
                    </h1>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-foreground-subtle" suppressHydrationWarning>
                        {post.published_at && (
                            <div className="flex items-center gap-2.5">
                                <Calendar className="size-3.5 text-brand-500" />
                                <span>Published {formatDate(post.published_at)}</span>
                            </div>
                        )}
                        {post.content_updated_at && post.content_updated_at !== post.published_at && (
                            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                                <Clock className="size-3.5" />
                                <span>Updated {formatDate(post.content_updated_at)}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full border border-brand-200 dark:bg-brand-900/30 dark:text-brand-400 dark:border-brand-800/40 shadow-sm" title="This content meets our rigorous editorial standards for accuracy.">
                            <ShieldCheck className="size-3.5" />
                            <span>Expert Written & Fact-Checked</span>
                        </div>
                        {post.author?.credentials && (
                            <div className="hidden sm:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/40 shadow-sm">
                                <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span>Reviewed by {post.author.credentials}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* ── Featured Image with overlay badges + actions ─────── */}
                <figure className="relative aspect-video overflow-hidden rounded-4xl shadow-xl border border-border group bg-background-muted flex flex-col items-center justify-center">
                    <Image
                        src={post.featured_image || '/images/placeholder-post.png'}
                        alt={post.featured_image_alt ?? post.title}
                        width={1200}
                        height={675}
                        className="w-full h-auto transition-transform duration-slow group-hover:scale-[1.02]"
                        priority
                        fetchPriority="high"
                    />

                    {/* Top-left: status badge (overlay) */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <ApplicationStatusBadge status={post.application_status} />
                    </div>

                    {/* Bottom bar (overlay) */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between bg-linear-to-t from-black/80 via-black/20 to-transparent">
                        {/* Bottom-left: info badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {post.state_name && (
                                <span className="rounded-full bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1 text-[11px] font-black text-white uppercase tracking-widest shadow-lg">
                                    {post.state_name}
                                </span>
                            )}
                        </div>
                    </div>

                    <PostImageOverlay
                        slug={slug}
                        title={post.title}
                        type={typeKey}
                        readingTime={post.reading_time_min}
                    />
                </figure>
            </LocalErrorBoundary>

            {/* Excerpt */}
            {post.excerpt && (
                <div className="space-y-8">
                    <p className="border-l-8 border-brand-500 pl-8 py-4 text-2xl font-black text-foreground leading-[1.4] bg-linear-to-r from-brand-50/50 to-transparent dark:from-brand-900/10 rounded-r-4xl">
                        {post.excerpt}
                    </p>
                    <ShareBar title={post.title} url={url} />
                </div>
            )}

            {/* ── Action Center: Consolidating Sidebar Links ─────── */}
            <ActionCenter
                links={[
                    ...(post.org_official_url ? [{ href: post.org_official_url, label: 'Official Website', icon: 'external' as const, primary: true }] : []),
                    ...(post.primary_link ? [{ href: post.primary_link, label: getActionLinkPageLabel(typeKey), icon: 'check' as const, primary: true }] : []),
                    ...(post.notification_pdf ? [{ href: post.notification_pdf, label: 'Notification PDF', icon: 'download' as const }] : []),
                ]}
            />

            <AdZone zoneSlug="above_content" postType={typeKey} postId={post.id} className="my-6" />

            {/* ── Type-aware content sections ────────────────────── */}
            <article suppressHydrationWarning>
                {renderedSections}
            </article>

            {/* ── Last reviewed notice ───────────────────────────── */}
            {(post as any).last_reviewed_at && (
                <p className="text-xs text-foreground-subtle italic pt-2 border-t border-border">
                    This information was last reviewed and verified on{' '}
                    <time dateTime={formatDate((post as any).last_reviewed_at, 'ISO')}>
                        {formatDate((post as any).last_reviewed_at)}
                    </time>
                    .
                </p>
            )}
        </div>
    )
}

/* ── Exported helper: extract TOC items for sidebar ───────── */
export { processContentHtml } from '@/lib/content-processing'
export { sanitizeHtml } from '@/lib/sanitize'

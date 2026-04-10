import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'
import { FAQAccordion } from './FAQAccordion'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'

import { AffiliateProductsBox } from './AffiliateProductsBox'
import { PostImageOverlay } from './PostImageOverlay'
import { AdZone } from '@/components/ads/AdZone'
import { processContentHtml, replacePlaceholders } from '@/lib/content-processing'
import { POST_TYPE_CONFIG } from '@/config/constants'
import type { PostTypeKey } from '@/config/site'
import type { PostDetail as PostDetailType, PostAffiliateProductEntry } from '@/types/post.types'
import type { FaqItem } from '@/types/post-content.types'
import { AuthorBox } from './AuthorBox'
import { ShareBar } from './ShareBar'
import { Award, Calendar, Clock, FileText, Tag, ShieldCheck } from 'lucide-react'
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
    job: ['summary', 'dates', 'content', 'affiliates', 'author', 'faq', 'tags'],
    notification: ['dates', 'content', 'affiliates', 'author', 'faq', 'tags'],
    exam: ['dates', 'content', 'affiliates', 'author', 'faq', 'tags'],
    result: ['content', 'affiliates', 'author', 'faq', 'tags'],
    admit: ['content', 'affiliates', 'author', 'faq', 'tags'],
    'answer-key': ['content', 'affiliates', 'author', 'faq', 'tags'],
    answer_key: ['content', 'affiliates', 'author', 'faq', 'tags'],
    'cut-off': ['content', 'affiliates', 'author', 'faq', 'tags'],
    cut_off: ['content', 'affiliates', 'author', 'faq', 'tags'],
    syllabus: ['content', 'affiliates', 'author', 'faq', 'tags'],
    'exam-pattern': ['content', 'affiliates', 'author', 'faq', 'tags'],
    exam_pattern: ['content', 'affiliates', 'author', 'faq', 'tags'],
    'previous-paper': ['content', 'affiliates', 'author', 'faq', 'tags'],
    previous_paper: ['content', 'affiliates', 'author', 'faq', 'tags'],
    scheme: ['content', 'affiliates', 'author', 'faq', 'tags'],
    admission: ['dates', 'content', 'affiliates', 'author', 'faq', 'tags'],
    scholarship: ['dates', 'content', 'affiliates', 'author', 'faq', 'tags'],
}

const DEFAULT_ORDER: SectionId[] = ['content', 'affiliates', 'author', 'faq', 'tags']

/* ── Component ───────────────────────────────────────────────── */

interface Props {
    post: PostDetailType
    slug: string
    url: string
}

export function PostDetail({ post, slug, url }: Props) {
    const typeKey = post.type as PostTypeKey
    const typeMeta = POST_TYPE_CONFIG[typeKey]
    console.debug('Type Meta:', typeMeta) // Use for potential future enhancement or remove if unnecessary

    const faq = post.faq as FaqItem[] | null
    const affiliates = (post as any).affiliates as PostAffiliateProductEntry[] | undefined

    /* Process content HTML */
    const mappings = {
        officialWebsiteUrl: post.org_official_url,
        applyOnlineUrl: post.primary_link || post.org_official_url,
        notificationPdfUrl: post.notification_pdf,
    }

    const { processedHtml: rawHtml } = post.content
        ? processContentHtml(sanitizeHtml(post.content))
        : { processedHtml: '' }

    const processedHtml = replacePlaceholders(rawHtml, mappings)

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
                    <div key="dates" className="flex flex-wrap items-center gap-x-8 gap-y-4 py-2 border-y border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                                <Calendar className="size-4.5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle">Registration Start</p>
                                <p className="text-sm font-bold text-foreground">{formatDate(post.application_start_date)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "flex size-9 items-center justify-center rounded-full",
                                post.application_status === 'closing_soon'
                                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400 animate-pulse-subtle"
                                    : "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                            )}>
                                <Clock className="size-4.5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground-subtle">Registration End</p>
                                <p className={cn(
                                    "text-sm font-bold",
                                    post.application_status === 'closing_soon' ? "text-orange-700 dark:text-orange-400" : "text-foreground"
                                )}>
                                    {formatDate(post.application_end_date)}
                                </p>
                            </div>
                        </div>
                    </div>
                )

            case 'content':
                if (!processedHtml) return null
                return (
                    <div
                        key="content"
                        className="prose prose-lg max-w-none dark:prose-invert prose-headings:tracking-tight prose-headings:scroll-mt-20 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md prose-table:overflow-hidden prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:before:content-none prose-code:after:content-none"
                        dangerouslySetInnerHTML={{ __html: processedHtml }}
                    />
                )



            case 'affiliates':
                if (!affiliates || affiliates.length === 0) return null
                return <AffiliateProductsBox key="affiliates" affiliates={affiliates} />

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
        const rendered = renderSection(section)
        if (rendered) {
            renderedSections.push(rendered)
            sectionCount++

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
        <div className="space-y-8 animate-fade-in md:space-y-10">
            {/* ── Header: Title, Org, Dates ────────────────────────── */}
            <header className="space-y-5 animate-fade-up">
                {/* Title */}
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl leading-tight">
                    {post.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-foreground-muted">
                    {post.org_name && (
                        <span className="flex items-center gap-1.5">
                            <Award className="size-4 text-brand-500" />
                            {post.org_name}
                        </span>
                    )}
                    {post.published_at && (
                        <time dateTime={new Date(post.published_at).toISOString()} className="flex items-center gap-1.5 border-r border-border pr-4">
                            <Calendar className="size-4 text-brand-500" />
                            <span className="hidden sm:inline">Published </span>{formatDate(post.published_at)}
                        </time>
                    )}
                    {post.content_updated_at && post.content_updated_at !== post.published_at && (
                        <time dateTime={new Date(post.content_updated_at).toISOString()} className="flex items-center gap-1.5 border-r border-border pr-4 text-emerald-600 dark:text-emerald-400">
                             <Clock className="size-4" />
                            <span className="hidden sm:inline">Updated </span>{formatDate(post.content_updated_at)}
                        </time>
                    )}
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30">
                        <ShieldCheck className="size-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Sarkari Verified</span>
                    </div>
                </div>
            </header>

            {/* ── Featured Image with overlay badges + actions ─────── */}
            <figure className="relative overflow-hidden rounded-2xl shadow-md border border-border group bg-background-muted flex flex-col items-center justify-center">
                <Image
                    src={post.featured_image || '/images/placeholder-post.png'}
                    alt={post.featured_image_alt ?? post.title}
                    width={1200}
                    height={675}
                    className="w-full h-auto transition-transform duration-slow group-hover:scale-[1.01]"
                    sizes="(max-width: 768px) 100vw, 1200px"
                    priority
                    quality={75}
                />

                {/* Top-left: status badge (overlay) */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <ApplicationStatusBadge status={post.application_status} />
                </div>

                {/* Bottom bar (overlay) */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between bg-linear-to-t from-black/60 via-black/20 to-transparent">
                    {/* Bottom-left: info badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        {post.state_name && (
                            <span className="rounded-full bg-white/20 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white uppercase tracking-wide">
                                {post.state_name}
                            </span>
                        )}
                    </div>

                </div>
                
                {/* New Overlays: Top-Right (Save) & Bottom-Right (Read Time) */}
                <PostImageOverlay 
                    slug={slug} 
                    title={post.title} 
                    type={typeKey} 
                    readingTime={post.reading_time_min} 
                />
            </figure>

            {/* Excerpt */}
            {post.excerpt && (
                <div className="space-y-6">
                    <p className="border-l-4 border-brand-500 pl-4 py-1 text-lg italic font-medium text-foreground-muted bg-linear-to-r from-brand-50/50 to-transparent dark:from-brand-900/10 rounded-r-lg leading-relaxed">
                        {post.excerpt}
                    </p>
                    <ShareBar title={post.title} url={url} />
                </div>
            )}

            {/* ── Above Content Ad ─────────────────────────────── */}
            <AdZone zoneSlug="above_content" postType={typeKey} postId={post.id} className="my-6" />

            {/* ── Type-aware content sections ────────────────────── */}
            {renderedSections}

            {/* ── Last reviewed notice ───────────────────────────── */}
            {(post as any).last_reviewed_at && (
                <p className="text-xs text-foreground-subtle italic pt-2 border-t border-border">
                    This information was last reviewed and verified on{' '}
                    <time dateTime={new Date((post as any).last_reviewed_at).toISOString()}>
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
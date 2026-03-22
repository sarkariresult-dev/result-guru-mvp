import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'
import { FAQAccordion } from './FAQAccordion'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'

import { AffiliateProductsBox } from './AffiliateProductsBox'
import { ImageActionButtons } from './ImageActionButtons'
import { AdZone } from '@/components/ads/AdZone'
import { processContentHtml, replacePlaceholders } from '@/lib/content-processing'
import { POST_TYPE_CONFIG } from '@/config/constants'
import type { PostTypeKey } from '@/config/site'
import type { PublishedPost, PostAffiliateProductEntry } from '@/types/post.types'
import type { FaqItem } from '@/types/post-content.types'
import { Award, Calendar, Eye, FileText, Tag } from 'lucide-react'

/* ── Section IDs ─────────────────────────────────────────────── */

type SectionId =
    | 'summary'
    | 'content'
    | 'affiliates'
    | 'faq'
    | 'tags'

/* ── Type-aware section ordering ─────────────────────────────── */
/* Org info, TOC, quick links, newsletter are now in the sidebar (page.tsx) */

const SECTION_ORDER: Record<string, SectionId[]> = {
    job: ['summary', 'content', 'affiliates', 'faq', 'tags'],
    notification: ['content', 'affiliates', 'faq', 'tags'],
    exam: ['content', 'affiliates', 'faq', 'tags'],
    result: ['content', 'affiliates', 'faq', 'tags'],
    admit: ['content', 'affiliates', 'faq', 'tags'],
    'answer-key': ['content', 'affiliates', 'faq', 'tags'],
    answer_key: ['content', 'affiliates', 'faq', 'tags'],
    'cut-off': ['content', 'affiliates', 'faq', 'tags'],
    cut_off: ['content', 'affiliates', 'faq', 'tags'],
    syllabus: ['content', 'affiliates', 'faq', 'tags'],
    'exam-pattern': ['content', 'affiliates', 'faq', 'tags'],
    exam_pattern: ['content', 'affiliates', 'faq', 'tags'],
    'previous-paper': ['content', 'affiliates', 'faq', 'tags'],
    previous_paper: ['content', 'affiliates', 'faq', 'tags'],
    scheme: ['content', 'affiliates', 'faq', 'tags'],
    admission: ['content', 'affiliates', 'faq', 'tags'],
    scholarship: ['content', 'affiliates', 'faq', 'tags'],
}

const DEFAULT_ORDER: SectionId[] = ['content', 'affiliates', 'faq', 'tags']

/* ── Component ───────────────────────────────────────────────── */

interface Props {
    post: PublishedPost
    slug: string
    url: string
}

export function PostDetail({ post, slug, url }: Props) {
    const typeKey = post.type as PostTypeKey
    const typeMeta = POST_TYPE_CONFIG[typeKey]

    const faq = post.faq as FaqItem[] | null
    const affiliates = (post as any).affiliates as PostAffiliateProductEntry[] | undefined

    /* Process content HTML */
    const mappings = {
        officialWebsiteUrl: post.org_official_url,
        applyOnlineUrl: post.admit_card_link || post.result_link || post.answer_key_link || post.org_official_url,
        notificationPdfUrl: post.notification_pdf,
    }

    const { tocItems, processedHtml: rawHtml } = post.content
        ? processContentHtml(sanitizeHtml(post.content))
        : { tocItems: [] as any[], processedHtml: '' }

    const processedHtml = replacePlaceholders(rawHtml, mappings)

    /* Extract tags */
    const tags = (post as any).tags as Array<{ id: string; name: string; slug: string }> | undefined

    /* Determine section order */
    const sectionOrder = SECTION_ORDER[post.type] || SECTION_ORDER[typeKey] || DEFAULT_ORDER

    /* ── Section renderer ──────────────────────────────────── */
    const renderSection = (section: SectionId): React.ReactNode => {
        switch (section) {


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
                        <time dateTime={new Date(post.published_at).toISOString()} className="flex items-center gap-1.5">
                            <Calendar className="size-4 text-foreground-subtle" />
                            Published {formatDate(post.published_at)}
                        </time>
                    )}
                    {/* COUNCIL P2 (Area 5): Show content_updated_at (meaningful edits) not updated_at (any DB write) */}
                    {/* MARCUS: Google penalizes cosmetic-only date bumps - only show real content changes */}
                    {post.content_updated_at && post.content_updated_at !== post.published_at && (
                        <time dateTime={new Date(post.content_updated_at).toISOString()} className="flex items-center gap-1.5 text-foreground-subtle">
                            Updated {formatDate(post.content_updated_at)}
                        </time>
                    )}
                </div>
            </header>

            {/* ── Featured Image with overlay badges + actions ─────── */}
            <figure className="relative aspect-video overflow-hidden rounded-2xl shadow-md border border-border group">
                <Image
                    src={post.featured_image || '/images/placeholder-post.png'}
                    alt={post.featured_image_alt ?? post.title}
                    fill
                    className="object-cover transition-transform duration-slow group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                    quality={75}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                {/* Top-left: status badge */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <ApplicationStatusBadge status={post.application_status} />
                </div>

                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                    {/* Bottom-left: info badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        {post.state_name && (
                            <span className="rounded-full bg-white/20 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white uppercase tracking-wide">
                                {post.state_name}
                            </span>
                        )}
                        <span className="rounded-full bg-white/20 backdrop-blur-sm border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white flex items-center gap-1">
                            <FileText className="size-3" />
                            {post.reading_time_min} min read
                        </span>
                    </div>

                    {/* Bottom-right: share, copy, save */}
                    <ImageActionButtons
                        postId={post.id}
                        slug={slug}
                        title={post.title}
                        type={typeKey}
                        url={url}
                    />
                </div>
            </figure>

            {/* Excerpt */}
            {post.excerpt && (
                <p className="border-l-4 border-brand-500 pl-4 py-1 text-lg italic font-medium text-foreground-muted bg-linear-to-r from-brand-50/50 to-transparent dark:from-brand-900/10 rounded-r-lg leading-relaxed">
                    {post.excerpt}
                </p>
            )}

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

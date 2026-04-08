import type { Metadata } from 'next'
import type { PostDetail } from '@/types/post.types'
import type { HreflangEntry } from '@/types/post-content.types'
import { SITE, postUrl, ogImageUrl, CTR_CONFIG, type PostTypeKey } from '@/config/site'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* ── Title Formatting ──────────────────────────────────────────────── */

/**
 * Centralized title formatter for SEO.
 * Appends brand suffix " | Result Guru" only if total length <= 70.
 * If over 70, it truncates the title so the branded result is exactly 70.
 */
export function formatTitle(title: string): string {
    const brandName = SITE.name
    const brandSuffix = ` | ${brandName}`
    const limit = 70

    // If title already contains brand name, don't append it again
    if (title.includes(brandName)) {
        return title.length > limit ? `${title.slice(0, limit - 3)}...` : title
    }

    if (title.length + brandSuffix.length <= limit) {
        return `${title}${brandSuffix}`
    }

    // If already too long, truncate title to fit brand
    const ellipsis = '...'
    const available = limit - brandSuffix.length - ellipsis.length
    if (available > 10) {
        return `${title.slice(0, available)}${ellipsis}${brandSuffix}`
    }

    // Fallback: just truncate the title if it's very long
    return title.length > limit ? `${title.slice(0, limit - 3)}...` : title
}

/**
 * Truncates meta descriptions to SEO-compliant lengths (150-160 chars).
 */
export function formatDescription(description: string, limit = 160): string {
    if (!description) return ''
    if (description.length <= limit) return description
    return `${description.slice(0, limit - 3)}...`
}

/* ── CTR Optimization Engine ───────────────────────────────────────── */

/**
 * Get a time-freshness signal string based on a date.
 * Returns "Updated Apr 2026" or "LIVE" for very recent content.
 */
function getFreshness(date?: string | null): string {
    // NOTE: Avoiding relative "LIVE" checks via new Date() as they cause non-deterministic
    // build errors in Next.js 16. For SEO, absolute month/year is safer.
    if (!date) {
        return `Apr 2026`
    }

    const d = new Date(date)
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Build a high-CTR SERP title for a post.
 * Adds type-aware emoji prefix and freshness signals.
 * Guaranteed to fit within 60 characters (Google SERP safe).
 *
 * Examples:
 *   "✅ SSC CGL Result 2026 OUT - Check Score"
 *   "🔥 UPSC NDA Vacancy 2026 - Apply Now"
 */
export function buildCTRTitle(
    title: string,
    type: PostTypeKey,
    opts?: { publishedAt?: string | null; applicationEndDate?: string | null; seoTitle?: string | null }
): string {
    // Priority 1: Use AI-generated seoTitle if available and valid
    if (opts?.seoTitle && opts.seoTitle.length <= 60) {
        return opts.seoTitle
    }

    const config = CTR_CONFIG[type]
    if (!config) return formatTitle(title)

    const maxLen = 60 // Google SERP safe limit

    let action = config.urgencyWords[0] || ''

    // SEO Strategy: Use absolute dates instead of relative days for SSG safety
    if (opts?.applicationEndDate) {
        const endDate = new Date(opts.applicationEndDate)
        action = `Ends ${endDate.getDate()} ${MONTHS[endDate.getMonth()]}`
    }

    // Add freshness signal
    const freshness = getFreshness(opts?.publishedAt)
    if (freshness === 'LIVE') {
        // Fallback for metadata indexability
        action = 'Apr 2026'
    }

    // Strategy: [title] - [action]
    const separator = ' - '
    const full = `${title}${separator}${action}`

    if (full.length <= maxLen) return full

    // Try without action word
    if (title.length <= maxLen) return title

    // Truncate title
    const available = maxLen - 3 // 3 for "..."
    return `${title.slice(0, available)}...`
}

/**
 * Build a CTR-optimized meta description with a CTA suffix.
 * Guaranteed to be 120-155 characters.
 *
 * Examples:
 *   "SSC CGL Result 2026 declared. Check your tier-1 score, cut off marks & merit list. Check your score now →"
 *   "UPSC NDA 2026 notification for 400 vacancies. Check eligibility, syllabus & apply online. Apply before the last date →"
 */
export function buildClickableMeta(
    description: string,
    type: PostTypeKey,
): string {
    const config = CTR_CONFIG[type]
    if (!config) return formatDescription(description)

    const cta = config.ctaSuffix
    const maxLen = 155
    const minLen = 120

    // If description already ends with → or CTA, just format it
    if (description.includes('→') || description.includes('→')) {
        return formatDescription(description, maxLen)
    }

    // Try: "[description] [cta]"
    const withCTA = `${description.trim()} ${cta}`

    if (withCTA.length <= maxLen && withCTA.length >= minLen) {
        return withCTA
    }

    if (withCTA.length > maxLen) {
        // Trim description to make room for CTA
        const availableForDesc = maxLen - cta.length - 2 // 2 for ". " join
        if (availableForDesc > 60) {
            const trimmedDesc = description.slice(0, availableForDesc).trimEnd()
            // Find the last sentence boundary for clean truncation
            const lastPeriod = trimmedDesc.lastIndexOf('.')
            const lastComma = trimmedDesc.lastIndexOf(',')
            const cutPoint = Math.max(lastPeriod, lastComma)
            const cleanDesc = cutPoint > 40 ? trimmedDesc.slice(0, cutPoint + 1) : trimmedDesc + '.'
            return `${cleanDesc} ${cta}`
        }
    }

    // CTA doesn't fit - just format the description
    return formatDescription(description, maxLen)
}

/**
 * Build a CTR-optimized listing page title.
 * Used by [type]/page.tsx for category listing pages.
 *
 * Example: "🔥 Latest Government Job 2026 - Apply Now | Result Guru"
 */
export function buildListingTitle(
    type: PostTypeKey,
    page: number = 1
): string {
    const config = CTR_CONFIG[type]
    const year = 2026
    const heading = config?.freshnessLabel || type.replace(/_/g, ' ')

    if (page > 1) {
        return formatTitle(`${heading} ${year} - Page ${page}`)
    }

    const action = config?.urgencyWords[0] || ''
    const base = `${heading} ${year} - ${action}`.trim()

    return formatTitle(base)
}

/**
 * Build a CTR-optimized listing page meta description.
 */
export function buildListingMeta(
    type: PostTypeKey,
    page: number = 1
): string {
    const config = CTR_CONFIG[type]
    const year = 2026
    const label = config?.freshnessLabel || type.replace(/_/g, ' ')

    const base = page > 1
        ? `Page ${page} of ${label.toLowerCase()} ${year}. Browse all verified updates, official notifications & direct apply links.`
        : `Get the latest ${label.toLowerCase()} for ${year}. Verified official notifications, eligibility details & direct links. Updated daily.`

    return buildClickableMeta(base, type)
}

/* ── Post Metadata Builder ─────────────────────────────────────────── */

/**
 * Build a complete Next.js Metadata object from a PostDetail.
 * Used by dynamic [type]/[slug] pages.
 * Now enhanced with CTR-optimized og:title and meta descriptions.
 */
export function buildMetadata(post: PostDetail): Metadata {
    const postType = post.type as PostTypeKey
    // Prefer seo_title → meta_title → title for SERP display
    const seoTitle = (post as any).seo_title
    const title = formatTitle(seoTitle || post.meta_title || post.title)

    // Build CTR-optimized description with CTA
    const rawDescription = post.meta_description || post.excerpt || `${post.title} - ${SITE.name}`
    const description = postType && CTR_CONFIG[postType]
        ? buildClickableMeta(rawDescription, postType)
        : formatDescription(rawDescription)

    const url = `${SITE.url}${postUrl(postType, post.slug)}`

    // Phase 2: Dynamic OG image fallback - when no custom OG or featured image,
    // generate a branded preview using /api/og with post context
    const hasCustomImage = !!(post.og_image || post.featured_image)
    const ogImage = hasCustomImage
        ? ogImageUrl(post.og_image ?? post.featured_image)
        : `${SITE.url}/api/og?${new URLSearchParams({
            title: post.title,
            type: post.type,
            ...(post.org_name && { org: post.org_name }),
            ...(post.state_name && { state: post.state_name }),
        }).toString()}`

    /* ── Hreflang alternate links ─────────────────────────────── */
    const hreflang = (post.hreflang ?? []) as HreflangEntry[]
    const languages: Record<string, string> = {}
    if (hreflang.length > 0) {
        for (const entry of hreflang) {
            languages[entry.lang] = entry.url
        }
        // Add x-default pointing to self-canonical
        if (!languages['x-default']) {
            languages['x-default'] = post.canonical_url || url
        }
    }

    /* ── OG article tags (section + keywords) - enhanced with long-tail/semantic */
    const ogSection = post.category_name ?? undefined
    const ogTags: string[] = [
        ...(post.meta_keywords ?? []),
        ...(post.focus_keyword ? [post.focus_keyword] : []),
        ...(post.secondary_keywords ?? []),
        ...((post as any).long_tail_keywords ?? []).slice(0, 3),
        ...((post as any).semantic_keywords ?? []).slice(0, 3),
    ].filter(Boolean)

    /* ── CTR-enhanced OG title with date-awareness ────────────── */
    const ogTitle = post.og_title
        ? formatTitle(post.og_title)
        : postType && CTR_CONFIG[postType]
            ? buildCTRTitle(post.title, postType, {
                publishedAt: post.published_at,
                applicationEndDate: (post as any).application_end_date,
                seoTitle: (post as any).seo_title,
            })
            : title

    return {
        title,
        description,
        keywords: [
            ...(post.meta_keywords ?? []),
            ...(post.focus_keyword ? [post.focus_keyword] : []),
            ...((post as any).long_tail_keywords ?? []).slice(0, 5),
        ].filter(Boolean).length > 0
            ? [
                ...(post.meta_keywords ?? []),
                ...(post.focus_keyword ? [post.focus_keyword] : []),
                ...((post as any).long_tail_keywords ?? []).slice(0, 5),
            ].filter(Boolean)
            : undefined,
        alternates: {
            canonical: post.canonical_url || url,
            ...(Object.keys(languages).length > 0 && { languages }),
        },
        robots: post.noindex
            ? { index: false, follow: true }
            : { index: true, follow: true },
        openGraph: {
            title: ogTitle,
            description: formatDescription(post.og_description || description),
            url: post.canonical_url || url,
            siteName: SITE.name,
            locale: SITE.locale,
            type: 'article',
            // COUNCIL P1 (Area 2): article:author for E-E-A-T authority signals
            authors: [post.author?.name || `${SITE.name} Editorial Team`],
            publishedTime: post.published_at ?? undefined,
            modifiedTime: post.content_updated_at ?? post.updated_at ?? undefined,
            ...(ogSection && { section: ogSection }),
            ...(ogTags.length > 0 && { tags: ogTags }),
            images: [
                {
                    url: ogImage,
                    width: post.og_image_width
                        ? Number(post.og_image_width)
                        : SITE.defaultOgWidth,
                    height: post.og_image_height
                        ? Number(post.og_image_height)
                        : SITE.defaultOgHeight,
                    alt: post.featured_image_alt || title,
                },
            ],
        },
        twitter: {
            card: (post.twitter_card_type as any) ?? SITE.twitter.cardType,
            title: formatTitle(post.twitter_title || post.og_title || post.title),
            description: formatDescription(post.twitter_description || post.og_description || description),
            images: [ogImage],
            site: SITE.twitter.handle,
        },
    }
}

/* ── Static Page Metadata Builder ──────────────────────────────────── */

/**
 * Build metadata for static pages (about, contact, etc.).
 */
export function buildPageMetadata(opts: {
    title: string
    description: string
    path: string
    noindex?: boolean
}): Metadata {
    const url = `${SITE.url}${opts.path.startsWith('/') ? opts.path : `/${opts.path}`}`
    const title = formatTitle(opts.title)
    const description = formatDescription(opts.description)

    return {
        title,
        description,
        alternates: { canonical: url },
        robots: opts.noindex
            ? { index: false, follow: true }
            : { index: true, follow: true },
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
            card: SITE.twitter.cardType as any,
            title,
            description,
            site: SITE.twitter.handle,
        },
    }
}

import type { Metadata } from 'next'
import type { PostDetail } from '@/types/post.types'
import type { HreflangEntry } from '@/types/post-content.types'
import { SITE, postUrl, ogImageUrl } from '@/config/site'

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

/**
 * Build a complete Next.js Metadata object from a PostDetail.
 * Used by dynamic [type]/[slug] pages.
 */
export function buildMetadata(post: PostDetail): Metadata {
    const title = formatTitle(post.meta_title || post.title)
    const description = formatDescription(
        post.meta_description || post.excerpt || `${post.title} - ${SITE.name}`
    )
    const url = `${SITE.url}${postUrl(post.type as any, post.slug)}`
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

    /* ── OG article tags (section + keywords) ─────────────────── */
    const ogSection = post.category_name ?? undefined
    const ogTags: string[] = [
        ...(post.meta_keywords ?? []),
        ...(post.focus_keyword ? [post.focus_keyword] : []),
        ...(post.secondary_keywords ?? []),
    ].filter(Boolean)

    return {
        title,
        description,
        keywords: (post.meta_keywords && post.meta_keywords.length > 0)
            ? post.meta_keywords
            : post.focus_keyword
                ? [post.focus_keyword]
                : undefined,
        alternates: {
            canonical: post.canonical_url || url,
            ...(Object.keys(languages).length > 0 && { languages }),
        },
        robots: post.noindex
            ? { index: false, follow: true }
            : { index: true, follow: true },
        openGraph: {
            title: formatTitle(post.og_title || title),
            description: formatDescription(post.og_description || description),
            url: post.canonical_url || url,
            siteName: SITE.name,
            locale: SITE.locale,
            type: 'article',
            // COUNCIL P1 (Area 2): article:author for E-E-A-T authority signals
            // Resolves Task 3: Use real author name when available for better E-E-A-T footprint
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
            title: formatTitle(post.twitter_title || post.og_title || title),
            description: formatDescription(post.twitter_description || post.og_description || description),
            images: [ogImage],
            site: SITE.twitter.handle,
        },
    }
}

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

import type { Metadata } from 'next'
import type { PostDetail } from '@/types/post.types'
import type { HreflangEntry } from '@/types/post-content.types'
import { SITE, postUrl, ogImageUrl } from '@/config/site'

/**
 * Build a complete Next.js Metadata object from a PostDetail.
 * Used by dynamic [type]/[slug] pages.
 */
export function buildMetadata(post: PostDetail): Metadata {
    const title = post.meta_title || post.title
    const description =
        post.meta_description || post.excerpt || `${post.title} — ${SITE.name}`
    const url = `${SITE.url}${postUrl(post.type as any, post.slug)}`
    const ogImage = ogImageUrl(post.og_image ?? post.featured_image)

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
        keywords: post.meta_keywords ?? post.focus_keyword ?? undefined,
        alternates: {
            canonical: post.canonical_url || url,
            ...(Object.keys(languages).length > 0 && { languages }),
        },
        robots: post.noindex
            ? { index: false, follow: true }
            : post.robots_directive
                ? { index: true, follow: true }
                : undefined,
        openGraph: {
            title: post.og_title || title,
            description: post.og_description || description,
            url,
            siteName: SITE.name,
            locale: SITE.locale,
            type: 'article',
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
            title: post.twitter_title || post.og_title || title,
            description: post.twitter_description || post.og_description || description,
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
    const url = `${SITE.url}${opts.path}`

    return {
        title: `${opts.title} | ${SITE.name}`,
        description: opts.description,
        alternates: { canonical: url },
        robots: opts.noindex
            ? { index: false, follow: true }
            : undefined,
        openGraph: {
            title: `${opts.title} | ${SITE.name}`,
            description: opts.description,
            url,
            siteName: SITE.name,
            locale: SITE.locale,
            type: 'website',
            images: [{ url: SITE.defaultOgImage, width: SITE.defaultOgWidth, height: SITE.defaultOgHeight }],
        },
        twitter: {
            card: SITE.twitter.cardType as any,
            title: `${opts.title} | ${SITE.name}`,
            description: opts.description,
            site: SITE.twitter.handle,
        },
    }
}

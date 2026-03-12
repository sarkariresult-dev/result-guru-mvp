import type { PostDetail } from '@/types/post.types'
import { SITE, postUrl } from '@/config/site'

// ── JSON-LD Types ──────────────────────────────────────────
type JsonLdObject = Record<string, unknown>

// ── JobPosting Schema ──────────────────────────────────────
/**
 * Build schema.org/JobPosting structured data for a government-job post.
 * Falls back gracefully when optional fields are missing.
 */
export function buildJobPostingSchema(post: PostDetail): JsonLdObject {
    const url = `${SITE.url}${postUrl(post.type as any, post.slug)}`

    // Calculate expiry date (validThrough)
    // Preference: post.expires_at -> 30 days after today if not set
    let expiryDate = post.expires_at
    if (!expiryDate) {
        const date = new Date()
        date.setDate(date.getDate() + 30)
        expiryDate = date.toISOString()
    }

    const schema: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: post.title,
        description: post.excerpt || post.meta_description || post.title,
        url,
        datePosted: post.published_at ?? post.created_at,
        validThrough: expiryDate,
        employmentType: 'FULL_TIME',
        hiringOrganization: {
            '@type': 'Organization',
            name: post.org_name ?? SITE.name,
            sameAs: post.org_official_url ?? undefined,
            logo: post.org_logo_url ?? SITE.publisher.logo,
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressRegion: post.state_name ?? 'India',
                addressCountry: 'IN',
            },
        },
    }


    return schema
}

// ── BreadcrumbList Schema ──────────────────────────────────
/**
 * Build schema.org/BreadcrumbList from an array of { name, url } items.
 */
export function buildBreadcrumbSchema(
    items: Array<{ name: string; url: string }>
): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    }
}

// ── Organization Schema ────────────────────────────────────
/**
 * Build schema.org/Organization from site config.
 */
export function buildOrganizationSchema(): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE.publisher.name,
        url: SITE.publisher.url,
        logo: {
            '@type': 'ImageObject',
            url: SITE.publisher.logo,
        },
        sameAs: SITE.publisher.sameAs,
    }
}

// ── WebSite Schema (for homepage) ──────────────────────────
export function buildWebSiteSchema(): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE.url}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    }
}

// ── FAQPage Schema ─────────────────────────────────────────
/**
 * Build schema.org/FAQPage structured data from FAQ items.
 * Google uses this for rich FAQ snippets in search results.
 */
export function buildFAQPageSchema(
    items: Array<{ q: string; a: string }>
): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
            },
        })),
    }
}

// ── GovernmentService Schema ───────────────────────────────
/**
 * Build schema.org/GovernmentService for scheme posts.
 */
export function buildGovernmentServiceSchema(post: PostDetail): JsonLdObject {
    const url = `${SITE.url}${postUrl(post.type as any, post.slug)}`
    return {
        '@context': 'https://schema.org',
        '@type': 'GovernmentService',
        name: post.title,
        description: post.excerpt || post.meta_description || post.title,
        url,
        serviceType: 'Government Scheme',
        provider: {
            '@type': 'GovernmentOrganization',
            name: post.org_name ?? 'Government of India',
            ...(post.org_official_url && { url: post.org_official_url }),
        },
        areaServed: {
            '@type': 'Country',
            name: 'India',
        },
    }
}

// ── HowTo Schema ───────────────────────────────────────────
/**
 * Build schema.org/HowTo from "how to apply" steps.
 * Google displays rich HowTo snippets with step-by-step instructions.
 */
export function buildHowToSchema(
    title: string,
    steps: string[],
    url: string,
): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: title,
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            text: step,
            url: `${url}#step-${index + 1}`,
        })),
    }
}

// ── NewsArticle Schema ─────────────────────────────────────
/**
 * Build schema.org/NewsArticle for published posts.
 * NewsArticle (not Article) enables Google Discover Top Stories
 * carousel and AMP-free news surfaces.
 * - Championed by MARCUS (SEO Purist), approved unanimously by COUNCIL.
 */
export function buildNewsArticleSchema(post: PostDetail): JsonLdObject {
    const url = `${SITE.url}${postUrl(post.type as any, post.slug)}`
    const schema: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: post.title,
        description: post.excerpt || post.meta_description || post.title,
        // SARA: isAccessibleForFree signals free content to Discover
        isAccessibleForFree: true,
        url,
        datePublished: post.published_at ?? post.created_at,
        dateModified: post.content_updated_at ?? post.updated_at,
        publisher: {
            '@type': 'Organization',
            name: SITE.publisher.name,
            url: SITE.publisher.url,
            logo: { '@type': 'ImageObject', url: SITE.publisher.logo },
        },
        // E-E-A-T: Set author to Editorial Team as a Person type for authority
        author: {
            '@type': 'Person',
            name: `${SITE.name} Editorial Team`,
            url: `${SITE.url}/about`,
        },
        // SARA: dateline adds regional authority signal
        ...(post.state_name && { dateline: post.state_name }),
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
    }

    if (post.featured_image) {
        schema.image = {
            '@type': 'ImageObject',
            url: post.featured_image,
            ...(post.featured_image_width && { width: post.featured_image_width }),
            ...(post.featured_image_height && { height: post.featured_image_height }),
        }
    }

    if (post.word_count) {
        schema.wordCount = post.word_count
    }

    return schema
}

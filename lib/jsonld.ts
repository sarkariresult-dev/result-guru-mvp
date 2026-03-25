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
    try {
        const url = postUrl(post.type as any, post.slug)

        // Calculate expiry date (validThrough)
        // Preference: post.expires_at -> 30 days after today if not set
        let expiryDate = post.expires_at
        if (!expiryDate) {
            // Next.js 15 strictly bans `new Date()` or `Date.now()` inside Static routes
            // Using DB timestamp to remain 100% deterministic for SSG
            const fallbackStr = post.published_at || post.created_at || '2026-01-01T00:00:00Z'
            const date = new Date(fallbackStr)
            date.setDate(date.getDate() + 30)
            expiryDate = date.toISOString()
        }

        return {
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: post.title,
            description: post.excerpt || post.meta_description || post.title,
            url,
            datePosted: post.published_at ?? post.created_at,
            validThrough: expiryDate,
            employmentType: post.title.match(/part\s?-?time/i)
                ? 'PART_TIME'
                : post.title.match(/contract/i)
                    ? 'CONTRACTOR'
                    : 'FULL_TIME',
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
                    // Future-proofing: map addressLocality if city_name is added to PostDetail
                    ...((post as any).city_name && { addressLocality: (post as any).city_name }),
                    addressRegion: post.state_name ?? 'India',
                    addressCountry: 'IN',
                },
            },
        }
    } catch {
        // Graceful fallback - return minimal valid schema rather than crash the page
        return {
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: post.title ?? 'Government Job',
            description: post.title ?? '',
        }
    }
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
            width: 512,
            height: 512,
        },
        sameAs: SITE.publisher.sameAs,
        description: SITE.description,
        foundingDate: '2024',
        areaServed: {
            '@type': 'Country',
            name: 'India',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            url: `${SITE.url}/contact`,
            availableLanguage: ['English', 'Hindi'],
        },
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
        inLanguage: 'en-IN',
        publisher: {
            '@type': 'Organization',
            name: SITE.publisher.name,
            url: SITE.publisher.url,
            logo: { '@type': 'ImageObject', url: SITE.publisher.logo },
        },
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

// ── SiteNavigationElement Schema ───────────────────────────
/**
 * Build schema.org/SiteNavigationElement to help Google
 * generate sitelinks under the main search result.
 */
export function buildSiteNavigationSchema(): JsonLdObject {
    return {
        '@context': 'https://schema.org',
        '@type': 'SiteNavigationElement',
        name: [
            'Latest Jobs', 'Results', 'Admit Card',
            'Answer Key', 'Syllabus', 'Exam Pattern',
            'Admission', 'Scholarship', 'Govt Schemes',
        ],
        url: [
            `${SITE.url}/job`, `${SITE.url}/result`, `${SITE.url}/admit-card`,
            `${SITE.url}/answer-key`, `${SITE.url}/syllabus`, `${SITE.url}/exam-pattern`,
            `${SITE.url}/admission`, `${SITE.url}/scholarship`, `${SITE.url}/scheme`,
        ],
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
    try {
        const url = postUrl(post.type as any, post.slug)
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
    } catch {
        return {
            '@context': 'https://schema.org',
            '@type': 'GovernmentService',
            name: post.title ?? 'Government Scheme',
        }
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
    try {
        const url = postUrl(post.type as any, post.slug)
        const schema: JsonLdObject = {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: post.title,
            description: post.excerpt || post.meta_description || post.title,
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
            author: {
                '@type': 'Person',
                name: `${SITE.name} Editorial Team`,
                url: `${SITE.url}/about`,
            },
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
    } catch {
        return {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: post.title ?? '',
        }
    }
}

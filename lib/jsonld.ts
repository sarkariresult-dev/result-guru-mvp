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
    const dates = (post.important_dates ?? {}) as Record<string, string>

    const schema: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: post.title,
        description: post.excerpt || post.meta_description || post.title,
        url,
        datePosted: post.published_at ?? post.created_at,
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

    // Optional fields
    if (dates['last_date'] || dates['last_date_to_apply']) {
        schema.validThrough = dates['last_date'] ?? dates['last_date_to_apply']
    }
    if (post.total_vacancies && post.total_vacancies > 0) {
        schema.totalJobOpenings = post.total_vacancies
    }
    if (post.qualification) {
        schema.educationRequirements = {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: post.qualification,
        }
    }
    if (post.pay_scale) {
        schema.baseSalary = {
            '@type': 'MonetaryAmount',
            currency: 'INR',
            value: { '@type': 'QuantitativeValue', value: post.pay_scale },
        }
    }
    if (post.eligibility) {
        schema.experienceRequirements = post.eligibility
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

// ── Article Schema ─────────────────────────────────────────
/**
 * Build schema.org/Article for any post type.
 * Produces rich search results with headline, image, date, author.
 */
export function buildArticleSchema(post: PostDetail): JsonLdObject {
    const url = `${SITE.url}${postUrl(post.type as any, post.slug)}`
    const schema: JsonLdObject = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt || post.meta_description || post.title,
        url,
        datePublished: post.published_at ?? post.created_at,
        dateModified: post.content_updated_at ?? post.updated_at,
        publisher: {
            '@type': 'Organization',
            name: SITE.publisher.name,
            url: SITE.publisher.url,
            logo: { '@type': 'ImageObject', url: SITE.publisher.logo },
        },
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

    if (post.org_name) {
        schema.author = {
            '@type': 'Organization',
            name: post.org_name,
        }
    }

    if (post.word_count) {
        schema.wordCount = post.word_count
    }

    return schema
}

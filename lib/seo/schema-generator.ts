/**
 * JSON-LD Schema Generator - Result Guru
 *
 * Generates valid structured data for each post type.
 * Output is ready to be placed in <script type="application/ld+json">.
 */

import { SITE, ROUTE_PREFIXES, siteUrl, type PostTypeKey } from '@/config/site'

// ── Types ────────────────────────────────────────────────────────────────────

interface SchemaInput {
    type: PostTypeKey
    title: string
    slug: string
    excerpt: string
    content: string
    featuredImage?: string | null
    authorName?: string
    authorUrl?: string
    publishedAt?: string | null
    updatedAt?: string | null
    orgName?: string | null
    stateName?: string | null
    faq?: { q: string; a: string }[]
    applicationStartDate?: string | null
    applicationEndDate?: string | null
    categoryName?: string | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function wordCount(html: string): number {
    return stripHtml(html).split(/\s+/).filter(Boolean).length
}

function publisherSchema() {
    return {
        '@type': 'Organization',
        name: SITE.publisher.name,
        url: SITE.publisher.url,
        logo: {
            '@type': 'ImageObject',
            url: SITE.publisher.logo,
        },
    }
}

function breadcrumbSchema(type: PostTypeKey, title: string, slug: string): Record<string, unknown> {
    const prefix = ROUTE_PREFIXES[type]
    const typeLabel = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
            { '@type': 'ListItem', position: 2, name: typeLabel, item: siteUrl(prefix) },
            { '@type': 'ListItem', position: 3, name: title, item: siteUrl(`${prefix}/${slug}`) },
        ],
    }
}

function faqSchema(faq: { q: string; a: string }[]): Record<string, unknown> | null {
    if (!faq || faq.length === 0) return null
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.a,
            },
        })),
    }
}

// ── Type-specific schema builders ────────────────────────────────────────────

function articleSchema(input: SchemaInput): Record<string, unknown> {
    const url = siteUrl(`${ROUTE_PREFIXES[input.type]}/${input.slug}`)
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: input.title,
        description: input.excerpt || stripHtml(input.content).slice(0, 160),
        url,
        datePublished: input.publishedAt || new Date().toISOString(),
        dateModified: input.updatedAt || input.publishedAt || new Date().toISOString(),
        author: {
            '@type': 'Person',
            name: input.authorName || 'Result Guru Team',
            url: input.authorUrl || SITE.url,
        },
        publisher: publisherSchema(),
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        wordCount: wordCount(input.content),
        ...(input.featuredImage && {
            image: {
                '@type': 'ImageObject',
                url: input.featuredImage.startsWith('http') ? input.featuredImage : siteUrl(input.featuredImage),
                width: 1200,
                height: 630,
            },
        }),
    }
}

function jobPostingSchema(input: SchemaInput): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: input.title,
        description: input.excerpt || stripHtml(input.content).slice(0, 300),
        datePosted: input.publishedAt || new Date().toISOString(),
        ...(input.applicationEndDate && { validThrough: input.applicationEndDate }),
        hiringOrganization: {
            '@type': 'Organization',
            name: input.orgName || 'Government of India',
            sameAs: SITE.url,
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'IN',
                ...(input.stateName && { addressRegion: input.stateName }),
            },
        },
        employmentType: 'FULL_TIME',
        applicantLocationRequirements: {
            '@type': 'Country',
            name: 'India',
        },
    }
}

function governmentServiceSchema(input: SchemaInput): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'GovernmentService',
        name: input.title,
        description: input.excerpt || stripHtml(input.content).slice(0, 200),
        serviceType: input.type === 'scheme' ? 'Government Scheme' : 'Scholarship',
        provider: {
            '@type': 'GovernmentOrganization',
            name: input.orgName || 'Government of India',
        },
        ...(input.stateName && {
            areaServed: {
                '@type': 'State',
                name: input.stateName,
            },
        }),
        url: siteUrl(`${ROUTE_PREFIXES[input.type]}/${input.slug}`),
    }
}

// ── Main Generator ───────────────────────────────────────────────────────────

export function generateSchemaMarkup(input: SchemaInput): Record<string, unknown>[] {
    const schemas: Record<string, unknown>[] = []

    // Breadcrumb (always)
    schemas.push(breadcrumbSchema(input.type, input.title, input.slug))

    // Type-specific main schema
    switch (input.type) {
        case 'job':
        case 'notification':
            schemas.push(jobPostingSchema(input))
            schemas.push(articleSchema(input))
            break

        case 'scheme':
        case 'scholarship':
            schemas.push(governmentServiceSchema(input))
            schemas.push(articleSchema(input))
            break

        default:
            // All other types: result, admit, answer_key, cut_off, syllabus,
            // exam_pattern, previous_paper, exam, admission
            schemas.push(articleSchema(input))
            break
    }

    // FAQ schema (if FAQ items exist)
    const faq = faqSchema(input.faq ?? [])
    if (faq) schemas.push(faq)

    return schemas
}

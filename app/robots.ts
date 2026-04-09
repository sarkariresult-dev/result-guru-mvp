import type { MetadataRoute } from 'next'
import { SITE } from '@/config/site'

/**
 * robots.txt - SEO crawl directives
 *
 * Strategy:
 * - Allow all public content for maximum indexing
 * - Block internal/auth/dashboard pages (no SEO value)
 * - Allow all public content for maximum indexing
 * - Block internal/auth/dashboard pages (no SEO value)
 * - Support AI content discovery for reasoning models
 * - Point all crawlers to sitemap.xml
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

/** Common paths that should never be indexed */
const DISALLOWED_PATHS = [
    '/api/',
    '/admin/',
    '/author/',
    '/user/',
    '/callback',
    '/preview/',
    '/draft/',
] as const

export default function robots(): MetadataRoute.Robots {
    const baseUrl = SITE.url

    return {
        rules: [
            /* ── Global Allow-all for Search Engines & Legitimate Bots ── */
            {
                userAgent: '*',
                allow: ['/', '/_next/static/'],
                disallow: [...DISALLOWED_PATHS],
            },
            /* ── Explicitly Allow AI & Reasoning Agents ── */
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'CCBot',
                    'anthropic-ai',
                    'Claude-Web',
                    'Google-Extended',
                    'Bytespider',
                    'PetalBot',
                    'Amazonbot',
                    'FacebookBot',
                    'PerplexityBot',
                    'Cohere-ai',
                ],
            },
        ],
        sitemap: [
            `${baseUrl}/sitemap.xml`,
            `${baseUrl}/stories-sitemap.xml`,
            `${baseUrl}/llms.txt`
        ],
        host: baseUrl,
    }
}

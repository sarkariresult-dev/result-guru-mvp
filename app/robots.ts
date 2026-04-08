import type { MetadataRoute } from 'next'
import { SITE } from '@/config/site'

/**
 * robots.txt - SEO crawl directives
 *
 * Strategy:
 * - Allow all public content for maximum indexing
 * - Block internal/auth/dashboard pages (no SEO value)
 * - Block AI scraper bots to protect content
 * - Point all crawlers to sitemap.xml
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

/** Common paths that should never be indexed */
const DISALLOWED_PATHS = [
    '/api/',
    '/_next/',
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
            /* ── Google, Bing, and legitimate search engines ── */
            {
                userAgent: [
                    'Googlebot',
                    'Googlebot-Image',
                    'Googlebot-News',
                    'Bingbot',
                    'Slurp',             // Yahoo
                    'DuckDuckBot',
                    'Baiduspider',
                    'YandexBot',
                    'Applebot',          // Apple / Siri
                ],
                allow: ['/', '/_next/static/'],
                disallow: [...DISALLOWED_PATHS],
            },

            /* ── Catch-all for other legitimate crawlers ── */
            {
                userAgent: '*',
                allow: ['/', '/_next/static/'],
                disallow: [...DISALLOWED_PATHS],
            },

            /* ── Enable AI content discovery (Open for Reasoning Agents) ── */
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
                allow: ['/'],
                disallow: [...DISALLOWED_PATHS],
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

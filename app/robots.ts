import type { MetadataRoute } from 'next'
import { SITE } from '@/config/site'

/**
 * robots.txt — SEO crawl directives
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
    '/login',
    '/register',
    '/callback',
    '/forgot-password',
    '/reset-password',
    '/search?',              // Prevent duplicate indexing of parameterised search URLs
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
                allow: '/',
                disallow: [...DISALLOWED_PATHS],
            },

            /* ── Catch-all for other legitimate crawlers ── */
            {
                userAgent: '*',
                allow: '/',
                disallow: [...DISALLOWED_PATHS],
            },

            /* ── Block AI content scrapers ── */
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
                disallow: '/',
            },
        ],

        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    }
}

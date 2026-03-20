import { NextResponse } from 'next/server'
import { createStaticClient } from '@/lib/supabase/static'
import { SITE, ROUTE_PREFIXES } from '@/config/site'

/**
 * sitemap.xml - SEO index for all public pages (Route Handler)
 *
 * Uses a route handler instead of the metadata sitemap convention
 * to work around a known Turbopack bug (#78609) with generateSitemaps
 * and the [__metadata_id__] dynamic route in Next.js 16.
 *
 * Strategy:
 * - Static pages: homepage, category listings, info pages
 * - Dynamic pages: all published posts from Supabase
 * - State pages: individual state listing pages
 * - Organisation pages: individual org listing pages
 * - Tag pages: all active tags
 * - Priority: homepage 1.0 > categories 0.9 > posts 0.7 > info 0.4
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

/* Post type → URL segment mapping */
const TYPE_SEGMENT: Record<string, string> = Object.fromEntries(
    Object.entries(ROUTE_PREFIXES).map(([key, val]) => [
        key,
        val.replace(/^\//, ''),
    ])
)

/* ── Static pages sorted by crawl priority ── */
const STATIC_PAGES = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/job', changeFrequency: 'daily', priority: 0.9 },
    { path: '/result', changeFrequency: 'daily', priority: 0.9 },
    { path: '/admit-card', changeFrequency: 'daily', priority: 0.9 },
    { path: '/answer-key', changeFrequency: 'daily', priority: 0.8 },
    { path: '/syllabus', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/exam-pattern', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/cut-off', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/previous-paper', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/exam', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/scheme', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/admission', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/notification', changeFrequency: 'daily', priority: 0.8 },
    { path: '/search', changeFrequency: 'weekly', priority: 0.5 },
    { path: '/states', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/organizations', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/site-map', changeFrequency: 'weekly', priority: 0.3 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.2 },
] as const

/** Escape XML special chars */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

/** Build a single <url> entry */
function urlEntry(
    url: string,
    lastmod: string,
    changefreq: string,
    priority: number
): string {
    return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
}

export async function GET() {
    const baseUrl = SITE.url
    const now = new Date().toISOString()
    const entries: string[] = []

    /* ── Static Pages ── */
    for (const page of STATIC_PAGES) {
        entries.push(urlEntry(`${baseUrl}${page.path}`, now, page.changeFrequency, page.priority))
    }

    /* ── Taxonomy (States, Orgs, Tags) ── */
    try {
        const supabase = createStaticClient()
        const [statesResult, orgsResult, tagsResult] = await Promise.allSettled([
            supabase.from('states').select('slug, created_at, updated_at').eq('is_active', true).order('name'),
            supabase.from('organizations').select('slug, created_at, updated_at').eq('is_active', true).order('name'),
            supabase.from('tags').select('slug, created_at, updated_at').eq('is_active', true).order('name'),
        ])

        if (statesResult.status === 'fulfilled' && statesResult.value.data) {
            for (const state of statesResult.value.data as any[]) {
                const mod = new Date(state.updated_at ?? state.created_at ?? now).toISOString()
                entries.push(urlEntry(`${baseUrl}/states/${state.slug}`, mod, 'weekly', 0.6))
            }
        }

        if (orgsResult.status === 'fulfilled' && orgsResult.value.data) {
            for (const org of orgsResult.value.data as any[]) {
                const mod = new Date(org.updated_at ?? org.created_at ?? now).toISOString()
                entries.push(urlEntry(`${baseUrl}/organizations/${org.slug}`, mod, 'monthly', 0.5))
            }
        }

        if (tagsResult.status === 'fulfilled' && tagsResult.value.data) {
            for (const tag of tagsResult.value.data as any[]) {
                const mod = new Date(tag.updated_at ?? tag.created_at ?? now).toISOString()
                entries.push(urlEntry(`${baseUrl}/tag/${tag.slug}`, mod, 'weekly', 0.4))
            }
        }
    } catch (err) {
        console.error('[sitemap] Failed to fetch taxonomy data:', err)
    }

    /* ── Posts (fetch all in chunks for large datasets) ── */
    try {
        const supabase = createStaticClient()
        const CHUNK_SIZE = 10000
        let from = 0
        let hasMore = true

        while (hasMore) {
            const { data: posts, error } = await supabase
                .from('v_published_posts')
                .select('slug, type, updated_at, published_at, content_updated_at')
                .order('published_at', { ascending: false })
                .range(from, from + CHUNK_SIZE - 1)

            if (error) {
                console.error('[sitemap] Posts error:', error.message)
                break
            }

            if (posts?.length) {
                for (const post of posts as any[]) {
                    if (!post.slug || !post.type || !TYPE_SEGMENT[post.type]) continue
                    const mod = new Date(
                        post.content_updated_at ?? post.updated_at ?? post.published_at ?? now
                    ).toISOString()
                    entries.push(
                        urlEntry(`${baseUrl}/${TYPE_SEGMENT[post.type]}/${post.slug}`, mod, 'weekly', 0.7)
                    )
                }
                hasMore = posts.length === CHUNK_SIZE
                from += CHUNK_SIZE
            } else {
                hasMore = false
            }
        }
    } catch (err) {
        console.error('[sitemap] Failed to fetch posts:', err)
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    })
}

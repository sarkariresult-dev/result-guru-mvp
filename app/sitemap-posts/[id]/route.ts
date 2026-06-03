import { NextResponse } from 'next/server'
import { createStaticClient } from '@/lib/supabase/static'
import { SITE, ROUTE_PREFIXES } from '@/config/site'

const POSTS_PER_SITEMAP = 10000

const TYPE_SEGMENT: Record<string, string> = Object.fromEntries(
    Object.entries(ROUTE_PREFIXES).map(([key, val]) => [
        key,
        val.replace(/^\//, ''),
    ])
)

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function urlEntry(url: string, lastmod: string, changefreq: string, priority: number): string {
    return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const pageId = parseInt(id, 10)

    if (isNaN(pageId) || pageId < 1) {
        return new NextResponse('Invalid sitemap ID', { status: 400 })
    }

    const baseUrl = SITE.url
    const now = new Date().toISOString()
    const entries: string[] = []

    try {
        const supabase = createStaticClient()
        const from = (pageId - 1) * POSTS_PER_SITEMAP
        const to = from + POSTS_PER_SITEMAP - 1

        const { data: posts, error } = await supabase
            .from('v_published_posts')
            .select('slug, type, updated_at, published_at, content_updated_at')
            .order('published_at', { ascending: false })
            .range(from, to)

        if (error) {
            void 0;
            return new NextResponse('Internal Server Error', { status: 500 })
        }

        if (posts?.length) {
            for (const post of posts as { slug: string; type: string; updated_at: string | null; published_at: string | null; content_updated_at: string | null }[]) {
                if (!post.slug || !post.type || !TYPE_SEGMENT[post.type]) continue
                const mod = new Date(
                    post.content_updated_at ?? post.updated_at ?? post.published_at ?? now
                ).toISOString()
                entries.push(
                    urlEntry(`${baseUrl}/${TYPE_SEGMENT[post.type]}/${post.slug}`, mod, 'weekly', 0.7)
                )
            }
        }
    } catch (err) {
        void 0;
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

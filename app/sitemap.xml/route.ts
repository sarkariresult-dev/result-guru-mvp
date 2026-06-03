import { NextResponse } from 'next/server'
import { createStaticClient } from '@/lib/supabase/static'
import { SITE } from '@/config/site'
import { PostStatus } from '@/types/enums'

/**
 * sitemap.xml - Sitemap Index
 *
 * Replaces the monolithic sitemap with a scalable index pointing to:
 * 1. sitemap-static.xml
 * 2. sitemap-taxonomy.xml
 * 3. sitemap-posts/[1...N]
 */

const POSTS_PER_SITEMAP = 10000

export async function GET() {
    const baseUrl = SITE.url
    const sitemaps = [
        `${baseUrl}/sitemap-static.xml`,
        `${baseUrl}/sitemap-taxonomy.xml`,
    ]

    try {
        const supabase = createStaticClient()
        // Count published posts to generate paginated sitemaps
        const { count, error } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('status', PostStatus.Published)

        if (!error && count !== null) {
            const numPages = Math.ceil(count / POSTS_PER_SITEMAP) || 1
            for (let i = 1; i <= numPages; i++) {
                // Using route /sitemap-posts/1 to bypass Next.js restricted dynamic .xml limitations
                sitemaps.push(`${baseUrl}/sitemap-posts/${i}`)
            }
        }
    } catch (err) {
        void 0;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>\n    <loc>${url}</loc>\n  </sitemap>`).join('\n')}
</sitemapindex>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    })
}

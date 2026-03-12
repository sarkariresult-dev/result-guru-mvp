import { NextResponse } from 'next/server'
import { getPublicStories } from '@/lib/queries/stories'
import { SITE } from '@/config/site'


export async function GET() {
    const { data: stories } = await getPublicStories(1000)

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${stories.map((story: any) => `
    <url>
        <loc>${SITE.url}/stories/${story.slug}</loc>
        <lastmod>${new Date(story.updated_at).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
        <news:news>
            <news:publication>
                <news:name>${SITE.name}</news:name>
                <news:language>${SITE.language}</news:language>
            </news:publication>
            <news:publication_date>${new Date(story.published_at || story.created_at).toISOString()}</news:publication_date>
            <news:title>${story.meta_title || story.title}</news:title>
        </news:news>
        <image:image>
            <image:loc>${story.cover_image}</image:loc>
            <image:title>${story.title}</image:title>
        </image:image>
    </url>
    `).join('')}
</urlset>`

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
    })
}

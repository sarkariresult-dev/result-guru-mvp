import { createStaticClient } from '@/lib/supabase/static'
import { SITE, ROUTE_PREFIXES } from '@/config/site'

/**
 * GET /feed.xml
 *
 * RSS 2.0 XML feed of the latest published posts.
 * Used by RSS readers, Google News, podcast aggregators, and SEO tools.
 *
 * @see https://www.rssboard.org/rss-specification
 */

const TYPE_SEGMENT: Record<string, string> = Object.fromEntries(
    Object.entries(ROUTE_PREFIXES).map(([key, val]) => [key, val.replace(/^\//, '')])
)

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

export async function GET() {
    const baseUrl = SITE.url
    let items = ''

    try {
        const supabase = createStaticClient()

        const { data: posts } = await supabase
            .from('v_published_posts')
            .select('slug, type, title, excerpt, published_at, updated_at, category_name, org_name')
            .order('published_at', { ascending: false })
            .limit(50)

        if (posts?.length) {
            items = posts
                .filter((p: { slug: string | null; type: string | null }) => p.slug && p.type && TYPE_SEGMENT[p.type])
                .map(
                    (post: {
                        slug: string
                        type: string
                        title: string
                        excerpt: string | null
                        published_at: string | null
                        category_name: string | null
                        org_name: string | null
                    }) => {
                        const url = `${baseUrl}/${TYPE_SEGMENT[post.type]}/${post.slug}`
                        const pubDate = post.published_at
                            ? new Date(post.published_at).toUTCString()
                            : new Date().toUTCString()
                        const description = post.excerpt || post.title
                        const categories = [post.category_name, post.org_name]
                            .filter(Boolean)
                            .map((c) => `<category>${escapeXml(c!)}</category>`)
                            .join('')

                        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      ${categories}
    </item>`
                    },
                )
                .join('\n')
        }
    } catch (err) {
        console.error('[feed.xml] Failed to fetch posts:', err)
    }

    const lastBuildDate = new Date().toUTCString()

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>${SITE.language}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE.publisher.logo}</url>
      <title>${escapeXml(SITE.name)}</title>
      <link>${baseUrl}</link>
    </image>
${items}
  </channel>
</rss>`

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
    })
}

import { NextResponse } from 'next/server'
import { createStaticClient } from '@/lib/supabase/static'
import { SITE } from '@/config/site'

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

export async function GET() {
    const baseUrl = SITE.url
    const now = new Date().toISOString()
    const entries: string[] = []

    try {
        const supabase = createStaticClient()

        // Fetch published posts to find active taxonomies
        const { data: activePosts } = await supabase
            .from('v_published_posts')
            .select('state_slug, org_slug, category_slug, tags') as { data: any[] | null }

        const activeStateSlugs = new Set<string>()
        const activeOrgSlugs = new Set<string>()
        const activeCategorySlugs = new Set<string>()
        const activeTagSlugs = new Set<string>()

        if (activePosts) {
            for (const post of activePosts) {
                if (post.state_slug) activeStateSlugs.add(post.state_slug)
                if (post.org_slug) activeOrgSlugs.add(post.org_slug)
                if (post.category_slug) activeCategorySlugs.add(post.category_slug)
                
                const tags = post.tags as Array<{ slug: string }> | null
                if (tags) {
                    for (const t of tags) {
                        if (t.slug) activeTagSlugs.add(t.slug)
                    }
                }
            }
        }

        const [statesResult, orgsResult, tagsResult, catsResult] = await Promise.allSettled([
            supabase.from('states').select('slug, created_at').eq('is_active', true).order('name'),
            supabase.from('organizations').select('slug, created_at').eq('is_active', true).order('name'),
            supabase.from('tags').select('slug, created_at').eq('is_active', true).order('name'),
            supabase.from('categories').select('slug, created_at').eq('is_active', true).order('name'),
        ])

        if (statesResult.status === 'fulfilled' && statesResult.value.data) {
            for (const state of statesResult.value.data as { slug: string; created_at: string | null }[]) {
                if (activeStateSlugs.has(state.slug)) {
                    const mod = new Date(state.created_at ?? now).toISOString()
                    entries.push(urlEntry(`${baseUrl}/states/${state.slug}`, mod, 'weekly', 0.6))
                }
            }
        }

        if (orgsResult.status === 'fulfilled' && orgsResult.value.data) {
            for (const org of orgsResult.value.data as { slug: string; created_at: string | null }[]) {
                if (activeOrgSlugs.has(org.slug)) {
                    const mod = new Date(org.created_at ?? now).toISOString()
                    entries.push(urlEntry(`${baseUrl}/organizations/${org.slug}`, mod, 'monthly', 0.5))
                }
            }
        }

        if (tagsResult.status === 'fulfilled' && tagsResult.value.data) {
            for (const tag of tagsResult.value.data as { slug: string; created_at: string | null }[]) {
                if (activeTagSlugs.has(tag.slug)) {
                    const mod = new Date(tag.created_at ?? now).toISOString()
                    entries.push(urlEntry(`${baseUrl}/tag/${tag.slug}`, mod, 'weekly', 0.4))
                }
            }
        }

        if (catsResult.status === 'fulfilled' && catsResult.value.data) {
            for (const cat of catsResult.value.data as { slug: string; created_at: string | null }[]) {
                if (activeCategorySlugs.has(cat.slug)) {
                    const mod = new Date(cat.created_at ?? now).toISOString()
                    entries.push(urlEntry(`${baseUrl}/category/${cat.slug}`, mod, 'weekly', 0.6))
                }
            }
        }

        // Shop Categories & Products
        const [shopProductsResult] = await Promise.allSettled([
            supabase.from('affiliate').select('slug, updated_at, category').eq('is_active', true)
        ])

        if (shopProductsResult.status === 'fulfilled' && shopProductsResult.value.data) {
            const products = shopProductsResult.value.data as { slug: string; updated_at: string | null }[]
            for (const product of products) {
                const mod = new Date(product.updated_at ?? now).toISOString()
                entries.push(urlEntry(`${baseUrl}/shop/${product.slug}`, mod, 'daily', 0.8))
            }
        }

        const shopCats = ['books', 'stationery', 'electronics', 'software', 'tools', 'other']
        for (const cat of shopCats) {
            entries.push(urlEntry(`${baseUrl}/shop/${cat}`, now, 'daily', 0.8))
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

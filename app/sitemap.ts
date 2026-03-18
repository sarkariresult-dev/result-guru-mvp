import type { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/static'
import { cacheLife, cacheTag } from 'next/cache'
import { SITE, ROUTE_PREFIXES } from '@/config/site'

/**
 * sitemap.xml - SEO index for all public pages
 *
 * Strategy:
 * - Sitemap index: id=0 static+taxonomy, id=1+ dynamic post chunks
 * - Chunk size: 5000 URLs per sitemap (well under 50k spec limit)
 * - Static pages: homepage, category listings, info pages
 * - Dynamic pages: all published posts from Supabase
 * - State pages: individual state listing pages
 * - Organisation pages: individual org listing pages
 * - Tag pages: all active tags
 * - Priority: homepage 1.0 > categories 0.9 > posts 0.7 > info 0.4
 * - changeFrequency: based on typical content update patterns
 *
 * Next.js 16 uses generateSitemaps() to auto-create a sitemap index.
 * Google crawls this to discover & index all pages efficiently.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

/** URLs per sitemap chunk (well under the 50k spec limit for safety) */
/** URLs per sitemap chunk (well under the 50k spec limit for safety) */
const CHUNK_SIZE = 10_000

/* Post type → URL segment mapping */
const TYPE_SEGMENT: Record<string, string> = Object.fromEntries(
    Object.entries(ROUTE_PREFIXES).map(([key, val]) => [
        key,
        val.replace(/^\//, ''),
    ])
)

/* ── Static pages sorted by crawl priority ── */
const STATIC_PAGES: Array<{
    path: string
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
    priority: number
}> = [
        /* Homepage - highest priority, changes daily */
        { path: '', changeFrequency: 'daily', priority: 1.0 },

        /* Core content categories - change daily */
        { path: '/job', changeFrequency: 'daily', priority: 0.9 },
        { path: '/result', changeFrequency: 'daily', priority: 0.9 },
        { path: '/admit-card', changeFrequency: 'daily', priority: 0.9 },
        { path: '/answer-key', changeFrequency: 'daily', priority: 0.8 },

        /* Exam-related - change frequently */
        { path: '/syllabus', changeFrequency: 'weekly', priority: 0.7 },
        { path: '/exam-pattern', changeFrequency: 'weekly', priority: 0.7 },
        { path: '/cut-off', changeFrequency: 'weekly', priority: 0.7 },
        { path: '/previous-paper', changeFrequency: 'weekly', priority: 0.6 },
        { path: '/exam', changeFrequency: 'weekly', priority: 0.7 },

        /* Government schemes & admissions */
        { path: '/scheme', changeFrequency: 'weekly', priority: 0.7 },
        { path: '/admission', changeFrequency: 'weekly', priority: 0.7 },
        { path: '/notification', changeFrequency: 'daily', priority: 0.8 },

        /* Browse / directory pages */
        { path: '/search', changeFrequency: 'weekly', priority: 0.5 },
        { path: '/states', changeFrequency: 'monthly', priority: 0.5 },
        { path: '/organizations', changeFrequency: 'monthly', priority: 0.5 },
        { path: '/site-map', changeFrequency: 'weekly', priority: 0.3 },

        /* Info pages - rarely change */
        { path: '/about', changeFrequency: 'monthly', priority: 0.4 },
        { path: '/contact', changeFrequency: 'monthly', priority: 0.4 },
        { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.2 },
        { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.2 },
        { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.2 },
    ]

/* ── Combined Sitemap Generation ────────────────────────── */

export const revalidate = 3600 // revalidate at most every hour
export const dynamic = 'force-static'

const POSTS_PER_SITEMAP = 10000

export async function generateSitemaps() {
    try {
        const supabase = createStaticClient()
        // Get total published posts count
        const { count } = await supabase
            .from('v_published_posts')
            .select('*', { count: 'exact', head: true })

        if (!count) return [{ id: 0 }]

        // e.g 45_000 -> 5 chunks (0, 1, 2, 3, 4)
        const totalChunks = Math.ceil(count / POSTS_PER_SITEMAP)
        return Array.from({ length: totalChunks }, (_, i) => ({ id: i }))
    } catch {
        return [{ id: 0 }]
    }
}

export default async function sitemap(props: { id?: number | Promise<number> } = {}): Promise<MetadataRoute.Sitemap> {
    const rawId = props?.id ?? 0;
    const id = typeof rawId === 'object' && rawId !== null && 'then' in rawId ? await rawId : rawId;
    const baseUrl = SITE.url
    const now = new Date()

    let staticEntries: MetadataRoute.Sitemap = []
    let stateEntries: MetadataRoute.Sitemap = []
    let orgEntries: MetadataRoute.Sitemap = []
    let tagEntries: MetadataRoute.Sitemap = []
    let postEntries: MetadataRoute.Sitemap = []

    // 1. Only include static and taxonomy links in the FIRST sitemap (id = 0)
    if (id === 0) {
        /* ── Static Pages ── */
        staticEntries = STATIC_PAGES.map(
            ({ path, changeFrequency, priority }) => ({
                url: `${baseUrl}${path}`,
                lastModified: now,
                changeFrequency,
                priority,
            })
        )

        /* ── Taxonomy (States, Orgs, Tags) ── */
        try {
            const supabase = createStaticClient()
            const [statesResult, orgsResult, tagsResult] = await Promise.allSettled([
                supabase.from('states').select('slug, created_at, updated_at').eq('is_active', true).order('name'),
                supabase.from('organizations').select('slug, created_at, updated_at').eq('is_active', true).order('name'),
                supabase.from('tags').select('slug, created_at, updated_at').eq('is_active', true).order('name'),
            ])

            if (statesResult.status === 'fulfilled' && statesResult.value.data) {
                stateEntries = statesResult.value.data.map((state: any) => ({
                    url: `${baseUrl}/states/${state.slug}`,
                    lastModified: new Date(state.updated_at ?? state.created_at ?? now),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                }))
            }

            if (orgsResult.status === 'fulfilled' && orgsResult.value.data) {
                orgEntries = orgsResult.value.data.map((org: any) => ({
                    url: `${baseUrl}/organizations/${org.slug}`,
                    lastModified: new Date(org.updated_at ?? org.created_at ?? now),
                    changeFrequency: 'monthly' as const,
                    priority: 0.5,
                }))
            }

            if (tagsResult.status === 'fulfilled' && tagsResult.value.data) {
                tagEntries = tagsResult.value.data.map((tag: any) => ({
                    url: `${baseUrl}/tag/${tag.slug}`,
                    lastModified: new Date(tag.updated_at ?? tag.created_at ?? now),
                    changeFrequency: 'weekly' as const,
                    priority: 0.4,
                }))
            }
        } catch (err) {
            console.error(`[sitemap] Failed to fetch taxonomy data:`, err)
        }
    }

    /* ── Posts ── */
    try {
        const supabase = createStaticClient()
        
        // Calculate pagination range based on sitemap id chunk
        const from = id * POSTS_PER_SITEMAP
        const to = from + POSTS_PER_SITEMAP - 1

        const { data: posts, error } = await supabase
            .from('v_published_posts')
            .select('slug, type, updated_at, published_at, content_updated_at')
            .order('published_at', { ascending: false })
            .range(from, to)

        if (error) {
            console.error(`[sitemap-${id}] Posts error:`, error.message)
        } else if (posts?.length) {
            postEntries = posts
                .filter(
                    (p: { slug: string | null; type: string | null }) =>
                        p.slug && p.type && TYPE_SEGMENT[p.type]
                )
                .map(
                    (post: {
                        slug: string
                        type: string
                        updated_at: string | null
                        published_at: string | null
                        content_updated_at: string | null
                    }) => ({
                        url: `${baseUrl}/${TYPE_SEGMENT[post.type]}/${post.slug}`,
                        lastModified: new Date(
                            post.content_updated_at ?? post.updated_at ?? post.published_at ?? now
                        ),
                        changeFrequency: 'weekly' as const,
                        priority: 0.7,
                    })
                )
        }
    } catch (err) {
        console.error(`[sitemap-${id}] Failed to fetch posts:`, err)
    }

    return [...staticEntries, ...stateEntries, ...orgEntries, ...tagEntries, ...postEntries]
}

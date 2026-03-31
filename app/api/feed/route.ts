import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { SITE } from '@/config/site'

/**
 * GET /api/feed
 * Returns the latest 100 published posts as JSON for RSS/sitemap consumers.
 */
export async function GET() {
    try {
        const supabase = await createServerClient()

        const { data } = await supabase
            .from('v_published_posts')
            .select('slug, type, title, excerpt, published_at, updated_at')
            .order('published_at', { ascending: false })
            .limit(100)

        const posts = (data ?? []).map((p: { slug: string; type: string; title: string; excerpt: string | null; published_at: string; updated_at: string | null }) => ({
            slug: p.slug,
            type: p.type,
            title: p.title,
            excerpt: p.excerpt,
            published_at: p.published_at,
            updated_at: p.updated_at,
            url: `${SITE.url}/${p.type}/${p.slug}`,
        }))

        return NextResponse.json({
            success: true,
            data: posts,
            generated_at: new Date().toISOString(),
        })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

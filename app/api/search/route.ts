import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { searchLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import type { SearchResult } from '@/types/api.types'

/**
 * GET /api/search?q=...&type=...&state=...&page=...&limit=...
 * Full-text search against published posts.
 */
export async function GET(request: NextRequest) {
    // Rate limit: 20 req/min per IP
    const ip = getClientIp(request)
    const rl = await searchLimiter.limit(ip)
    if (!rl.success) return rateLimitResponse(rl.reset)

    const startTime = Date.now()
    const { searchParams } = request.nextUrl
    const q = searchParams.get('q')?.trim()
    const type = searchParams.get('type')
    const state = searchParams.get('state')
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))

    if (!q || q.length < 2) {
        return NextResponse.json(
            { success: false, error: 'Search query must be at least 2 characters' },
            { status: 400 }
        )
    }

    try {
        const supabase = await createServerClient()

        let query = supabase
            .from('v_published_posts')
            .select('*', { count: 'exact' })
            .textSearch('search_vector', q, { type: 'websearch' })

        if (type) query = query.eq('type', type)
        if (state) query = query.eq('state_slug', state)

        const { data, count } = await query
            .order('published_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

        const total = count ?? 0
        const result: SearchResult = {
            posts: (data ?? []) as any,
            total,
            page,
            limit,
            hasMore: page * limit < total,
            took_ms: Date.now() - startTime,
        }

        return NextResponse.json({ success: true, data: result })
    } catch {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}

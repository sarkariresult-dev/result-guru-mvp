import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { searchLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { withErrorHandling, successResponse, errorResponse } from '@/lib/api-response'
import type { SearchResult } from '@/types/api.types'

/**
 * GET /api/search?q=...&type=...&state=...&page=...&limit=...
 * Full-text search against published posts.
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
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
        return errorResponse('Search query must be at least 2 characters', 400)
    }

    const supabase = await createServerClient()

    let query = supabase
        .from('v_published_posts')
        .select('*', { count: 'exact' })
        .textSearch('search_vector', q, { type: 'websearch' })

    if (type) query = query.eq('type', type)
    if (state) query = query.eq('state_slug', state)

    const { data, count, error } = await query
        .order('published_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (error) throw error

    const total = count ?? 0
    const result: SearchResult = {
        posts: (data ?? []) as any,
        total,
        page,
        limit,
        hasMore: page * limit < total,
        took_ms: Date.now() - startTime,
    }

    // Fire-and-forget telemetry logging for Admin Search Analytics
    if (page === 1) {
        Promise.resolve().then(async () => {
            try {
                const userAgent = request.headers.get('user-agent') || ''
                const isMobile = /mobile/i.test(userAgent)
                await supabase.from('search_queries').insert({
                    query: q,
                    results_count: total,
                    device: isMobile ? 'mobile' : 'desktop',
                })
            } catch (e) {
                console.error('Search telemetry failed:', e)
            }
        })
    }

    return successResponse(result)
})

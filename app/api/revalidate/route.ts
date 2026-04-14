import { NextRequest } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { env } from '@/config/env'
import { revalidateLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'
import { withErrorHandling, successResponse, errorResponse } from '@/lib/api-response'

/**
 * POST /api/revalidate
 * On-demand ISR revalidation. Requires REVALIDATE_SECRET.
 *
 * Body: { secret, tag?, path? }
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
    // Rate limit purely as an extra safeguard against brute-forcing the secret
    const ip = getClientIp(request)
    const rl = await revalidateLimiter.limit(ip)
    if (!rl.success) return rateLimitResponse(rl.reset)

    const body = await request.json()
    const { secret, tag, path } = body

    const expected = env.REVALIDATE_SECRET
    if (!expected || secret !== expected) {
        return errorResponse('Invalid secret', 401)
    }

    if (tag) {
        // Next.js 15 (Stable): revalidateTag(tag)
        revalidateTag(tag)
        return successResponse({ revalidated: true, tag })
    }

    if (path) {
        revalidatePath(path)
        return successResponse({ revalidated: true, path })
    }

    return errorResponse('Provide tag or path', 400)
})

/**
 * GET /api/revalidate
 * Vercel Cron handler - runs every 15 minutes to keep homepage content fresh.
 *
 * Vercel sends: Authorization: Bearer <CRON_SECRET>
 * Set CRON_SECRET in Vercel project settings.
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
    // Verify Vercel Cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return errorResponse('Unauthorized', 401)
    }

    // Revalidate key cache tags for homepage freshness
    const tags = ['posts', 'stats', 'homepage-sections']
    for (const tag of tags) {
        revalidateTag(tag)
    }

    return successResponse({
        revalidated: true,
        tags,
        timestamp: new Date().toISOString(),
    })
})


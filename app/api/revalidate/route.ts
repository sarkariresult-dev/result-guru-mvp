import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { env } from '@/config/env'
import { revalidateLimiter, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

/**
 * POST /api/revalidate
 * On-demand ISR revalidation. Requires REVALIDATE_SECRET.
 *
 * Body: { secret, tag?, path? }
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limit purely as an extra safeguard against brute-forcing the secret
        const ip = getClientIp(request)
        const rl = await revalidateLimiter.limit(ip)
        if (!rl.success) return rateLimitResponse(rl.reset)

        const body = await request.json()
        const { secret, tag, path } = body

        const expected = env.REVALIDATE_SECRET
        if (!expected || secret !== expected) {
            return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
        }

        if (tag) {
            // Next.js 16: revalidateTag(tag, profile) - use 'default' profile
            revalidateTag(tag, 'default')
            return NextResponse.json({ revalidated: true, tag })
        }

        if (path) {
            revalidatePath(path)
            return NextResponse.json({ revalidated: true, path })
        }

        return NextResponse.json({ error: 'Provide tag or path' }, { status: 400 })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

/**
 * GET /api/revalidate
 * Vercel Cron handler - runs every 15 minutes to keep homepage content fresh.
 *
 * Vercel sends: Authorization: Bearer <CRON_SECRET>
 * Set CRON_SECRET in Vercel project settings.
 */
export async function GET(request: NextRequest) {
    try {
        // Verify Vercel Cron secret
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Revalidate key cache tags for homepage freshness
        const tags = ['posts', 'stats', 'homepage-sections']
        for (const tag of tags) {
            revalidateTag(tag, 'default')
        }

        return NextResponse.json({
            revalidated: true,
            tags,
            timestamp: new Date().toISOString(),
        })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}


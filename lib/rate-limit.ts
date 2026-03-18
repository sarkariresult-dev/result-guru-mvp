/**
 * Upstash Redis-backed sliding-window rate limiter (C4).
 * Works securely across all Vercel serverless Edge functions.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

// Guard against missing Redis credentials in local dev
const isRedisConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

const redis = isRedisConfigured 
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null


/* ── Pre-configured limiters for different API routes ────────────────────── */

/** Newsletter subscribe: 5 requests per minute per IP */
export const subscribeLimiter = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as any


/** View tracking: 30 requests per minute per IP */
export const viewLimiter = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as any


/** Revalidate: 10 requests per minute per IP */
export const revalidateLimiter = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as any


/** Search: 20 requests per minute per IP */
export const searchLimiter = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as any


/** General API: 60 requests per minute per IP */
export const generalLimiter = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as any


/* ── Helper to extract client IP from NextRequest ────────────────────────── */

export function getClientIp(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        '127.0.0.1'
    )
}

/** Return a 429 JSON response with Retry-After header */
export function rateLimitResponse(reset: number): NextResponse {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
            status: 429,
            headers: {
                'Retry-After': String(retryAfter),
                'X-RateLimit-Reset': String(reset),
            },
        },
    )
}

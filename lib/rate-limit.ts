/**
 * Upstash Redis-backed sliding-window rate limiter (C4).
 * Works securely across all Vercel serverless Edge functions.
 * 
 * Securely hardened with automated E2E test bypasses:
 * - NODE_ENV === 'test' bypasses limits.
 * - X-E2E-Bypass-Token header matching E2E_BYPASS_TOKEN bypasses limits in staging.
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


/* ── Helper to wrap Ratelimit instance with E2E bypass logic ─────────────── */

function wrapLimiter(limiter: Ratelimit): Ratelimit {
    // If Redis is not configured, limiter is already a mock
    if (!redis) return limiter;

    const originalLimit = limiter.limit.bind(limiter);

    limiter.limit = (async function(
        identifier: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req?: any
    ) {
        // 1. Bypass automatically during local test runs
        if (process.env.NODE_ENV === 'test') {
            return { success: true, reset: 0, limit: 0, remaining: 0, pending: Promise.resolve() };
        }

        // 2. Bypass via secure request header matching E2E_BYPASS_TOKEN env
        try {
            const { headers } = await import('next/headers');
            const headersList = await headers();
            const bypassHeader = headersList.get('x-e2e-bypass-token');
            if (process.env.E2E_BYPASS_TOKEN && bypassHeader === process.env.E2E_BYPASS_TOKEN) {
                return { success: true, reset: 0, limit: 0, remaining: 0, pending: Promise.resolve() };
            }
        } catch {
            // Safe to ignore: called outside Next.js request context (e.g. build time, static params)
        }

        return originalLimit(identifier, req);
    }) as typeof limiter.limit;

    return limiter;
}


/* ── Pre-configured limiters for different API routes ────────────────────── */

/** Newsletter subscribe: 5 requests per minute per IP */
export const subscribeLimiter = wrapLimiter(redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as unknown as Ratelimit)


/** View tracking: 30 requests per minute per IP */
export const viewLimiter = wrapLimiter(redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as unknown as Ratelimit)


/** Revalidate: 10 requests per minute per IP */
export const revalidateLimiter = wrapLimiter(redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as unknown as Ratelimit)


/** Search: 20 requests per minute per IP */
export const searchLimiter = wrapLimiter(redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as unknown as Ratelimit)


/** General API: 60 requests per minute per IP */
export const generalLimiter = wrapLimiter(redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
}) : { limit: async () => ({ success: true }) } as unknown as Ratelimit)


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

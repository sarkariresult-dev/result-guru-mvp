import { NextResponse } from 'next/server'
import { createStaticClient } from '@/lib/supabase/static'

/**
 * GET /api/health
 * Health-check endpoint for uptime monitors (UptimeRobot, Vercel, etc.).
 * Returns 200 with status info, or 503 if the database is unreachable.
 */
export async function GET() {
    const start = Date.now()

    try {
        // Quick Supabase connectivity check - lightweight query
        const supabase = createStaticClient()
        const { error } = await supabase.from('states').select('id').limit(1).single()

        const latency = Date.now() - start

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = "no rows returned" - still means DB is reachable
            return NextResponse.json(
                {
                    status: 'degraded',
                    database: 'unreachable',
                    error: error.message,
                    timestamp: new Date().toISOString(),
                    latency_ms: latency,
                },
                { status: 503 },
            )
        }

        return NextResponse.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
            latency_ms: latency,
        })
    } catch (err) {
        return NextResponse.json(
            {
                status: 'error',
                database: 'unreachable',
                error: err instanceof Error ? err.message : 'Unknown error',
                timestamp: new Date().toISOString(),
                latency_ms: Date.now() - start,
            },
            { status: 503 },
        )
    }
}

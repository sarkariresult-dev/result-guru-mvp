import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServerClient()

    // Call the RPC functions defined in 021_rpc_functions.sql and 022_db_optimizations.sql
    const [trendingRes, typeStatsRes, siteStatsRes] = await Promise.all([
        supabase.rpc('fn_refresh_trending'),
        supabase.rpc('fn_refresh_type_counts'),
        supabase.rpc('fn_refresh_site_stats')
    ])

    if (trendingRes.error || typeStatsRes.error || siteStatsRes.error) {
        console.error('Cron refresh partial error:', {
            trending: trendingRes.error,
            typeCounts: typeStatsRes.error,
            siteStats: siteStatsRes.error
        })
        return NextResponse.json({ error: 'Failed to refresh some materialized views' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Materialized views refreshed successfully' })
}

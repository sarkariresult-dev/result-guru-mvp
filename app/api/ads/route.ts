import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * GET /api/ads?zone_slug=...&device=...
 * Returns active ads for a given zone from the v_active_ads view.
 * Ordered by weight descending for weighted ad rotation.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const zone_slug = searchParams.get('zone_slug')
        const device = searchParams.get('device')

        if (!zone_slug) {
            return NextResponse.json(
                { error: 'zone_slug is required' },
                { status: 400 },
            )
        }

        const supabase = await createServerClient()

        // v_active_ads.zone_slug is a TEXT column (az.slug AS zone_slug)
        let query = supabase
            .from('v_active_ads')
            .select('*')
            .eq('zone_slug', zone_slug)
            .order('weight', { ascending: false })
            .limit(10)

        // Optional device targeting
        if (device === 'mobile') query = query.eq('is_mobile', true)
        else if (device === 'desktop') query = query.eq('is_desktop', true)

        const { data, error } = await query
        if (error) throw error

        return NextResponse.json({ success: true, data: data ?? [] })
    } catch {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

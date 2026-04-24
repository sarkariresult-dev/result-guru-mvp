import 'server-only'
import { createStaticClient } from '@/lib/supabase/static'
import type { ActiveAd } from '@/types/advertising.types'
import type { PostTypeKey } from '@/config/site'

interface AdFetchContext {
    post_type?: PostTypeKey
    device?: 'mobile' | 'tablet' | 'desktop'
    post_id?: string
}

/**
 * Fetch active ads for a specific zone on the server.
 * This allows us to pass initial ad data to the client,
 * eliminating Layout Shift (CLS) and reducing client-side fetch latency.
 */
export async function getActiveAds(zoneSlug: string, ctx: AdFetchContext = {}): Promise<ActiveAd[]> {
    'use cache'
    
    const supabase = createStaticClient()

    let q = supabase
        .from('v_active_ads')
        .select('*')
        .eq('zone_slug', zoneSlug)
        .order('weight', { ascending: false })

    // Device targeting
    if (ctx.device === 'mobile') {
        q = q.eq('is_mobile', true)
    } else if (ctx.device === 'desktop') {
        q = q.eq('is_desktop', true)
    }

    const { data, error } = await q
    if (error) {
        console.error(`getActiveAds error for ${zoneSlug}:`, error)
        return []
    }

    return (data ?? []) as ActiveAd[]
}

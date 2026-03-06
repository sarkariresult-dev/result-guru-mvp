'use client'

/**
 * useAds — Result Guru
 *
 * Fetches active ads for a given zone slug.
 * Respects targeting context (post type, state, device).
 *
 * Usage:
 *   const { ads, isLoading } = useAds('sidebar-top', {
 *     post_type: 'job',
 *     state_slug: 'up',
 *     device: 'desktop',
 *   })
 */

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/config/query-keys'
import { STALE_TIME } from '@/config/constants'
import type { ActiveAd } from '@/types/advertising.types'
import type { PostTypeKey } from '@/config/site'

export interface AdRenderContext {
    post_type?: PostTypeKey
    state_slug?: string
    device?: 'mobile' | 'tablet' | 'desktop'
    post_id?: string
}

export function useAds(zoneSlug: string, ctx: AdRenderContext = {}) {
    return useQuery<ActiveAd[]>({
        queryKey: queryKeys.ads.zone(zoneSlug, ctx),
        staleTime: STALE_TIME.ADS,
        enabled: Boolean(zoneSlug),
        queryFn: async () => {
            const supabase = createClient()

            // v_active_ads exposes az.slug AS zone_slug (TEXT)
            // Order by weight DESC for weighted ad rotation
            let q = supabase
                .from('v_active_ads')
                .select('*')
                .eq('zone_slug', zoneSlug)
                .order('weight', { ascending: false })

            // Device targeting — filter out ads not meant for this device
            if (ctx.device === 'mobile') {
                q = q.eq('is_mobile', true)
            } else if (ctx.device === 'desktop') {
                q = q.eq('is_desktop', true)
            }

            const { data, error } = await q
            if (error) throw error
            return (data ?? []) as ActiveAd[]
        },
    })
}

// ─── Record ad impression / click ────────────────────────────────────────────

/**
 * Fire-and-forget ad event recording.
 * @param adId   - The ad UUID
 * @param zoneId - The ad_zones UUID (available in ad data from v_active_ads)
 * @param eventType - 'impression' | 'click'
 * @param ctx    - Optional context (post_id, device)
 */
export async function recordAdEvent(
    adId: string,
    zoneId: string,
    eventType: 'impression' | 'click',
    ctx: { post_id?: string; device?: string } = {},
) {
    try {
        await fetch('/api/ads/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ad_id: adId,
                zone_id: zoneId,
                event_type: eventType,
                post_id: ctx.post_id ?? null,
                device: ctx.device ?? null,
            }),
            keepalive: true,
        })
    } catch {
        // Analytics must never crash the page
    }
}
'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAds, recordAdEvent } from '@/hooks/useAds'
import { AdDisplay } from './AdDisplay'
import type { PostTypeKey } from '@/config/site'

interface Props {
    /** Zone slug matching ad_zones.slug in DB */
    zoneSlug: string
    postType?: PostTypeKey
    postId?: string
    sticky?: boolean
    className?: string
}

export function AdZone({ zoneSlug, postType, postId, sticky, className }: Props) {
    const device = typeof window !== 'undefined'
        ? window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
        : 'desktop'

    const { data: ads, isLoading, error } = useAds(zoneSlug, {
        post_type: postType,
        device: device as 'mobile' | 'tablet' | 'desktop',
        post_id: postId,
    })

    const impressionSent = useRef<Set<string>>(new Set())

    // Record impressions for visible ads
    useEffect(() => {
        if (!ads?.length || error) return
        for (const ad of ads) {
            if (!impressionSent.current.has(ad.id)) {
                impressionSent.current.add(ad.id)
                recordAdEvent(ad.id, ad.zone_id ?? '', 'impression', { post_id: postId, device })
            }
        }
    }, [ads, postId, device, error])

    // Nothing to render on error or no data
    if (error) {
        console.error(`AdZone (${zoneSlug}) error:`, error)
        return null
    }

    if (!isLoading && (!ads || ads.length === 0)) return null

    return (
        <div
            className={cn(
                'space-y-3',
                sticky && 'lg:sticky lg:top-20',
                className,
            )}
            data-ad-zone={zoneSlug}
        >
            {isLoading ? (
                <div className="flex min-h-22.5 items-center justify-center rounded-lg bg-background-muted animate-pulse" />
            ) : (
                ads?.map((ad) => (
                    <AdDisplay
                        key={ad.id}
                        ad={ad}
                        onClick={() => recordAdEvent(ad.id, ad.zone_id ?? '', 'click', { post_id: postId, device })}
                    />
                ))
            )}
        </div>
    )
}

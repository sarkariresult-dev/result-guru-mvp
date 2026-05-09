'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAds, recordAdEvent } from '@/hooks/useAds'
import { AdDisplay } from './AdDisplay'
import { isRestrictedIframe } from '@/lib/safe-env'
import type { PostTypeKey } from '@/config/site'

import type { ActiveAd } from '@/types/advertising.types'

interface Props {
    /** Zone slug matching ad_zones.slug in DB */
    zoneSlug: string
    postType?: PostTypeKey
    postId?: string
    sticky?: boolean
    className?: string
    initialAds?: ActiveAd[]
}

export function AdZone({ zoneSlug, postType, postId, sticky, className, initialAds }: Props) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // To prevent CLS, we render a placeholder with a fixed height on the server
    // for known high-impact zones.
    const hasPlaceholder = 
        zoneSlug === 'above_content' || 
        zoneSlug === 'sidebar_right_top' || 
        zoneSlug.startsWith('inline_') ||
        zoneSlug === 'below_content'

    if (!isMounted && !hasPlaceholder && !initialAds) return null

    return (
        <div className={cn(hasPlaceholder && !isMounted && "min-h-[90px] w-full bg-background-muted/50 rounded-xl animate-pulse-subtle mb-6")}>
            <AdZoneContent 
                zoneSlug={zoneSlug} 
                postType={postType} 
                postId={postId} 
                sticky={sticky} 
                className={className}
                initialAds={initialAds}
            />
        </div>
    )
}

function AdZoneContent({ zoneSlug, postType, postId, sticky, className, initialAds }: Props) {
    let device: 'mobile' | 'tablet' | 'desktop' = 'desktop'
    try {
        if (typeof window !== 'undefined') {
            const w = window.innerWidth
            if (w < 768) device = 'mobile'
            else if (w < 1024) device = 'tablet'
            else device = 'desktop'
        }
    } catch {
        // Fallback to desktop in restricted environments
    }

    const { data: ads, isLoading, error } = useAds(zoneSlug, {
        post_type: postType,
        device,
        post_id: postId,
    }, initialAds)

    const impressionSent = useRef<Set<string>>(new Set())

    // Record impressions for visible ads
    useEffect(() => {
        try {
            const isIframe = isRestrictedIframe()
            if (!ads?.length || error || isIframe) return
            for (const ad of ads) {
                if (!impressionSent.current.has(ad.id)) {
                    impressionSent.current.add(ad.id)
                    recordAdEvent(ad.id, ad.zone_id ?? '', 'impression', { post_id: postId, device })
                }
            }
        } catch {
            // Impression tracking must never crash the page
        }
    }, [ads, postId, device, error])

    // Nothing to render on error or no data
    if (error) {

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

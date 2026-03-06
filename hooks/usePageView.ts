'use client'

/**
 * usePageView — Result Guru
 *
 * Fires a page view event once per post-detail page mount.
 * - Increments post_views.view_count in Supabase (via API route)
 * - Respects bot/crawler detection
 * - Deduplicated per session via sessionStorage
 *
 * Usage — call once at the top of a post page component:
 *   usePageView(post.id)
 */

import { useEffect, useRef } from 'react'

// Bot UA patterns — skip tracking for known crawlers
const BOT_PATTERN = /bot|crawl|spider|slurp|mediapartners|adsbot|lighthouse|prerender|headless/i

function isBot(): boolean {
    if (typeof navigator === 'undefined') return true
    return BOT_PATTERN.test(navigator.userAgent)
}

function getDevice(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    if (w < 768) return 'mobile'
    if (w < 1024) return 'tablet'
    return 'desktop'
}

export function usePageView(postId: string | undefined) {
    const firedRef = useRef(false)

    useEffect(() => {
        if (!postId || firedRef.current || isBot()) return

        // Deduplicate within the same browser session
        const sessionKey = `pv_${postId}`
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(sessionKey)) return

        firedRef.current = true
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(sessionKey, '1')
        }

        // Fire and forget — don't block render
        const payload = {
            post_id: postId,
            referrer: typeof document !== 'undefined' ? document.referrer : '',
            device: getDevice(),
        }

        fetch('/api/analytics/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            // keepalive ensures the request completes even if the user navigates away
            keepalive: true,
        }).catch(() => {
            // Silently ignore network errors — analytics must never break the page
        })
    }, [postId])
}
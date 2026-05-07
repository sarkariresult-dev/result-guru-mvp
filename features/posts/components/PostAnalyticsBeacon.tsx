'use client'

import { useEffect, useRef } from 'react'

interface PostAnalyticsBeaconProps {
    postId: string
}

/**
 * Invisible component that tracks user engagement time on a post.
 * Uses navigator.sendBeacon for reliable delivery on page exit.
 */
export function PostAnalyticsBeacon({ postId }: PostAnalyticsBeaconProps) {
    const startTimeRef = useRef<number>(Date.now())
    const accumulatedTimeRef = useRef<number>(0)
    const isTabActiveRef = useRef<boolean>(true)

    useEffect(() => {
        const calculateAndSend = () => {
            const now = Date.now()
            if (isTabActiveRef.current) {
                accumulatedTimeRef.current += Math.round((now - startTimeRef.current) / 1000)
            }
            
            const duration = accumulatedTimeRef.current
            // Only send if the user spent more than 3 seconds (filters out bots/accidental clicks)
            if (duration >= 3) {
                const payload = JSON.stringify({ postId, duration })
                const blob = new Blob([payload], { type: 'application/json' })
                navigator.sendBeacon('/api/analytics/beacon', blob)
                
                // Reset accumulated time after sending to avoid double-counting if called multiple times
                accumulatedTimeRef.current = 0
            }
            startTimeRef.current = now
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                isTabActiveRef.current = false
                calculateAndSend()
            } else {
                isTabActiveRef.current = true
                startTimeRef.current = Date.now()
            }
        }

        const handleBeforeUnload = () => {
            calculateAndSend()
        }

        // ── Event Listeners ──────────────────────────────────────────
        window.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('pagehide', handleBeforeUnload)

        return () => {
            calculateAndSend()
            window.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('pagehide', handleBeforeUnload)
        }
    }, [postId])

    return null
}

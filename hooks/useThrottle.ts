'use client'

/**
 * useThrottle - Result Guru
 *
 * Returns a throttled version of a value - updates at most once
 * every `limit` ms. Useful for scroll/resize handlers.
 *
 * Usage:
 *   const throttledY = useThrottle(scrollY, 100)
 *
 * Also exports `useThrottledCallback` for throttling a function.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Value throttle ─────────────────────────────────────────────────────────

export function useThrottle<T>(value: T, limit = 100): T {
    const [throttled, setThrottled] = useState<T>(value)
    const lastRan = useRef<number>(Date.now())

    useEffect(() => {
        const elapsed = Date.now() - lastRan.current
        if (elapsed >= limit) {
            setThrottled(value)
            lastRan.current = Date.now()
            return
        }
        const timer = setTimeout(() => {
            setThrottled(value)
            lastRan.current = Date.now()
        }, limit - elapsed)
        return () => clearTimeout(timer)
    }, [value, limit])

    return throttled
}

// ─── Callback throttle ──────────────────────────────────────────────────────

/**
 * Returns a stable throttled version of the provided callback.
 * The inner function is called at most once every `limit` ms.
 * Trailing call is fired after the throttle window ends.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottledCallback<T extends (...args: any[]) => any>(
    fn: T,
    limit = 100,
): (...args: Parameters<T>) => void {
    const lastRan = useRef<number>(0)
    const trailingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const fnRef = useRef(fn)
    fnRef.current = fn   // keep up to date without re-memoising

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now()
            const elapsed = now - lastRan.current

            if (elapsed >= limit) {
                lastRan.current = now
                fnRef.current(...args)
            } else {
                clearTimeout(trailingTimer.current)
                trailingTimer.current = setTimeout(() => {
                    lastRan.current = Date.now()
                    fnRef.current(...args)
                }, limit - elapsed)
            }
        },
        [limit],
    )
}
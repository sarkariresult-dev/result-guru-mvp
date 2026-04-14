'use client'

/**
 * useIntersectionObserver - Result Guru
 *
 * Thin wrapper around IntersectionObserver. Common uses:
 *  - Trigger infinite scroll when sentinel element enters viewport
 *  - Lazy-load images / heavy components
 *  - Animate elements on scroll
 *
 * Usage:
 *   const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })
 *   <div ref={ref} />
 *
 * Infinite scroll pattern:
 *   const { ref } = useIntersectionObserver({
 *     onIntersect: fetchNextPage,
 *     enabled: hasNextPage,
 *   })
 *   <div ref={ref} />   ← place at end of list
 */

import { useRef, useState, useEffect, useCallback, useLayoutEffect } from 'react'

interface Options extends IntersectionObserverInit {
    /** Called once when element enters viewport (if `once` is true) or on every entry */
    onIntersect?: () => void
    /** Only observe while enabled (default true) */
    enabled?: boolean
    /** Unobserve after first intersection (default false) */
    once?: boolean
}

export function useIntersectionObserver<T extends Element = Element>({
    threshold = 0,
    root = null,
    rootMargin = '0px',
    onIntersect,
    enabled = true,
    once = false,
}: Options = {}) {
    const ref = useRef<T | null>(null)
    const [isIntersecting, setIsIntersecting] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const onIntersectRef = useRef(onIntersect)
    useLayoutEffect(() => {
        onIntersectRef.current = onIntersect
    }, [onIntersect])

    const observe = useCallback(() => {
        if (!ref.current || !enabled) return

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (!entry) return
                const intersecting = entry.isIntersecting
                setIsIntersecting(intersecting)
                if (intersecting) {
                    onIntersectRef.current?.()
                    if (once) observerRef.current?.unobserve(entry.target)
                }
            },
            { threshold, root, rootMargin },
        )
        observerRef.current.observe(ref.current)
    }, [enabled, threshold, root, rootMargin, once])

    useEffect(() => {
        observe()
        return () => {
            observerRef.current?.disconnect()
        }
    }, [observe])

    return { ref, isIntersecting }
}

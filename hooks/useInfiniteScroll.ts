'use client'

import { useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(
    onLoadMore: () => void,
    options?: { threshold?: number; enabled?: boolean }
) {
    const observerRef = useRef<IntersectionObserver | null>(null)
    const enabled = options?.enabled ?? true

    const sentinelRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (observerRef.current) observerRef.current.disconnect()
            if (!node || !enabled) return

            observerRef.current = new IntersectionObserver(
                ([entry]) => {
                    if (entry?.isIntersecting) onLoadMore()
                },
                { threshold: options?.threshold ?? 0.1 }
            )
            observerRef.current.observe(node)
        },
        [onLoadMore, enabled, options?.threshold]
    )

    useEffect(() => {
        return () => observerRef.current?.disconnect()
    }, [])

    return { sentinelRef }
}

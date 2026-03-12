'use client'

/**
 * useMediaQuery - Result Guru
 *
 * SSR-safe media query hook with Tailwind-aligned breakpoints.
 *
 * Usage:
 *   const isMobile  = useIsMobile()     // < 768px
 *   const isTablet  = useIsTablet()     // 768–1023px
 *   const isDesktop = useIsDesktop()    // ≥ 1024px
 *   const matches   = useMediaQuery('(prefers-color-scheme: dark)')
 */

import { useState, useEffect } from 'react'

// ─── Generic ─────────────────────────────────────────────────────────────────

export function useMediaQuery(query: string): boolean {
    // SSR: default false - avoid hydration mismatch
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia(query)
        setMatches(mq.matches)
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [query])

    return matches
}

// ─── Tailwind-aligned breakpoint helpers ─────────────────────────────────────

/** True when viewport < 640px (Tailwind `sm` breakpoint) */
export const useIsXs = () => useMediaQuery('(max-width: 639px)')

/** True when viewport ≥ 640px */
export const useIsSm = () => useMediaQuery('(min-width: 640px)')

/** True when viewport ≥ 768px */
export const useIsMd = () => useMediaQuery('(min-width: 768px)')

/** True when viewport ≥ 1024px */
export const useIsLg = () => useMediaQuery('(min-width: 1024px)')

/** True when viewport ≥ 1280px */
export const useIsXl = () => useMediaQuery('(min-width: 1280px)')

/** Convenience alias - mobile-first: viewport < 768px */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')

/** Convenience alias - tablet range: 768–1023px */
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)')

/** Convenience alias - desktop: ≥ 1024px */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

/** System dark mode preference */
export const usePrefersDark = () => useMediaQuery('(prefers-color-scheme: dark)')

/** System reduced-motion preference - use for disabling animations */
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

/** Touch device - hides hover-only UI on touch devices */
export const useIsTouch = () => useMediaQuery('(pointer: coarse)')
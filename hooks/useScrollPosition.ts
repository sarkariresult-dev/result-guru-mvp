'use client'

/**
 * useScrollPosition — Result Guru
 *
 * Tracks window scroll position with throttling.
 * Returns scrollY, direction, and a showBackToTop flag.
 *
 * Usage:
 *   const { scrollY, direction, showBackToTop } = useScrollPosition()
 */

import { useState, useEffect, useRef } from 'react'
import { TIMING } from '@/config/constants'

interface ScrollPosition {
    scrollY: number
    direction: 'up' | 'down' | null
    showBackToTop: boolean   // true when scrollY > 400
    isAtTop: boolean
    isAtBottom: boolean
}

export function useScrollPosition(throttleMs = TIMING.THROTTLE_SCROLL): ScrollPosition {
    const [state, setState] = useState<ScrollPosition>({
        scrollY: 0,
        direction: null,
        showBackToTop: false,
        isAtTop: true,
        isAtBottom: false,
    })
    const lastY = useRef(0)
    const lastRan = useRef(0)

    useEffect(() => {
        const onScroll = () => {
            const now = Date.now()
            if (now - lastRan.current < throttleMs) return
            lastRan.current = now

            const y = window.scrollY
            const docHeight = document.documentElement.scrollHeight - window.innerHeight
            const direction = y > lastY.current ? 'down' : y < lastY.current ? 'up' : null
            lastY.current = y

            setState({
                scrollY: y,
                direction,
                showBackToTop: y > 400,
                isAtTop: y < 10,
                isAtBottom: docHeight > 0 && y >= docHeight - 10,
            })
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [throttleMs])

    return state
}

/** Scroll smoothly back to top */
export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
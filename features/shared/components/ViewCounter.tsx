'use client'

import { useEffect, useRef } from 'react'
import { Eye } from 'lucide-react'

interface Props {
    postId: string
    initialCount: number
}

/** Detect device type from viewport width */
function getDevice(): string {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    if (w < 768) return 'mobile'
    if (w < 1024) return 'tablet'
    return 'desktop'
}

export function ViewCounter({ postId, initialCount }: Props) {
    const tracked = useRef(false)

    useEffect(() => {
        if (tracked.current) return
        tracked.current = true

        fetch('/api/views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                postId,
                referrer: document.referrer || null,
                device: getDevice(),
            }),
            keepalive: true,
        }).catch(() => { }) // fire and forget
    }, [postId])

    return (
        <span className="inline-flex items-center gap-1 text-xs text-foreground-subtle">
            <Eye className="size-3.5" />
            {initialCount.toLocaleString()} views
        </span>
    )
}

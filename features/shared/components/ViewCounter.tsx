'use client'

import { useEffect, useRef } from 'react'
import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
    postId: string
    initialCount: number
    className?: string
}

/** Detect device type from viewport width */
function getDevice(): string {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    if (w < 768) return 'mobile'
    if (w < 1024) return 'tablet'
    return 'desktop'
}

export function ViewCounter({ postId, initialCount, className }: Props) {
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
        <span className={cn("inline-flex items-center gap-1.5 text-xs text-foreground-subtle", className)}>
            <Eye className="size-3.5 text-brand-500" />
            <span>{initialCount.toLocaleString()} Views</span>
        </span>
    )
}


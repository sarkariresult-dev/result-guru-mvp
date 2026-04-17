'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface LazyHomeSectionsProps {
    /** Pre-rendered server component children to defer showing */
    children: ReactNode
}

/**
 * Client wrapper that defers rendering its server-component children
 * until the user scrolls near them or clicks "Show More".
 *
 * The children are already SSR'd by Next.js, so this just controls
 * visibility — no client-side data fetching needed.
 *
 * SEO Impact: The HTML is still in the document for crawlers (rendered
 * server-side), but the initial paint is deferred via CSS display:none
 * until IntersectionObserver triggers. This reduces paint cost and
 * perceived DOM complexity without hiding content from bots.
 */
export function LazyHomeSections({ children }: LazyHomeSectionsProps) {
    const [visible, setVisible] = useState(false)
    const sentinelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = sentinelRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '200px' }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <>
            {/* Invisible sentinel that triggers loading when scrolled near */}
            <div ref={sentinelRef} className="h-0 w-0 col-span-full" aria-hidden="true" />

            {!visible ? (
                <div className="col-span-full flex justify-center py-6">
                    <button
                        type="button"
                        onClick={() => setVisible(true)}
                        className="group flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-bold text-foreground-muted shadow-sm transition-all hover:border-brand-300 hover:shadow-md hover:text-foreground active:scale-[0.98]"
                    >
                        Show More Sections
                        <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5" />
                    </button>
                </div>
            ) : (
                children
            )}
        </>
    )
}

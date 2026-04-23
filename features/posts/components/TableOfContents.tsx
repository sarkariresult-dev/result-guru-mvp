'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, ListTree } from 'lucide-react'
import type { TocItem } from '@/lib/content-processing'

// Re-export utilities so existing imports keep working
export { processContentHtml, extractTocFromHtml, wrapTablesForResponsive, optimizeContentImages } from '@/lib/content-processing'
export type { TocItem } from '@/lib/content-processing'

interface TableOfContentsProps {
    items: TocItem[]
}

export function TableOfContents({ items }: TableOfContentsProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    if (items.length < 2) return null

    return (
        <nav
            aria-label="Table of Contents"
            className="animate-fade-up"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-6 bg-brand-500" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-subtle">
                    On This Page
                </h2>
            </div>

            <ol className="space-y-4" role="list">
                {items.map((item, idx) => (
                    <li
                        key={item.id}
                        className="group relative"
                        style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                    >
                        <a
                            href={`#${item.id}`}
                            className="block text-xs font-bold text-foreground-muted transition-all hover:text-brand-600 leading-snug"
                        >
                            <span className="absolute -left-4 top-1/2 -translate-y-1/2 size-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            {item.text}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    )
}


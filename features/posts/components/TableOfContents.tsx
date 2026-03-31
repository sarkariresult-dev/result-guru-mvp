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
            className="py-2 animate-fade-up"
        >
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between text-left group"
            >
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.05em] text-foreground-muted group-hover:text-foreground transition-colors">
                    <ListTree className="size-4 text-brand-500" />
                    On This Page
                </h2>
                {isExpanded ? (
                    <ChevronDown className="size-4 text-foreground-muted" />
                ) : (
                    <ChevronRight className="size-4 text-foreground-muted" />
                )}
            </button>

            {isExpanded && (
                <ol className="mt-4 space-y-1.5 text-sm" role="list">
                    {items.map((item, idx) => (
                        <li
                            key={item.id}
                            style={{ paddingLeft: `${(item.level - 2) * 16}px` }}
                        >
                            <a
                                href={`#${item.id}`}
                                className="group flex items-start gap-2 rounded-md px-2 py-1 text-foreground-muted transition-colors hover:bg-background-subtle hover:text-brand-600"
                            >
                                <span className="mt-0.5 min-w-5 text-xs font-mono text-foreground-subtle group-hover:text-brand-500">
                                    {idx + 1}.
                                </span>
                                <span className="leading-snug">{item.text}</span>
                            </a>
                        </li>
                    ))}
                </ol>
            )}
        </nav>
    )
}


'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Tab { value: string; label: string }

interface TabsProps {
    tabs: Tab[]
    defaultValue?: string
    children: (activeTab: string) => ReactNode
    className?: string
}

export function Tabs({ tabs, defaultValue, children, className }: TabsProps) {
    const [active, setActive] = useState(defaultValue ?? tabs[0]?.value ?? '')

    return (
        <div className={className}>
            <div className="flex border-b border-border" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        role="tab"
                        aria-selected={active === tab.value}
                        onClick={() => setActive(tab.value)}
                        className={cn(
                            'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                            active === tab.value
                                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-foreground-muted hover:text-foreground'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="pt-4" role="tabpanel">
                {children(active)}
            </div>
        </div>
    )
}

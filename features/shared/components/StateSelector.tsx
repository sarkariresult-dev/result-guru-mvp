'use client'

import { useStates } from '@/hooks/useTaxonomy'
import { Loader2 } from 'lucide-react'

interface Props {
    value: string
    onChange: (value: string) => void
    className?: string
}

export function StateSelector({ value, onChange, className }: Props) {
    const { data: states, isLoading } = useStates()

    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={isLoading}
                className={`h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none disabled:opacity-50 ${className ?? ''}`}
                aria-label="Select state"
            >
                <option value="">All States</option>
                {states?.map((state) => (
                    <option key={state.slug} value={state.slug}>{state.name}</option>
                ))}
            </select>
            {isLoading && (
                <Loader2 className="absolute right-8 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-foreground-subtle" />
            )}
        </div>
    )
}

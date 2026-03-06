'use client'

import { QUALIFICATION_MAP } from '@/config/constants'

interface Props {
    value: string
    onChange: (value: string) => void
    className?: string
}

export function QualificationFilter({ value, onChange, className }: Props) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`h-9 rounded-lg border border-border bg-surface px-3 text-sm ${className ?? ''}`}
        >
            <option value="">All Qualifications</option>
            {Object.entries(QUALIFICATION_MAP).map(([slug, name]) => (
                <option key={slug} value={slug}>{name}</option>
            ))}
        </select>
    )
}

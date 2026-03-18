'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { APPLICATION_STATUSES } from '@/config/constants'
import { StateSelector } from '@/features/shared/components/StateSelector'
import { QualificationFilter } from '@/features/shared/components/QualificationFilter'

export function PostFilters({ basePath }: { basePath: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const update = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        params.delete('page')
        const qs = params.toString()
        router.push(qs ? `${basePath}?${qs}` : basePath)
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <select
                value={searchParams.get('status') ?? ''}
                onChange={(e) => update('status', e.target.value)}
                className="h-9 rounded-lg border border-border bg-surface px-3 text-sm transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                aria-label="Filter by status"
            >
                <option value="">All Status</option>
                {APPLICATION_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>

            <StateSelector
                value={searchParams.get('state') ?? ''}
                onChange={(v) => update('state', v)}
            />

            <QualificationFilter
                value={searchParams.get('qualification') ?? ''}
                onChange={(v) => update('qualification', v)}
            />
        </div>
    )
}

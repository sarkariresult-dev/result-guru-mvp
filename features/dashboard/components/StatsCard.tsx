import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'

interface Props {
    title: string
    value: string | number
    description?: string
    icon: ComponentType<{ className?: string }>
    trend?: { value: number; positive: boolean }
    className?: string
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: Props) {
    return (
        <div className={cn('rounded-xl border border-border bg-surface p-6', className)}>
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground-muted">{title}</p>
                <Icon className="size-5 text-foreground-subtle" />
            </div>
            <div className="mt-2">
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                {trend && (
                    <p className={cn('mt-1 text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-600')}>
                        {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        <span className="text-foreground-subtle"> from last month</span>
                    </p>
                )}
                {description && <p className="mt-1 text-xs text-foreground-subtle">{description}</p>}
            </div>
        </div>
    )
}

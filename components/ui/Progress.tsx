import { cn } from '@/lib/utils'

interface ProgressProps {
    value: number
    max?: number
    className?: string
    label?: string
}

export function Progress({ value, max = 100, className, label }: ProgressProps) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100))
    return (
        <div className={cn('w-full', className)}>
            {label && (
                <div className="mb-1 flex justify-between text-xs text-foreground-muted">
                    <span>{label}</span>
                    <span>{Math.round(pct)}%</span>
                </div>
            )}
            <div className="h-2 w-full overflow-hidden rounded-full bg-background-subtle">
                <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                />
            </div>
        </div>
    )
}

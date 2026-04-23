import { ShieldCheck, Truck, RotateCcw, BadgeCheck } from 'lucide-react'

const BADGES = [
    { icon: ShieldCheck, label: '100% Verified', sublabel: 'Genuine products' },
    { icon: Truck, label: 'Fast Delivery', sublabel: 'Quick access' },
    { icon: RotateCcw, label: 'Easy Returns', sublabel: 'Hassle-free' },
    { icon: BadgeCheck, label: 'Best Quality', sublabel: 'Top rated' },
] as const

interface Props {
    compact?: boolean
}

export function TrustBadges({ compact = false }: Props) {
    if (compact) {
        return (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-foreground-subtle">
                {BADGES.map(b => (
                    <span key={b.label} className="flex items-center gap-1">
                        <b.icon className="size-3 text-brand-600 dark:text-brand-400" />
                        {b.label}
                    </span>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-4">
            {BADGES.map(b => (
                <div key={b.label} className="flex flex-col items-center justify-center space-y-1.5 text-center py-2">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
                        <b.icon className="size-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <span className="text-xs font-bold text-foreground">{b.label}</span>
                    <span className="text-[10px] text-foreground-subtle">{b.sublabel}</span>
                </div>
            ))}
        </div>
    )
}

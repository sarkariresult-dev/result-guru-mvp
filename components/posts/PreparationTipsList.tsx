import { Lightbulb } from 'lucide-react'
import type { PreparationTips } from '@/types/post-content.types'

interface Props {
    tips: PreparationTips | unknown
}

export function PreparationTipsList({ tips }: Props) {
    const t = Array.isArray(tips) ? tips : []
    if (t.length === 0) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-border bg-background-muted/50 px-6 py-4 flex items-center gap-3">
                <div className="icon-badge bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                    <Lightbulb className="size-4.5" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">Preparation Tips & Strategy</h2>
            </div>
            <ul className="divide-y divide-border/60">
                {t.map((tip: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-4 px-6 py-4 hover:bg-background-subtle transition-colors">
                        <span className="flex size-7 mt-0.5 shrink-0 items-center justify-center rounded-full bg-brand-100/50 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                            {idx + 1}
                        </span>
                        <span className="leading-relaxed text-sm font-medium text-foreground-muted">{tip}</span>
                    </li>
                ))}
            </ul>
        </section>
    )
}

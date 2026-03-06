import { CheckCircle2 } from 'lucide-react'

export function SelectionProcessList({ steps }: { steps: string[] }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-border bg-background-muted/50 px-6 py-4">
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-brand-600 dark:text-brand-400" />
                    Selection Process
                </h3>
            </div>
            <ol className="divide-y divide-border/60">
                {steps.map((step, i) => (
                    <li key={i} className="flex gap-4 px-6 py-4 transition-colors hover:bg-background-subtle">
                        <span className="step-number bg-brand-100/50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                            {i + 1}
                        </span>
                        <span className="text-sm font-medium leading-relaxed text-foreground-muted">{step}</span>
                    </li>
                ))}
            </ol>
        </div>
    )
}

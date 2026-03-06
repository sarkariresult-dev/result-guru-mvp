import { Users } from 'lucide-react'

export function VacancyDetailsBox({ details }: { details: Record<string, unknown> }) {
    // Filter out entries with empty/null values
    const entries = Object.entries(details).filter(([, v]) => v != null && String(v).trim() !== '')
    if (entries.length === 0) return null

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-border bg-background-muted/50 px-6 py-4">
                <div className="icon-badge bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <Users className="size-4.5" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Vacancy Details</h3>
            </div>
            <div className="divide-y divide-border/60">
                {entries.map(([key, value], index) => (
                    <div
                        key={key}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-6 py-4 transition-colors hover:bg-background-subtle ${index % 2 === 0 ? 'bg-surface' : 'bg-background-muted/20'}`}
                    >
                        <span className="text-sm font-medium text-foreground-muted sm:max-w-[50%]">{key}</span>
                        <span className="text-sm font-bold text-foreground sm:text-right">{String(value)}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

import { TrendingUp } from 'lucide-react'

interface Props {
    marks: Record<string, unknown>
}

export function CutOffMarksBox({ marks }: Props) {
    if (!marks || Object.keys(marks).length === 0) return null

    // Filter out entries with empty/null values
    const entries = Object.entries(marks).filter(([, v]) => v != null && String(v).trim() !== '')
    if (entries.length === 0) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-border bg-background-muted/50 px-6 py-4 flex items-center gap-3">
                <div className="icon-badge bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                    <TrendingUp className="size-4.5" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">Cut Off Marks</h2>
            </div>
            <div className="p-6">
                <div className="overflow-hidden rounded-xl border border-border/60">
                    <table className="min-w-full divide-y divide-border/60 text-left text-sm">
                        <thead className="bg-background-muted/30">
                            <tr>
                                <th className="px-5 py-3.5 font-bold text-foreground-muted uppercase tracking-wider text-xs">Category</th>
                                <th className="px-5 py-3.5 font-bold text-foreground-muted uppercase tracking-wider text-xs">Cut Off Marks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 bg-background">
                            {entries.map(([key, value]) => (
                                <tr key={key} className="hover:bg-background-subtle transition-colors">
                                    <td className="px-5 py-4 font-semibold text-foreground">{key}</td>
                                    <td className="px-5 py-4 font-bold text-foreground">{value as string}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}

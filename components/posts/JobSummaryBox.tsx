interface Props {
    ageLimit: Record<string, string>
    payScale: Record<string, string>
    totalVacancies: number | null
}

export function JobSummaryBox({ ageLimit, payScale, totalVacancies }: Props) {
    if (!totalVacancies && Object.keys(ageLimit).length === 0 && Object.keys(payScale).length === 0) return null

    return (
        <section className="">

            <div className="p-6 space-y-6">
                {totalVacancies !== null && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-900/40 dark:bg-brand-900/20">
                        <span className="text-sm font-bold uppercase tracking-widest text-brand-700 dark:text-brand-300">Total Vacancies</span>
                        <span className="font-display text-3xl font-extrabold text-brand-600 dark:text-brand-400">{totalVacancies.toLocaleString()} Posts</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.keys(ageLimit).length > 0 && (
                        <div className="rounded-xl border border-border/50 bg-background-subtle">
                            <div className="border-b border-border/50 bg-background-muted/30 px-5 py-3">
                                <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground-muted">
                                    ⏳ Age Limit
                                </span>
                            </div>
                            <div className="divide-y divide-border/50">
                                {Object.entries(ageLimit).map(([key, val]) => (
                                    <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-5 py-3.5 hover:bg-surface transition-colors">
                                        <span className="text-sm font-medium text-foreground-muted sm:max-w-[55%]">{key}</span>
                                        <span className="text-sm font-bold text-foreground sm:text-right">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {Object.keys(payScale).length > 0 && (
                        <div className="rounded-xl border border-border/50 bg-background-subtle">
                            <div className="border-b border-border/50 bg-background-muted/30 px-5 py-3">
                                <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground-muted">
                                    💰 Pay Scale / Salary
                                </span>
                            </div>
                            <div className="divide-y divide-border/50">
                                {Object.entries(payScale).map(([key, val]) => (
                                    <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-5 py-3.5 hover:bg-surface transition-colors">
                                        <span className="text-sm font-medium text-foreground-muted sm:max-w-[55%]">{key}</span>
                                        <span className="text-sm font-bold text-foreground sm:text-right">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

import { FileStack } from 'lucide-react'

interface Props {
    patterns: unknown
}

export function ExamPatternBox({ patterns }: Props) {
    const p = Array.isArray(patterns) ? patterns : []
    if (p.length === 0) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-border bg-background-muted/50 px-6 py-4 flex items-center gap-3">
                <div className="icon-badge bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <FileStack className="size-4.5" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">Exam Pattern</h2>
            </div>
            <div className="p-6 space-y-6">
                {p.map((pattern: any, idx: number) => {
                    // Support both template format {paper,questions,marks,duration,type}
                    // and typed format {stage,sections,total_marks,...}
                    const title = pattern.paper || pattern.stage || pattern.exam_phase || `Stage ${idx + 1}`
                    const sections = pattern.sections || pattern.subjects || []
                    const hasSubTable = Array.isArray(sections) && sections.length > 0

                    return (
                        <div key={idx} className="rounded-xl border border-border/60 overflow-hidden bg-background">
                            <div className="bg-background-muted/30 px-5 py-3 border-b border-border/60 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-bold text-brand-700 dark:text-brand-300">{title}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {(pattern.type || pattern.mode) && (
                                        <span className="text-xs font-bold bg-brand-100/50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2.5 py-1 rounded-full">
                                            {pattern.type || (pattern.mode === 'online' ? 'Online CBT' : 'Offline')}
                                        </span>
                                    )}
                                    {(pattern.marks || pattern.total_marks) && (
                                        <span className="text-xs font-bold bg-orange-100/50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-2.5 py-1 rounded-full">
                                            {pattern.marks || pattern.total_marks} Marks
                                        </span>
                                    )}
                                    {pattern.duration && (
                                        <span className="text-xs font-bold bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-full">
                                            {pattern.duration}
                                        </span>
                                    )}
                                    {pattern.questions && (
                                        <span className="text-xs font-bold bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2.5 py-1 rounded-full">
                                            {pattern.questions} Qs
                                        </span>
                                    )}
                                </div>
                            </div>
                            {hasSubTable ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-border/60 text-left text-sm">
                                        <thead className="bg-background-subtle">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold text-foreground-muted uppercase tracking-wider text-xs">Section</th>
                                                <th className="px-5 py-3 font-semibold text-foreground-muted uppercase tracking-wider text-xs">Questions</th>
                                                <th className="px-5 py-3 font-semibold text-foreground-muted uppercase tracking-wider text-xs">Marks</th>
                                                <th className="px-5 py-3 font-semibold text-foreground-muted uppercase tracking-wider text-xs">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60 bg-surface">
                                            {sections.map((sub: any, i: number) => (
                                                <tr key={i} className="hover:bg-background-subtle transition-colors">
                                                    <td className="px-5 py-3.5 font-medium text-foreground">{sub.name || sub.subject || '–'}</td>
                                                    <td className="px-5 py-3.5 font-bold text-foreground">{sub.questions ?? '–'}</td>
                                                    <td className="px-5 py-3.5 font-bold text-foreground">{sub.marks ?? '–'}</td>
                                                    <td className="px-5 py-3.5 text-foreground-muted">
                                                        {sub.duration_min ? `${sub.duration_min} min` : sub.duration_minutes ? `${sub.duration_minutes} min` : '–'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-5 py-4 text-sm text-foreground-muted">
                                    {pattern.negative_marking !== undefined && (
                                        <span className="block">Negative Marking: {pattern.negative_marking ? 'Yes' : 'No'}
                                            {pattern.negative_marks_per_question ? ` (−${pattern.negative_marks_per_question} per wrong answer)` : ''}
                                        </span>
                                    )}
                                    {pattern.qualifying && <span className="block mt-1 text-xs text-foreground-subtle">This stage is qualifying only — marks not counted in final merit.</span>}
                                    {pattern.note && <span className="block mt-1">{pattern.note}</span>}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

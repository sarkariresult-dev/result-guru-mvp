import { BookOpen } from 'lucide-react'
import type { SyllabusSections } from '@/types/post-content.types'

interface Props {
    sections: SyllabusSections | unknown
}

export function SyllabusBox({ sections }: Props) {
    const s = Array.isArray(sections) ? sections : []
    if (s.length === 0) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-border bg-background-muted/50 px-6 py-4 flex items-center gap-3">
                <div className="icon-badge bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                    <BookOpen className="size-4.5" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">Syllabus Overview</h2>
            </div>
            <div className="p-6 space-y-6">
                {s.map((section: any, idx: number) => (
                    <div key={idx} className="rounded-xl border border-border/60 overflow-hidden bg-background">
                        <div className="bg-background-muted/30 px-5 py-3 border-b border-border/60 flex flex-wrap gap-2 justify-between items-center transition-colors hover:bg-background-subtle">
                            <h3 className="font-bold text-foreground">{section.subject}</h3>
                            {section.marks && (
                                <span className="text-xs font-bold text-brand-700 bg-brand-100/50 px-2.5 py-1 rounded-full dark:text-brand-300 dark:bg-brand-900/30">
                                    {section.marks} Marks
                                </span>
                            )}
                        </div>
                        {section.topics && section.topics.length > 0 ? (
                            <ul className="list-disc pl-9 pr-6 py-4 text-sm text-foreground-muted space-y-2 marker:text-brand-400">
                                {section.topics.map((topic: string, i: number) => (
                                    <li key={i} className="pl-1 leading-relaxed font-medium">{topic}</li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-6 py-4 text-sm text-foreground-subtle italic">No specific topics listed.</div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}

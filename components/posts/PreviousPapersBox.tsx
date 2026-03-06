import { Download, FileDown } from 'lucide-react'

interface Props {
    papers: unknown
}

export function PreviousPapersBox({ papers }: Props) {
    const p = Array.isArray(papers) ? papers : []
    if (p.length === 0) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-border bg-background-muted/50 px-6 py-4 flex items-center gap-3">
                <div className="icon-badge bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                    <FileDown className="size-4.5" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">Previous Year Papers</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {p.map((item: any, idx: number) => {
                    const href = item.url || item.pdf_url || item.link || ''
                    const title = item.title || item.exam || 'Download Paper'
                    const year = item.year
                    const isSolved = item.is_solved
                    const hasLink = !!href

                    return (
                        <div
                            key={idx}
                            className={`group flex flex-col justify-between rounded-xl border border-border/60 bg-background p-5 transition-all ${hasLink ? 'hover:bg-background-subtle hover:border-brand-500 hover:shadow-sm cursor-pointer' : 'opacity-70'}`}
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {year && (
                                        <span className="inline-block rounded-md bg-background-muted px-2.5 py-1 text-xs font-bold tracking-wide text-foreground-muted uppercase">
                                            {year}
                                        </span>
                                    )}
                                    {isSolved && (
                                        <span className="inline-block rounded-md bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">
                                            Solved
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-foreground group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                                    {title}
                                </h3>
                            </div>
                            {hasLink ? (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-5 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400 focus-ring rounded"
                                >
                                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">Download PDF</span>
                                    <Download className="size-4" />
                                </a>
                            ) : (
                                <span className="mt-5 text-xs font-medium text-foreground-subtle italic">Link will be updated</span>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

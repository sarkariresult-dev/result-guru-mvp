import { ExternalLink, Download, FileCheck } from 'lucide-react'

interface ActionLink {
    href: string
    label: string
    icon: 'external' | 'download' | 'check'
    primary?: boolean
}

interface Props {
    links: ActionLink[]
}

export function ActionCenter({ links }: Props) {
    if (links.length === 0) return null

    return (
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-10">
            {links.map((link, i) => (
                <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={`
                        group relative flex items-center justify-between gap-4 rounded-2xl p-4 transition-all active:scale-[0.98]
                        ${link.primary 
                            ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/20 hover:bg-brand-700' 
                            : 'bg-surface border border-border text-foreground hover:border-brand-400 hover:shadow-lg'
                        }
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div className={`
                            flex size-10 items-center justify-center rounded-xl transition-colors
                            ${link.primary ? 'bg-white/20' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'}
                        `}>
                            {link.icon === 'download' ? (
                                <Download className="size-5" />
                            ) : link.icon === 'check' ? (
                                <FileCheck className="size-5" />
                            ) : (
                                <ExternalLink className="size-5" />
                            )}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
                    </div>
                    <div className={`
                        flex size-6 items-center justify-center rounded-full transition-transform group-hover:translate-x-1
                        ${link.primary ? 'bg-white/20' : 'bg-brand-100/50 dark:bg-brand-800/30'}
                    `}>
                        <ExternalLink className="size-3" />
                    </div>
                </a>
            ))}
        </div>
    )
}

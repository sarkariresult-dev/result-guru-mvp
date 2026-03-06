import { Building2, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Props {
    name: string | null
    shortName: string | null
    logoUrl: string | null
    officialUrl: string | null
    description?: string | null
    slug?: string | null
}

export function OrgInfoBox({ name, shortName, logoUrl, officialUrl, description, slug }: Props) {
    if (!name) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 border-b border-border bg-background-muted/50 px-6 py-4">
                <div className="icon-badge bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Building2 className="size-4.5" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Organization Details</h3>
            </div>
            <div className="p-6">
                <div className="flex items-start gap-5">
                    {logoUrl && (
                        <div className="shrink-0 size-16 rounded-xl border border-border/60 bg-background flex items-center justify-center overflow-hidden p-2">
                            <Image
                                src={logoUrl}
                                alt={`${shortName || name} logo`}
                                width={48}
                                height={48}
                                className="object-contain"
                            />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground text-base leading-snug">{name}</h4>
                        {shortName && shortName !== name && (
                            <span className="mt-0.5 inline-block rounded-md bg-background-muted px-2 py-0.5 text-xs font-bold tracking-wide text-foreground-muted uppercase">
                                {shortName}
                            </span>
                        )}
                        {description && (
                            <p className="mt-2 text-sm text-foreground-muted leading-relaxed line-clamp-3">{description}</p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            {officialUrl && (
                                <a
                                    href={officialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-300 dark:hover:bg-brand-900/40"
                                >
                                    <ExternalLink className="size-3" />
                                    Official Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

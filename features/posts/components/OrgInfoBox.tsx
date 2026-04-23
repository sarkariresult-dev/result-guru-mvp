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
        <div className="py-2 space-y-4 text-center border-b border-border">
            <div className="flex items-center gap-4">
                {logoUrl && (
                    <div className="shrink-0 size-14 rounded-xl border border-border/40 bg-background flex items-center justify-center overflow-hidden p-1.5 shadow-sm">
                        <Image
                            src={logoUrl}
                            alt={`${shortName || name} logo`}
                            width={40}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm leading-tight">{name}</h3>
                    {shortName && shortName !== name && (
                        <p className="mt-1 text-[10px] font-bold text-foreground-subtle tracking-wider uppercase">{shortName}</p>
                    )}
                </div>
            </div>

            {description && (
                <p className="text-xs text-foreground-muted leading-relaxed line-clamp-3">{description}</p>
            )}

            {officialUrl && (
                <a
                    href={officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors py-1 group"
                >
                    Visit Official Website
                </a>
            )}
        </div>
    )
}

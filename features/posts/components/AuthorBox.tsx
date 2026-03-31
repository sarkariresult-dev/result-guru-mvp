import { BadgeCheck } from 'lucide-react'
import Image from 'next/image'
import type { AuthorInfo } from '@/types/user.types'

interface Props {
    author: AuthorInfo
}

export function AuthorBox({ author }: Props) {
    if (!author) return null

    const initials = author.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="mt-16 pt-8 border-t border-border animate-fade-up">
            <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                    {author.avatar_url ? (
                        <div className="size-16 rounded-full border border-border/60 p-0.5 overflow-hidden shadow-sm">
                            <Image
                                src={author.avatar_url}
                                alt={author.name}
                                width={64}
                                height={64}
                                className="rounded-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="size-16 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100 text-brand-600 font-bold text-xl uppercase dark:bg-brand-900/20 dark:text-brand-400">
                            {initials}
                        </div>
                    )}
                    {/* Verified Icon Badge overlay */}
                    <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm dark:border-surface">
                        <BadgeCheck className="size-4" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest dark:text-brand-400">Written By</span>
                        <h4 className="font-bold text-foreground text-lg leading-tight">{author.name}</h4>
                    </div>
                    {author.bio ? (
                        <p className="mt-2 text-sm text-foreground-muted leading-relaxed italic">
                            &ldquo;{author.bio}&rdquo;
                        </p>
                    ) : (
                        <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                            Content Specialist at Result Guru, ensuring accurate and up-to-date information for all readers.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

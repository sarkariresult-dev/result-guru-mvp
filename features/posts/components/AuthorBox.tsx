'use client'

import { useState, useEffect } from 'react'
import { BadgeCheck, Twitter, Linkedin, Facebook, Award, Briefcase } from 'lucide-react'
import Image from 'next/image'
import type { AuthorInfo } from '@/types/user.types'

interface Props {
    author: AuthorInfo
}

export function AuthorBox({ author }: Props) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return <AuthorBoxContent author={author} />
}

function AuthorBoxContent({ author }: Props) {
    if (!author) return null

    const initials = author.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
        .slice(0, 2)

    return (
        <div className="mt-20 pt-10 border-t border-border/60">
            <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Author Avatar */}
                <div className="relative shrink-0">
                    {author.avatar_url ? (
                        <div className="size-20 rounded-full bg-background-subtle ring-4 ring-brand-50/50 dark:ring-brand-900/10 overflow-hidden shadow-xs">
                            <Image
                                src={author.avatar_url}
                                alt={author.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="size-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-black text-2xl ring-4 ring-brand-50/50 dark:bg-brand-900/20 dark:text-brand-400">
                            {initials}
                        </div>
                    )}
                    {/* Editorial Seal */}
                    <div className="absolute -bottom-1 -right-1 size-7 flex items-center justify-center rounded-full bg-brand-600 text-white shadow-sm ring-2 ring-white dark:ring-surface">
                        <BadgeCheck className="size-4.5" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-px w-6 bg-brand-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-subtle">
                            Verified Publication Authority
                        </span>
                    </div>

                    <h4 className="text-2xl font-black text-foreground tracking-tight mb-3">
                        {author.name}
                    </h4>

                    {author.bio ? (
                        <p className="text-sm text-foreground-muted leading-relaxed font-medium max-w-2xl">
                            {author.bio}
                        </p>
                    ) : (
                        <p className="text-sm text-foreground-muted leading-relaxed font-medium max-w-2xl">
                            Editorial Director and Senior Recruitment Analyst at Result Guru. Specialized in verifying high-stakes government examinations and analyzing notification policy changes with over a decade of industry expertise.
                        </p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center gap-4">
                        {author.credentials && (
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">
                                <Award className="size-3.5" />
                                {author.credentials}
                            </div>
                        )}
                        {author.social_links && Object.keys(author.social_links).length > 0 && (
                            <div className="flex items-center gap-3 border-l border-border pl-4">
                                {author.social_links.twitter && (
                                    <a href={author.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-foreground-subtle hover:text-brand-600 transition-colors">
                                        <Twitter className="size-4" />
                                    </a>
                                )}
                                {author.social_links.linkedin && (
                                    <a href={author.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-foreground-subtle hover:text-brand-600 transition-colors">
                                        <Linkedin className="size-4" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

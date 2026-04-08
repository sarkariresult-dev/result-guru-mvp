import { BadgeCheck, Twitter, Linkedin, Facebook, Award, Briefcase } from 'lucide-react'
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
        .slice(0, 2)

    return (
        <div className="mt-16 pt-8 border-t border-border animate-fade-up">
            <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                    {author.avatar_url ? (
                        <div className="size-16 rounded-full border border-border/60 p-0.5 overflow-hidden shadow-sm lg:size-20">
                            <Image
                                src={author.avatar_url}
                                alt={author.name}
                                width={80}
                                height={80}
                                className="rounded-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="size-16 rounded-full bg-brand-50 flex items-center justify-center border border-brand-100 text-brand-600 font-bold text-xl uppercase dark:bg-brand-900/20 dark:text-brand-400 lg:size-20 lg:text-2xl">
                            {initials}
                        </div>
                    )}
                    {/* Verified Icon Badge overlay */}
                    <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-sm dark:border-surface lg:size-7">
                        <BadgeCheck className="size-4 lg:size-5" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest dark:text-brand-400">Written By</span>
                            <h4 className="font-bold text-foreground text-lg leading-tight lg:text-xl">{author.name}</h4>
                        </div>
                        
                        {(author.credentials || author.years_of_experience) && (
                            <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-4">
                                {author.credentials && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background-subtle border border-border text-[11px] font-bold text-foreground-muted">
                                        <Award className="size-3 text-brand-500" />
                                        {author.credentials}
                                    </div>
                                )}
                                {author.years_of_experience && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background-subtle border border-border text-[11px] font-bold text-foreground-muted">
                                        <Briefcase className="size-3 text-brand-500" />
                                        {author.years_of_experience}+ Years Exp.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {author.bio ? (
                        <p className="mt-4 text-sm text-foreground-muted leading-relaxed italic">
                            &ldquo;{author.bio}&rdquo;
                        </p>
                    ) : (
                        <p className="mt-4 text-sm text-foreground-muted leading-relaxed">
                            Senior Content Strategist at {author.name && 'Result Guru'}, specializing in large-scale government notification verification and educational policy impact.
                        </p>
                    )}

                    {/* Social Verification Links */}
                    {author.social_links && Object.keys(author.social_links).length > 0 && (
                        <div className="mt-4 flex items-center gap-4">
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
                            {author.social_links.facebook && (
                                <a href={author.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-foreground-subtle hover:text-brand-600 transition-colors">
                                    <Facebook className="size-4" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

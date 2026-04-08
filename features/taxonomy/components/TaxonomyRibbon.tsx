import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import Link from 'next/link'
import { createStaticClient } from '@/lib/supabase/static'
import { ChevronRight, MapPin, GraduationCap, Building2 } from 'lucide-react'
import type { State, Organization, Qualification } from '@/types/taxonomy.types'

// ── Cached fetches for Top Taxonomy Entities ─────────────────────────

export const getTopStates = cache(unstable_cache(
    async (): Promise<Pick<State, 'slug' | 'name'>[]> => {
        const supabase = createStaticClient()
        const { data } = await supabase
            .from('states')
            .select('slug, name')
            .limit(10)
        return (data || []) as Pick<State, 'slug' | 'name'>[]
    },
    ['top-states-v3'],
    { revalidate: 3600, tags: ['states'] } // 1 hour
))

export const getTopOrgs = cache(unstable_cache(
    async (): Promise<Pick<Organization, 'slug' | 'name' | 'short_name'>[]> => {
        const supabase = createStaticClient()
        const { data } = await supabase
            .from('organizations')
            .select('slug, name, short_name')
            // Just picking popular ones, you could sort by a views or featured column if they existed
            .limit(15)
        return (data || []) as Pick<Organization, 'slug' | 'name' | 'short_name'>[]
    },
    ['top-orgs-v3'],
    { revalidate: 3600, tags: ['organizations'] }
))

export const getTopQualifications = cache(unstable_cache(
    async (): Promise<Pick<Qualification, 'slug' | 'name' | 'short_name'>[]> => {
        const supabase = createStaticClient()
        const { data } = await supabase
            .from('qualifications')
            .select('slug, name, short_name')
            .limit(8)
        return (data || []) as Pick<Qualification, 'slug' | 'name' | 'short_name'>[]
    },
    ['top-quals-v3'],
    { revalidate: 3600, tags: ['qualifications'] }
))

// ── Component ────────────────────────────────────────────────────────

interface Props {
    typeSlug: string
    layout?: 'ribbon' | 'sidebar'
}

export async function TaxonomyRibbon({ typeSlug, layout = 'ribbon' }: Props) {
    const [states, orgs, quals] = await Promise.all([
        getTopStates(),
        getTopOrgs(),
        getTopQualifications()
    ])

    if (!states.length && !orgs.length && !quals.length) return null

    if (layout === 'sidebar') {
        return (
            <div className="space-y-8 animate-fade-in group/sidebar">
                {/* Qualifications Section */}
                {quals.length > 0 && (
                    <section>
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground-subtle">
                            <GraduationCap className="size-4 text-brand-500" />
                            Qualifications
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            {quals.map(q => (
                                <Link
                                    key={q.slug}
                                    href={`/${typeSlug}/for/${q.slug}`}
                                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-all hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/20"
                                >
                                    <span>{q.short_name || q.name}</span>
                                    <ChevronRight className="size-3.5 opacity-0 -translate-x-2 transition-all group-hover/sidebar:opacity-20 group-hover/sidebar:translate-x-0" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* States Section */}
                {states.length > 0 && (
                    <section>
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground-subtle">
                            <MapPin className="size-4 text-accent-500" />
                            By State
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            {states.map(s => (
                                <Link
                                    key={s.slug}
                                    href={`/${typeSlug}/in/${s.slug}`}
                                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-all hover:bg-accent-50 hover:text-accent-700 dark:hover:bg-accent-950/30"
                                >
                                    <span>{s.name}</span>
                                    <ChevronRight className="size-3.5 opacity-0 -translate-x-2 transition-all group-hover/sidebar:opacity-20 group-hover/sidebar:translate-x-0" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Boards Section */}
                {orgs.length > 0 && (
                    <section>
                        <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground-subtle">
                            <Building2 className="size-4 text-brand-500" />
                            Top Boards
                        </h3>
                        <div className="flex flex-col gap-1.5 text-balance">
                            {orgs.map(o => (
                                <Link
                                    key={o.slug}
                                    href={`/${typeSlug}/org/${o.slug}`}
                                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-all hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/20"
                                >
                                    <span className="line-clamp-1">{o.short_name || o.name}</span>
                                    <ChevronRight className="size-3.5 opacity-0 -translate-x-2 transition-all group-hover/sidebar:opacity-20 group-hover/sidebar:translate-x-0" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        )
    }

    return (
        <div className="mb-6 space-y-4 animate-fade-in fade-in-out-duration-500">
            {/* Qualifications Ribbon */}
            {quals.length > 0 && (
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-subtle shrink-0">
                        <GraduationCap className="size-3.5 text-brand-500" /> Qualification
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide shrink-0 w-full sm:w-auto pr-4 mask-fade-right">
                        {quals.map(q => (
                            <Link
                                key={q.slug}
                                href={`/${typeSlug}/for/${q.slug}`}
                                className="whitespace-nowrap rounded-lg border border-border bg-background-subtle px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 active:scale-95"
                            >
                                {q.short_name || q.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* States Ribbon */}
            {states.length > 0 && (
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-subtle shrink-0">
                        <MapPin className="size-3.5 text-accent-500" /> State
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide shrink-0 w-full sm:w-auto pr-4 mask-fade-right">
                        {states.map(s => (
                            <Link
                                key={s.slug}
                                href={`/${typeSlug}/in/${s.slug}`}
                                className="whitespace-nowrap rounded-lg border border-border bg-background-subtle px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700 dark:hover:bg-accent-950/30 active:scale-95"
                            >
                                {s.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Organizations Ribbon */}
            {orgs.length > 0 && (
                <div className="flex items-center gap-3 overflow-hidden">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground-subtle shrink-0">
                        <Building2 className="size-3.5 text-brand-500" /> Board
                    </span>
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide shrink-0 w-full sm:w-auto pr-4 mask-fade-right">
                        {orgs.map(o => (
                            <Link
                                key={o.slug}
                                href={`/${typeSlug}/org/${o.slug}`}
                                className="whitespace-nowrap rounded-lg border border-border bg-background-subtle px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900/30 active:scale-95"
                            >
                                {o.short_name || o.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}


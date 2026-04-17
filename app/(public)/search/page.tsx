import type { Metadata } from 'next'
import Link from 'next/link'
import { searchPosts, getPosts } from '@/features/posts/queries'
import { PostCard } from '@/types/post.types'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { SearchBar } from '@/features/shared/components/SearchBar'
import { AdZone } from '@/components/ads/AdZone'
import { buildPageMetadata } from '@/lib/metadata'
import { ROUTE_PREFIXES } from '@/config/site'
import { Search, ServerCrash, Briefcase, FileText, CreditCard, Key, Compass, ArrowUpRight, MessageSquare, Shield, CheckCircle2 } from 'lucide-react'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    const { q } = await searchParams
    const query = q?.trim() || ""
    const isSearchActionTest = query === '{search_term_string}'
    const shouldIndex = !query || isSearchActionTest

    return buildPageMetadata({
        title: !shouldIndex ? `Search: ${query}` : 'Search Results',
        description: 'Search government jobs, results, admit cards, answer keys, syllabus, and exam updates across India.',
        path: '/search',
        noindex: !shouldIndex,
    })
}

const QUICK_LINKS = [
    { label: 'Sarkari Jobs', href: ROUTE_PREFIXES.job, icon: Briefcase, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/30' },
    { label: 'Exam Results', href: ROUTE_PREFIXES.result, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { label: 'Admit Cards', href: ROUTE_PREFIXES.admit, icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
    { label: 'Answer Keys', href: ROUTE_PREFIXES.answer_key, icon: Key, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30' },
]

interface Props {
    searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
    const { q } = await searchParams
    const trimmedQuery = q?.trim() ?? ''

    // Detect if this is the literal placeholder from Google GSC
    const isSearchActionTest = trimmedQuery === '{search_term_string}'

    // Treat the placeholder as empty for rendering purposes to avoid "No results" Soft 404
    const effectiveQuery = isSearchActionTest ? '' : trimmedQuery

    let posts: PostCard[] = []
    let fetchError = false

    try {
        if (effectiveQuery) {
            posts = await searchPosts(effectiveQuery)
        } else {
            posts = await getPosts({}, 1, 12)
        }
    } catch (err) {

        fetchError = true
    }

    return (
        <>
            {/* 1. Professional Hub Header */}
            <header className="relative bg-slate-50 border-b border-border/50 pt-16 pb-12 sm:pt-24 sm:pb-20 dark:bg-slate-950/20 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
                    <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent-500/5 blur-[100px]" />
                </div>

                <div className="container relative mx-auto max-w-7xl px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 dark:bg-brand-900/30 dark:border-brand-800/50 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <Compass className="size-3.5 text-brand-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">Search Intelligence</span>
                    </div>

                    <h1 className="text-4xl font-black text-foreground sm:text-6xl mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        {effectiveQuery ? (
                            <>Results for <span className="text-gradient-brand">&ldquo;{effectiveQuery}&rdquo;</span></>
                        ) : (
                            <>Explore <span className="text-gradient-brand">Latest Updates.</span></>
                        )}
                    </h1>

                    <div className="mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        <SearchBar initialValue={effectiveQuery} />
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 py-16 sm:py-24">
                {fetchError ? (
                    <div className="flex min-h-75 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-8 sm:p-20 text-center">
                        <div className="mb-6 rounded-2xl bg-red-100 dark:bg-red-900/30 p-5">
                            <ServerCrash className="size-10 text-red-600" />
                        </div>
                        <h3 className="mb-4 text-2xl font-black text-foreground">Search System Offline</h3>
                        <p className="text-foreground-muted max-w-md mx-auto leading-relaxed">
                            We&apos;re experiencing a high load on our live verification pipeline. Please try refreshing in a few moments.
                        </p>
                    </div>
                ) : posts.length > 0 ? (
                    <div className="animate-in fade-in duration-700">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="h-px grow bg-border/50" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground-muted whitespace-nowrap">
                                {effectiveQuery
                                    ? `${posts.length} Verified results found`
                                    : 'Showing 12 Newest Gazettes'
                                }
                            </span>
                            <div className="h-px grow bg-border/50" />
                        </div>

                        <PostGrid posts={posts} />
                        <AdZone zoneSlug="below_content" className="mt-16" />
                    </div>
                ) : (
                    <div className="space-y-24">
                        {/* No results fallback */}
                        {effectiveQuery ? (
                            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-border bg-surface p-8 sm:p-20 text-center shadow-xl shadow-slate-200/50 dark:shadow-none">
                                <div className="mb-8 rounded-3xl bg-slate-50 dark:bg-slate-900 p-6 border border-border">
                                    <Search className="size-12 text-slate-400 stroke-[1.5]" />
                                </div>
                                <h3 className="mb-4 text-3xl font-black text-foreground">No matches found</h3>
                                <p className="text-foreground-muted max-w-md mx-auto mb-10 text-lg leading-relaxed">
                                    We couldn&apos;t find anything matching &ldquo;{effectiveQuery}&rdquo; in our live gazette repository.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-4">
                                    <Link
                                        href="/site-map"
                                        className="px-8 py-4 rounded-xl border border-border font-bold text-sm hover:bg-slate-50 transition-colors"
                                    >
                                        Browse Sitemap
                                    </Link>
                                    <Link
                                        href="/"
                                        className="px-8 py-4 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors"
                                    >
                                        Go to Home
                                    </Link>
                                </div>
                            </div>
                        ) : null}

                        {/* Browse by Category - Premium Grid */}
                        <div>
                            <div className="flex items-center gap-4 mb-12">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-brand-600 whitespace-nowrap">Institutional Discovery</h2>
                                <div className="h-px grow bg-brand-100 dark:bg-brand-900/30" />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {QUICK_LINKS.map((link) => {
                                    const Icon = link.icon
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="group relative flex flex-col items-start p-8 rounded-4xl border border-border bg-surface transition-all hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/5"
                                        >
                                            <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${link.bg} ${link.color} mb-6 border border-border group-hover:scale-110 transition-transform`}>
                                                <Icon className="size-7 stroke-[1.5]" />
                                            </div>
                                            <h4 className="font-black text-foreground text-xl mb-2 group-hover:text-brand-600 transition-colors">
                                                {link.label}
                                            </h4>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground-muted group-hover:text-brand-600 transition-colors">
                                                <span>Explore Archive</span>
                                                <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Accuracy Integrity Hub */}
                <div className="mt-32">
                    <InstitutionalCTA
                        badge="Search Support"
                        title="Can't find a specific update?"
                        description="Our live verification pipeline updates every 15 minutes. If an official government gazette was just released and isn't here, please notify our speed-indexing team."
                        primaryCTA={{ label: "Join Telegram Alert Channel", href: "https://t.me/resultguru247" }}
                        secondaryCTA={{ text: "Found an error?", actionLabel: "Report Discrepancy", href: "mailto:support@resultguru.co.in" }}
                        features={[
                            { icon: MessageSquare, label: "50K+ Community" },
                            { icon: Shield, label: "Zero-Error Guarantee" },
                            { icon: CheckCircle2, label: "4-Hour Resonse" }
                        ]}
                    />
                </div>
            </main>
        </>
    )
}

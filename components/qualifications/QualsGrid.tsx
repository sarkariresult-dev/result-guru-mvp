'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Search, ArrowRight } from 'lucide-react'
import type { Qualification } from '@/types/taxonomy.types'

interface QualsGridProps {
    qualifications: Qualification[]
}

export function QualsGrid({ qualifications }: QualsGridProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredQuals = qualifications.filter((qual) => {
        const query = searchQuery.toLowerCase()
        return (
            qual.name.toLowerCase().includes(query) ||
            qual.short_name?.toLowerCase().includes(query) ||
            qual.slug.toLowerCase().includes(query)
        )
    })

    return (
        <div className="space-y-16">
            {/* Premium Hero Section with Integrated Search */}
            <div className="relative -mt-16 overflow-hidden bg-slate-50 dark:bg-slate-950/20 border-b border-border">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} 
                />
                
                <div className="container mx-auto max-w-7xl px-4 py-20 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-brand-500/20">
                        <GraduationCap className="size-3" />
                        Career Pathway Directory
                    </div>
                    
                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl mb-6">
                        Browse by <span className="text-gradient-brand">Qualification</span>
                    </h1>
                    
                    <p className="mx-auto max-w-2xl text-lg text-foreground-muted leading-relaxed mb-10">
                        Map your educational background to the latest government recruitment notifications. 
                        Verified paths for 10th pass, 12th pass, and specialized degrees.
                    </p>

                    {/* Integrated Search Box */}
                    <div className="relative w-full lg:max-w-2xl mx-auto">
                        <div className="group relative">
                            <div className="absolute -inset-1 rounded-4xl bg-gradient-brand opacity-20 blur-lg transition duration-1000 group-hover:opacity-40" />
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 size-6 -translate-y-1/2 text-foreground-subtle" />
                                <input
                                    type="search"
                                    placeholder="e.g. 10th pass, Graduation, ITI, Diploma..."
                                    className="h-18 w-full rounded-3xl border border-border bg-white/80 dark:bg-slate-900/80 pl-16 pr-6 text-lg font-bold shadow-2xl backdrop-blur-xl transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 dark:focus:bg-slate-900"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="container mx-auto max-w-7xl px-4 pb-20">
                {filteredQuals.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredQuals.map((qual) => (
                            <div
                                key={qual.slug}
                                className="group relative flex flex-col gap-6 rounded-3xl border border-border bg-white p-8 shadow-sm transition-all hover:-translate-y-1.5 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 dark:bg-slate-900"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform">
                                        <GraduationCap className="size-7" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-accent-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-600 dark:text-accent-400">Live Hub</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-black text-xl text-foreground leading-tight group-hover:text-brand-600 transition-colors">
                                        {qual.name}
                                    </h3>
                                    <p className="text-xs font-black uppercase tracking-widest text-foreground-subtle">
                                        {qual.short_name || 'Verification Pending'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-4">
                                    <Link
                                        href={`/job/for/${qual.slug}`}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs font-bold text-foreground hover:bg-brand-600 hover:text-white transition-all group/btn"
                                    >
                                        Jobs
                                        <ArrowRight className="size-3 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                    </Link>
                                    <Link
                                        href={`/result/for/${qual.slug}`}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs font-bold text-foreground hover:bg-brand-600 hover:text-white transition-all group/btn"
                                    >
                                        Results
                                        <ArrowRight className="size-3 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50/50 p-12 text-center dark:bg-slate-900/20">
                        <div className="mb-6 rounded-full bg-slate-100 dark:bg-slate-800 p-6">
                            <Search className="size-10 text-foreground-subtle" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">No matches found</h3>
                        <p className="mt-2 text-foreground-muted max-w-sm mx-auto">
                            We couldn&apos;t find any qualifications matching &quot;{searchQuery}&quot;.
                        </p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-6 font-bold text-brand-600 hover:text-brand-700 transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

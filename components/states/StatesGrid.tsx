'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, MapPin } from 'lucide-react'
import type { State } from '@/types/taxonomy.types'

interface StatesGridProps {
    states: State[]
}

export function StatesGrid({ states }: StatesGridProps) {
    const [searchQuery, setSearchQuery] = useState('')

    // Filter states based on search query
    const filteredStates = useMemo(() => {
        return states.filter(state => 
            state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            state.abbr?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [states, searchQuery])

    // Group states by first letter
    const groupedStates = useMemo(() => {
        const groups: Record<string, State[]> = {}
        filteredStates.forEach(state => {
            if (!state.name || state.name.length === 0) return
            const firstLetter = state.name.charAt(0).toUpperCase()
            if (!groups[firstLetter]) groups[firstLetter] = []
            groups[firstLetter].push(state)
        })
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    }, [filteredStates])

    return (
        <div className="space-y-10">
            {/* Real-time Search Bar */}
            <div className="relative max-w-2xl mx-auto -mt-6 z-10">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="size-5 text-foreground-muted group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for a state or union territory..."
                        className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-surface/80 backdrop-blur-xl shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {searchQuery && (
                    <p className="mt-3 text-center text-sm text-foreground-muted">
                        Showing {filteredStates.length} results for &quot;{searchQuery}&quot;
                    </p>
                )}
            </div>

            {/* Quick Stats Placeholder or Alphabet Navigation */}
            {filteredStates.length > 0 && !searchQuery && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                    {groupedStates.map(([letter]) => (
                        <button
                            key={letter}
                            onClick={() => {
                                const el = document.getElementById(`section-${letter}`)
                                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }}
                            className="size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold text-foreground-muted hover:border-brand-500 hover:text-brand-600 transition-all hover:scale-110 active:scale-95 shadow-sm"
                        >
                            {letter}
                        </button>
                    ))}
                </div>
            )}

            {/* Grouped Results */}
            {filteredStates.length > 0 ? (
                <div className="space-y-12">
                    {groupedStates.map(([letter, items]) => (
                        <div key={letter} id={`section-${letter}`} className="scroll-mt-32">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-3xl font-black text-brand-500/20 leading-none">{letter}</span>
                                <div className="h-px flex-1 bg-linear-to-r from-border to-transparent mx-6" />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {items.map((state) => (
                                    <Link
                                        key={state.slug}
                                        href={`/states/${state.slug}`}
                                        className="group relative flex items-center gap-4 p-4 rounded-2xl border border-border bg-white dark:bg-slate-900 hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5 transition-all hover:-translate-y-1"
                                    >
                                        {/* State Abbreviation Icon */}
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-800/20 text-brand-700 dark:text-brand-300 font-bold tracking-tighter text-sm border border-brand-200/50 dark:border-brand-700/50 shadow-inner group-hover:scale-110 transition-transform">
                                            {state.abbr || state.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-foreground group-hover:text-brand-600 transition-colors truncate">
                                                {state.name}
                                            </h3>
                                            <p className="text-[10px] font-medium uppercase tracking-widest text-foreground-subtle/60 group-hover:text-foreground-subtle transition-colors flex items-center gap-1">
                                                <MapPin className="size-2.5" />
                                                Latest Updates
                                            </p>
                                        </div>

                                        <ArrowRight className="size-4 text-brand-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                        
                                        {/* Premium Ambient Background Hover */}
                                        <div className="absolute inset-0 rounded-2xl bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors pointer-events-none" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center">
                    <div className="inline-flex size-20 items-center justify-center rounded-full bg-surface border border-dashed border-border mb-6">
                        <Search className="size-10 text-foreground-subtle" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No matches for &quot;{searchQuery}&quot;</h3>
                    <p className="mt-2 text-foreground-muted">Check your spelling or try a broader search term.</p>
                </div>
            )}
        </div>
    )
}

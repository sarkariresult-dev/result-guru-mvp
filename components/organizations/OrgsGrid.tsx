'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, Search, MapPin, ArrowRight } from 'lucide-react'

interface Organization {
    id: string
    name: string
    short_name?: string | null
    slug: string
    logo_url?: string | null
    state_slug?: string | null
}

interface OrgsGridProps {
    organizations: Organization[]
}

export function OrgsGrid({ organizations }: OrgsGridProps) {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredOrgs = organizations.filter((org) => {
        const query = searchQuery.toLowerCase()
        return (
            org.name.toLowerCase().includes(query) ||
            org.short_name?.toLowerCase().includes(query) ||
            org.slug.toLowerCase().includes(query)
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
                        <Building2 className="size-3" />
                        Institutional Directory
                    </div>
                    
                    <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl mb-6">
                        Government <span className="text-gradient-brand">Recruitment Bodies</span>
                    </h1>
                    
                    <p className="mx-auto max-w-2xl text-lg text-foreground-muted leading-relaxed mb-10">
                        Access the complete repository of India&apos;s leading commissions, boards, and examination agencies. 
                        Track updates from UPSC, SSC, Banking, and State PSCs in one verified hub.
                    </p>

                    {/* Integrated Search Box */}
                    <div className="relative w-full lg:max-w-2xl mx-auto">
                        <div className="group relative">
                            <div className="absolute -inset-1 rounded-4xl bg-gradient-brand opacity-20 blur-lg transition duration-1000 group-hover:opacity-40" />
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 size-6 -translate-y-1/2 text-foreground-subtle" />
                                <input
                                    type="search"
                                    placeholder="Search commission, board, or agency (e.g. UPSC, SSC, BPSC)..."
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
            {filteredOrgs.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredOrgs.map((org) => (
                        <Link
                            key={org.id}
                            href={`/organizations/${org.slug}`}
                            className="group relative flex flex-col gap-5 rounded-3xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-1.5 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 dark:bg-slate-900"
                        >
                            <div className="flex items-start justify-between">
                                {org.logo_url ? (
                                    <Image
                                        src={org.logo_url}
                                        alt={`${org.name} logo`}
                                        width={64}
                                        height={64}
                                        className="size-16 rounded-2xl bg-slate-50 object-contain p-2 shadow-sm border border-border dark:bg-white"
                                    />
                                ) : (
                                    <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 font-black text-white text-xl shadow-lg shadow-brand-500/20">
                                        {(org.short_name || org.name).substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                
                                {org.short_name && (
                                    <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:bg-brand-900/40 dark:text-brand-400 border border-brand-100 dark:border-brand-800">
                                        {org.short_name}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-black text-lg text-foreground leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
                                    {org.name}
                                </h3>
                                
                                <div className="flex items-center gap-3">
                                    {org.state_slug ? (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground-muted">
                                            <MapPin className="size-3 text-brand-500" />
                                            <span className="uppercase tracking-tight">
                                                {org.state_slug.replace(/-/g, ' ')}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground-muted">
                                            <Building2 className="size-3 text-brand-500" />
                                            <span className="uppercase tracking-tight">National Level</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 mt-auto border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-subtle">Recruitment Hub</span>
                                <ArrowRight className="size-4 text-brand-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50/50 p-12 text-center dark:bg-slate-900/20">
                    <div className="mb-6 rounded-full bg-slate-100 dark:bg-slate-800 p-6">
                        <Search className="size-10 text-foreground-subtle" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No matches found</h3>
                    <p className="mt-2 text-foreground-muted max-w-sm mx-auto">
                        We couldn&apos;t find any organizations matching &quot;{searchQuery}&quot;. Try searching for a common abbreviation like SSC or UPSC.
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
    )
}

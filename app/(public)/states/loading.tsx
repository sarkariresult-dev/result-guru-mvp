import { Search, MapPin } from 'lucide-react'

export default function StatesLoading() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-12">
            {/* Hero Skeleton */}
            <div className="mb-16 text-center">
                <div className="mx-auto mb-6 h-12 w-3/4 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 lg:w-1/2" />
                <div className="mx-auto h-6 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900 lg:w-2/3" />
            </div>

            {/* Sticky Search & Nav Skeleton */}
            <div className="sticky top-20 z-30 mb-12 flex flex-col items-center justify-between gap-6 rounded-3xl border border-border bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-slate-900/80 lg:flex-row">
                <div className="relative w-full lg:max-w-md">
                    <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="flex w-full items-center justify-center gap-1 overflow-x-auto lg:w-auto">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    ))}
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="space-y-16">
                {Array.from({ length: 3 }).map((_, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 animate-pulse rounded-xl bg-brand-500/10" />
                            <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                            <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-32 w-full animate-pulse rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/50" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

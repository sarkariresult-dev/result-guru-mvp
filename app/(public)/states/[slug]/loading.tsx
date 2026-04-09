import { FileText, MapPin } from 'lucide-react'

export default function StateDetailLoading() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Skeleton */}
            <div className="relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-b border-border py-12">
                <div className="container mx-auto max-w-7xl px-4 relative">
                    {/* Breadcrumb Skeleton */}
                    <div className="mb-8 h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                {/* State Icon Skeleton */}
                                <div className="size-16 shrink-0 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                                <div className="space-y-3">
                                    <div className="h-3 w-32 animate-pulse rounded bg-emerald-500/20" />
                                    <div className="h-12 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                                </div>
                            </div>
                            
                            <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-slate-100 dark:bg-slate-900 mb-2" />
                            <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-900 mb-8" />

                            {/* Pills Skeleton */}
                            <div className="flex flex-wrap gap-2.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-9 w-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" />
                                ))}
                            </div>
                        </div>

                        {/* Stats Box Skeleton */}
                        <div className="lg:w-72 p-6 rounded-2xl border border-border bg-white dark:bg-slate-900 shadow-sm">
                            <div className="mb-4 h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <div className="h-2 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
                                        <div className="h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="container mx-auto max-w-7xl px-4 py-12">
                <div className="grid lg:grid-cols-[1fr_300px] gap-12">
                    <div>
                        {/* Section Header Skeleton */}
                        <div className="mb-8 flex items-center gap-3">
                            <div className="size-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                        </div>

                        {/* Post Cards Grid Skeleton */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-48 w-full animate-pulse rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/50" />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-8">
                        <div className="h-48 w-full animate-pulse rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/50" />
                        <div className="h-32 w-full animate-pulse rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/50" />
                    </div>
                </div>
            </div>
        </div>
    )
}

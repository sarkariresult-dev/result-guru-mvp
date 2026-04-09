import { Building2 } from 'lucide-react'

export default function OrgsLoading() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Skeleton */}
            <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950/20 border-b border-border py-20">
                <div className="container mx-auto max-w-7xl px-4 relative text-center">
                    <div className="mx-auto mb-6 h-6 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="mx-auto mb-6 h-12 w-3/4 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800 lg:w-2/3" />
                    <div className="mx-auto h-6 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900 lg:w-1/2" />
                </div>
            </div>

            {/* Sticky Search Skeleton */}
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="sticky top-20 z-30 mb-12 flex items-center justify-center rounded-3xl border border-border bg-white/80 p-4 shadow-xl backdrop-blur-xl dark:bg-slate-900/80 lg:p-6">
                    <div className="h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                </div>

                {/* Grid Skeleton */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-5 rounded-3xl border border-border bg-white p-6 shadow-sm dark:bg-slate-900">
                            <div className="flex justify-between items-start">
                                <div className="size-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                                <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
                            </div>
                            <div className="mt-4 pt-4 border-t border-border flex justify-between">
                                <div className="h-3 w-20 animate-pulse rounded bg-slate-50 dark:bg-slate-800" />
                                <div className="h-4 w-4 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

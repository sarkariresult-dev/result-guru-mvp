import { Skeleton } from '@/components/ui/Skeleton'

export default function HomeLoading() {
    return (
        <div className="flex flex-col gap-0 overflow-hidden" role="status" aria-label="Loading home page">
            {/* 1. Hero Content Skeleton */}
            <section className="bg-background-subtle py-12 lg:py-20 border-b border-border">
                <div className="container mx-auto max-w-7xl px-4 flex flex-col items-center">
                    <Skeleton className="h-4 w-32 mb-6 rounded-full" />
                    <Skeleton className="h-10 sm:h-16 w-full max-w-2xl mb-4 rounded-xl" />
                    <Skeleton className="h-6 w-full max-w-lg mb-10 rounded-lg" />
                    
                    {/* Search Bar Skeleton */}
                    <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-3">
                        <Skeleton className="h-14 flex-1 rounded-2xl" />
                        <Skeleton className="h-14 w-full sm:w-32 rounded-2xl" />
                    </div>
                </div>
            </section>

            {/* 2. Stats Grid Skeleton */}
            <section className="container mx-auto max-w-7xl px-4 -translate-y-10 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-3xl border border-border bg-surface p-6 shadow-xl space-y-3">
                            <div className="flex justify-between items-start">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="size-10 rounded-2xl" />
                            </div>
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Organizations Row Skeleton */}
            <section className="container mx-auto max-w-7xl px-4 py-6 border-b border-border/50">
                <div className="flex overflow-hidden gap-4 pb-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="shrink-0 flex flex-col items-center gap-3 w-[140px] sm:w-[160px]">
                            <Skeleton className="size-14 sm:size-16 rounded-xl" />
                            <Skeleton className="h-3 w-20 rounded-full" />
                            <Skeleton className="h-2 w-24 rounded-full opacity-60" />
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Main Content Grid Skeleton */}
            <section className="container mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Feed Column */}
                    <div className="lg:col-span-2 space-y-10">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-8 w-48 rounded-lg" />
                                <div className="space-y-3">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <Skeleton key={j} className="h-16 w-full rounded-2xl" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-40 rounded-lg" />
                            <div className="space-y-3">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                                ))}
                            </div>
                        </div>
                        <Skeleton className="h-64 w-full rounded-3xl" />
                        <Skeleton className="h-64 w-full rounded-3xl" />
                    </div>
                </div>
            </section>

            <span className="sr-only">Loading home page content...</span>
        </div>
    )
}

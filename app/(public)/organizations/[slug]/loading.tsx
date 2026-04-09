export default function OrgDetailLoading() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Skeleton */}
            <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950/20 border-b border-border py-16">
                <div className="container mx-auto max-w-7xl px-4 relative">
                    <div className="mb-8 h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                                <div className="size-24 shrink-0 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
                                <div className="space-y-4">
                                    <div className="h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
                                    <div className="h-12 w-96 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
                                <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
                            </div>
                        </div>
                        <div className="lg:w-80 h-48 animate-pulse rounded-3xl bg-white dark:bg-slate-900 border border-borderShadow shadow-sm" />
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="container mx-auto max-w-7xl px-4 py-16">
                <div className="grid lg:grid-cols-[1fr_320px] gap-12">
                    <div className="space-y-12">
                        {/* Title Skeleton */}
                        <div className="flex items-center gap-4">
                            <div className="size-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                            <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        </div>

                        {/* Card Grid Skeleton */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-48 animate-pulse rounded-3xl border border-border bg-white dark:bg-slate-900" />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="space-y-8">
                        <div className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-900" />
                        <div className="h-48 animate-pulse rounded-3xl border border-border bg-white dark:bg-slate-900" />
                    </div>
                </div>
            </div>
        </div>
    )
}

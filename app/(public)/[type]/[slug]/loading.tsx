import { Skeleton } from '@/components/ui/Skeleton'

export default function DetailLoading() {
    return (
        <article className="container mx-auto max-w-7xl px-4 py-8" role="status" aria-label="Loading post details">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
            </div>

            <div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-[240px_1fr_240px]">
                {/* LEFT WING */}
                <aside className="hidden lg:block space-y-8">
                    <div className="space-y-12">
                        <Skeleton className="h-40 w-full rounded-xl" /> {/* Ad skeleton */}
                    </div>
                    <div className="sticky top-24 space-y-8">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-32 rounded-lg" />
                            <div className="space-y-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>
                        </div>
                        <Skeleton className="h-64 w-full rounded-xl" /> {/* Sticky Ad skeleton */}
                    </div>
                </aside>

                {/* CORE CONTENT */}
                <article className="min-w-0">
                    <div className="mx-auto max-w-3xl space-y-10">
                        {/* Above content Ad */}
                        <Skeleton className="h-24 w-full rounded-xl" />
                        
                        {/* Post Header */}
                        <div className="space-y-6">
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            <div className="space-y-3">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-3/4 rounded-xl" />
                            </div>
                            
                            <div className="flex items-center gap-4 pt-2 border-b border-border pb-6">
                                <Skeleton className="size-10 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        </div>

                        {/* Content Blocks */}
                        <div className="space-y-12">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-4">
                                    <Skeleton className="h-8 w-64 rounded-lg" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-11/12" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Below content Ad & Related */}
                        <div className="space-y-12 pt-8">
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-64 w-full rounded-2xl" />
                        </div>
                    </div>
                </article>

                {/* RIGHT WING */}
                <aside className="hidden lg:block space-y-8">
                    <Skeleton className="h-40 w-full rounded-xl" /> {/* Top Ad */}
                    
                    <div className="space-y-8 sticky top-24">
                        {/* Sidebar Products */}
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="space-y-4">
                                <Skeleton className="h-5 w-32 rounded" />
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <div key={j} className="flex gap-3">
                                            <Skeleton className="size-12 rounded-lg shrink-0" />
                                            <div className="space-y-1 flex-1">
                                                <Skeleton className="h-3 w-full" />
                                                <Skeleton className="h-2 w-16" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Intelligence Silo */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="h-px w-6 bg-border" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <div className="space-y-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-2 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <span className="sr-only">Loading detailed content...</span>
        </article>
    )
}

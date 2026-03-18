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

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
                {/* Main Content Column */}
                <div className="space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-3/4 rounded-xl" />
                        
                        <div className="flex items-center gap-4 pt-2">
                            <Skeleton className="size-10 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <Skeleton className="aspect-video w-full rounded-2xl shadow-sm" />

                    {/* Content Blocks */}
                    <div className="space-y-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-6 w-48 rounded-lg" />
                                <Skeleton className="h-4 w-full rounded-md" />
                                <Skeleton className="h-4 w-full rounded-md" />
                                <Skeleton className="h-4 w-5/6 rounded-md" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="hidden lg:block space-y-8">
                    {/* Quick Access / CTA */}
                    <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
                        <Skeleton className="h-6 w-32 rounded-lg" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>

                    {/* Related/Latest Posts */}
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-40 rounded-lg" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <Skeleton className="size-16 rounded-lg shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <span className="sr-only">Loading detailed content...</span>
        </article>
    )
}

import { Skeleton } from '@/components/ui/Skeleton'

export default function OrganizationsLoading() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-8" role="status" aria-label="Loading organizations">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
            </div>

            {/* Header */}
            <div className="mb-10 mt-4 max-w-3xl">
                <Skeleton className="h-10 w-2/3 rounded-xl mb-4" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-full rounded-lg" />
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                </div>
            </div>

            {/* Count badge skeleton */}
            <div className="mb-8">
                <Skeleton className="h-8 w-40 rounded-full" />
            </div>

            {/* Grid skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
                        <Skeleton className="size-14 shrink-0 rounded-lg" />
                        <div className="min-w-0 flex-1 space-y-3">
                            <Skeleton className="h-5 w-full rounded-lg" />
                            <div className="flex gap-3">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <Skeleton className="size-5 shrink-0 rounded-full" />
                    </div>
                ))}
            </div>

            <span className="sr-only">Loading organizations list...</span>
        </div>
    )
}

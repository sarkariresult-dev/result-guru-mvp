import { Skeleton } from '@/components/ui/Skeleton'
import { PostCardSkeleton } from '@/components/posts/PostCardSkeleton'

export default function ListingLoading() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-8" role="status" aria-label="Loading listing page">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
            </div>

            {/* Heading section skeleton */}
            <div className="mb-10 mt-4 max-w-3xl">
                <Skeleton className="h-10 w-3/4 sm:w-1/2 rounded-xl mb-3" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-full rounded-lg" />
                    <Skeleton className="h-5 w-2/3 rounded-lg" />
                </div>
            </div>

            {/* Filters/Tabs skeleton (simulated) */}
            <div className="mb-8 flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
                ))}
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>

            <span className="sr-only">Loading results...</span>
        </div>
    )
}

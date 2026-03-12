import { PostCardSkeleton } from '@/components/posts/PostCardSkeleton'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Public route loading state - shows a page-level skeleton
 * that mirrors the actual category/listing layout.
 */
export default function PublicLoading() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-8" role="status" aria-label="Loading content">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
            </div>

            {/* Heading skeleton */}
            <div className="mb-8 space-y-3">
                <Skeleton className="h-9 w-72 rounded-lg" />
                <Skeleton className="h-5 w-96 max-w-full" />
            </div>

            {/* Post grid skeleton */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>

            <span className="sr-only">Loading page content, please wait.</span>
        </div>
    )
}

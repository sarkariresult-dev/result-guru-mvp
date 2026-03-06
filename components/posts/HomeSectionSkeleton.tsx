import { PostCardSkeleton } from '@/components/posts/PostCardSkeleton'
import { Skeleton } from '@/components/ui/Skeleton'

interface HomeSectionSkeletonProps {
    /** Number of skeleton cards to show */
    count?: number
}

/**
 * Skeleton fallback for a home page section while it streams in.
 */
export function HomeSectionSkeleton({ count = 6 }: HomeSectionSkeletonProps) {
    return (
        <div className="space-y-6" role="status" aria-label="Loading section">
            {/* Header skeleton */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <Skeleton className="h-7 w-48 rounded-lg" />
                <Skeleton className="h-5 w-28" />
            </div>
            {/* Card grid skeleton */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: count }).map((_, i) => (
                    <PostCardSkeleton key={i} />
                ))}
            </div>
            <span className="sr-only">Loading section content.</span>
        </div>
    )
}

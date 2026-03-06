import { Skeleton } from '@/components/ui/Skeleton'

export function PostCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <Skeleton className="aspect-video w-full" />
            <div className="space-y-3 p-5">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between border-t border-border pt-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </div>
    )
}

export function PostDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="aspect-video w-full rounded-xl" />
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    )
}

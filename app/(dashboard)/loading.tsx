import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Dashboard route loading — skeleton that mirrors the dashboard shell content area.
 */
export default function DashboardLoading() {
    return (
        <div className="flex-1 space-y-6 p-6" role="status" aria-label="Loading dashboard">
            {/* Page header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-surface p-6 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ))}
            </div>

            {/* Table skeleton */}
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                <div className="border-b border-border bg-background-subtle px-6 py-4">
                    <Skeleton className="h-5 w-32 bg-border" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b border-border px-6 py-4 last:border-b-0">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-8 w-8" />
                    </div>
                ))}
            </div>

            <span className="sr-only">Dashboard content is loading, please wait.</span>
        </div>
    )
}

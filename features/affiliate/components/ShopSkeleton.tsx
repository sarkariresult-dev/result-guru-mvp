import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-foreground-muted/10", className)}
            {...props}
        />
    )
}

/** ── Card Skeleton ────────────────────────────────────────────────────── */

export function ProductCardSkeleton() {
    return (
        <div className="flex flex-col rounded-3xl border border-border bg-surface overflow-hidden">
            <Skeleton className="aspect-4/3 w-full rounded-none" />
            <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <div className="pt-2 flex gap-2">
                    <Skeleton className="h-8 flex-1 rounded-xl" />
                    <Skeleton className="h-8 w-10 rounded-xl" />
                </div>
            </div>
        </div>
    )
}

/** ── Category Hero Skeleton ───────────────────────────────────────────── */

export function CategoryHeroSkeleton() {
    return (
        <section className="relative overflow-hidden bg-surface p-8 md:p-12 lg:p-16 border-b border-border">
            <div className="max-w-3xl space-y-6">
                <Skeleton className="h-5 w-32 rounded-full" />
                <div className="space-y-3">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-12 w-1/2" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex items-center gap-6 pt-6 border-t border-border/50">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            </div>
        </section>
    )
}

/** ── Product Detail Skeleton ──────────────────────────────────────────── */

export function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
                {/* Left: Main Content (lg:col-span-9) */}
                <div className="lg:col-span-9 space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Image Column (lg:col-span-5) */}
                        <div className="lg:col-span-5">
                            <Skeleton className="aspect-square w-full rounded-4xl" />
                        </div>
                        {/* Info Column (lg:col-span-7) */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                    <Skeleton className="h-6 w-32 rounded-full" />
                                </div>
                                <Skeleton className="h-14 w-full rounded-xl" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <Skeleton className="h-32 w-full rounded-3xl" />
                            <Skeleton className="h-16 w-full rounded-2xl" />
                        </div>
                    </div>

                    {/* Bottom description blocks */}
                    <div className="space-y-8 pt-8">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-64 w-full rounded-4xl" />
                    </div>
                </div>

                {/* Right: Sidebar (lg:col-span-3) */}
                <aside className="lg:col-span-3 space-y-8">
                    <div className="space-y-6">
                        <Skeleton className="h-6 w-48" />
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="size-16 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </aside>
            </div>
        </div>
    )
}

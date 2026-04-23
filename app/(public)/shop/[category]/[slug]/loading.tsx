import { Skeleton } from '@/components/ui/Skeleton'

export default function ShopProductLoading() {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Breadcrumb Header placeholder */}
            <div className="bg-surface border-b border-border">
                <div className="container mx-auto max-w-7xl px-4 py-4">
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
                    {/* Left: Main Content (lg:col-span-9) */}
                    <div className="lg:col-span-9 space-y-16">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                            {/* Image Column */}
                            <div className="lg:col-span-5">
                                <div className="sticky top-24">
                                    <Skeleton className="aspect-square w-full rounded-4xl border border-border" />
                                    <div className="mt-8 flex gap-4 overflow-hidden">
                                        {[1, 2, 3, 4].map(i => (
                                            <Skeleton key={i} className="size-20 rounded-2xl shrink-0" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Info Column */}
                            <div className="lg:col-span-7 space-y-10">
                                <div className="space-y-6">
                                    <div className="flex gap-3">
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                        <Skeleton className="h-6 w-32 rounded-full" />
                                    </div>
                                    <div className="space-y-3">
                                        <Skeleton className="h-14 w-full rounded-2xl" />
                                        <Skeleton className="h-14 w-3/4 rounded-2xl" />
                                    </div>
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-40" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>

                                <Skeleton className="h-6 w-full" />

                                {/* Price / Action Box */}
                                <div className="p-8 rounded-4xl border border-border bg-surface-raised space-y-8">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-32" />
                                        <Skeleton className="h-12 w-48" />
                                    </div>
                                    <Skeleton className="h-16 w-full rounded-2xl" />
                                    <div className="flex justify-center">
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Skeleton className="h-12 rounded-xl" />
                                    <Skeleton className="h-12 rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-64" />
                                <div className="h-px flex-1 bg-border/60" />
                            </div>
                            <Skeleton className="h-80 w-full rounded-4xl" />
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="lg:col-span-3 space-y-10">
                        <div className="space-y-6">
                            <Skeleton className="h-8 w-48" />
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="flex gap-4 p-2 rounded-2xl border border-transparent">
                                    <Skeleton className="size-16 rounded-xl shrink-0" />
                                    <div className="flex-1 space-y-2 mt-1">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Skeleton className="aspect-4/5 w-full rounded-3xl" />
                        <Skeleton className="h-24 w-full rounded-2xl border border-dashed border-border" />
                    </aside>
                </div>
            </div>
        </div>
    )
}

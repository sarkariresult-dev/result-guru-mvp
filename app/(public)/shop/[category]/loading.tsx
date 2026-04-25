import { Skeleton } from '@/components/ui/Skeleton'

export default function ShopCategoryLoading() {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Visual Breadcrumb Header placeholder */}
            <div className="bg-surface border-b border-border">
                <div className="container mx-auto max-w-7xl px-4 py-4">
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8 space-y-12">
                {/* Category Header Hero Skeleton */}
                <section className="relative py-8 md:py-12 lg:py-16">
                    <div className="max-w-3xl space-y-8">
                        <Skeleton className="h-6 w-32 rounded-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-3/4" />
                            <Skeleton className="h-16 w-1/2" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-5/6" />
                        </div>
                        <div className="flex items-center gap-10 pt-8 border-t border-border/50">
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

                {/* Product Grid Section */}
                <section className="space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-2 rounded-full bg-brand-500" />
                            <Skeleton className="h-8 w-64" />
                        </div>
                        <div className="h-px flex-1 bg-border/60 mx-8 hidden sm:block" />
                        <Skeleton className="h-8 w-32 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex flex-col overflow-hidden">
                                <Skeleton className="aspect-4/3 w-full rounded-3xl mb-4" />
                                <div className="px-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="h-5 w-2/3" />
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-full opacity-60" />
                                        <Skeleton className="h-3 w-4/5 opacity-60" />
                                    </div>
                                    <div className="pt-4">
                                        <Skeleton className="h-10 w-24 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

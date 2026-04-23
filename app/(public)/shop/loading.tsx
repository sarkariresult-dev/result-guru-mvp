import { Skeleton } from '@/components/ui/Skeleton'

export default function ShopLoading() {
    return (
        <div className="min-h-screen bg-background pb-20 overflow-hidden">
            {/* Premium Hero Loading State */}
            <div className="relative bg-slate-950 pt-24 pb-20 sm:pt-40 sm:pb-32 px-4 overflow-hidden">
                {/* Decorative gradients matching real hero */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(79,70,229,0.15),transparent)] pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-brand-600/5 to-transparent blur-[120px]" />

                <div className="container relative mx-auto max-w-7xl z-10">
                    <div className="max-w-3xl space-y-8">
                        <Skeleton className="h-6 w-48 bg-white/10 rounded-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-14 w-full bg-white/10 rounded-2xl" />
                            <Skeleton className="h-14 w-2/3 bg-white/10 rounded-2xl" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-5 w-full bg-white/5 rounded-lg" />
                            <Skeleton className="h-5 w-4/5 bg-white/5 rounded-lg" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Skeleton className="h-12 w-32 bg-white/10 rounded-xl" />
                            <Skeleton className="h-12 w-48 bg-white/5 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 -mt-8 relative z-20 space-y-20">
                {/* Category Directory Skeletons */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="group relative rounded-4xl border border-border bg-surface p-6 flex flex-col items-center gap-4 shadow-sm">
                            <Skeleton className="size-16 rounded-2xl" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>

                {/* Section Header Placeholder */}
                <div className="space-y-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-10 rounded-2xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                        <div className="h-px flex-1 bg-border/60 mx-8 hidden lg:block" />
                    </div>

                    {/* Product Grid Placeholder */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex flex-col rounded-4xl border border-border bg-surface overflow-hidden p-2">
                                <Skeleton className="aspect-square w-full rounded-3xl" />
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Skeleton className="h-5 w-2/3" />
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-full opacity-60" />
                                        <Skeleton className="h-3 w-4/5 opacity-60" />
                                    </div>
                                    <div className="pt-4 flex gap-2">
                                        <Skeleton className="h-12 flex-1 rounded-xl" />
                                        <Skeleton className="h-12 w-12 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

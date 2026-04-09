export default function QualificationsLoading() {
    return (
        <div className="flex flex-col min-h-screen animate-pulse">
            {/* Hero Skeleton */}
            <div className="bg-slate-50 dark:bg-slate-900/20 border-b border-border py-24">
                <div className="container mx-auto max-w-7xl px-4 text-center">
                    <div className="mx-auto h-6 w-32 rounded-full bg-slate-200 dark:bg-slate-800 mb-6" />
                    <div className="mx-auto h-12 w-full max-w-2xl rounded-2xl bg-slate-200 dark:bg-slate-800 mb-6" />
                    <div className="mx-auto h-4 w-full max-w-md rounded-lg bg-slate-200 dark:bg-slate-800 mb-10" />
                    <div className="mx-auto h-16 w-full max-w-2xl rounded-3xl bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="container mx-auto max-w-7xl px-4 py-16">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 rounded-3xl border border-border bg-white dark:bg-slate-900 p-8 space-y-6">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                            <div className="space-y-3">
                                <div className="h-6 w-3/4 rounded-lg bg-slate-100 dark:bg-slate-800" />
                                <div className="h-4 w-1/4 rounded-lg bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="pt-4 space-y-2">
                                <div className="h-10 w-full rounded-xl bg-slate-50 dark:bg-slate-800/50" />
                                <div className="h-10 w-full rounded-xl bg-slate-50 dark:bg-slate-800/50" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

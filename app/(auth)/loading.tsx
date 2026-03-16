/**
 * Auth route loading - centered spinner matching the auth layout split.
 */
export default function AuthLoading() {
    return (
        <div
            className="flex min-h-screen items-center justify-center bg-background"
            role="status"
            aria-label="Loading authentication"
        >
            <div className="flex flex-col items-center gap-6">
                <div className="relative size-12">
                    <div className="absolute inset-0 animate-spin rounded-2xl border-4 border-brand-100 border-t-brand-600 dark:border-brand-900/40 dark:border-t-brand-500" />
                    <div className="absolute inset-2 animate-pulse rounded-xl bg-brand-600/10 dark:bg-brand-400/10" />
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted animate-pulse">
                        Authenticating
                    </span>
                    <div className="h-1 w-12 overflow-hidden rounded-full bg-brand-50 dark:bg-brand-950">
                        <div className="h-full w-1/2 animate-shimmer rounded-full bg-brand-600" />
                    </div>
                </div>
            </div>
            <span className="sr-only">Authentication page is loading, please wait.</span>
        </div>
    )
}

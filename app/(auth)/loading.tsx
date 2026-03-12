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
            <div className="flex flex-col items-center gap-4">
                <div className="relative size-10">
                    <div className="absolute inset-0 rounded-full border-2 border-brand-100 dark:border-brand-900/40" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600" />
                </div>
                <p className="animate-pulse text-sm font-medium text-foreground-subtle">
                    Loading&hellip;
                </p>
            </div>
            <span className="sr-only">Authentication page is loading, please wait.</span>
        </div>
    )
}

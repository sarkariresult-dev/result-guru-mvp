export default function Loading() {
    return (
        <div
            role="status"
            aria-label="Loading content"
            aria-live="polite"
            className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4"
        >
            {/* Brand-coloured spinner with layered rings */}
            <div className="relative size-12">
                {/* Outer static ring */}
                <div className="absolute inset-0 rounded-full border-2 border-brand-100 dark:border-brand-900/40" />
                {/* Middle pulsing ring */}
                <div className="absolute inset-1 animate-pulse rounded-full border border-brand-200/50 dark:border-brand-800/30" />
                {/* Inner spinning arc */}
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600 border-r-brand-400" />
                {/* Center dot */}
                <div className="absolute inset-0 m-auto size-2 animate-pulse rounded-full bg-brand-600" />
            </div>

            {/* Pulse text */}
            <div className="flex flex-col items-center gap-1.5">
                <p className="animate-pulse text-sm font-medium text-foreground-subtle">
                    Loading…
                </p>
                <div className="h-0.5 w-16 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900/40">
                    <div className="h-full w-1/2 animate-shimmer rounded-full bg-brand-500" />
                </div>
            </div>

            {/* Accessible hidden text for screen readers */}
            <span className="sr-only">Content is loading, please wait.</span>
        </div>
    )
}

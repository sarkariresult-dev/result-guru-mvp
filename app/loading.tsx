export default function RootLoading() {
    return (
        <div 
            className="flex min-h-screen flex-col items-center justify-center bg-background"
            role="status"
            aria-label="Initializing application"
        >
            <div className="relative flex flex-col items-center gap-8">
                {/* Brand Logo or Silhouette Logo would go here, using a stylized icon-like loader for now */}
                <div className="relative size-20">
                    <div className="absolute inset-0 animate-spin rounded-3xl border-4 border-brand-100 border-t-brand-600 dark:border-brand-900/40 dark:border-t-brand-500" />
                    <div className="absolute inset-4 animate-ping rounded-2xl bg-brand-600/10 dark:bg-brand-400/10" />
                    <div className="absolute inset-0 flex items-center justify-center font-black text-brand-600 text-xl">
                        RG
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-brand-50 dark:bg-brand-950">
                        <div className="h-full w-1/3 animate-shimmer rounded-full bg-linear-to-r from-brand-600 to-brand-400" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground-muted animate-pulse">
                        Result Guru
                    </span>
                </div>
            </div>
            
            <span className="sr-only">Loading application, please wait.</span>
        </div>
    )
}

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ServerCrash, RotateCcw, Home } from 'lucide-react'

import { isRestrictedIframe } from '@/lib/safe-env'

export default function TypeError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const isIframe = isRestrictedIframe()

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Type Route Error:', error)

        // Silent recovery for iframes: 
        // If it's a hydration mismatch (no digest) in an iframe, attempt a one-time reset 
        // after a short delay to try and clear the AdSense-induced state.
        if (isIframe && !error.digest) {
            const timer = setTimeout(() => {
                reset()
            }, 2000)
            return () => clearTimeout(timer)
        }
        
        return undefined
    }, [error, reset, isIframe])

    // In Next.js 15, hydration errors often have no digest.
    const isConnectionError = !error.digest || error.message?.toLowerCase().includes('connection') || error.message?.toLowerCase().includes('digest')

    // If we are in an iframe and it's a non-fatal (no digest) error, 
    // we show an even quieter UI to avoid failing AdSense reviews.
    if (isIframe && !error.digest) {
        return (
            <div className="flex min-h-[40vh] flex-col items-center justify-center bg-background px-4 text-center">
                <RotateCcw className="size-8 text-brand-600/50 animate-spin-slow mb-4" />
                <p className="text-sm text-foreground-subtle animate-pulse">Syncing content...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-background-subtle">
                {isConnectionError ? (
                    <RotateCcw className="size-10 text-brand-600 animate-spin-slow" />
                ) : (
                    <ServerCrash className="size-10 text-red-600 dark:text-red-500" />
                )}
            </div>

            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {isConnectionError ? 'Refreshing content...' : 'Something went wrong!'}
            </h1>
            <p className="mb-10 max-w-lg text-base text-foreground-muted leading-relaxed">
                {isConnectionError 
                    ? 'The connection was interrupted. We are trying to restore the page.' 
                    : 'We encountered an error while loading this content. Our team has been notified.'}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-700 hover:shadow-xl active:scale-95"
                >
                    <RotateCcw className="size-4" />
                    Try Again
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-background-subtle active:scale-95"
                >
                    <Home className="size-4" />
                    Back to Home
                </Link>
            </div>

            {!isConnectionError && (
                <div className="mt-12 flex flex-col items-center justify-center border-t border-border pt-8 text-sm text-foreground-subtle">
                    <p>Reference ID: <span className="font-mono text-xs">{error.digest || 'system-fallback'}</span></p>
                </div>
            )}
        </div>
    )
}

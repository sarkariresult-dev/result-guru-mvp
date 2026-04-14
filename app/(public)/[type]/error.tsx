'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ServerCrash, RotateCcw, Home, ChevronLeft } from 'lucide-react'

export default function TypeError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Type Route Error:', error)
    }, [error])

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
                <ServerCrash className="size-10 text-red-600 dark:text-red-500" />
            </div>

            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Something went wrong!
            </h1>
            <p className="mb-10 max-w-lg text-lg text-foreground-muted leading-relaxed">
                We encountered an error while loading this content. Please try again later.
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

            <div className="mt-12 flex flex-col items-center justify-center border-t border-border pt-8 text-sm text-foreground-subtle">
                <p>Error ID: <span className="font-mono text-xs">{error.digest || 'no-digest'}</span></p>
                {error.message && (
                    <p className="mt-2 max-w-md bg-background-muted p-2 rounded text-[10px] font-mono opacity-50">
                        {error.message}
                    </p>
                )}
            </div>
        </div>
    )
}

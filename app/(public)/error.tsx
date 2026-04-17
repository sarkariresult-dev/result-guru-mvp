'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { RotateCcw, Home, WifiOff, ServerCrash, Search } from 'lucide-react'

const AUTO_RETRY_SECONDS = 12

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

function isNetworkError(error: Error): boolean {
    const msg = error.message.toLowerCase()
    return (
        msg.includes('fetch failed') ||
        msg.includes('network') ||
        msg.includes('econnrefused') ||
        msg.includes('load failed') ||
        msg.includes('timeout')
    )
}

export default function PublicError({ error, reset }: ErrorProps) {
    const [countdown, setCountdown] = useState(AUTO_RETRY_SECONDS)
    const [retryCount, setRetryCount] = useState(0)
    const isNetwork = isNetworkError(error)
    const maxRetries = 3

    const handleRetry = useCallback(() => {
        setRetryCount((c) => c + 1)
        setCountdown(AUTO_RETRY_SECONDS)
        reset()
    }, [reset])

    useEffect(() => {
        // Logging removed for production
    }, [error])

    useEffect(() => {
        if (retryCount >= maxRetries) return
        let cleared = false
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (!cleared) {
                        cleared = true
                        clearInterval(timer)
                        // Schedule retry outside the state updater to avoid nested state transitions
                        queueMicrotask(() => handleRetry())
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => { cleared = true; clearInterval(timer) }
    }, [retryCount, handleRetry])

    const Icon = isNetwork ? WifiOff : ServerCrash

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
            <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 text-center animate-fade-up">
                <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-surface shadow-md">
                    <Icon className="size-9 text-error" strokeWidth={1.5} aria-hidden />
                </div>

                <div className="space-y-3">
                    <h1 className="font-display text-fluid-2xl font-bold tracking-tight text-foreground">
                        {isNetwork ? 'Connection Error' : 'Something went wrong'}
                    </h1>
                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-foreground-muted">
                        {isNetwork
                            ? 'Could not connect to the server. Please check your internet connection.'
                            : 'We couldn\u2019t load this page. The issue has been logged and we\u2019re looking into it.'}
                    </p>

                    {retryCount < maxRetries && (
                        <p className="text-xs text-foreground-subtle">
                            Auto-retrying in{' '}
                            <span className="font-mono font-semibold text-foreground-muted">{countdown}s</span>
                            {retryCount > 0 && (
                                <span className="ml-1">(attempt {retryCount + 1}/{maxRetries})</span>
                            )}
                        </p>
                    )}

                    {error.digest && (
                        <p className="font-mono text-xs text-foreground-subtle">
                            Ref: <code className="select-all rounded-md bg-background-subtle px-2 py-0.5">{error.digest}</code>
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                        <RotateCcw className="size-4" aria-hidden />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-all duration-200 hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                        <Home className="size-4" aria-hidden />
                        Home
                    </Link>
                    <Link
                        href="/search"
                        className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-all duration-200 hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                        <Search className="size-4" aria-hidden />
                        Search
                    </Link>
                </div>

                {retryCount >= maxRetries && (
                    <p className="text-xs text-foreground-subtle">
                        Still having issues?{' '}
                        <Link href="/contact" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
                            Contact us
                        </Link>
                    </p>
                )}
            </div>
        </div>
    )
}

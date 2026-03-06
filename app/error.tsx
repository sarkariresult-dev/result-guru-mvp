'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, RotateCcw, Home, WifiOff, ServerCrash } from 'lucide-react'

/* ── Auto-retry countdown (seconds) ── */
const AUTO_RETRY_SECONDS = 15

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

/** Detect if the error is likely a network / connectivity issue */
function isNetworkError(error: Error): boolean {
    const msg = error.message.toLowerCase()
    return (
        msg.includes('fetch failed') ||
        msg.includes('network') ||
        msg.includes('econnrefused') ||
        msg.includes('enotfound') ||
        msg.includes('load failed') ||
        msg.includes('timeout')
    )
}

export default function Error({ error, reset }: ErrorProps) {
    const [countdown, setCountdown] = useState(AUTO_RETRY_SECONDS)
    const [retryCount, setRetryCount] = useState(0)
    const isNetwork = isNetworkError(error)
    const maxRetries = 3

    const handleRetry = useCallback(() => {
        setRetryCount((c) => c + 1)
        setCountdown(AUTO_RETRY_SECONDS)
        reset()
    }, [reset])

    /* Log error once */
    useEffect(() => {
        console.error('[Error Boundary]', {
            message: error.message,
            digest: error.digest,
            stack: error.stack,
        })
    }, [error])

    /* Auto-retry countdown — only if under max retries */
    useEffect(() => {
        if (retryCount >= maxRetries) return

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleRetry()
                    return AUTO_RETRY_SECONDS
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [retryCount, handleRetry])

    const Icon = isNetwork ? WifiOff : ServerCrash

    return (
        <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 sm:py-24">
            {/* Ambient background glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-error/8 blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/3 size-48 rounded-full bg-brand-500/6 blur-[80px]" />
            </div>

            <div className="animate-fade-up relative z-10 flex w-full max-w-md flex-col items-center gap-8 text-center">
                {/* Icon container */}
                <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-surface shadow-md">
                    <Icon className="size-9 text-error" strokeWidth={1.5} aria-hidden />
                </div>

                {/* Content */}
                <div className="space-y-3">
                    <h1 className="font-display text-fluid-2xl font-bold tracking-tight text-foreground">
                        {isNetwork ? 'Connection Error' : 'Something went wrong'}
                    </h1>
                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-foreground-muted">
                        {isNetwork
                            ? 'Could not connect to the server. Please check your internet connection and try again.'
                            : error.message || 'An unexpected error occurred. We\'re working on it — please try again.'}
                    </p>

                    {/* Auto-retry indicator */}
                    {retryCount < maxRetries && (
                        <p className="text-xs text-foreground-subtle">
                            Auto-retrying in{' '}
                            <span className="font-mono font-semibold text-foreground-muted">{countdown}s</span>
                            {retryCount > 0 && (
                                <span className="ml-1 text-foreground-subtle">
                                    (attempt {retryCount + 1}/{maxRetries})
                                </span>
                            )}
                        </p>
                    )}

                    {/* Digest reference for support */}
                    {error.digest && (
                        <p className="font-mono text-xs text-foreground-subtle">
                            Error ID:{' '}
                            <code className="select-all rounded-md bg-background-subtle px-2 py-0.5 text-foreground-muted">
                                {error.digest}
                            </code>
                        </p>
                    )}
                </div>

                {/* CTA buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:bg-brand-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                        <RotateCcw className="size-4" aria-hidden />
                        Try Again
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-all duration-200 hover:bg-background-subtle hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                        <Home className="size-4" aria-hidden />
                        Go Home
                    </Link>
                </div>

                {/* Subtle help link */}
                {retryCount >= maxRetries && (
                    <p className="text-xs text-foreground-subtle">
                        Still having issues?{' '}
                        <Link href="/contact" className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700">
                            Contact support
                        </Link>
                    </p>
                )}
            </div>
        </div>
    )
}

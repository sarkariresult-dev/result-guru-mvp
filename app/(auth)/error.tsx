'use client'

import Link from 'next/link'
import { useEffect, useCallback } from 'react'
import { SITE } from '@/config/site'
import { RotateCcw, AlertTriangle } from 'lucide-react'

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function AuthError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('[Auth Error]', { message: error.message, digest: error.digest })
    }, [error])

    const handleRetry = useCallback(() => reset(), [reset])

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6 text-center animate-fade-up">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-md">
                    <AlertTriangle className="size-8 text-warning" strokeWidth={1.5} aria-hidden />
                </div>

                <div className="space-y-2">
                    <h1 className="font-display text-xl font-bold text-foreground">
                        Authentication Error
                    </h1>
                    <p className="text-sm text-foreground-muted">
                        Something went wrong during authentication. Please try again.
                    </p>
                    {error.digest && (
                        <p className="font-mono text-xs text-foreground-subtle">
                            Ref: <code className="select-all rounded-md bg-background-subtle px-2 py-0.5">{error.digest}</code>
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleRetry}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition-all hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                        <RotateCcw className="size-4" aria-hidden />
                        Try Again
                    </button>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                        Back to Login
                    </Link>
                    <Link
                        href="/"
                        className="text-xs text-foreground-subtle hover:text-foreground-muted transition-colors"
                    >
                        &larr; Return to {SITE.name}
                    </Link>
                </div>
            </div>
        </div>
    )
}

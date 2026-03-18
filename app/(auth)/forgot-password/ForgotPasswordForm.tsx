'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { forgotPassword } from '@/features/auth/actions'
import { forgotPasswordSchema } from '@/lib/validations'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SITE } from '@/config/site'

/**
 * Forgot password form - sends a password reset link to the user's email.
 *
 * Features:
 * - Client-side Zod validation
 * - Success state with instructions
 * - Contextual error hints (no account → register link, deactivated → contact link)
 * - Accessible, clean design
 */
export default function ForgotPasswordForm() {
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [success, setSuccess] = useState(false)
    const [submittedEmail, setSubmittedEmail] = useState('')
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setFieldErrors({})

        const fd = new FormData(e.currentTarget)
        const raw = { email: fd.get('email') as string }

        /* Client-side validation */
        const parsed = forgotPasswordSchema.safeParse(raw)
        if (!parsed.success) {
            const errs: Record<string, string> = {}
            parsed.error.issues.forEach((issue) => {
                const field = issue.path[0] as string
                if (!errs[field]) errs[field] = issue.message
            })
            setFieldErrors(errs)
            return
        }

        setSubmittedEmail(parsed.data.email)

        startTransition(async () => {
            const result = await forgotPassword(parsed.data)
            if (result.success) {
                setSuccess(true)
            } else {
                setError(result.error ?? 'Something went wrong. Please try again.')
            }
        })
    }

    /* ── Success state ── */
    if (success) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-6 text-center shadow-lg sm:p-8">
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle2
                        className="size-7 text-green-600 dark:text-green-400"
                        strokeWidth={1.5}
                        aria-hidden
                    />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    Check your email
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                    We&apos;ve sent a password reset link to{' '}
                    <span className="font-medium text-foreground">{submittedEmail}</span>.
                    Please check your inbox and click the link to reset your password.
                </p>
                <p className="mt-4 text-xs text-foreground-subtle">
                    Didn&apos;t receive it? Check your spam folder or{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setSuccess(false)
                            setSubmittedEmail('')
                        }}
                        className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                    >
                        try again
                    </button>
                    .
                </p>
                <div className="mt-6 border-t border-border pt-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400"
                    >
                        &larr; Back to Sign In
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">
            {/* ── Header ── */}
            <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    Forgot password?
                </h1>
                <p className="mt-1.5 text-sm text-foreground-muted">
                    Enter your email and we&apos;ll send you a reset link
                </p>
            </div>

            {/* ── Error alert ── */}
            {error && (
                <div
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                >
                    <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                        <span className="flex-1">{error}</span>
                        <button
                            type="button"
                            onClick={() => setError('')}
                            className="shrink-0 text-red-500 hover:text-red-700"
                            aria-label="Dismiss error"
                        >
                            &times;
                        </button>
                    </div>
                    {error.includes('No account found') && (
                        <p className="mt-2 ml-6 text-xs">
                            <Link
                                href="/register"
                                className="font-medium text-red-700 underline hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
                            >
                                Create a new account &rarr;
                            </Link>
                        </p>
                    )}
                    {error.includes('deactivated') && (
                        <p className="mt-2 ml-6 text-xs text-red-600 dark:text-red-400">
                            If you believe this is a mistake, please reach out to us via the{' '}
                            <Link
                                href="/contact"
                                className="font-medium underline hover:text-red-800 dark:hover:text-red-200"
                            >
                                contact page
                            </Link>
                            .
                        </p>
                    )}
                </div>
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                    <label
                        htmlFor="forgot-email"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Email address
                    </label>
                    <div className="relative">
                        <Mail
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
                            aria-hidden
                        />
                        <Input
                            id="forgot-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="you@example.com"
                            error={fieldErrors.email}
                            className="pl-10"
                            disabled={isPending}
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    loading={isPending}
                    disabled={isPending}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                            Sending...
                        </>
                    ) : (
                        'Send Reset Link'
                    )}
                </Button>
            </form>

            {/* ── Footer link ── */}
            <p className="mt-6 text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                >
                    <ArrowLeft className="size-3.5" aria-hidden />
                    Back to Sign In
                </Link>
            </p>
        </div>
    )
}

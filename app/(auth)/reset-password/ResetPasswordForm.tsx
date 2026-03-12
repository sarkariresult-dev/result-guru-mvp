'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react'
import { resetPassword } from '@/lib/actions/auth'
import { resetPasswordSchema } from '@/lib/validations'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

/**
 * Reset password form - set a new password after clicking the reset link.
 *
 * Supabase flow:
 * 1. User clicks reset link in email → /callback?code=...&type=recovery
 * 2. Callback exchanges code for session (user is now authenticated)
 * 3. This form calls supabase.auth.updateUser({ password }) to set new password
 *
 * Features:
 * - Client-side Zod validation
 * - Password + confirm with visibility toggles
 * - Success state with sign-in CTA
 * - Error handling with dismiss
 */
export default function ResetPasswordForm() {
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setFieldErrors({})

        const fd = new FormData(e.currentTarget)
        const raw = {
            password: fd.get('password') as string,
            confirmPassword: fd.get('confirmPassword') as string,
        }

        /* Client-side validation */
        const parsed = resetPasswordSchema.safeParse(raw)
        if (!parsed.success) {
            const errs: Record<string, string> = {}
            parsed.error.issues.forEach((issue) => {
                const field = issue.path[0] as string
                if (!errs[field]) errs[field] = issue.message
            })
            setFieldErrors(errs)
            return
        }

        startTransition(async () => {
            const result = await resetPassword(parsed.data)
            if (result.success) {
                setSuccess(true)
            } else {
                setError(result.error ?? 'Failed to reset password. Please try again.')
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
                    Password updated
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                    Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <div className="mt-6">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        Sign In
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
                    Set new password
                </h1>
                <p className="mt-1.5 text-sm text-foreground-muted">
                    Enter your new password below
                </p>
            </div>

            {/* ── Error alert ── */}
            {error && (
                <div
                    role="alert"
                    className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                >
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
            )}

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* New password */}
                <div>
                    <label
                        htmlFor="reset-password"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        New password
                    </label>
                    <div className="relative">
                        <Lock
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
                            aria-hidden
                        />
                        <Input
                            id="reset-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            placeholder="Min 6 characters"
                            error={fieldErrors.password}
                            className="pl-10 pr-10"
                            disabled={isPending}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle transition-colors hover:text-foreground"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Confirm password */}
                <div>
                    <label
                        htmlFor="reset-confirm"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Confirm new password
                    </label>
                    <div className="relative">
                        <Lock
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
                            aria-hidden
                        />
                        <Input
                            id="reset-confirm"
                            name="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            error={fieldErrors.confirmPassword}
                            className="pl-10 pr-10"
                            disabled={isPending}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle transition-colors hover:text-foreground"
                            aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                            {showConfirm ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    loading={isPending}
                    disabled={isPending}
                >
                    Reset Password
                </Button>
            </form>

            {/* ── Footer link ── */}
            <p className="mt-6 text-center text-sm text-foreground-muted">
                Remember your password?{' '}
                <Link
                    href="/login"
                    className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                >
                    Sign in
                </Link>
            </p>
        </div>
    )
}

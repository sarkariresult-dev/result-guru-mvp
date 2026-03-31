'use client'

import Link from 'next/link'
import { useState, useTransition, useMemo } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle2 } from 'lucide-react'
import { signUp, signInWithGoogle } from '@/features/auth/actions'
import { registerSchema } from '@/lib/validations'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleIcon } from '@/features/shared/components/GoogleIcon'
import { SITE } from '@/config/site'

/**
 * Register form - email/password sign-up + Google OAuth.
 *
 * Features:
 * - Client-side Zod validation (registerSchema) with per-field errors
 * - Live password strength indicator (weak / fair / strong)
 * - Password visibility toggles for both fields
 * - Google OAuth one-click sign-up
 * - Success state with email verification instructions
 * - Accessible labels, focus rings, aria attributes
 * - Loading states on both flows
 */

/* ── Password strength helper ─────────────────────────────── */
type Strength = { level: 0 | 1 | 2 | 3; label: string; color: string; scale: number }

function getPasswordStrength(password: string): Strength {
    if (!password) return { level: 0, label: '', color: '', scale: 0 }

    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500', scale: 0.33 }
    if (score <= 3) return { level: 2, label: 'Fair', color: 'bg-amber-500', scale: 0.66 }
    return { level: 3, label: 'Strong', color: 'bg-green-500', scale: 1 }
}

export default function RegisterForm() {
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [password, setPassword] = useState('')
    const [isPending, startTransition] = useTransition()
    const [isGooglePending, setIsGooglePending] = useState(false)

    const strength = useMemo(() => getPasswordStrength(password), [password])

    /* ── Email/password form handler ── */
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setFieldErrors({})

        const fd = new FormData(e.currentTarget)
        const raw = {
            name: fd.get('name') as string,
            email: fd.get('email') as string,
            password: fd.get('password') as string,
            confirmPassword: fd.get('confirmPassword') as string,
        }

        /* Client-side validation */
        const parsed = registerSchema.safeParse(raw)
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
            const result = await signUp(parsed.data)
            if (result.success) {
                setSuccess(true)
            } else {
                const err = result.error as unknown
                setError(
                    typeof err === 'string'
                        ? err
                        : (err as { message?: string })?.message ?? 'Registration failed. Please try again.',
                )
            }
        })
    }

    /* ── Google OAuth handler ── */
    async function handleGoogleSignIn() {
        setError('')
        setIsGooglePending(true)
        try {
            const result = await signInWithGoogle()
            if (result?.error) {
                setError(result.error)
                setIsGooglePending(false)
            } else if (result?.url) {
                window.location.href = result.url
            }
        } catch {
            setError('Google sign-in failed. Please try again.')
            setIsGooglePending(false)
        }
    }

    const isLoading = isPending || isGooglePending

    /* ── Success state - email verification ── */
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
                    We&apos;ve sent a verification link to your email address.
                    Please check your inbox and click the link to activate your
                    account.
                </p>
                <p className="mt-4 text-xs text-foreground-subtle">
                    Didn&apos;t receive it? Check your spam folder or{' '}
                    <button
                        type="button"
                        onClick={() => setSuccess(false)}
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
                    Create your account
                </h1>
                <p className="mt-1.5 text-sm text-foreground-muted">
                    Join {SITE.name} for job alerts &amp; bookmarks
                </p>
            </div>

            {/* ── Google OAuth ── */}
            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-xs transition-all duration-150 hover:bg-background-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
                {isGooglePending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                    <GoogleIcon />
                )}
                Continue with Google
            </button>

            {/* ── Divider ── */}
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface px-3 text-foreground-subtle">
                        or register with email
                    </span>
                </div>
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

            {/* ── Registration Form ── */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Name field */}
                <div>
                    <label
                        htmlFor="register-name"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Full name
                    </label>
                    <div className="relative">
                        <User
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
                            aria-hidden
                        />
                        <Input
                            id="register-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            placeholder="Your full name"
                            error={fieldErrors.name}
                            className="pl-10"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Email field */}
                <div>
                    <label
                        htmlFor="register-email"
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
                            id="register-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="you@example.com"
                            error={fieldErrors.email}
                            className="pl-10"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Password field */}
                <div>
                    <label
                        htmlFor="register-password"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <Lock
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
                            aria-hidden
                        />
                        <Input
                            id="register-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            placeholder="Min 6 characters"
                            error={fieldErrors.password}
                            className="pl-10 pr-10"
                            disabled={isLoading}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                    {/* Password strength indicator */}
                    {password.length > 0 && (
                        <div className="mt-2 space-y-1">
                            <div className="h-1 w-full overflow-hidden rounded-full bg-background-muted">
                                <div
                                    className={`h-full origin-left rounded-full transition-transform duration-300 ${strength.color}`}
                                    style={{ transform: `scaleX(${strength.scale})` }}
                                />
                            </div>
                            <p className={`text-xs ${strength.level <= 1 ? 'text-red-600 dark:text-red-400' : strength.level === 2 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                                Password strength: {strength.label}
                            </p>
                        </div>
                    )}
                </div>

                {/* Confirm password field */}
                <div>
                    <label
                        htmlFor="register-confirm"
                        className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                        Confirm password
                    </label>
                    <div className="relative">
                        <Lock
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
                            aria-hidden
                        />
                        <Input
                            id="register-confirm"
                            name="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            error={fieldErrors.confirmPassword}
                            className="pl-10 pr-10"
                            disabled={isLoading}
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

                {/* Terms agreement */}
                <p className="text-xs leading-relaxed text-foreground-subtle">
                    By creating an account, you agree to our{' '}
                    <Link
                        href="/terms-of-service"
                        className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                        target="_blank"
                    >
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                        href="/privacy-policy"
                        className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                        target="_blank"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full"
                    loading={isPending}
                    disabled={isLoading}
                >
                    Create Account
                </Button>
            </form>

            {/* ── Footer link ── */}
            <p className="mt-6 text-center text-sm text-foreground-muted">
                Already have an account?{' '}
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

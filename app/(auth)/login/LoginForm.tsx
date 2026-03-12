'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { signIn, signInWithGoogle } from '@/lib/actions/auth'
import { loginSchema } from '@/lib/validations'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GoogleIcon } from '@/components/shared/GoogleIcon'
import { SITE } from '@/config/site'

/**
 * Login form - email/password + Google OAuth.
 *
 * Features:
 * - Client-side Zod validation before server action
 * - Password visibility toggle
 * - Google OAuth one-click sign-in
 * - Forgot password link
 * - Reads ?error param from callback for display
 * - Accessible labels, focus rings, aria attributes
 * - Loading states on both flows
 * - Error display with dismiss
 */
export default function LoginForm() {
    const searchParams = useSearchParams()
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [showPassword, setShowPassword] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isGooglePending, setIsGooglePending] = useState(false)

    /* Pick up error from callback redirect (?error=...) */
    useEffect(() => {
        const urlError = searchParams.get('error')
        if (urlError) setError(urlError)
    }, [searchParams])

    /* ── Email/password form handler ── */
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError('')
        setFieldErrors({})

        const fd = new FormData(e.currentTarget)
        const raw = {
            email: fd.get('email') as string,
            password: fd.get('password') as string,
        }

        /* Client-side validation */
        const parsed = loginSchema.safeParse(raw)
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
            const result = await signIn(parsed.data)
            if (result?.error) {
                const err = result.error as unknown
                setError(
                    typeof err === 'string'
                        ? err
                        : (err as { message?: string })?.message ?? 'Login failed. Please try again.',
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

    return (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">
            {/* ── Header ── */}
            <div className="mb-6 text-center">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    Welcome back
                </h1>
                <p className="mt-1.5 text-sm text-foreground-muted">
                    Sign in to your {SITE.name} account
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
                        or sign in with email
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

            {/* ── Email/Password Form ── */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Email field */}
                <div>
                    <label
                        htmlFor="login-email"
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
                            id="login-email"
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
                    <div className="mb-1.5 flex items-center justify-between">
                        <label
                            htmlFor="login-password"
                            className="text-sm font-medium text-foreground"
                        >
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock
                            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle"
                            aria-hidden
                        />
                        <Input
                            id="login-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            error={fieldErrors.password}
                            className="pl-10 pr-10"
                            disabled={isLoading}
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

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full"
                    loading={isPending}
                    disabled={isLoading}
                >
                    Sign In
                </Button>
            </form>

            {/* ── Footer link ── */}
            <p className="mt-6 text-center text-sm text-foreground-muted">
                Don&apos;t have an account?{' '}
                <Link
                    href="/register"
                    className="font-medium text-brand-600 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
                >
                    Create account
                </Link>
            </p>
        </div>
    )
}

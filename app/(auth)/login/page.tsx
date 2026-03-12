import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SITE } from '@/config/site'
import LoginForm from './LoginForm'

/* ── SEO (noindex inherited from auth layout, title for browser tab) ── */
export const metadata: Metadata = {
    title: 'Sign In',
    description: `Sign in to your ${SITE.name} account to access job alerts, bookmarks, and personalised updates.`,
}

/**
 * Login page - server component wrapper.
 * Renders the client-side LoginForm inside Suspense (required for useSearchParams).
 */
export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
        </Suspense>
    )
}

/* ── Skeleton shown while LoginForm's useSearchParams resolves ── */
function LoginFormSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8">
            <div className="mb-6 flex flex-col items-center gap-2">
                <div className="h-7 w-40 rounded-lg bg-background-muted" />
                <div className="h-4 w-56 rounded bg-background-muted" />
            </div>
            <div className="h-10 w-full rounded-xl bg-background-muted" />
            <div className="my-6 h-px w-full bg-border" />
            <div className="space-y-4">
                <div className="h-4 w-24 rounded bg-background-muted" />
                <div className="h-9 w-full rounded-lg bg-background-muted" />
                <div className="h-4 w-20 rounded bg-background-muted" />
                <div className="h-9 w-full rounded-lg bg-background-muted" />
                <div className="h-9 w-full rounded-lg bg-brand-600/20" />
            </div>
        </div>
    )
}

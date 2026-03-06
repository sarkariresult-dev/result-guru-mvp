import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/config/site'
import { Logo } from '@/components/shared/Logo'
import { FileText, Bell, Bookmark, Shield } from 'lucide-react'

/**
 * Auth layout — split-screen design.
 *
 * Left panel:  Brand showcase with gradient, value props, trust signals.
 * Right panel: Scrollable auth forms (login, register, forgot/reset password).
 *
 * Responsive:
 * - Mobile (<lg): single-column, compact brand header + form below
 * - Desktop (lg+): 50/50 split with fixed left + scrollable right
 */

/* ── SEO — auth pages must never be indexed ────────────────── */
export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

const VALUE_PROPS = [
    {
        icon: FileText,
        title: 'Latest Sarkari Results',
        description: 'Instant updates on all government exam results & notifications',
    },
    {
        icon: Bell,
        title: 'Smart Job Alerts',
        description: 'Get notified about new vacancies matching your preferences',
    },
    {
        icon: Bookmark,
        title: 'Save & Track',
        description: 'Bookmark posts and track application deadlines easily',
    },
    {
        icon: Shield,
        title: 'Trusted & Verified',
        description: 'All information sourced from official government portals',
    },
]

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:flex-row lg:overflow-hidden">
            {/* ─────────────── Left Panel — Branding (desktop only) ─────────────── */}
            <div className="relative hidden w-1/2 shrink-0 overflow-hidden bg-linear-to-br from-brand-600 via-brand-700 to-brand-900 lg:flex lg:flex-col lg:justify-between">
                {/* Decorative elements */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/5 blur-[80px]" />
                    <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-accent-500/10 blur-[100px]" />
                    <div className="absolute right-12 top-1/3 h-48 w-48 rounded-full bg-white/3 blur-[60px]" />
                    {/* Grid overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                        }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-1 flex-col justify-center space-y-4 px-10 xl:px-16">
                    {/* Back */}
                    <Link
                        href="/"
                        className="group mb-6 flex items-center gap-3 transition-opacity hover:opacity-90"
                        aria-label={`Go to ${SITE.name} homepage`}
                    >
                        <Logo height={36} forceDark />
                    </Link>
                    {/* Headline */}
                    <h1 className="mb-2 font-display text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
                        Your gateway to<br />
                        <span className="text-accent-300">government careers</span>
                    </h1>
                    <p className="max-w-sm text-sm leading-relaxed text-white/70">
                        {SITE.tagline}. Join thousands of aspirants who trust us for accurate and timely updates.
                    </p>

                    {/* Value Props */}
                    <div className="space-y-5">
                        {VALUE_PROPS.map((prop) => (
                            <div key={prop.title} className="flex items-start gap-3.5">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                                    <prop.icon className="size-4.5 text-accent-300" strokeWidth={1.5} aria-hidden />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{prop.title}</h3>
                                    <p className="mt-0.5 text-xs leading-relaxed text-white/60">{prop.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between bg-white/5 px-10 py-4 text-sm">
                    <p className="text-white/40">
                        &copy; {SITE.name}. All rights reserved.
                    </p>
                    <div className="space-x-4 text-white/60">
                        <Link
                            href="/privacy-policy"
                            className="hover:text-white transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms-of-service"
                            className="hover:text-white transition-colors"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>

            {/* ─────────────── Right Panel — Auth Forms ─────────────── */}
            <div className="flex w-full flex-1 flex-col lg:w-1/2 lg:overflow-y-auto">
                {/* Mobile brand header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-4 lg:hidden">
                    <Link
                        href="/"
                        className="flex items-center gap-2"
                        aria-label={`Go to ${SITE.name} homepage`}
                    >
                        <Logo height={34} />
                    </Link>
                    <Link
                        href="/"
                        className="text-xs text-foreground-subtle transition-colors hover:text-foreground-muted"
                    >
                        ← Home
                    </Link>
                </div>

                {/* Form area */}
                <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
                    <div className="w-full max-w-105">
                        {children}
                    </div>
                </div>

                {/* Mobile footer — compliance links (hidden on desktop, shown in left panel there) */}
                <div className="border-t border-border px-5 py-4 lg:hidden">
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-foreground-subtle">
                        <Link
                            href="/privacy-policy"
                            className="transition-colors hover:text-foreground-muted"
                        >
                            Privacy Policy
                        </Link>
                        <span aria-hidden className="text-border">·</span>
                        <Link
                            href="/terms-of-service"
                            className="transition-colors hover:text-foreground-muted"
                        >
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

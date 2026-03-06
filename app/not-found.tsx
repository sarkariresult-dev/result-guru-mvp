import Link from 'next/link'
import type { Metadata } from 'next'
import { Home, Search, ArrowRight, Briefcase, FileText, CreditCard, Key, BookOpen, Star } from 'lucide-react'
import { ROUTE_PREFIXES } from '@/config/site'

export const metadata: Metadata = {
    title: '404 — Page Not Found',
    description:
        'The page you\'re looking for doesn\'t exist or has been moved. Browse our latest Results, Government Jobs, and Admit Cards.',
    robots: { index: false, follow: true },
}

/* Quick-links — high-traffic sections to retain visitors */
const quickLinks = [
    { label: 'Latest Jobs', href: ROUTE_PREFIXES.job, Icon: Briefcase },
    { label: 'Exam Results', href: ROUTE_PREFIXES.result, Icon: FileText },
    { label: 'Admit Cards', href: ROUTE_PREFIXES.admit, Icon: CreditCard },
    { label: 'Answer Keys', href: ROUTE_PREFIXES.answer_key, Icon: Key },
    { label: 'Syllabus', href: ROUTE_PREFIXES.syllabus, Icon: BookOpen },
    { label: 'Schemes', href: ROUTE_PREFIXES.scheme, Icon: Star },
] as const

export default function NotFound() {
    return (
        <div className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
            {/* Decorative ambient blobs */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-32 -top-32 h-112 w-md rounded-full bg-brand-500/6 blur-[120px]" />
                <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-accent-500/5 blur-[100px]" />
            </div>

            <div className="animate-fade-up relative z-10 flex w-full max-w-lg flex-col items-center gap-10 text-center">
                {/* Large 404 numeral */}
                <div className="select-none" aria-hidden>
                    <span className="font-display text-[7rem] font-extrabold leading-none tracking-tighter text-gradient-brand sm:text-[9rem]">
                        404
                    </span>
                </div>

                {/* Heading & description */}
                <div className="space-y-3">
                    <h1 className="font-display text-fluid-xl font-bold tracking-tight text-foreground">
                        Page Not Found
                    </h1>
                    <p className="mx-auto max-w-sm text-sm leading-relaxed text-foreground-muted">
                        The page you&apos;re looking for doesn&apos;t exist or may have been
                        moved. Use the links below to find what you need.
                    </p>
                </div>

                {/* Primary CTA buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:bg-brand-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                        <Home className="size-4" aria-hidden />
                        Go Home
                    </Link>
                    <Link
                        href="/search"
                        className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-all duration-200 hover:bg-background-subtle hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.97]"
                    >
                        <Search className="size-4" aria-hidden />
                        Search
                    </Link>
                </div>

                {/* Quick-nav grid — reduces bounce rate */}
                <div className="w-full border-t border-border pt-8">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-foreground-subtle">
                        Popular Sections
                    </p>
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {quickLinks.map(({ label, href, Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="group flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-foreground-muted transition-all duration-200 hover:border-brand-300 hover:bg-background-subtle hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:border-brand-700 dark:hover:text-brand-400"
                            >
                                <Icon className="size-4 shrink-0 text-foreground-subtle transition-colors group-hover:text-brand-500" aria-hidden />
                                <span className="flex-1">{label}</span>
                                <ArrowRight className="size-3.5 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5" aria-hidden />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

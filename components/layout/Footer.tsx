'use client'

import Link from 'next/link'
import { SITE, FOOTER_NAV } from '@/config/site'
import { Logo } from '@/components/shared/Logo'

export function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="border-t border-border bg-background-muted">
            <div className="container mx-auto max-w-7xl px-4 py-12">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="inline-block" aria-label="Result Guru home">
                            <Logo height={32} />
                        </Link>
                        <p className="mt-3 text-sm leading-relaxed text-foreground-muted max-w-xs">
                            {SITE.description}
                        </p>
                    </div>

                    {/* Nav groups from config */}
                    {FOOTER_NAV.map((group) => (
                        <div key={group.label}>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground-subtle">
                                {group.label}
                            </h3>
                            <ul className="space-y-2">
                                {group.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            prefetch={false}
                                            className="text-sm text-foreground-muted hover:text-brand-600 transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
                    <p className="text-sm text-foreground-subtle">
                        © {year} {SITE.name}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-foreground-subtle">
                        <Link href="/privacy-policy" prefetch={false} className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/terms-of-service" prefetch={false} className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href="/disclaimer" prefetch={false} className="hover:text-foreground transition-colors">Disclaimer</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

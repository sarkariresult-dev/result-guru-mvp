'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { X, Cookie } from 'lucide-react'
import { STORAGE_KEYS } from '@/config/constants'

type ConsentState = 'pending' | 'accepted' | 'rejected'

/**
 * GDPR / cookie consent banner.
 * Stores preference in localStorage (`rg_cookie_consent`).
 *
 * When user hasn't consented, GTM/GA4 scripts in root layout
 * still load (they're SSR'd). For full compliance at scale, you'd gate
 * those behind consent too — this banner records user preference and
 * sends a consent signal to GTM via dataLayer.
 */
export function CookieConsent() {
    const [consent, setConsent] = useState<ConsentState>('pending')
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT)
            if (stored === 'accepted' || stored === 'rejected') {
                setConsent(stored)
                // Push consent state to GTM dataLayer
                if (typeof window !== 'undefined' && stored === 'accepted') {
                    ; (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer?.push({
                        event: 'cookie_consent_granted',
                    })
                }
                return
            }
            // Show banner after a small delay for better UX
            const timer = setTimeout(() => setVisible(true), 1500)
            return () => clearTimeout(timer)
        } catch {
            // localStorage not available (private mode, etc.)
            setVisible(true)
            return
        }
    }, [])

    const handleAccept = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'accepted')
        } catch { /* ignore */ }
        setConsent('accepted')
        setVisible(false)
        // Signal GTM
        if (typeof window !== 'undefined') {
            ; (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer?.push({
                event: 'cookie_consent_granted',
            })
        }
    }, [])

    const handleReject = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'rejected')
        } catch { /* ignore */ }
        setConsent('rejected')
        setVisible(false)
        // Signal GTM
        if (typeof window !== 'undefined') {
            ; (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer?.push({
                event: 'cookie_consent_denied',
            })
        }
    }, [])

    // Don't render if consent already given or banner not yet ready
    if (consent !== 'pending' || !visible) return null

    return (
        <div
            role="dialog"
            aria-label="Cookie consent"
            className="fixed inset-x-0 bottom-0 z-9999 animate-fade-up p-4 sm:p-6"
        >
            <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xl sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                <div className="flex items-start gap-3 sm:items-center">
                    <Cookie className="mt-0.5 size-5 shrink-0 text-brand-600 sm:mt-0" aria-hidden />
                    <p className="text-sm leading-relaxed text-foreground-muted">
                        We use cookies and similar technologies to improve your experience and provide analytics.
                        By continuing, you agree to our{' '}
                        <Link
                            href="/privacy-policy"
                            className="font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                    <button
                        onClick={handleReject}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
                    >
                        Reject
                    </button>
                    <button
                        onClick={handleAccept}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 shadow-brand"
                    >
                        Accept
                    </button>
                    <button
                        onClick={handleReject}
                        aria-label="Close cookie banner"
                        className="ml-1 rounded-md p-1 text-foreground-subtle hover:text-foreground transition-colors sm:hidden"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

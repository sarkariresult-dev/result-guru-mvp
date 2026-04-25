'use client'

import dynamic from 'next/dynamic'

const CookieConsent = dynamic(
    () => import('@/features/shared/components/CookieConsent').then((mod) => mod.CookieConsent),
    { ssr: false }
)

export function CookieConsentWrapper() {
    return <CookieConsent />
}

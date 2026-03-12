'use client'

import dynamic from 'next/dynamic'

/* Below-fold client components - lazy-loaded with ssr:false to reduce initial bundle.
   Wrapped in a Client Component because next/dynamic ssr:false is disallowed in Server Components. */

export const AdZone = dynamic(
    () => import('@/components/ads/AdZone').then(m => m.AdZone),
    { ssr: false },
)

export const NewsletterForm = dynamic(
    () => import('@/components/shared/NewsletterForm').then(m => m.NewsletterForm),
    { ssr: false },
)

export const PostActionBar = dynamic(
    () => import('@/components/posts/PostActionBar').then(m => m.PostActionBar),
    { ssr: false },
)

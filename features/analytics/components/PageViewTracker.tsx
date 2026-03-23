'use client'

import { usePageView } from '@/hooks/usePageView'

interface Props {
    postId: string
}

/**
 * Lightweight Client Component wrapper for the usePageView hook.
 * This is injected into the Server Component post pages so that 
 * analytics are recorded without converting the whole page to a Client Component.
 */
export function PageViewTracker({ postId }: Props) {
    usePageView(postId)
    return null
}

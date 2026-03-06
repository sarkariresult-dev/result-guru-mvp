'use client'

/**
 * useCopyToClipboard — Result Guru
 *
 * Copies text to clipboard with success/error feedback.
 * Resets the `copied` flag after `resetMs` milliseconds.
 *
 * Usage:
 *   const { copy, copied, error } = useCopyToClipboard()
 *   <button onClick={() => copy(post.url)}>{copied ? 'Copied!' : 'Share'}</button>
 */

import { useState, useCallback } from 'react'

export function useCopyToClipboard(resetMs = 2000) {
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const copy = useCallback(
        async (text: string) => {
            setError(null)
            try {
                await navigator.clipboard.writeText(text)
                setCopied(true)
                setTimeout(() => setCopied(false), resetMs)
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to copy'
                setError(message)
            }
        },
        [resetMs],
    )

    return { copy, copied, error }
}
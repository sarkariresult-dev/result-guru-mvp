'use client'

/**
 * useCopyToClipboard - Result Guru
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
                // Primary: Clipboard API (not available in restricted iframes)
                if (navigator?.clipboard?.writeText) {
                    await navigator.clipboard.writeText(text)
                } else {
                    // Fallback: execCommand (works in more contexts)
                    const textarea = document.createElement('textarea')
                    textarea.value = text
                    textarea.style.position = 'fixed'
                    textarea.style.opacity = '0'
                    document.body.appendChild(textarea)
                    textarea.select()
                    document.execCommand('copy')
                    document.body.removeChild(textarea)
                }
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

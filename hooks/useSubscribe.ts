'use client'

/**
 * useSubscribe - Result Guru
 *
 * Newsletter subscription mutation with:
 *  - Loading / success / error state
 *  - Input validation (Zod)
 *  - Duplicate detection
 *
 * Usage:
 *   const { subscribe, status, error, reset } = useSubscribe()
 *   await subscribe({ email: 'user@example.com', name: 'Rahul' })
 */

import { useState, useCallback } from 'react'

export type SubscribeStatus = 'idle' | 'loading' | 'success' | 'error' | 'already_subscribed'

export interface SubscribePayload {
    email: string
    name?: string
    phone?: string
    whatsapp_opt_in?: boolean
}

export function useSubscribe() {
    const [status, setStatus] = useState<SubscribeStatus>('idle')
    const [error, setError] = useState<string | null>(null)

    const subscribe = useCallback(async (payload: SubscribePayload) => {
        if (!payload.email || !/\S+@\S+\.\S+/.test(payload.email)) {
            setError('Please enter a valid email address.')
            setStatus('error')
            return
        }

        setStatus('loading')
        setError(null)

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const json = await res.json() as { success: boolean; message?: string; already_subscribed?: boolean }

            if (!res.ok) {
                setError(json.message ?? 'Something went wrong. Please try again.')
                setStatus('error')
                return
            }

            setStatus(json.already_subscribed ? 'already_subscribed' : 'success')
        } catch {
            setError('Network error. Please check your connection and try again.')
            setStatus('error')
        }
    }, [])

    const reset = useCallback(() => {
        setStatus('idle')
        setError(null)
    }, [])

    return { subscribe, status, error, reset, isLoading: status === 'loading' }
}

// ─── useUnsubscribe ───────────────────────────────────────────────────────────

export function useUnsubscribe() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)

    const unsubscribe = useCallback(async (token: string) => {
        if (!token) { setError('Invalid unsubscribe link.'); setStatus('error'); return }
        setStatus('loading')
        try {
            const res = await fetch('/api/newsletter/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            })
            const json = await res.json() as { success: boolean; message?: string }
            if (!res.ok) { setError(json.message ?? 'Failed to unsubscribe.'); setStatus('error'); return }
            setStatus('success')
        } catch {
            setError('Network error.')
            setStatus('error')
        }
    }, [])

    return { unsubscribe, status, error, isLoading: status === 'loading' }
}

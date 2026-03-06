'use client'

import { useState } from 'react'
import { subscribe } from '@/lib/actions/subscribers'
import { Button } from '@/components/ui/Button'

export function NewsletterForm() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        const result = await subscribe({ email, whatsapp_opt_in: false, preferences: {} })
        setStatus(result.success ? 'success' : 'error')
    }

    if (status === 'success') {
        return <p className="text-sm font-medium text-green-600">Thank you for subscribing!</p>
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2" aria-label="Newsletter subscription">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                aria-label="Email address for newsletter"
                className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm"
            />
            <Button type="submit" loading={status === 'loading'} size="md">Subscribe</Button>
        </form>
    )
}

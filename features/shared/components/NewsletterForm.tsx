'use client'

import { useActionState } from 'react'
import { subscribe } from '@/features/subscribers/actions'
import { Button } from '@/components/ui/Button'

export function NewsletterForm() {
    const [state, formAction, isPending] = useActionState(subscribe, null)

    if (state?.success) {
        return <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{state.message}</p>
    }

    return (
        <form action={formAction} className="flex flex-col gap-2" aria-label="Newsletter subscription">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    disabled={isPending}
                    aria-label="Email address for newsletter"
                    className="h-10 w-full sm:flex-1 rounded-lg border border-border bg-surface px-3 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                <Button type="submit" loading={isPending} className="h-10 w-full sm:w-auto font-semibold">Subscribe</Button>
            </div>
            {state?.error && (
                <p className="text-xs font-medium text-rose-500">{state.error}</p>
            )}
        </form>
    )
}

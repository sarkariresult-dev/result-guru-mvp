'use client'

import { useTransition } from 'react'
import { LogOut } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

export function LogoutButton({ variant = 'icon' }: { variant?: 'icon' | 'full' }) {
    const [isPending, startTransition] = useTransition()

    const handleLogout = () => {
        startTransition(async () => {
            await signOut()
        })
    }

    if (variant === 'full') {
        return (
            <button
                onClick={handleLogout}
                disabled={isPending}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
                <LogOut className="size-4" />
                {isPending ? 'Signing out…' : 'Sign Out'}
            </button>
        )
    }

    return (
        <button
            onClick={handleLogout}
            disabled={isPending}
            className="inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted hover:bg-background-subtle hover:text-red-600"
            aria-label="Sign out"
            title="Sign out"
        >
            <LogOut className="size-4.5" strokeWidth={1.75} />
        </button>
    )
}

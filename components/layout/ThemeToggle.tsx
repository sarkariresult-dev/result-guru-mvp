'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted) return <div className="size-9" />

    const icons = { light: Sun, dark: Moon, system: Monitor } as const
    const Icon = icons[(theme as keyof typeof icons)] ?? Monitor

    const cycle = () => {
        const order = ['system', 'light', 'dark'] as const
        const idx = order.indexOf((theme as typeof order[number]) ?? 'system')
        setTheme(order[(idx + 1) % order.length] as string)
    }

    return (
        <button
            onClick={cycle}
            className="inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
            aria-label={`Switch theme (current: ${theme})`}
        >
            <Icon className="size-4.5" strokeWidth={1.75} />
        </button>
    )
}

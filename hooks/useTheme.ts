'use client'

/**
 * useTheme — Result Guru
 *
 * Re-exports next-themes `useTheme` and adds:
 *  - `isDark` / `isLight` booleans
 *  - `toggleTheme()` one-call toggle
 *  - Resolved theme accounting for "system" preference
 *
 * Usage:
 *   const { isDark, toggleTheme } = useTheme()
 */

export { useTheme as useNextTheme } from 'next-themes'

import { useCallback } from 'react'
import { useTheme as _useTheme } from 'next-themes'

export interface UseThemeReturn {
    theme: string | undefined
    resolvedTheme: string | undefined
    setTheme: (theme: string) => void
    toggleTheme: () => void
    isDark: boolean
    isLight: boolean
    systemTheme: string | undefined
    themes: string[]
}

export function useTheme(): UseThemeReturn {
    const { theme, resolvedTheme, setTheme, systemTheme, themes } = _useTheme()

    const isDark = resolvedTheme === 'dark'
    const isLight = resolvedTheme === 'light'

    const toggleTheme = useCallback(() => {
        setTheme(isDark ? 'light' : 'dark')
    }, [isDark, setTheme])

    return { theme, resolvedTheme, setTheme, toggleTheme, isDark, isLight, systemTheme, themes }
}
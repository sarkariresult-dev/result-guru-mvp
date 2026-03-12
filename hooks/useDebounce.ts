'use client'

/**
 * useDebounce - Result Guru
 *
 * Delays updating the returned value until `delay` ms have passed
 * since the last change. Ideal for search inputs and auto-save.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(query, 300)
 *   // use debouncedQuery as the React Query queryKey / fetch param
 */

import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState<T>(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}
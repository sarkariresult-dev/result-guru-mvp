'use client'

/**
 * useLocalStorage - Result Guru
 *
 * SSR-safe localStorage hook with:
 *  - Lazy initialisation (avoids hydration mismatch)
 *  - Cross-tab synchronisation via the `storage` event
 *  - Functional updates like useState
 *  - Optional serializer/deserializer override
 *  - `removeItem` helper for clearing the key
 *
 * Usage:
 *   const [bookmarks, setBookmarks, clearBookmarks] =
 *     useLocalStorage<string[]>('rg_bookmarks', [])
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

interface Options<T> {
    serializer?: (value: T) => string
    deserializer?: (raw: string) => T
}

export function useLocalStorage<T>(
    key: string,
    initialValue: T,
    options?: Options<T>,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    const serialize = useMemo(() => options?.serializer ?? JSON.stringify, [options?.serializer])
    const deserialize = useMemo(() => options?.deserializer ?? ((raw: string) => JSON.parse(raw) as T), [options?.deserializer])

    // Read once, lazily - avoids SSR / hydration mismatch
    const readValue = useCallback((): T => {
        if (typeof window === 'undefined') return initialValue
        try {
            // In cross-origin iframes (AdSense preview), even accessing
            // window.localStorage can throw SecurityError in some browsers.
            // Double-wrap to be absolutely safe during initial render.
            const storage = window.localStorage
            if (!storage) return initialValue
            
            const item = storage.getItem(key)
            return item !== null ? deserialize(item) : initialValue
        } catch {
            // SecurityError, QuotaExceeded, or any storage restriction - use in-memory value
            return initialValue
        }
    }, [key, initialValue, deserialize])

    const [stored, setStored] = useState<T>(readValue)

    // Keep initialValue reference stable so the effect below doesn't re-fire
    const initialValueRef = useRef(initialValue)

    // Sync with external changes to the same key (e.g. another tab)
    useEffect(() => {
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key !== key) return
            if (e.newValue === null) {
                setStored(initialValueRef.current)
            } else {
                try {
                    setStored(deserialize(e.newValue))
                } catch {
                    setStored(initialValueRef.current)
                }
            }
        }
        
        try {
            window.addEventListener('storage', handleStorageEvent)
            return () => window.removeEventListener('storage', handleStorageEvent)
        } catch {
            return () => {}
        }
    }, [key, deserialize])

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStored((prev) => {
                const next = value instanceof Function ? value(prev) : value
                try {
                    window.localStorage.setItem(key, serialize(next))
                } catch {
                    // Quota exceeded, private mode, or restricted iframe - silently ignore
                }
                return next
            })
        },
        [key, serialize],
    )

    const removeItem = useCallback(() => {
        try {
            window.localStorage.removeItem(key)
        } catch { /* ignore */ }
        setStored(initialValueRef.current)
    }, [key])

    return [stored, setValue, removeItem]
}

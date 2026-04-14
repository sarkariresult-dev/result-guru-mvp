'use client'

/**
 * useBookmarks - Result Guru
 *
 * Persist bookmarked post slugs in localStorage.
 * Works offline and without a user account.
 *
 * Usage:
 *   const { bookmarks, toggle, isBookmarked, clear } = useBookmarks()
 */

import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { STORAGE_KEYS, MAX_BOOKMARKS } from '@/config/constants'

export interface BookmarkEntry {
    slug: string
    title: string
    type: string
    savedAt: string   // ISO timestamp
}

export function useBookmarks() {
    const [storedBookmarks, setBookmarks] = useLocalStorage<BookmarkEntry[]>(
        STORAGE_KEYS.BOOKMARKS,
        [],
    )

    // Ensure it's always an array in case of corruption or storage failure
    const bookmarks = Array.isArray(storedBookmarks) ? storedBookmarks : []

    const isBookmarked = useCallback(
        (slug: string) => bookmarks.some((b) => b.slug === slug),
        [bookmarks],
    )

    const add = useCallback(
        (entry: Omit<BookmarkEntry, 'savedAt'>) => {
            setBookmarks((prev) => {
                if (prev.some((b) => b.slug === entry.slug)) return prev
                if (prev.length >= MAX_BOOKMARKS) {
                    // Remove the oldest entry to stay under limit
                    return [...prev.slice(1), { ...entry, savedAt: new Date().toISOString() }]
                }
                return [...prev, { ...entry, savedAt: new Date().toISOString() }]
            })
        },
        [setBookmarks],
    )

    const remove = useCallback(
        (slug: string) => {
            setBookmarks((prev) => prev.filter((b) => b.slug !== slug))
        },
        [setBookmarks],
    )

    const toggle = useCallback(
        (entry: Omit<BookmarkEntry, 'savedAt'>) => {
            if (isBookmarked(entry.slug)) {
                remove(entry.slug)
            } else {
                add(entry)
            }
        },
        [isBookmarked, add, remove],
    )

    const clear = useCallback(() => setBookmarks([]), [setBookmarks])

    return {
        bookmarks,
        isBookmarked,
        add,
        remove,
        toggle,
        clear,
        count: bookmarks.length,
    }
}
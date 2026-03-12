'use client'

/**
 * useSearch - Result Guru
 *
 * Full search experience hook:
 *  - Debounced query to avoid spamming Supabase
 *  - Suggestions via full-text search on v_published_posts
 *  - Recent searches persisted in localStorage
 *  - useSearchResults for full results page
 *
 * Usage:
 *   const { query, setQuery, suggestions, isLoading } = useSearch()
 */

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useDebounce } from './useDebounce'
import { useLocalStorage } from './useLocalStorage'
import { queryKeys } from '@/config/query-keys'
import { SEARCH, STORAGE_KEYS, STALE_TIME, MAX_RECENT_SEARCHES } from '@/config/constants'
import type { PostCard } from '@/types/post.types'

// ─── useSearch (autocomplete) ────────────────────────────────────────────────

export function useSearch() {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebounce(query, SEARCH.DEBOUNCE_MS)
    const isTyping = query !== debouncedQuery

    const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
        STORAGE_KEYS.RECENT_SEARCHES,
        [],
    )

    const suggestionsQuery = useQuery<PostCard[]>({
        queryKey: queryKeys.search.suggest(debouncedQuery),
        staleTime: STALE_TIME.POSTS,
        enabled: debouncedQuery.trim().length >= SEARCH.MIN_QUERY_LENGTH,
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('v_published_posts')
                .select('id, type, title, slug, state_name, org_short_name, published_at')
                .textSearch('search_vector', debouncedQuery, { type: 'websearch' })
                .order('published_at', { ascending: false })
                .limit(SEARCH.AUTOCOMPLETE_MAX)

            if (error) throw error
            return (data ?? []) as PostCard[]
        },
    })

    const addRecentSearch = useCallback(
        (term: string) => {
            if (!term.trim()) return
            setRecentSearches((prev) => {
                const filtered = prev.filter((s) => s !== term)
                return [term, ...filtered].slice(0, MAX_RECENT_SEARCHES)
            })
        },
        [setRecentSearches],
    )

    const removeRecentSearch = useCallback(
        (term: string) => {
            setRecentSearches((prev) => prev.filter((s) => s !== term))
        },
        [setRecentSearches],
    )

    const clearRecentSearches = useCallback(() => {
        setRecentSearches([])
    }, [setRecentSearches])

    const clearQuery = useCallback(() => setQuery(''), [])

    return {
        query,
        setQuery,
        clearQuery,
        debouncedQuery,
        isTyping,
        suggestions: suggestionsQuery.data ?? [],
        isSuggestLoading: suggestionsQuery.isFetching || isTyping,
        suggestError: suggestionsQuery.error,
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        hasQuery: debouncedQuery.trim().length >= SEARCH.MIN_QUERY_LENGTH,
    }
}

// ─── useSearchResults (full results page) ────────────────────────────────────

export function useSearchResults(query: string, page = 1) {
    const limit = SEARCH.RESULTS_PER_PAGE
    const debouncedQuery = useDebounce(query, SEARCH.DEBOUNCE_MS)

    return useQuery<{ data: PostCard[]; total: number }>({
        queryKey: queryKeys.search.results(`${debouncedQuery}:${page}`),
        staleTime: STALE_TIME.POSTS,
        enabled: debouncedQuery.trim().length >= SEARCH.MIN_QUERY_LENGTH,
        queryFn: async () => {
            const supabase = createClient()
            const { data, error, count } = await supabase
                .from('v_published_posts')
                .select(
                    'id, type, application_status, title, slug, excerpt, state_name, org_short_name, published_at, reading_time_min',
                    { count: 'exact' },
                )
                .textSearch('search_vector', debouncedQuery, { type: 'websearch' })
                .order('published_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1)

            if (error) throw error
            return { data: (data ?? []) as PostCard[], total: count ?? 0 }
        },
    })
}
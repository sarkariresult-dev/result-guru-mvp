import 'server-only'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Get top search queries ranked by frequency.
 */
export async function getTopSearchQueries(limit = 20) {
    const supabase = await createServerClient()

    // Aggregate queries by text - group, count, sort by frequency
    const { data, error } = await supabase
        .from('search_queries')
        .select('query, results_count')
        .order('searched_at', { ascending: false })
        .limit(500) // fetch recent 500 for aggregation

    if (error || !data) return []

    // Aggregate client-side (Supabase doesn't support GROUP BY via JS client)
    const map = new Map<string, { count: number; avgResults: number; totalResults: number }>()
    for (const row of data) {
        const q = row.query.toLowerCase().trim()
        const existing = map.get(q)
        if (existing) {
            existing.count++
            existing.totalResults += row.results_count
            existing.avgResults = Math.round(existing.totalResults / existing.count)
        } else {
            map.set(q, { count: 1, avgResults: row.results_count, totalResults: row.results_count })
        }
    }

    return Array.from(map.entries())
        .map(([query, stats]) => ({ query, ...stats }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
}

/**
 * Get zero-result queries (content gaps).
 */
export async function getZeroResultQueries(limit = 20) {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('search_queries')
        .select('query, searched_at')
        .eq('results_count', 0)
        .order('searched_at', { ascending: false })
        .limit(200)

    if (error || !data) return []

    // Aggregate by query - count frequency of zero-result queries
    const map = new Map<string, { count: number; lastSearched: string }>()
    for (const row of data) {
        const q = row.query.toLowerCase().trim()
        const existing = map.get(q)
        if (existing) {
            existing.count++
        } else {
            map.set(q, { count: 1, lastSearched: row.searched_at })
        }
    }

    return Array.from(map.entries())
        .map(([query, stats]) => ({ query, ...stats }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
}

/**
 * Get recent search activity log.
 */
export async function getRecentSearches(limit = 30) {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('search_queries')
        .select('id, query, results_count, device, searched_at')
        .order('searched_at', { ascending: false })
        .limit(limit)

    if (error) return []
    return data ?? []
}

/**
 * Get search overview stats.
 */
export async function getSearchStats() {
    const supabase = await createServerClient()

    // Total searches
    const { count: totalSearches } = await supabase
        .from('search_queries')
        .select('*', { count: 'exact', head: true })

    // Zero-result count
    const { count: zeroResults } = await supabase
        .from('search_queries')
        .select('*', { count: 'exact', head: true })
        .eq('results_count', 0)

    // Searches with clicks
    const { count: withClicks } = await supabase
        .from('search_queries')
        .select('*', { count: 'exact', head: true })
        .not('post_clicked', 'is', null)

    return {
        totalSearches: totalSearches ?? 0,
        zeroResults: zeroResults ?? 0,
        withClicks: withClicks ?? 0,
        clickRate: totalSearches ? Math.round(((withClicks ?? 0) / totalSearches) * 100) : 0,
    }
}

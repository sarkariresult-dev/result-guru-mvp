import 'server-only'
import { createStaticClient } from '@/lib/supabase/static'
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'
import type { State } from '@/types/taxonomy.types'

/**
 * Get all active states, ordered by sort_order.
 * Used for state listing page, nav dropdowns, and PostForm selects.
 */
export async function getStates(): Promise<State[]> {
    'use cache'
    cacheLife('days')
    cacheTag('taxonomy', 'states')

    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('states')
        .select('slug, name, abbr, is_active, sort_order, meta_title, meta_description, meta_robots')
        .eq('is_active', true)
        .order('sort_order')
    if (error) throw new Error(`getStates: ${error.message}`)
    return (data ?? []) as State[]
}

/**
 * Get a single state by slug (full row for state detail page).
 */
export async function getStateBySlug(slug: string): Promise<State | null> {
    'use cache'
    cacheLife('days')
    cacheTag('taxonomy', `state-${slug}`)

    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('states')
        .select('*')
        .eq('slug', slug)
        .single()
    if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`getStateBySlug: ${error.message}`)
    }
    return data as State
}

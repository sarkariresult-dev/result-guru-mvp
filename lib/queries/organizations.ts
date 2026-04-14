import 'server-only'
import { createStaticClient } from '@/lib/supabase/static'
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'
import type { Organization } from '@/types/taxonomy.types'

/**
 * Get all active organizations, optionally filtered by state.
 */
export async function getOrganizations(stateSlug?: string): Promise<Organization[]> {
    'use cache'
    cacheLife('days')
    cacheTag('taxonomy', 'organizations', stateSlug ? `orgs-${stateSlug}` : 'orgs-all')

    const supabase = createStaticClient()
    let query = supabase
        .from('organizations')
        .select('id, slug, name, short_name, state_slug, official_url, logo_url, meta_title, meta_description')
        .eq('is_active', true)

    if (stateSlug) query = query.eq('state_slug', stateSlug)

    const { data, error } = await query.order('name')
    if (error) throw new Error(`getOrganizations: ${error.message}`)
    return (data ?? []) as Organization[]
}

/**
 * Get popular organizations for the homepage (limited set).
 */
export async function getPopularOrganizations(limit = 12): Promise<Organization[]> {
    'use cache'
    cacheLife('days')
    cacheTag('taxonomy', 'organizations', 'orgs-popular')

    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('organizations')
        .select('id, slug, name, short_name, logo_url')
        .eq('is_active', true)
        .order('name')
        .limit(limit)
    if (error) throw new Error(`getPopularOrganizations: ${error.message}`)
    return (data ?? []) as Organization[]
}

/**
 * Get a single organization by slug (full row for org detail page).
 */
export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
    'use cache'
    cacheLife('days')
    cacheTag('taxonomy', `org-${slug}`)

    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single()
    if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`getOrganizationBySlug: ${error.message}`)
    }
    return data as Organization
}

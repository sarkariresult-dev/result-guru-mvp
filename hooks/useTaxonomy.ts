'use client'

/**
 * useTaxonomy - Result Guru
 *
 * React Query hooks for all taxonomy entities:
 *  - useStates / useState_hook
 *  - useOrganizations / useOrganization
 *  - useCategories
 *  - useQualifications
 *  - useTags / useTag
 *  - useTaxonomySummary - all in one (for filter dropdowns)
 *
 * All taxonomy data has a long stale time since it rarely changes.
 */

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/config/query-keys'
import { STALE_TIME } from '@/config/constants'
import type { State, Organization, Category, Qualification, Tag, TaxonomySummary } from '@/types/taxonomy.types'

// ─── States ──────────────────────────────────────────────────────────────────

export function useStates() {
    return useQuery<State[]>({
        queryKey: queryKeys.taxonomy.states(),
        staleTime: STALE_TIME.TAXONOMY,
        queryFn: async () => {
            const { data, error } = await createClient()
                .from('states')
                .select('slug, name, abbr, is_active, sort_order, meta_title, meta_description, meta_robots')
                .eq('is_active', true)
                .order('sort_order')
            if (error) throw error
            return (data ?? []) as State[]
        },
    })
}

export function useState_hook(slug: string) {
    return useQuery<State | null>({
        queryKey: queryKeys.taxonomy.state(slug),
        staleTime: STALE_TIME.TAXONOMY,
        enabled: Boolean(slug),
        queryFn: async () => {
            const { data, error } = await createClient()
                .from('states')
                .select('*')
                .eq('slug', slug)
                .single()
            if (error) { if (error.code === 'PGRST116') return null; throw error }
            return data as State
        },
    })
}

// ─── Organizations ───────────────────────────────────────────────────────────

export function useOrganizations(stateSlug?: string) {
    return useQuery<Organization[]>({
        queryKey: queryKeys.taxonomy.organisations(),
        staleTime: STALE_TIME.TAXONOMY,
        queryFn: async () => {
            let q = createClient()
                .from('organizations')
                .select('id, slug, name, short_name, state_slug, official_url, logo_url, meta_title, meta_description')
                .eq('is_active', true)
            if (stateSlug) q = q.eq('state_slug', stateSlug)
            const { data, error } = await q.order('name')
            if (error) throw error
            return (data ?? []) as Organization[]
        },
    })
}

/** @deprecated Use useOrganizations instead */
export const useOrganisations = useOrganizations

export function useOrganization(slug: string) {
    return useQuery<Organization | null>({
        queryKey: queryKeys.taxonomy.organisation(slug),
        staleTime: STALE_TIME.TAXONOMY,
        enabled: Boolean(slug),
        queryFn: async () => {
            const { data, error } = await createClient()
                .from('organizations')
                .select('*')
                .eq('slug', slug)
                .single()
            if (error) { if (error.code === 'PGRST116') return null; throw error }
            return data as Organization
        },
    })
}

/** @deprecated Use useOrganization instead */
export const useOrganisation = useOrganization

// ─── Categories ──────────────────────────────────────────────────────────────

export function useCategories() {
    return useQuery<Category[]>({
        queryKey: queryKeys.taxonomy.categories(),
        staleTime: STALE_TIME.TAXONOMY,
        queryFn: async () => {
            const { data, error } = await createClient()
                .from('categories')
                .select('id, slug, name, parent_id, icon, sort_order')
                .order('sort_order')
            if (error) throw error
            return (data ?? []) as Category[]
        },
    })
}

// ─── Qualifications ──────────────────────────────────────────────────────────

export function useQualifications() {
    return useQuery<Qualification[]>({
        queryKey: queryKeys.taxonomy.qualifications(),
        staleTime: STALE_TIME.TAXONOMY,
        queryFn: async () => {
            const { data, error } = await createClient()
                .from('qualifications')
                .select('slug, name, short_name, sort_order')
                .order('sort_order')
            if (error) throw error
            return (data ?? []) as Qualification[]
        },
    })
}

// ─── Tags ────────────────────────────────────────────────────────────────────

export function useTags(limit = 50) {
    return useQuery<Tag[]>({
        queryKey: queryKeys.taxonomy.tags(),
        staleTime: STALE_TIME.TAXONOMY,
        queryFn: async () => {
            const { data, error } = await createClient()
                .from('tags')
                .select('id, slug, name, tag_type, post_count')
                .order('post_count', { ascending: false })
                .limit(limit)
            if (error) throw error
            return (data ?? []) as Tag[]
        },
    })
}

export function useTag(slug: string) {
    return useQuery<Tag | null>({
        queryKey: queryKeys.taxonomy.tag(slug),
        staleTime: STALE_TIME.TAXONOMY,
        enabled: Boolean(slug),
        queryFn: async () => {
            const { data, error } = await createClient()
                .from('tags')
                .select('*')
                .eq('slug', slug)
                .single()
            if (error) { if (error.code === 'PGRST116') return null; throw error }
            return data as Tag
        },
    })
}

// ─── Taxonomy summary (all in one, for filter dropdowns) ─────────────────────

export function useTaxonomySummary() {
    return useQuery<TaxonomySummary>({
        queryKey: queryKeys.taxonomy.summary(),
        staleTime: STALE_TIME.TAXONOMY,
        queryFn: async () => {
            const supabase = createClient()
            const [states, orgs, qualifications, categories, tags] = await Promise.all([
                supabase.from('states').select('slug, name, abbr').eq('is_active', true).order('sort_order'),
                supabase.from('organizations').select('id, slug, name, short_name, logo_url').eq('is_active', true).order('name').limit(200),
                supabase.from('qualifications').select('slug, name, short_name').order('sort_order'),
                supabase.from('categories').select('id, slug, name, parent_id').order('sort_order'),
                supabase.from('tags').select('id, slug, name, tag_type, post_count').eq('is_active', true).order('post_count', { ascending: false }).limit(100),
            ])
            return {
                states: (states.data ?? []) as TaxonomySummary['states'],
                organizations: (orgs.data ?? []) as TaxonomySummary['organizations'],
                qualifications: (qualifications.data ?? []) as TaxonomySummary['qualifications'],
                categories: (categories.data ?? []) as TaxonomySummary['categories'],
                tags: (tags.data ?? []) as TaxonomySummary['tags'],
            }
        },
    })
}
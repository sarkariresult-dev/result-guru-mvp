import 'server-only'
import { createServerClient } from '@/lib/supabase/server'
import type { Category, Qualification } from '@/types/taxonomy.types'

/**
 * Get all categories, ordered by sort_order.
 * Used in PostForm dropdowns and category filter chips.
 */
export async function getCategories(): Promise<Category[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('categories')
        .select('id, slug, name, parent_id, icon, sort_order')
        .eq('is_active', true)
        .order('sort_order')
    if (error) throw new Error(`getCategories: ${error.message}`)
    return (data ?? []) as Category[]
}

/**
 * Get all qualifications, ordered by sort_order.
 * Used in PostForm dropdowns and qualification filter chips.
 */
export async function getQualifications(): Promise<Qualification[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('qualifications')
        .select('slug, name, short_name, sort_order')
        .eq('is_active', true)
        .order('sort_order')
    if (error) throw new Error(`getQualifications: ${error.message}`)
    return (data ?? []) as Qualification[]
}

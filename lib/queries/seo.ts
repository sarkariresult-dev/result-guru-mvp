import 'server-only'
import { createServerClient } from '@/lib/supabase/server'
import type { SeoSettingRow, SeoSettings, Redirect, SitemapConfig } from '@/types/seo.types'

/**
 * Represent a single key-value SEO setting row.
 * Re-exported for consumers that import { SeoSetting } from '@/lib/queries/seo'.
 */
export type SeoSetting = SeoSettingRow

/**
 * Get all SEO settings as an array of rows.
 */
export async function getSeoSettings(): Promise<SeoSetting[]> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('seo_settings')
        .select('*')
        .order('key')
    return (data ?? []) as SeoSetting[]
}

/**
 * Get all SEO settings collapsed into a single typed object.
 */
export async function getSeoSettingsMap(): Promise<SeoSettings> {
    const rows = await getSeoSettings()
    const map: Record<string, string> = {}
    for (const row of rows) {
        map[row.key] = row.value ?? ''
    }
    return map as SeoSettings
}

/**
 * Get a single SEO setting by key.
 */
export async function getSeoSetting(key: string): Promise<string | null> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('seo_settings')
        .select('value')
        .eq('key', key)
        .single()
    return data?.value ?? null
}

/**
 * Get redirects list (admin).
 */
export async function getRedirects(opts: {
    page?: number
    limit?: number
    active?: boolean
} = {}): Promise<{ data: Redirect[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? 50

    let query = supabase
        .from('redirects')
        .select('*', { count: 'exact' })

    if (opts.active !== undefined) query = query.eq('is_active', opts.active)

    const { data, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as Redirect[], count: count ?? 0 }
}

/**
 * Get sitemap configuration rows.
 */
export async function getSitemapConfig(): Promise<SitemapConfig[]> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('sitemap_config')
        .select('*')
        .eq('include', true)
        .order('priority', { ascending: false })
    return (data ?? []) as SitemapConfig[]
}

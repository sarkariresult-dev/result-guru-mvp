import { createServerClient, createStaticClient } from '@/lib/supabase/server'
import { cache } from 'react'
import type { AffiliateProduct } from '@/types/post.types'

// ── Category metadata (mirrors affiliate_category ENUM) ──────

export type AffiliateCategory = 'books' | 'stationery' | 'electronics' | 'software' | 'tools' | 'other'

export interface AffiliateCategoryMeta {
    slug: AffiliateCategory
    label: string
    icon: string  // lucide icon name
    description: string
}

export const AFFILIATE_CATEGORIES: AffiliateCategoryMeta[] = [
    { slug: 'books', label: 'Books', icon: 'BookOpen', description: 'Best-selling exam guides & study material' },
    { slug: 'stationery', label: 'Stationery', icon: 'Pen', description: 'Premium pens, notebooks & exam kits' },
    { slug: 'electronics', label: 'Electronics', icon: 'Laptop', description: 'Tablets, headphones & study gadgets' },
    { slug: 'software', label: 'Software', icon: 'AppWindow', description: 'Mock tests, apps & learning platforms' },
    { slug: 'tools', label: 'Tools', icon: 'Wrench', description: 'Desk organizers, lamps & accessories' },
    { slug: 'other', label: 'Other', icon: 'Package', description: 'More student essentials' },
]

export const getAffiliateCategories = cache(async () => AFFILIATE_CATEGORIES)

export const getAffiliateCategoryBySlug = cache(
    async (slug: string): Promise<AffiliateCategoryMeta | null> => {
        return AFFILIATE_CATEGORIES.find(c => c.slug === slug) || null
    }
)

// ── Legacy aliases ──────────────────────────────────────────

/** @deprecated Use getAffiliateCategories */
export const getAffiliateTypes = getAffiliateCategories
/** @deprecated Use getAffiliateCategoryBySlug */
export const getAffiliateTypeBySlug = getAffiliateCategoryBySlug

// ── Public queries ──────────────────────────────────────────

/**
 * Fetch products at build-time for generateStaticParams.
 * Uses a static client to bypass cookies() API requirements.
 */
export const getStaticAffiliateProducts = cache(
    async (category?: string): Promise<AffiliateProduct[]> => {
        const supabase = createStaticClient()
        let query = supabase
            .from('affiliate')
            .select('*')
            .eq('is_active', true)
        
        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query
            .order('is_featured', { ascending: false })
            .order('display_priority', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            void 0;
            return []
        }
        return (data || []) as AffiliateProduct[]
    }
)

export const getAffiliateProducts = cache(
    async (category?: string): Promise<AffiliateProduct[]> => {
        const supabase = await createServerClient()
        let query = supabase
            .from('affiliate')
            .select('*')
            .eq('is_active', true)
        
        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query
            .order('is_featured', { ascending: false })
            .order('display_priority', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            void 0;
            return []
        }
        return (data || []) as AffiliateProduct[]
    }
)

export const getFeaturedProducts = cache(
    async (limit = 6): Promise<AffiliateProduct[]> => {
        const supabase = await createServerClient()
        const { data, error } = await supabase
            .from('affiliate')
            .select('*')
            .eq('is_active', true)
            .eq('is_featured', true)
            .order('display_priority', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            void 0;
            return []
        }
        return (data || []) as AffiliateProduct[]
    }
)

export const getRecentlyAddedProducts = cache(
    async (limit = 4): Promise<AffiliateProduct[]> => {
        const supabase = await createServerClient()
        const { data, error } = await supabase
            .from('affiliate')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            void 0;
            return []
        }
        return (data || []) as AffiliateProduct[]
    }
)

export const getAffiliateProductBySlug = cache(
    async (slug: string): Promise<AffiliateProduct | null> => {
        const supabase = await createServerClient()
        const { data, error } = await supabase
            .from('affiliate')
            .select('*')
            .eq('slug', slug)
            .single()
            
        if (error) {
            void 0;
            return null
        }
        return data as AffiliateProduct
    }
)

export const getProductsByCategory = cache(
    async (category: AffiliateCategory, limit = 4): Promise<AffiliateProduct[]> => {
        const supabase = await createServerClient()
        const { data, error } = await supabase
            .from('affiliate')
            .select('*')
            .eq('is_active', true)
            .eq('category', category)
            .order('is_featured', { ascending: false })
            .order('display_priority', { ascending: false })
            .limit(limit)

        if (error) {
            void 0;
            return []
        }
        return (data || []) as AffiliateProduct[]
    }
)

export const getCategoryCounts = cache(
    async (): Promise<Record<AffiliateCategory, number>> => {
        const supabase = await createServerClient()
        const counts: Record<string, number> = {}

        const results = await Promise.all(
            AFFILIATE_CATEGORIES.map(async (cat) => {
                const { count } = await supabase
                    .from('affiliate')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true)
                    .eq('category', cat.slug)
                return { slug: cat.slug, count: count || 0 }
            })
        )

        for (const r of results) {
            counts[r.slug] = r.count
        }
        return counts as Record<AffiliateCategory, number>
    }
)

export const getRelatedProducts = cache(
    async (category: string, excludeId: string, limit = 4): Promise<AffiliateProduct[]> => {
        const supabase = await createServerClient()
        const { data, error } = await supabase
            .from('affiliate')
            .select('*')
            .eq('is_active', true)
            .eq('category', category)
            .neq('id', excludeId)
            .order('is_featured', { ascending: false })
            .order('display_priority', { ascending: false })
            .limit(limit)

        if (error) {
            void 0;
            return []
        }
        return (data || []) as AffiliateProduct[]
    }
)

export const searchAffiliateProducts = cache(
    async (query: string): Promise<AffiliateProduct[]> => {
        if (!query || query.trim().length < 2) return []
        
        const supabase = await createServerClient()
        const { data, error } = await supabase
            .from('affiliate')
            .select('*')
            .eq('is_active', true)
            .ilike('name', `%${query.trim()}%`)
            .order('is_featured', { ascending: false })
            .order('display_priority', { ascending: false })
            .limit(20)

        if (error) {
            void 0;
            return []
        }
        return (data || []) as AffiliateProduct[]
    }
)

// ── Admin queries ───────────────────────────────────────────

interface AdminAffiliateOptions {
    page: number
    typeSlug?: string
    search?: string
}

export const getAdminAffiliateProducts = cache(
    async ({ page, typeSlug, search }: AdminAffiliateOptions) => {
        const supabase = await createServerClient()
        const limit = 20
        const from = (page - 1) * limit
        const to = from + limit - 1
        
        let countQuery = supabase
            .from('affiliate')
            .select('*', { count: 'exact', head: true })
            
        let query = supabase
            .from('affiliate')
            .select('*')
            
        if (typeSlug) {
            countQuery = countQuery.eq('category', typeSlug)
            query = query.eq('category', typeSlug)
        }
        if (search) {
            countQuery = countQuery.ilike('name', `%${search}%`)
            query = query.ilike('name', `%${search}%`)
        }

        const [{ count }, { data, error }] = await Promise.all([
            countQuery,
            query.order('created_at', { ascending: false }).range(from, to)
        ])
            
        if (error) {
            void 0;
            return { data: [] as AffiliateProduct[], count: 0 }
        }
        return { data: (data || []) as AffiliateProduct[], count: count || 0 }
    }
)

export const getAffiliateProduct = cache(
    async (id: string): Promise<AffiliateProduct | null> => {
        const supabase = await createServerClient()
        const { data, error } = await supabase
            .from('affiliate')
            .select('*')
            .eq('id', id)
            .single()
            
        if (error) {
            void 0;
            return null
        }
        return data as AffiliateProduct
    }
)

export const getAffiliateHeaderStats = cache(
    async () => {
        const supabase = await createServerClient()
        const [
            { count: total },
            { count: active },
            { count: featured }
        ] = await Promise.all([
            supabase.from('affiliate').select('*', { count: 'exact', head: true }),
            supabase.from('affiliate').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('affiliate').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        ])

        return {
            total: total || 0,
            active: active || 0,
            featured: featured || 0,
        }
    }
)

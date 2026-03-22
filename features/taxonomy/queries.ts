import 'server-only'
import { createServerClient } from '@/lib/supabase/server'
import { PAGINATION } from '@/config/constants'
import type { Category, Tag, Organization, State, Qualification } from '@/types/taxonomy.types'

// ── Admin Categories (paginated with parent name) ──────────

export interface AdminCategory extends Category {
    parent_name?: string | null
}

export async function getAdminCategories(opts: {
    page?: number
    limit?: number
    search?: string
    active?: string // 'true' | 'false' | ''
} = {}): Promise<{ data: AdminCategory[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? PAGINATION.ADMIN_LIMIT

    let query = supabase
        .from('categories')
        .select('*', { count: 'exact' })

    if (opts.active === 'true') query = query.eq('is_active', true)
    if (opts.active === 'false') query = query.eq('is_active', false)

    if (opts.search) {
        const sanitized = opts.search.replace(/[%_]/g, '\\$&')
        query = query.ilike('name', `%${sanitized}%`)
    }

    const { data, count } = await query
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
        .range((page - 1) * limit, page * limit - 1)

    const categories = (data ?? []) as Category[]

    // Resolve parent names
    const parentIds = [...new Set(categories.filter(c => c.parent_id).map(c => c.parent_id!))]
    let parentMap: Record<string, string> = {}
    if (parentIds.length > 0) {
        const { data: parents } = await supabase
            .from('categories')
            .select('id, name')
            .in('id', parentIds)
        parentMap = Object.fromEntries((parents ?? []).map((p: { id: string; name: string }) => [p.id, p.name]))
    }

    const result: AdminCategory[] = categories.map(c => ({
        ...c,
        parent_name: c.parent_id ? parentMap[c.parent_id] ?? null : null,
    }))

    return { data: result, count: count ?? 0 }
}

/** Get all categories for parent dropdown (id + name only) */
export async function getCategoryOptions(): Promise<Pick<Category, 'id' | 'slug' | 'name' | 'parent_id'>[]> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('categories')
        .select('id, slug, name, parent_id')
        .eq('is_active', true)
        .order('sort_order')
        .order('name')
    return (data ?? []) as Pick<Category, 'id' | 'slug' | 'name' | 'parent_id'>[]
}

// ── Admin Tags (paginated with type filter) ────────────────

export async function getAdminTags(opts: {
    page?: number
    limit?: number
    search?: string
    tag_type?: string
    active?: string
} = {}): Promise<{ data: Tag[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? PAGINATION.ADMIN_LIMIT

    let query = supabase
        .from('tags')
        .select('*', { count: 'exact' })

    if (opts.active === 'true') query = query.eq('is_active', true)
    if (opts.active === 'false') query = query.eq('is_active', false)
    if (opts.tag_type) query = query.eq('tag_type', opts.tag_type)

    if (opts.search) {
        const sanitized = opts.search.replace(/[%_]/g, '\\$&')
        query = query.ilike('name', `%${sanitized}%`)
    }

    const { data, count } = await query
        .order('post_count', { ascending: false })
        .order('name', { ascending: true })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as Tag[], count: count ?? 0 }
}

// ── Admin Organizations (paginated with state filter) ──────

export async function getAdminOrganizations(opts: {
    page?: number
    limit?: number
    search?: string
    state_slug?: string
    active?: string
} = {}): Promise<{ data: Organization[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? PAGINATION.ADMIN_LIMIT

    let query = supabase
        .from('organizations')
        .select('*', { count: 'exact' })

    if (opts.active === 'true') query = query.eq('is_active', true)
    if (opts.active === 'false') query = query.eq('is_active', false)
    if (opts.state_slug) query = query.eq('state_slug', opts.state_slug)

    if (opts.search) {
        const sanitized = opts.search.replace(/[%_]/g, '\\$&')
        query = query.or(`name.ilike.%${sanitized}%,short_name.ilike.%${sanitized}%`)
    }

    const { data, count } = await query
        .order('name', { ascending: true })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as Organization[], count: count ?? 0 }
}

/** Get all states for filter dropdown */
export async function getStateOptions(): Promise<Pick<State, 'slug' | 'name'>[]> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('states')
        .select('slug, name')
        .eq('is_active', true)
        .order('sort_order')
        .order('name')
    return (data ?? []) as Pick<State, 'slug' | 'name'>[]
}

// ── Admin States (paginated) ───────────────────────────────

export async function getAdminStates(opts: {
    page?: number
    limit?: number
    search?: string
    active?: string
} = {}): Promise<{ data: State[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? PAGINATION.ADMIN_LIMIT

    let query = supabase
        .from('states')
        .select('*', { count: 'exact' })

    if (opts.active === 'true') query = query.eq('is_active', true)
    if (opts.active === 'false') query = query.eq('is_active', false)

    if (opts.search) {
        const sanitized = opts.search.replace(/[%_]/g, '\\$&')
        query = query.ilike('name', `%${sanitized}%`)
    }

    const { data, count } = await query
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as State[], count: count ?? 0 }
}

// ── Admin Qualifications (paginated) ───────────────────────

export async function getAdminQualifications(opts: {
    page?: number
    limit?: number
    search?: string
    active?: string
} = {}): Promise<{ data: Qualification[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? PAGINATION.ADMIN_LIMIT

    let query = supabase
        .from('qualifications')
        .select('*', { count: 'exact' })

    if (opts.active === 'true') query = query.eq('is_active', true)
    if (opts.active === 'false') query = query.eq('is_active', false)

    if (opts.search) {
        const sanitized = opts.search.replace(/[%_]/g, '\\$&')
        query = query.or(`name.ilike.%${sanitized}%,short_name.ilike.%${sanitized}%`)
    }

    const { data, count } = await query
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as Qualification[], count: count ?? 0 }
}

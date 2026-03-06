import 'server-only'
import { createServerClient } from '@/lib/supabase/server'
import type { User, UserFilters } from '@/types/user.types'

/**
 * Get paginated users list (admin only).
 */
export async function getUsers(opts: {
    filters?: UserFilters
    page?: number
    limit?: number
} = {}): Promise<{ data: User[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? 25

    let query = supabase
        .from('users')
        .select('*', { count: 'exact' })

    if (opts.filters?.role) query = query.eq('role', opts.filters.role)
    if (opts.filters?.is_active !== undefined) query = query.eq('is_active', opts.filters.is_active)
    if (opts.filters?.search) {
        query = query.or(`name.ilike.%${opts.filters.search}%,email.ilike.%${opts.filters.search}%`)
    }

    const { data, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as User[], count: count ?? 0 }
}

/**
 * Get a single user by ID.
 */
export async function getUserById(id: string): Promise<User | null> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
    return data as User | null
}

/**
 * Get a user by auth_user_id (the Supabase Auth UID).
 */
export async function getUserByAuthId(authUserId: string): Promise<User | null> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()
    return data as User | null
}

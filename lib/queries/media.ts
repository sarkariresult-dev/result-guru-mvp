import 'server-only'
import { createServerClient } from '@/lib/supabase/server'
import type { Media } from '@/types/media.types'

/**
 * Get media items with pagination, ordered by newest first.
 */
export async function getMediaItems(opts: {
    page?: number
    limit?: number
    bucket?: string
    search?: string
} = {}): Promise<{ data: Media[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? 25

    let query = supabase
        .from('media')
        .select('*', { count: 'exact' })

    if (opts.bucket) query = query.eq('bucket', opts.bucket)
    if (opts.search) query = query.ilike('file_name', `%${opts.search}%`)

    const { data, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as Media[], count: count ?? 0 }
}

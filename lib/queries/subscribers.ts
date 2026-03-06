import 'server-only'
import { createServerClient } from '@/lib/supabase/server'
import type { Subscriber } from '@/types/newsletter.types'

/**
 * Get paginated subscribers (admin).
 */
export async function getSubscribers(opts: {
    page?: number
    limit?: number
    status?: 'active' | 'unsubscribed' | 'bounced'
    search?: string
} = {}): Promise<{ data: Subscriber[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? 25

    let query = supabase
        .from('subscribers')
        .select('*', { count: 'exact' })

    if (opts.status) query = query.eq('status', opts.status)
    if (opts.search) {
        query = query.or(`email.ilike.%${opts.search}%,name.ilike.%${opts.search}%`)
    }

    const { data, count } = await query
        .order('subscribed_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as Subscriber[], count: count ?? 0 }
}

/**
 * Get subscriber count by status.
 */
export async function getSubscriberCount(
    status: 'active' | 'unsubscribed' | 'bounced' = 'active'
): Promise<number> {
    const supabase = await createServerClient()
    const { count } = await supabase
        .from('subscribers')
        .select('id', { count: 'exact', head: true })
        .eq('status', status)
    return count ?? 0
}

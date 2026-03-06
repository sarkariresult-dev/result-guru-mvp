import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { createStaticClient } from '@/lib/supabase/static'
import { createServerClient } from '@/lib/supabase/server'
import type { PostCard, Post, PostFilters } from '@/types/post.types'
import { PAGINATION } from '@/config/constants'

// ── Column projection matching v_published_posts + PostCard ────────────────

const POST_CARD_COLUMNS = `
  id, type, application_status, title, slug, excerpt,
  state_slug, state_name,
  org_name, org_short_name, org_logo_url,
  category_slug, category_name,
  qualification, total_vacancies,
  featured_image, featured_image_alt,
  important_dates,
  view_count, reading_time_min,
  published_at, updated_at
`.trim()

// ── Shared filter helper ───────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: PostFilters): any {
    if (filters.type) {
        query = Array.isArray(filters.type)
            ? (query as any).in('type', filters.type)
            : (query as any).eq('type', filters.type)
    }
    if (filters.status) {
        query = Array.isArray(filters.status)
            ? (query as any).in('status', filters.status)
            : (query as any).eq('status', filters.status)
    }
    if (filters.application_status) {
        query = Array.isArray(filters.application_status)
            ? (query as any).in('application_status', filters.application_status)
            : (query as any).eq('application_status', filters.application_status)
    }
    if (filters.state_slug) query = (query as any).eq('state_slug', filters.state_slug)
    if (filters.organization_id) query = (query as any).eq('organization_id', filters.organization_id)
    if (filters.category_id) query = (query as any).eq('category_id', filters.category_id)
    if (filters.category_slug) query = (query as any).eq('category_slug', filters.category_slug)
    if (filters.qualification) query = (query as any).contains('qualification', [filters.qualification])
    if (filters.author_id) query = (query as any).eq('author_id', filters.author_id)
    if (filters.search) query = (query as any).textSearch('search_vector', filters.search, { type: 'websearch' })
    if (filters.published_after) query = (query as any).gte('published_at', filters.published_after)
    if (filters.published_before) query = (query as any).lte('published_at', filters.published_before)
    return query
}

// ── Public queries ─────────────────────────────────────────────────────────

/** Paginated post listing from v_published_posts */
export async function getPosts(
    filters: PostFilters = {},
    page: number = 1,
    limit: number = PAGINATION.DEFAULT_LIMIT,
): Promise<PostCard[]> {
    'use cache'
    cacheLife('minutes')
    cacheTag('posts', `posts-page-${page}`)

    const supabase = createStaticClient()

    let query = supabase
        .from('v_published_posts')
        .select(POST_CARD_COLUMNS)

    query = applyFilters(query, filters)

    const { data, error } = await query
        .order('published_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (error) throw new Error(`getPosts: ${error.message}`)
    return (data ?? []) as unknown as PostCard[]
}

/** Single post by slug (full row from v_published_posts) */
export async function getPostBySlug(
    slug: string,
    type?: string,
): Promise<Post | null> {
    'use cache'
    cacheLife('hours')
    cacheTag('posts', `post-${slug}`)

    const supabase = createStaticClient()

    let query = supabase.from('v_published_posts').select('*').eq('slug', slug)
    if (type) query = query.eq('type', type)

    const { data } = await query.single()
    return (data as unknown as Post) ?? null
}

/** Recent posts by type (for homepage sections, footer, etc.) */
export async function getRecentPosts(
    type: string,
    limit = 5,
): Promise<PostCard[]> {
    'use cache'
    cacheLife('minutes')
    cacheTag('posts', `recent-${type}`)

    const supabase = createStaticClient()

    const { data } = await supabase
        .from('v_published_posts')
        .select(POST_CARD_COLUMNS)
        .eq('type', type)
        .order('published_at', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as PostCard[]
}

/** Full-text search using search_vector on v_published_posts */
export async function searchPosts(
    q: string,
    limit = 20,
): Promise<PostCard[]> {
    'use cache'
    cacheLife('seconds')
    cacheTag('search')

    const supabase = createStaticClient()

    const { data, error } = await supabase
        .from('v_published_posts')
        .select(POST_CARD_COLUMNS)
        .textSearch('search_vector', q, { type: 'websearch' })
        .order('published_at', { ascending: false })
        .limit(limit)

    if (error) throw new Error(`searchPosts: ${error.message}`)
    return (data ?? []) as unknown as PostCard[]
}

/** Count matching posts (for pagination metadata) */
export async function getPostsCount(
    filters: PostFilters = {},
): Promise<number> {
    'use cache'
    cacheLife('minutes')
    cacheTag('posts', 'posts-count')

    const supabase = createStaticClient()

    let query = supabase
        .from('v_published_posts')
        .select('id', { count: 'estimated', head: true })

    query = applyFilters(query, filters)

    const { count } = await query
    return count ?? 0
}

// ── Admin / Author queries (reads from `posts` table, all statuses) ────────

export interface AdminPost {
    id: string
    type: string
    status: string
    application_status: string
    title: string
    slug: string
    state_slug: string | null
    organization_id: string | null
    org_name: string | null
    view_count: number
    seo_score: number
    published_at: string | null
    updated_at: string
    created_at: string
}

const ADMIN_POST_COLUMNS =
    'id, type, status, application_status, title, slug, state_slug, organization_id, org_name, view_count, seo_score, published_at, updated_at, created_at'

export async function getAdminPosts(opts: {
    page?: number
    limit?: number
    status?: string
    type?: string
    search?: string
} = {}): Promise<{ data: AdminPost[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? PAGINATION.ADMIN_LIMIT

    let query = supabase
        .from('posts')
        .select(ADMIN_POST_COLUMNS, { count: 'exact' })

    if (opts.status) query = query.eq('status', opts.status)
    if (opts.type) query = query.eq('type', opts.type)
    if (opts.search) query = query.ilike('title', `%${opts.search}%`)

    const { data, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as AdminPost[], count: count ?? 0 }
}

export async function getAuthorPosts(
    authorId: string,
    opts: { page?: number; limit?: number; status?: string; search?: string; type?: string } = {},
): Promise<{ data: AdminPost[]; count: number }> {
    const supabase = await createServerClient()
    const page = opts.page ?? 1
    const limit = opts.limit ?? PAGINATION.ADMIN_LIMIT

    let query = supabase
        .from('posts')
        .select(ADMIN_POST_COLUMNS, { count: 'exact' })
        .eq('author_id', authorId)

    if (opts.status) query = query.eq('status', opts.status)
    if (opts.type) query = query.eq('type', opts.type)
    if (opts.search) query = query.ilike('title', `%${opts.search}%`)

    const { data, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []) as AdminPost[], count: count ?? 0 }
}

/** Full post row by ID (for edit page) — includes post_tags join */
export async function getPostById(id: string): Promise<(Post & { post_tags?: { post_id: string; tag_id: string }[] }) | null> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('posts')
        .select('*, post_tags(post_id, tag_id)')
        .eq('id', id)
        .single()
    return (data as unknown as (Post & { post_tags?: { post_id: string; tag_id: string }[] })) ?? null
}

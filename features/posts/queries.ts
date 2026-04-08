import 'server-only'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { createStaticClient } from '@/lib/supabase/static'
import { createServerClient } from '@/lib/supabase/server'
import type { PostCard, Post, PostFilters, PostDetail } from '@/types/post.types'
import { toPostCardDTO, toAdminPostDTO } from '@/lib/dal/mappers'
import { PAGINATION } from '@/config/constants'

// ── Column projection matching v_published_posts + PostCard ────────────────

const POST_CARD_COLUMNS = `
  id, type, application_status, title, slug, excerpt,
  state_slug, state_name,
  org_name, org_short_name, org_logo_url,
  category_slug, category_name,
  qualification,
  featured_image, featured_image_alt,
  view_count, reading_time_min,
  application_start_date, application_end_date,
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
export const getPosts = cache(unstable_cache(
    async (
        filters: PostFilters = {},
        page: number = 1,
        limit: number = PAGINATION.DEFAULT_LIMIT,
    ): Promise<PostCard[]> => {
        const supabase = createStaticClient()
        let query = supabase.from('v_published_posts').select(POST_CARD_COLUMNS)
        query = applyFilters(query, filters)

        const { data, error } = await query
            .order('published_at', { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

        if (error) throw new Error(`getPosts: ${error.message}`)
        return (data ?? []).map(toPostCardDTO)
    },
    ['posts-list'], // Cache key segment
    {
        revalidate: 300, // 5 min - faster freshness for listing pages
        tags: ['posts'],
    }
))

/** Single post by slug (full row from v_published_posts) */
export const getPostBySlug = cache(unstable_cache(
    async (
        slug: string,
        type?: string,
    ): Promise<Post | null> => {
        const supabase = createStaticClient()
        let query = supabase
            .from('v_published_posts')
            .select('*')
            .eq('slug', slug)
        if (type) query = query.eq('type', type)

        const { data, error } = await query.returns<PostDetail[]>().single()
        if (error || !data) return null

        // Map flattened author fields back to the nested object structure expected by components
        const post = data as any
        if (post.author_id) {
            post.author = {
                id: post.author_id,
                name: post.author_name,
                avatar_url: post.author_avatar_url,
                bio: post.author_bio
            }
        }

        return post as Post
    },
    ['post-by-slug'],
    {
        revalidate: 1800, // 30 min - tighter for faster content updates
        tags: ['posts'],
    }
))

/** Recent posts by type (for homepage sections, footer, etc.) */
export const getRecentPosts = cache(unstable_cache(
    async (
        type: string,
        limit = 5,
    ): Promise<PostCard[]> => {
        const supabase = createStaticClient()
        const { data } = await supabase
            .from('v_published_posts')
            .select(POST_CARD_COLUMNS)
            .eq('type', type)
            .order('published_at', { ascending: false })
            .limit(limit)

        return (data ?? []).map(toPostCardDTO)
    },
    ['recent-posts'],
    {
        revalidate: 300, // 5 min - homepage sections need fast updates
        tags: ['posts', 'homepage'],
    }
))

/** Full-text search using search_vector on posts, hydrated from v_published_posts */
export const searchPosts = cache(unstable_cache(
    async (
        q: string,
        limit = 20,
    ): Promise<PostCard[]> => {
        const supabase = createStaticClient()

        // 1. Find matching IDs from the base 'posts' table which holds the search_vector
        const { data: matches, error: searchError } = await supabase
            .from('posts')
            .select('id')
            .eq('status', 'published')
            .textSearch('search_vector', q, { type: 'websearch' })
            .order('published_at', { ascending: false })
            .limit(limit)

        if (searchError) {
            console.error(`[searchPosts] matching IDs error:`, searchError)
            return [] // Gracefully return empty arrays on search failures to prevent UI crashing
        }

        if (!matches || matches.length === 0) return []
        const ids = matches.map((m: { id: string }) => m.id)

        // 2. Fetch full flattened card data using the view
        const { data, error } = await supabase
            .from('v_published_posts')
            .select(POST_CARD_COLUMNS)
            .in('id', ids)

        if (error) {
            console.error(`[searchPosts] fetching details error:`, error)
            return []
        }

        // 3. Keep original sort order
        const idMap = new Map((data as any[] ?? []).map(p => [p.id, p]))
        const sorted = ids.map((id: string) => idMap.get(id)).filter(Boolean) as any[]

        return sorted.map(p => toPostCardDTO(p))
    },
    ['search-posts'],
    {
        revalidate: 60, // 1 minute caching for search
        tags: ['search'],
    }
))

/** Count matching posts (for pagination metadata) */
export const getPostsCount = cache(unstable_cache(
    async (
        filters: PostFilters = {},
    ): Promise<number> => {
        const supabase = createStaticClient()
        let query = supabase
            .from('v_published_posts')
            .select('id', { count: 'estimated', head: true })

        query = applyFilters(query, filters)
        const { count } = await query
        return count ?? 0
    },
    ['posts-count'],
    {
        revalidate: 300, // 5 min - keep pagination metadata fresh
        tags: ['posts', 'posts-count'],
    }
))

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
    application_start_date: string | null
    application_end_date: string | null
    published_at: string | null
    updated_at: string
    created_at: string
}

const ADMIN_POST_COLUMNS =
    'id, type, status, title, slug, state_slug, organization_id, org_name, view_count, seo_score, application_start_date, application_end_date, published_at, updated_at, created_at'

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
    if (opts.search) {
        const sanitized = opts.search.replace(/[%_]/g, '\\$&')
        query = query.ilike('title', `%${sanitized}%`)
    }

    const { data, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []).map(toAdminPostDTO), count: count ?? 0 }
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
    if (opts.search) {
        const sanitized = opts.search.replace(/[%_]/g, '\\$&')
        query = query.ilike('title', `%${sanitized}%`)
    }

    const { data, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    return { data: (data ?? []).map(toAdminPostDTO), count: count ?? 0 }
}

/** Full post row by ID (for edit page) - includes post_tags join */
export async function getPostById(id: string): Promise<(Post & { post_tags?: { post_id: string; tag_id: string }[] }) | null> {
    const supabase = await createServerClient()
    const { data } = await supabase
        .from('posts')
        .select('*, post_tags(post_id, tag_id)')
        .eq('id', id)
        .returns<(Post & { post_tags?: { post_id: string; tag_id: string }[] })[]>()
        .single()
    return data ?? null
}

/** Fetch Smart Related Jobs dynamically avoiding client fetch loops for SEO */
export const getSmartRelatedPosts = cache(unstable_cache(
    async (postId: string): Promise<PostCard[]> => {
        const supabase = createStaticClient()
        const { data: sourcePost, error: sourceError } = await supabase
            .from('posts')
            .select('related_post_ids, content_cluster_id, type')
            .eq('id', postId)
            .single()

        if (sourceError || !sourcePost) return []

        const postRecord = sourcePost as any
        const relatedIds = postRecord.related_post_ids || []
        let posts: PostCard[] = []

        if (relatedIds.length > 0) {
            const { data } = await supabase
                .from('v_published_posts')
                .select(POST_CARD_COLUMNS)
                .in('id', relatedIds)
                .limit(4)
            if (data) posts = data.map(toPostCardDTO)
        }

        if (posts.length < 4 && postRecord.content_cluster_id) {
            const { data } = await supabase
                .from('v_published_posts')
                .select(POST_CARD_COLUMNS)
                .eq('type', postRecord.type)
                .neq('id', postId)
                .limit(4 - posts.length)

            if (data) {
                const fallback = data.map(toPostCardDTO)
                const existingIds = new Set(posts.map(p => p.id))
                fallback.forEach(fp => {
                    if (!existingIds.has(fp.id)) posts.push(fp)
                })
            }
        }
        return posts
    },
    ['smart-related-posts'],
    { revalidate: 3600, tags: ['posts'] }
))

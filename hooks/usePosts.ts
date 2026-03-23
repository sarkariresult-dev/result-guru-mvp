'use client'

/**
 * usePosts / usePost / useInfinitePosts - Result Guru
 *
 * React Query wrappers for Supabase post queries.
 *
 * Exports:
 *  - usePosts(filters, page, limit) - paginated listing
 *  - useInfinitePosts(filters)       - infinite scroll
 *  - usePost(slug)                   - single post detail
 *  - useRelatedPosts(post, limit)    - related posts by type/state
 *  - useTrendingPosts(limit)         - v_trending_posts view
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/config/query-keys'
import { PAGINATION, STALE_TIME } from '@/config/constants'
import type { PostCard, PostDetail, PublishedPost, TrendingPostRow } from '@/types/post.types'
import type { PostFilters } from '@/types/post.types'

// ─── Shared query builder ────────────────────────────────────────────────────

/**
 * Column projection matching v_published_posts + PostCard type.
 * Every column here MUST exist in the view (018_views.sql).
 */
const POST_CARD_COLUMNS = [
    'id', 'type', 'application_status', 'title', 'slug', 'excerpt',
    'state_slug', 'state_name',
    'org_name', 'org_short_name', 'org_logo_url',
    'category_slug', 'category_name',
    'qualification',
    'featured_image', 'featured_image_alt',
    'view_count', 'reading_time_min',
    'application_start_date', 'application_end_date',
    'published_at', 'updated_at',
].join(', ')

/**
 * Apply PostFilters to a Supabase query builder.
 * Property names match PostFilters AND v_published_posts columns exactly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters(query: any, filters: PostFilters) {
    if (filters.type) {
        query = Array.isArray(filters.type)
            ? query.in('type', filters.type)
            : query.eq('type', filters.type)
    }
    if (filters.status) {
        query = Array.isArray(filters.status)
            ? query.in('status', filters.status)
            : query.eq('status', filters.status)
    }
    if (filters.application_status) {
        query = Array.isArray(filters.application_status)
            ? query.in('application_status', filters.application_status)
            : query.eq('application_status', filters.application_status)
    }
    if (filters.state_slug) query = query.eq('state_slug', filters.state_slug)
    if (filters.organization_id) query = query.eq('organization_id', filters.organization_id)
    if (filters.category_id) query = query.eq('category_id', filters.category_id)
    if (filters.qualification) query = query.contains('qualification', [filters.qualification])
    if (filters.author_id) query = query.eq('author_id', filters.author_id)
    if (filters.search) query = query.textSearch('search_vector', filters.search, { type: 'websearch' })
    if (filters.published_after) query = query.gte('published_at', filters.published_after)
    if (filters.published_before) query = query.lte('published_at', filters.published_before)
    return query
}

// ─── usePosts ────────────────────────────────────────────────────────────────

export function usePosts(filters: PostFilters = {}, page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
    return useQuery<PostCard[]>({
        queryKey: queryKeys.posts.list(filters),
        staleTime: STALE_TIME.POSTS,
        queryFn: async () => {
            const supabase = createClient()
            let q = supabase
                .from('v_published_posts')
                .select(POST_CARD_COLUMNS)

            q = applyFilters(q, filters)

            const { data, error } = await q
                .order('published_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1)

            if (error) throw error
            return (data ?? []) as unknown as PostCard[]
        },
    })
}

// ─── useInfinitePosts ────────────────────────────────────────────────────────

export function useInfinitePosts(filters: PostFilters = {}, limit = PAGINATION.INFINITE_LIMIT) {
    return useInfiniteQuery<PostCard[]>({
        queryKey: queryKeys.posts.infinite(filters),
        staleTime: STALE_TIME.POSTS,
        initialPageParam: 1,

        queryFn: async ({ pageParam }) => {
            const supabase = createClient()
            const page = pageParam as number

            let q = supabase
                .from('v_published_posts')
                .select(POST_CARD_COLUMNS)

            q = applyFilters(q, filters)

            const { data, error } = await q
                .order('published_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1)

            if (error) throw error
            return (data ?? []) as unknown as PostCard[]
        },

        getNextPageParam: (lastPage, _all, lastPageParam) =>
            lastPage.length === limit ? (lastPageParam as number) + 1 : undefined,
    })
}

// ─── usePost (single post detail) ────────────────────────────────────────────

export function usePost(slug: string) {
    return useQuery<PostDetail | null>({
        queryKey: queryKeys.posts.detail(slug),
        staleTime: STALE_TIME.POST_DETAIL,
        enabled: Boolean(slug),
        queryFn: async () => {
            const supabase = createClient()

            const { data: post, error: rawError } = await supabase
                .from('v_published_posts')
                .select('*')
                .eq('slug', slug)
                .single()

            if (rawError) {
                if (rawError.code === 'PGRST116') return null   // not found
                throw rawError
            }

            // Fetch related data in parallel
            const [tagsRes, affiliatesRes] = await Promise.all([
                supabase
                    .from('post_tags')
                    .select('post_id, tag_id, tags(id, slug, name, tag_type)')
                    .eq('post_id', post.id),
                supabase
                    .from('post_affiliate_products')
                    .select('post_id, product_id, sort_order, affiliate_products(*)')
                    .eq('post_id', post.id)
                    .order('sort_order'),
            ])

            return {
                ...post,
                tags: tagsRes.data?.flatMap((r) => r.tags ?? []) ?? [],
                affiliates: affiliatesRes.data?.map((r) => r.affiliate_products) ?? [],
            } as PostDetail
        },
    })
}

// ─── useRelatedPosts ─────────────────────────────────────────────────────────

export function useRelatedPosts(
    post: Pick<PublishedPost, 'id' | 'type' | 'state_slug' | 'organization_id'> | null,
    limit = 6,
) {
    return useQuery<PostCard[]>({
        queryKey: queryKeys.posts.related(post?.id ?? ''),
        staleTime: STALE_TIME.POSTS,
        enabled: Boolean(post?.id),
        queryFn: async () => {
            if (!post) return []
            const supabase = createClient()

            // Prefer same type + same org, fallback to same type + same state
            const { data } = await supabase
                .from('v_published_posts')
                .select(POST_CARD_COLUMNS)
                .eq('type', post.type)
                .neq('id', post.id)
                .or(
                    post.organization_id
                        ? `organization_id.eq.${post.organization_id},state_slug.eq.${post.state_slug ?? ''}`
                        : `state_slug.eq.${post.state_slug ?? ''}`,
                )
                .order('published_at', { ascending: false })
                .limit(limit)

            return (data ?? []) as unknown as PostCard[]
        },
    })
}

// ─── useTrendingPosts ────────────────────────────────────────────────────────

export function useTrendingPosts(limit = 10) {
    return useQuery<TrendingPostRow[]>({
        queryKey: queryKeys.posts.trending(),
        staleTime: STALE_TIME.POSTS,
        queryFn: async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('v_trending_posts')
                .select('post_id, type, title, slug, state_slug, org_name, featured_image, featured_image_alt, views_7d, published_at')
                .order('views_7d', { ascending: false })
                .limit(limit)

            if (error) throw error
            return (data ?? []) as TrendingPostRow[]
        },
    })
}
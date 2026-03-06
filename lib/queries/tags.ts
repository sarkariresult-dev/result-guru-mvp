import 'server-only'
import { createStaticClient } from '@/lib/supabase/static'
import { cacheLife, cacheTag } from 'next/cache'
import type { Tag } from '@/types/taxonomy.types'
import type { PostCard } from '@/types/post.types'
import { PAGINATION } from '@/config/constants'

/**
 * Get tags, ordered by post_count descending (most popular first).
 */
export async function getTags(limit = 100): Promise<Tag[]> {
    'use cache'
    cacheLife('hours')
    cacheTag('taxonomy', 'tags')

    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('tags')
        .select('id, slug, name, tag_type, post_count')
        .eq('is_active', true)
        .order('post_count', { ascending: false })
        .limit(limit)
    if (error) throw new Error(`getTags: ${error.message}`)
    return (data ?? []) as Tag[]
}

/**
 * Get a single tag by slug.
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
    'use cache'
    cacheLife('hours')
    cacheTag('taxonomy', `tag-${slug}`)

    const supabase = createStaticClient()
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('slug', slug)
        .single()
    if (error) {
        if (error.code === 'PGRST116') return null
        throw new Error(`getTagBySlug: ${error.message}`)
    }
    return data as Tag
}

/**
 * Get paginated posts for a specific tag via a single SQL JOIN (RPC).
 * Replaces the old 2-query pattern that fetched ALL post_ids then used IN.
 */
export async function getPostsByTag(
    tagId: string,
    page = 1,
    limit = PAGINATION.DEFAULT_LIMIT,
): Promise<PostCard[]> {
    'use cache'
    cacheLife('minutes')
    cacheTag('posts', `tag-posts-${tagId}`)

    const supabase = createStaticClient()
    const offset = (page - 1) * limit

    const { data, error } = await (supabase.rpc as any)('fn_posts_by_tag', {
        p_tag_id: tagId,
        p_limit: limit,
        p_offset: offset,
    })

    if (error) throw new Error(`getPostsByTag: ${error.message}`)
    return (data ?? []) as unknown as PostCard[]
}

/**
 * Count posts for a specific tag.
 */
export async function getPostsCountByTag(tagId: string): Promise<number> {
    'use cache'
    cacheLife('minutes')
    cacheTag('taxonomy', `tag-count-${tagId}`)

    const supabase = createStaticClient()
    const { count, error } = await supabase
        .from('post_tags')
        .select('post_id', { count: 'exact', head: true })
        .eq('tag_id', tagId)
    if (error) throw new Error(`getPostsCountByTag: ${error.message}`)
    return count ?? 0
}

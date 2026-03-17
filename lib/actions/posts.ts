'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { postSchema } from '@/lib/validations'
import { z } from 'zod'
import type { PostType, PostStatus, ApplicationStatus } from '@/types/enums'
import { pushToGoogleIndexingApi } from '@/lib/seo/indexing'
import { SITE, ROUTE_PREFIXES, type PostTypeKey } from '@/config/site'

/**
 * Columns marked NOT NULL in 007_posts.sql with their DB DEFAULT values.
 * When inserting/updating, we MUST NOT send `null` for these columns -
 * either send a real value or omit the key so the DB default applies.
 */
const NOT_NULL_DEFAULTS: Record<string, unknown> = {
    application_status: 'na',

    faq: [],
    robots_directive: 'index,follow',
    noindex: false,
    structured_data_type: 'auto',
    hreflang: [],
    breadcrumb_override: [],
    og_image_width: 1200,
    og_image_height: 630,
    twitter_card_type: 'summary_large_image',
    seo_score: 0,
    word_count: 0,
    reading_time_min: 1,
    internal_links_count: 0,
    view_count: 0,
    share_count: 0,
}

// ── Types - mirrors 007_posts.sql columns exactly ──────────
interface PostPayload {
    // Identity
    type: PostType
    status: PostStatus
    application_status?: ApplicationStatus

    // Content
    title: string
    slug: string
    excerpt?: string | null
    content?: string | null

    // Taxonomy
    state_slug?: string | null
    organization_id?: string | null
    // org_name / org_short_name are auto-filled by fn_denorm_org_fields trigger
    qualification?: string[] | null          // TEXT[] of qualification slugs
    category_id?: string | null

    // Media
    featured_image?: string | null
    featured_image_alt?: string | null
    featured_image_width?: number | null
    featured_image_height?: number | null
    notification_pdf?: string | null

    // Key links (external URLs)
    admit_card_link?: string | null
    result_link?: string | null
    answer_key_link?: string | null

    // Structured content (JSONB)

    faq?: Array<{ q: string; a: string }> | null
    related_post_ids?: string[] | null

    // SEO
    meta_title?: string | null
    meta_description?: string | null
    meta_keywords?: string[] | null
    focus_keyword?: string | null
    secondary_keywords?: string[] | null
    canonical_url?: string | null
    robots_directive?: string
    noindex?: boolean
    structured_data_type?: string | null
    schema_json?: Record<string, unknown> | null

    // Open Graph / Twitter
    og_title?: string | null
    og_description?: string | null
    og_image?: string | null
    og_image_width?: number | null
    og_image_height?: number | null
    twitter_title?: string | null
    twitter_description?: string | null
    twitter_card_type?: string | null

    // Publishing
    author_id?: string | null
    published_at?: string | null
    last_reviewed_at?: string | null

    // Junction table helpers (not DB columns - handled separately)
    tag_ids?: string[]
}

// Extend postSchema with tag_ids for the full payload
const createPostSchema = postSchema.extend({
    tag_ids: z.array(z.string().uuid()).optional(),
})

const updatePostSchema = postSchema.partial().extend({
    tag_ids: z.array(z.string().uuid()).optional(),
})

// ── Create Post ────────────────────────────────────────────
export async function createPost(data: PostPayload) {
    // Validate input with Zod before touching the DB
    const parsed = createPostSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()

    // Build row with only valid DB columns (triggers handle org_name, seo_score, etc.)
    // CRITICAL: For NOT NULL columns, use the DB default instead of null.
    // Sending explicit null to a NOT NULL column causes a constraint violation.
    const row: Record<string, unknown> = {
        // Identity
        type: data.type,
        status: data.status,
        application_status: data.application_status ?? 'na',

        // Content
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? null,
        content: data.content ?? null,

        // Taxonomy
        state_slug: data.state_slug ?? null,
        organization_id: data.organization_id ?? null,
        qualification: data.qualification ?? null,
        category_id: data.category_id ?? null,

        // Media
        featured_image: data.featured_image ?? null,
        featured_image_alt: data.featured_image_alt ?? null,
        featured_image_width: data.featured_image_width ?? null,
        featured_image_height: data.featured_image_height ?? null,
        notification_pdf: data.notification_pdf ?? null,

        // Key links
        admit_card_link: data.admit_card_link ?? null,
        result_link: data.result_link ?? null,
        answer_key_link: data.answer_key_link ?? null,


        faq: data.faq ?? [],
        related_post_ids: data.related_post_ids ?? null,

        // SEO - NOT NULL columns use DB defaults
        meta_title: data.meta_title ?? null,
        meta_description: data.meta_description ?? null,
        meta_keywords: data.meta_keywords ?? null,
        focus_keyword: data.focus_keyword ?? null,
        secondary_keywords: data.secondary_keywords ?? null,
        canonical_url: data.canonical_url ?? null,
        robots_directive: data.robots_directive ?? 'index,follow',
        noindex: data.noindex ?? false,
        structured_data_type: data.structured_data_type ?? 'auto',
        schema_json: data.schema_json ?? null,

        // Open Graph / Twitter - NOT NULL columns use DB defaults
        og_title: data.og_title ?? null,
        og_description: data.og_description ?? null,
        og_image: data.og_image ?? null,
        og_image_width: data.og_image_width ?? 1200,
        og_image_height: data.og_image_height ?? 630,
        twitter_title: data.twitter_title ?? null,
        twitter_description: data.twitter_description ?? null,
        twitter_card_type: data.twitter_card_type ?? 'summary_large_image',

        // Publishing
        author_id: data.author_id ?? null,
        published_at: data.published_at ?? null,
    }

    const { data: inserted, error } = await supabase
        .from('posts')
        .insert(row)
        .select('id, slug')
        .single()

    if (error) {
        return { error: error.message }
    }

    // Handle tag associations if provided - with error checking
    if (data.tag_ids?.length && inserted?.id) {
        const tagRows = data.tag_ids.map((tag_id) => ({
            post_id: inserted.id,
            tag_id,
        }))
        const { error: tagError } = await supabase.from('post_tags').insert(tagRows)
        if (tagError) {
            // Rollback: delete the post since tag association failed
            await supabase.from('posts').delete().eq('id', inserted.id)
            return { error: `Post created but tag association failed: ${tagError.message}` }
        }
    }

    revalidatePath('/author/posts')
    revalidatePath('/')
    revalidateTag('posts', undefined as any)
    return { success: true, id: inserted?.id, slug: inserted?.slug }
}

// ── Update Post ────────────────────────────────────────────
export async function updatePost(id: string, data: Partial<PostPayload>) {
    // Validate the id
    if (!z.string().uuid().safeParse(id).success) {
        return { error: 'Invalid post ID' }
    }

    // Validate input with Zod before touching the DB
    const parsed = updatePostSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()

    // Strip non-DB fields before sending to Supabase
    const { tag_ids, ...dbFields } = data
    const updateRow: Record<string, unknown> = {}

    // Only include fields that were actually provided.
    // CRITICAL: For NOT NULL columns, use the DB default instead of null.
    for (const [key, value] of Object.entries(dbFields)) {
        if (value === null || value === undefined) {
            // If this column is NOT NULL in the DB, use its default instead of null
            if (key in NOT_NULL_DEFAULTS) {
                updateRow[key] = NOT_NULL_DEFAULTS[key]
            } else {
                updateRow[key] = null
            }
        } else {
            updateRow[key] = value
        }
    }

    const { error } = await supabase
        .from('posts')
        .update(updateRow)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    // Handle tag associations if provided - atomic delete + insert with error handling
    if (tag_ids !== undefined) {
        // Delete existing tags first
        const { error: deleteError } = await supabase.from('post_tags').delete().eq('post_id', id)
        if (deleteError) {
            return { error: `Failed to update tags (delete): ${deleteError.message}` }
        }
        // Insert new tags
        if (tag_ids.length > 0) {
            const tagRows = tag_ids.map((tag_id) => ({ post_id: id, tag_id }))
            const { error: insertError } = await supabase.from('post_tags').insert(tagRows)
            if (insertError) {
                return { error: `Failed to update tags (insert): ${insertError.message}` }
            }
        }
    }

    revalidatePath('/author/posts')
    revalidatePath('/')
    revalidateTag('posts', undefined as any)
    // COUNCIL P0 (Area 9): Revalidate sitemap on published post updates
    if (dbFields.status === 'published' || updateRow.status === undefined) {
        revalidateTag('sitemap', undefined as any)
    }
    return { success: true }
}

// ── Publish Post ───────────────────────────────────────────
// COUNCIL P0: publishPost now triggers Indexing API + sitemap revalidation
// COUNCIL P1 (Area 10): Pre-publish validation for content quality
export async function publishPost(id: string) {
    if (!z.string().uuid().safeParse(id).success) {
        return { error: 'Invalid post ID' }
    }

    const supabase = await createServerClient()

    // DANIEL: Fetch post first for URL building + pre-publish validation
    const { data: existingPost } = await supabase
        .from('posts')
        .select('slug, type, word_count, featured_image, seo_score')
        .eq('id', id)
        .single()

    if (!existingPost) {
        return { error: 'Post not found' }
    }

    // COUNCIL P1 (Area 10): Pre-publish quality warnings
    // MARCUS: Don't block - return warnings so CMS can display them
    const warnings: string[] = []
    if ((existingPost.word_count ?? 0) < 300) {
        warnings.push('Thin content: word count below 300')
    }
    if (!existingPost.featured_image) {
        warnings.push('Missing featured image - reduces Discover visibility')
    }

    const { error } = await supabase
        .from('posts')
        .update({ status: 'published' as PostStatus, published_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/author/posts')
    revalidatePath('/admin/posts')
    revalidatePath('/')
    revalidateTag('posts', undefined as any)
    // COUNCIL P0 (Area 9): Revalidate sitemap immediately after publish
    revalidateTag('sitemap', undefined as any)

    // COUNCIL P0 (Area 9): Fire-and-forget Indexing API call
    // PRIYA: Non-blocking - don't await, don't fail the publish on API error
    const typeKey = existingPost.type as PostTypeKey
    if (typeKey && ROUTE_PREFIXES[typeKey] && existingPost.slug) {
        const postUrl = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${existingPost.slug}`
        pushToGoogleIndexingApi(postUrl, 'URL_UPDATED').catch(() => {
            // Silently swallow - IndexingApi logs its own errors
        })
    }

    return { success: true, warnings: warnings.length > 0 ? warnings : undefined }
}

// ── Delete Post ────────────────────────────────────────────
export async function deletePost(id: string) {
    if (!z.string().uuid().safeParse(id).success) {
        return { error: 'Invalid post ID' }
    }

    const supabase = await createServerClient()

    // DANIEL: Fetch post before deletion for URL_DELETED notification
    const { data: existingPost } = await supabase
        .from('posts')
        .select('slug, type, status')
        .eq('id', id)
        .single()

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/author/posts')
    revalidatePath('/admin/posts')
    revalidatePath('/')
    revalidateTag('posts', undefined as any)
    // COUNCIL P0 (Area 9): Revalidate sitemap on deletion
    revalidateTag('sitemap', undefined as any)

    // COUNCIL P0 (Area 9): Notify Google to deindex deleted published posts
    if (existingPost?.status === 'published' && existingPost.slug && existingPost.type) {
        const typeKey = existingPost.type as PostTypeKey
        if (ROUTE_PREFIXES[typeKey]) {
            const postUrl = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${existingPost.slug}`
            pushToGoogleIndexingApi(postUrl, 'URL_DELETED').catch(() => { })
        }
    }

    return { success: true }
}

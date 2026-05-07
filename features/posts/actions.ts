'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { postSchema } from '@/lib/validations'
import { z } from 'zod'
import type { PostType, PostStatus } from '@/types/enums'
import { pushToGoogleIndexingApi } from '@/lib/seo/indexing'
import { SITE, ROUTE_PREFIXES, type PostTypeKey } from '@/config/site'
import { runSeoAnalysis } from '@/lib/seo/seo-analyzer'
import { analyzeAiHeuristics } from '@/lib/humanize'

/**
 * Columns marked NOT NULL in 007_posts.sql with their DB DEFAULT values.
 */
const NOT_NULL_DEFAULTS: Record<string, unknown> = {
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
    needs_human_review: false,
}

interface PostPayload {
    // Identity
    type: PostType
    status: PostStatus
    application_start_date?: string | null
    application_end_date?: string | null

    // Content
    title: string
    slug: string
    excerpt?: string | null
    content?: string | null

    // Taxonomy
    state_slug?: string | null
    organization_id?: string | null
    qualification?: string[] | null
    category_id?: string | null

    // Media
    featured_image?: string | null
    featured_image_alt?: string | null
    featured_image_width?: number | null
    featured_image_height?: number | null
    notification_pdf?: string | null

    // Key links
    primary_link?: string | null

    // Structured content
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
    needs_human_review?: boolean

    // Helpers
    tag_ids?: string[]
}

const createPostSchema = postSchema.extend({
    tag_ids: z.array(z.string().uuid()).optional(),
})

const updatePostSchema = postSchema.partial().extend({
    tag_ids: z.array(z.string().uuid()).optional(),
})

function toIST(dateStr: string | null | undefined, isEnd = false) {
    if (!dateStr || dateStr.includes('T')) return dateStr ?? null
    return `${dateStr}T${isEnd ? '23:59:59' : '00:00:00'}+05:30`
}

function countInternalLinks(content: string | null | undefined): number {
    if (!content) return 0
    const relativeLinks = content.match(/href=["'](\/[^"']+)["']/g) || []
    const absoluteLinks = content.match(/href=["']https?:\/\/(www\.)?resultguru\.co\.in[^"']*["']/gi) || []
    return relativeLinks.length + absoluteLinks.length
}

// ── Create Post ────────────────────────────────────────────
export async function createPost(data: PostPayload) {
    if (data.application_start_date) data.application_start_date = toIST(data.application_start_date)
    if (data.application_end_date) data.application_end_date = toIST(data.application_end_date, true)

    const parsed = createPostSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()

    const row: Record<string, unknown> = {
        type: data.type,
        status: data.status,
        application_start_date: data.application_start_date ?? null,
        application_end_date: data.application_end_date ?? null,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt ?? null,
        content: data.content ?? null,
        state_slug: data.state_slug ?? null,
        organization_id: data.organization_id ?? null,
        qualification: data.qualification ?? null,
        category_id: data.category_id ?? null,
        featured_image: data.featured_image ?? null,
        featured_image_alt: data.featured_image_alt ?? null,
        featured_image_width: data.featured_image_width ?? null,
        featured_image_height: data.featured_image_height ?? null,
        notification_pdf: data.notification_pdf ?? null,
        primary_link: data.primary_link ?? null,
        faq: data.faq ?? [],
        related_post_ids: data.related_post_ids ?? null,
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
        og_title: data.og_title ?? null,
        og_description: data.og_description ?? null,
        og_image: data.og_image ?? null,
        og_image_width: data.og_image_width ?? 1200,
        og_image_height: data.og_image_height ?? 630,
        twitter_title: data.twitter_title ?? null,
        twitter_description: data.twitter_description ?? null,
        twitter_card_type: data.twitter_card_type ?? 'summary_large_image',
        author_id: data.author_id ?? null,
        published_at: data.published_at ?? null,
        needs_human_review: data.needs_human_review ?? false,
    }

    // Heuristics & Metrics
    const content = data.content || ''
    const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
    row.word_count = wordCount
    row.reading_time_min = Math.max(1, Math.round(wordCount / 200))
    row.internal_links_count = countInternalLinks(content)

    const heuristics = analyzeAiHeuristics(content)
    if (heuristics.isFlagged) {
        row.needs_human_review = true
    }

    const { data: inserted, error } = await supabase
        .from('posts')
        .insert(row)
        .select('id, slug')
        .single()

    if (error) return { error: error.message }

    if (data.tag_ids?.length && inserted?.id) {
        const tagRows = data.tag_ids.map((tag_id) => ({ post_id: inserted.id, tag_id }))
        await supabase.from('post_tags').insert(tagRows)
    }

    revalidatePath('/author/posts')
    revalidatePath('/')
    revalidateTag('posts')
    return { success: true, id: inserted?.id, slug: inserted?.slug }
}

// ── Update Post ────────────────────────────────────────────
export async function updatePost(id: string, data: Partial<PostPayload>) {
    if (data.application_start_date) data.application_start_date = toIST(data.application_start_date)
    if (data.application_end_date) data.application_end_date = toIST(data.application_end_date, true)

    const parsed = updatePostSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const supabase = await createServerClient()
    const { tag_ids, ...dbFields } = data
    const updateRow: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(dbFields)) {
        if (value === null || value === undefined) {
            updateRow[key] = key in NOT_NULL_DEFAULTS ? NOT_NULL_DEFAULTS[key] : null
        } else {
            updateRow[key] = value
        }
    }

    if (dbFields.content !== undefined) {
        const content = dbFields.content || ''
        const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
        updateRow.word_count = wordCount
        updateRow.reading_time_min = Math.max(1, Math.round(wordCount / 200))
        updateRow.internal_links_count = countInternalLinks(content)

        const heuristics = analyzeAiHeuristics(content)
        if (heuristics.isFlagged) {
            updateRow.needs_human_review = true
        }
    }

    const { error } = await supabase.from('posts').update(updateRow).eq('id', id)
    if (error) return { error: error.message }

    if (tag_ids !== undefined) {
        await supabase.from('post_tags').delete().eq('post_id', id)
        if (tag_ids.length > 0) {
            const tagRows = tag_ids.map((tag_id) => ({ post_id: id, tag_id }))
            await supabase.from('post_tags').insert(tagRows)
        }
    }

    revalidatePath('/author/posts')
    revalidatePath('/')
    revalidateTag('posts')
    return { success: true }
}

// ── Publish Post ───────────────────────────────────────────
export async function publishPost(id: string) {
    const supabase = await createServerClient()
    const { data: post } = await supabase
        .from('posts')
        .select('slug, type, word_count, content, featured_image')
        .eq('id', id)
        .single()

    if (!post) return { error: 'Post not found' }

    const content = post.content || ''
    const hasPlaceholders = /\[officialWebsiteUrl\]|\[primaryLink\]|\[notificationPdfUrl\]|href="#"/i.test(content)
    if (hasPlaceholders) {
        return { error: 'Publishing blocked: Post contains unresolved placeholder links.' }
    }

    if ((post.word_count ?? 0) < 1000) {
        return { error: `Publishing blocked: Thin content detected (${post.word_count} words). Min 1000 required.` }
    }

    const { error } = await supabase
        .from('posts')
        .update({ status: 'published', published_at: new Date().toISOString() })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/author/posts')
    revalidatePath('/')
    revalidateTag('posts')
    revalidateTag('sitemap')

    const typeKey = post.type as PostTypeKey
    if (ROUTE_PREFIXES[typeKey] && post.slug) {
        const postUrl = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${post.slug}`
        pushToGoogleIndexingApi(postUrl, 'URL_UPDATED').catch(() => { })
    }

    return { success: true }
}

// ── Delete Post ────────────────────────────────────────────
export async function deletePost(id: string) {
    const supabase = await createServerClient()
    const { data: post } = await supabase.from('posts').select('slug, type, status').eq('id', id).single()

    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/author/posts')
    revalidatePath('/')
    revalidateTag('posts')
    revalidateTag('sitemap')

    if (post?.status === 'published' && post.slug && post.type) {
        const typeKey = post.type as PostTypeKey
        if (ROUTE_PREFIXES[typeKey]) {
            const postUrl = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/${post.slug}`
            pushToGoogleIndexingApi(postUrl, 'URL_DELETED').catch(() => { })
        }
    }

    return { success: true }
}

// ── Editorial Review ──────────────────────────────────────────
export async function markAsReviewed(id: string) {
    const supabase = await createServerClient()
    const { error } = await supabase.from('posts').update({ needs_human_review: false }).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/author/posts')
    return { success: true }
}

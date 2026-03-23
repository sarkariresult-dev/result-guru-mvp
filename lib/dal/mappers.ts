import { calculateApplicationStatus } from '@/lib/utils'
import type { PostCard, PublishedPost } from '@/types/post.types'
import type { AdminPost } from '@/features/posts/queries'

/**
 * Maps a raw database row from `v_published_posts` to a clean `PostCard` DTO.
 * Guarantees that internal database columns do not leak into the presentation layer.
 */
export function toPostCardDTO(row: any): PostCard {
    if (!row) return null as any
    return {
        id: row.id,
        type: row.type,
        application_status: (row as any).application_status ?? calculateApplicationStatus(row.application_start_date, row.application_end_date),
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        state_slug: row.state_slug,
        state_name: row.state_name,
        org_name: row.org_name,
        org_short_name: row.org_short_name,
        org_logo_url: row.org_logo_url,
        category_slug: row.category_slug,
        category_name: row.category_name,
        qualification: row.qualification,
        featured_image: row.featured_image,
        featured_image_alt: row.featured_image_alt,
        view_count: row.view_count,
        reading_time_min: row.reading_time_min,
        application_start_date: row.application_start_date,
        application_end_date: row.application_end_date,
        published_at: row.published_at,
        updated_at: row.updated_at,
    }
}

/**
 * Maps a raw database row from `posts` table to a clean `AdminPost` DTO.
 */
export function toAdminPostDTO(row: any): AdminPost {
    if (!row) return null as any
    return {
        id: row.id,
        type: row.type,
        status: row.status,
        application_status: calculateApplicationStatus(row.application_start_date, row.application_end_date),
        title: row.title,
        slug: row.slug,
        state_slug: row.state_slug,
        organization_id: row.organization_id,
        org_name: row.org_name,
        view_count: row.view_count,
        seo_score: row.seo_score,
        application_start_date: row.application_start_date,
        application_end_date: row.application_end_date,
        published_at: row.published_at,
        updated_at: row.updated_at,
        created_at: row.created_at,
    }
}

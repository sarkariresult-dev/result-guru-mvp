import { calculateApplicationStatus } from '@/lib/utils'
import type { PostCard } from '@/types/post.types'
import type { AdminPost } from '@/features/posts/queries'
import { PostType, PostStatus, ApplicationStatus } from '@/types/enums'

interface PostCardRow {
    id: string;
    type: PostType;
    application_status: ApplicationStatus | null;
    application_start_date: string | null;
    application_end_date: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    state_slug: string | null;
    state_name: string | null;
    org_name: string | null;
    org_short_name: string | null;
    org_logo_url: string | null;
    category_slug: string | null;
    category_name: string | null;
    qualification: string[] | null;
    featured_image: string | null;
    featured_image_alt: string | null;
    view_count: number | null;
    reading_time_min: number | null;
    published_at: string | null;
    updated_at: string | null;
}

/**
 * Maps a raw database row from `v_published_posts` to a clean `PostCard` DTO.
 * Guarantees that internal database columns do not leak into the presentation layer.
 */
export function toPostCardDTO(row: Record<string, unknown> | null): PostCard | null {
    if (!row) return null
    const r = row as any
    return {
        id: r.id as string,
        type: r.type as PostType,
        application_status: (r.application_status as ApplicationStatus) ?? calculateApplicationStatus(r.application_start_date, r.application_end_date),
        title: r.title as string,
        slug: r.slug as string,
        excerpt: (r.excerpt as string) ?? null,
        state_slug: (r.state_slug as string) ?? null,
        state_name: (r.state_name as string) ?? null,
        org_name: (r.org_name as string) ?? null,
        org_short_name: (r.org_short_name as string) ?? null,
        org_logo_url: (r.org_logo_url as string) ?? null,
        category_slug: (r.category_slug as string) ?? null,
        category_name: (r.category_name as string) ?? null,
        qualification: (r.qualification as string[]) ?? null,
        featured_image: (r.featured_image as string) ?? null,
        featured_image_alt: (r.featured_image_alt as string) ?? null,
        view_count: (r.view_count as number) ?? 0,
        reading_time_min: (r.reading_time_min as number) ?? 1,
        application_start_date: (r.application_start_date as string) ?? null,
        application_end_date: (r.application_end_date as string) ?? null,
        published_at: (r.published_at as string) ?? null,
        updated_at: (r.updated_at as string) ?? '',
    }
}

interface AdminPostRow {
    id: string;
    type: PostType;
    status: PostStatus;
    application_start_date: string | null;
    application_end_date: string | null;
    title: string;
    slug: string;
    state_slug: string | null;
    organization_id: string | null;
    org_name: string | null;
    view_count: number | null;
    seo_score: number | null;
    published_at: string | null;
    updated_at: string | null;
    created_at: string;
}

/**
 * Maps a raw database row from `posts` table to a clean `AdminPost` DTO.
 */
export function toAdminPostDTO(row: Record<string, unknown> | null): AdminPost | null {
    if (!row) return null
    const r = row as any
    return {
        id: r.id as string,
        type: r.type as PostType,
        status: r.status as PostStatus,
        application_status: calculateApplicationStatus(r.application_start_date, r.application_end_date),
        title: r.title as string,
        slug: r.slug as string,
        state_slug: (r.state_slug as string) ?? null,
        organization_id: (r.organization_id as string) ?? null,
        org_name: (r.org_name as string) ?? null,
        view_count: (r.view_count as number) ?? 0,
        seo_score: (r.seo_score as number) ?? 0,
        application_start_date: (r.application_start_date as string) ?? null,
        application_end_date: (r.application_end_date as string) ?? null,
        published_at: (r.published_at as string) ?? null,
        updated_at: (r.updated_at as string) ?? '',
        created_at: (r.created_at as string) ?? '',
    }
}

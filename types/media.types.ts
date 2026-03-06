// =============================================================
// media.types.ts — Result Guru
// Mirrors 010_media.sql — central media / asset library.
// =============================================================

// ── Media record ───────────────────────────────────────────
export interface Media {
    id: string
    // Storage location
    bucket: string        // 'posts' | 'avatars' | 'organizations' | 'site-assets'
    storage_path: string        // Path within bucket
    public_url: string        // Computed CDN URL
    file_name: string
    // File metadata
    mime_type: string
    file_size: number | null // Bytes
    width: number | null
    height: number | null
    // Accessibility
    alt_text: string | null
    caption: string | null
    // WebP optimised copy
    webp_path: string | null
    webp_url: string | null
    is_webp_ready: boolean
    // Ownership
    uploaded_by: string | null
    used_in_posts: string[] | null
    created_at: string
}

// ── Upload payload ─────────────────────────────────────────
export interface MediaUploadPayload {
    file: File
    bucket: MediaBucket
    folder?: string
    alt_text?: string
    caption?: string
}

// ── Bucket names ───────────────────────────────────────────
export type MediaBucket =
    | 'posts'
    | 'avatars'
    | 'organizations'
    | 'site-assets'

// ── Upload result ──────────────────────────────────────────
export interface MediaUploadResult {
    media: Media
    public_url: string
}

// ── Media filters ──────────────────────────────────────────
export interface MediaFilters {
    bucket?: MediaBucket
    mime_type?: string
    uploaded_by?: string
    search?: string    // file_name search
}

// ── Image dimensions helper ────────────────────────────────
export interface ImageDimensions {
    width: number
    height: number
}

// ── Responsive image source set ───────────────────────────
export interface ResponsiveImage {
    src: string
    srcset: string
    webp?: string
    alt: string
    width: number | null
    height: number | null
}

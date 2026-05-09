/**
 * Custom image loader for Supabase Storage.
 *
 * Bypasses the Next.js server-side image optimizer (which fails due to
 * NAT64 / SSRF "private ip" errors on Vercel) and instead routes images
 * through Supabase Storage's `/render/image` endpoint for on-the-fly
 * resize + quality optimization.
 *
 * Performance optimization:
 * - Images requesting width < 200px (avatars, logos, tiny thumbnails)
 *   are served directly from Supabase CDN without transforms. At these
 *   sizes, the transform API overhead outweighs any file-size savings.
 * - Only larger images (post cards, hero images, product photos) use
 *   the /render/image transform endpoint.
 */

/** Width threshold below which we skip Supabase transforms */
const TRANSFORM_MIN_WIDTH = 200

export default function supabaseLoader({
    src,
    width,
    quality,
}: {
    src: string
    width: number
    quality?: number
}) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    /* ── 1. Local assets (starts with /) ─────────────────────── */
    if (src.startsWith('/')) {
        // SVGs are vector — serve original without any params
        if (src.endsWith('.svg')) return src
        // Append a cache-bust param for Next.js validation
        return `${src}?w=${width}`
    }

    /* ── 2. Supabase Storage images ──────────────────────────── */
    if (supabaseUrl && src.startsWith(supabaseUrl) && src.includes('/storage/v1/object/public/')) {
        const path = src.split('/storage/v1/object/public/')[1]
        if (path) {
            // Small images: serve directly from Supabase CDN (no transform)
            // This avoids unnecessary /render/image API calls for avatars,
            // org logos, and tiny thumbnails where resize overhead > savings.
            if (width < TRANSFORM_MIN_WIDTH) {
                return src
            }

            // Larger images: use Supabase Image Transforms for resize + quality
            // URL: /storage/v1/render/image/public/[bucket]/[path]?width=X&quality=Y
            return `${supabaseUrl}/storage/v1/render/image/public/${path}?width=${width}&quality=${quality || 75}`
        }
    }

    /* ── 3. External / fallback URLs ─────────────────────────── */
    return src
}

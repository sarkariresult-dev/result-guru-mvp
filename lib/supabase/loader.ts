/**
 * Custom image loader for Supabase Storage.
 *
 * This bypasses the Next.js server-side image optimizer (which can fail due to
 * NAT64 / SSRF protection issues) and instead serves images directly from
 * Supabase Storage with optional transformation parameters.
 */
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

    // 1. Local images (starts with /) - return as is
    if (src.startsWith('/')) {
        return src
    }

    // 2. Supabase Storage images - apply transformation if it's a storage URL
    if (supabaseUrl && src.startsWith(supabaseUrl)) {
        /**
         * Standard Supabase Storage public URL:
         * https://[id].supabase.co/storage/v1/object/public/[bucket]/[path]
         *
         * Supabase Image Transformation URL (Pro/Payg):
         * https://[id].supabase.co/storage/v1/render/image/public/[bucket]/[path]
         *
         * We use the /render/ endpoint if it looks like a public storage URL.
         * If the project is on the Free plan, it will fallback to original or fail,
         * but the primary goal here is bypassing the Next.js proxy to fix the "private ip" error.
         */
        if (src.includes('/storage/v1/object/public/')) {
            const path = src.split('/storage/v1/object/public/')[1]
            if (path) {
                // If the user is on the FREE plan, the /render/ endpoint might return 404.
                // However, given the "private ip" error in Next.js, we MUST bypass the proxy.
                // We'll use the transformation params on the public URL which works for many CDN setups,
                // or just return the direct URL.
                return `${supabaseUrl}/storage/v1/render/image/public/${path}?width=${width}&quality=${quality || 75}`
            }
        }
    }

    // 3. Fallback for other remote images
    return src
}

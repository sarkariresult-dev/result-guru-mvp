import type { MetadataRoute } from 'next'
import { SITE } from '@/config/site'

/**
 * Web App Manifest - enables PWA "Add to Home Screen" and
 * provides metadata for browsers, search engines, and app stores.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 * @see https://developer.mozilla.org/en-US/docs/Web/Manifest
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: SITE.name,
        short_name: SITE.name,
        description: SITE.description,
        start_url: '/',
        display: 'standalone',
        background_color: SITE.backgroundColor,
        theme_color: SITE.themeColor,
        orientation: 'portrait-primary',
        categories: ['education', 'news', 'government'],
        lang: SITE.language,
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
    }
}

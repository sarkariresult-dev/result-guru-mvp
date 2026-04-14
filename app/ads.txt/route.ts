import { env } from "@/config"

/**
 * ads.txt - Authorized Digital Sellers
 *
 * This route programmatically serves the ads.txt file.
 * Configuration is managed via NEXT_PUBLIC_ADSENSE_PUBLISHER_ID in environment variables.
 *
 * @see https://iabtechlab.com/ads-txt-v1-1/
 */
export async function GET() {
    const publisherId = env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
    const lines: string[] = []

    if (publisherId) {
        // Standard AdSense entry format
        const id = publisherId.startsWith('pub-') ? publisherId : `pub-${publisherId}`
        lines.push(`google.com, ${id}, DIRECT, f08c47fec0942fa0`)
    }

    const body = lines.length > 0
        ? lines.join('\n') + '\n'
        : '# Result Guru - Authorized Digital Sellers (ads.txt)\n' +
        '# AdSense implementation in progress...\n' +
        '# Status: Waiting for NEXT_PUBLIC_ADSENSE_PUBLISHER_ID in environment variables.\n'

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    })
}

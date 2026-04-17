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
    // Falls back to the standard Result Guru publisher ID if env var is missing
    const rawId = env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-2318647751686627'
    const lines: string[] = []

    if (rawId) {
        // Clean the ID for ads.txt (must be pub-XXXXXXXXXXXXXXXX format, no 'ca-')
        let publisherId = rawId.trim()
        if (publisherId.startsWith('ca-pub-')) {
            publisherId = publisherId.replace('ca-', '')
        } else if (!publisherId.startsWith('pub-')) {
            publisherId = `pub-${publisherId}`
        }

        // Standard AdSense entry format: google.com, pub-ID, DIRECT, f08c47fec0942fa0
        lines.push(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`)
    }

    const body = lines.length > 0
        ? lines.join('\n') + '\n'
        : '# Result Guru - Authorized Digital Sellers (ads.txt)\n' +
        '# AdSense implementation in progress...\n' +
        '# Status: Waiting for configuration.\n'

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    })
}

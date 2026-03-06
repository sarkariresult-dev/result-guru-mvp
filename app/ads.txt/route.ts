import { SITE } from '@/config/site'

/**
 * GET /ads.txt
 *
 * Serves the ads.txt file required by programmatic
 * programmatic advertising networks. This file declares which
 * ad networks are authorised to sell inventory on the domain.
 *
 * Format: <domain>, <publisher-id>, <relationship>, <certification-authority-id>
 *
 * @see https://developers.google.com/authorized-sellers/ads-txt
 * @see https://iabtechlab.com/ads-txt/
 */
export async function GET() {
    const lines: string[] = []



    // Add more ad networks here as needed:
    // lines.push('example.com, pub-12345, DIRECT, abc123')

    const body = lines.length > 0
        ? lines.join('\n') + '\n'
        : '# No ad networks configured yet.\n# Add your ad network entries to app/ads.txt/route.ts\n'

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    })
}

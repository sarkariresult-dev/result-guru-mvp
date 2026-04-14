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
 * @see https://iabtechlab.com/ads-txt-v1-1/
 */
export async function GET() {
    const lines: string[] = []

    // ── INSTRUCTIONS ──────────────────────────────────────────────
    // When you get your AdSense Publisher ID, add it here:
    // lines.push('google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0')
    // ──────────────────────────────────────────────────────────────

    const body = lines.length > 0
        ? lines.join('\n') + '\n'
        : '# Result Guru - Authorized Digital Sellers (ads.txt)\n' +
          '# AdSense application in progress...\n' +
          '# This file will be updated with the publisher ID upon approval.\n'

    return new Response(body, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    })
}

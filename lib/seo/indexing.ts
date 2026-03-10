import { google } from 'googleapis'

/**
 * ─────────────────────────────────────────────────────────────────
 * Google Search Console Indexing API
 * ─────────────────────────────────────────────────────────────────
 * This utility uses the Google Indexing API to notify Google immediately
 * when a post is created, updated, or deleted, bypassing the need to wait
 * for normal XML sitemap crawling.
 *
 * Requirements:
 * 1. A Google Cloud Platform (GCP) project with the Indexing API enabled.
 * 2. A Service Account with "Owner" permission on your Search Console Property.
 * 3. Service Account JSON key (passed as an env variable or loaded securely).
 */

export type IndexingAction = 'URL_UPDATED' | 'URL_DELETED'

/**
 * Request Google to crawl or remove a URL immediately.
 * 
 * @param url The exact absolute URL to index or remove.
 * @param action 'URL_UPDATED' (for new/updated posts) or 'URL_DELETED'
 */
export async function pushToGoogleIndexingApi(url: string, action: IndexingAction = 'URL_UPDATED') {
    // Prevent running during local dev unless specifically tested
    if (process.env.NODE_ENV !== 'production' && !process.env.TEST_INDEXING_API) {
        console.log(`[SEO:IndexingApi] Skipped mock index request for ${url} (Action: ${action})`)
        return { success: true, mock: true }
    }

    try {
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

        if (!clientEmail || !privateKey) {
            throw new Error('Missing Google Service Account credentials (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY) in env.')
        }

        const jwtClient = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        })

        // Authenticate
        await jwtClient.authorize()

        const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish'

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtClient.credentials.access_token}`,
            },
            body: JSON.stringify({
                url: url,
                type: action,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Indexing API responded with ${response.status}: ${errorText}`)
        }

        const data = await response.json()
        console.log(`[SEO:IndexingApi] Successfully requested ${action} for ${url}`, data)
        return { success: true, data }

    } catch (error) {
        console.error(`[SEO:IndexingApi] Failed to ping indexing API for ${url}:`, error)
        return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
}

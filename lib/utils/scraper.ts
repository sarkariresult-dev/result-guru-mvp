import { parse } from 'node-html-parser'
import crypto from 'crypto'

export interface ScrapedNotice {
    text: string
    url: string
}

export interface ScrapedResult {
    rawContent: string // Canonical list representation for history tracking
    hash: string       // Hash of the notices
    notices: ScrapedNotice[]
}

/**
 * Computes SHA-256 hash of a string.
 */
export function computeHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Normalizes text content (removes extra whitespace, tabs, newlines).
 */
function normalizeText(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
}

/**
 * Checks if a string contains common Indian Sarkari notification keywords.
 */
function isNoticeKeywords(text: string): boolean {
    const keywords = [
        'notice', 'notification', 'admit', 'result', 'answer', 'cutoff', 'cut-off',
        'syllabus', 'exam', 'recruitment', 'vacancy', 'bharti', 'apply', 'key',
        'selection', 'candidature', 'list', 'score', 'marks', 'dates'
    ]
    const textLower = text.toLowerCase()
    return keywords.some(kw => textLower.includes(kw))
}

/**
 * Scrapes a page and extracts notices/links.
 * 
 * Strategy:
 * 1. Fetch HTML.
 * 2. If selector provided, parse that element.
 * 3. Extract links (<a> tags) resolving relative URLs to absolute.
 * 4. Fallback filter links by keyword/type if no selector is configured to eliminate noise.
 */
export async function scrapePage(url: string, selector?: string | null, signal?: AbortSignal): Promise<ScrapedResult> {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        },
        next: { revalidate: 0 }, // Bypass Next.js cache for live updates
        signal,
    })

    if (!response.ok) {
        throw new Error(`Scraper failed to fetch: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const root = parse(html)

    // Select notice area root
    let noticeContainer = root
    let hasCustomSelector = false

    if (selector && selector.trim()) {
        const found = root.querySelector(selector)
        if (found) {
            noticeContainer = found
            hasCustomSelector = true
        }
    }

    const rawNotices: ScrapedNotice[] = []
    const seenUrls = new Set<string>()

    const aTags = noticeContainer.querySelectorAll('a')

    for (const a of aTags) {
        const text = normalizeText(a.textContent)
        let href = a.getAttribute('href')?.trim()

        if (!href || href.startsWith('#') || href.startsWith('javascript:')) {
            continue
        }

        // Convert relative URLs to absolute
        try {
            href = new URL(href, url).toString()
        } catch {
            continue
        }

        if (seenUrls.has(href)) {
            continue
        }

        // If no custom selector is used, apply intelligent filters to avoid header/footer menu clutter
        if (!hasCustomSelector) {
            const isPdf = href.toLowerCase().endsWith('.pdf')
            const hasKeywords = isNoticeKeywords(text) || isNoticeKeywords(href)
            
            // Skip general links like Home, Contact, Privacy, etc. unless they clearly have notice keywords
            if (text.length < 5) continue
            if (!isPdf && !hasKeywords) continue
        }

        rawNotices.push({
            text: text || href,
            url: href
        })
        seenUrls.add(href)
    }

    // Sort notices to produce a canonical representation (independent of rendering order changes)
    const notices = rawNotices.sort((a, b) => a.url.localeCompare(b.url))

    // Form a canonical markdown/text list
    const rawContent = notices.map(n => `* [${n.text}](${n.url})`).join('\n')
    const hash = computeHash(rawContent)

    return {
        rawContent,
        hash,
        notices
    }
}

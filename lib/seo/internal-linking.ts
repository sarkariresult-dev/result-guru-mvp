/**
 * SEO Internal Linking Engine
 * 
 * Automatically injects contextual internal links into HTML content to build
 * semantic clusters and hub-and-spoke architectures. Also injects platform
 * authority links (Telegram, WhatsApp) for community building.
 */

import { parse } from 'node-html-parser'

export interface PlatformLinks {
    telegram?: string
    whatsapp?: string
    website?: string
}

const DEFAULT_PLATFORM_LINKS: PlatformLinks = {
    telegram: 'https://t.me/resultguru247',
    whatsapp: 'https://chat.whatsapp.com/G45s5q8l8X5A9q8r8q8r8',
    website: 'https://resultguru.co.in'
}

/**
 * Injects contextual links into the HTML content.
 * 
 * @param html The raw HTML content from AI generation or editor.
 * @param focusKeyword The primary keyword to potentially link to a pillar page.
 * @param platformLinks Optional overrides for platform links.
 * @returns Modified HTML string with injected anchor tags.
 */
export function injectContextualLinks(
    html: string,
    focusKeyword?: string,
    platformLinks: PlatformLinks = DEFAULT_PLATFORM_LINKS
): string {
    if (!html || html.length < 50) return html

    const root = parse(html)
    const paragraphs = root.querySelectorAll('p')

    // Inject Platform CTAs in the first appropriate paragraph (usually 2nd or 3rd)
    let ctaInjected = false
    const minLengthForCta = 100

    for (let i = 1; i < paragraphs.length; i++) {
        const p = paragraphs[i]
        if (!p) continue

        if (!ctaInjected && (p.text || '').length > minLengthForCta) {
            const ctaHtml = ` <strong class="text-brand-600 dark:text-brand-400">For instant updates on mobile, join the <a href="${platformLinks.telegram}" target="_blank" rel="noopener noreferrer">Result Guru Telegram Channel</a>.</strong>`
            p.innerHTML = p.innerHTML + ctaHtml
            ctaInjected = true
            break
        }
    }

    // Auto-link primary entities (Placeholder for Hub & Spoke logic)
    // We target paragraphs that mention the exact focus keyword or common entities
    // and wrap them in an internal link.
    if (focusKeyword) {
        const keywordRegex = new RegExp(`\\b(${focusKeyword})\\b`, 'gi')
        let keywordLinked = false

        for (const p of paragraphs) {
            if (keywordLinked) break

            // Ensure we aren't linking inside an existing link or heading
            if (p.querySelector('a')) continue

            if (keywordRegex.test(p.innerHTML)) {
                p.innerHTML = p.innerHTML.replace(
                    keywordRegex,
                    (match) => `<a href="${platformLinks.website}">${match}</a>`
                )
                keywordLinked = true
            }
        }
    }

    // We can expand this with exact LSI keyword mapping to other category hubs
    const lsiMapping: Record<string, string> = {
        'sarkari result': '/result',
        'admit card': '/admit-card',
        'syllabus': '/syllabus',
        'latest jobs': '/latest-jobs'
    }

    const linkedCategories = new Set<string>()

    for (const p of paragraphs) {
        if (p.querySelector('a')) continue // Skip if already contains a link

        for (const [term, slug] of Object.entries(lsiMapping)) {
            if (linkedCategories.has(slug)) continue

            const termRegex = new RegExp(`\\b(${term})\\b`, 'gi')
            if (termRegex.test(p.innerHTML)) {
                p.innerHTML = p.innerHTML.replace(
                    termRegex,
                    (match) => `<a href="${slug}">${match}</a>`
                )
                linkedCategories.add(slug)
                break // Only one category link per paragraph
            }
        }
    }

    return root.toString()
}

/**
 * Calculates a related cluster score to find the most relevant posts.
 * Hub-and-Spoke logic uses this to suggest "Related Articles".
 */
export function calculateRelatedClusterScore(
    sourceTags: string[],
    targetTags: string[],
    sourceCategory: string,
    targetCategory: string
): number {
    let score = 0

    // Category match is a strong signal for hub-and-spoke
    if (sourceCategory === targetCategory) score += 50

    // Tag overlap (Semantic relevance)
    const overlap = sourceTags.filter(tag => targetTags.includes(tag)).length
    score += overlap * 20

    return score
}

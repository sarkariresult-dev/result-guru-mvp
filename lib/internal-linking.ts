import { ROUTE_PREFIXES } from '@/config/site'

interface PostContext {
    stateSlug?: string | null
    stateName?: string | null
    orgSlug?: string | null
    orgName?: string | null
    orgShortName?: string | null
}

interface KeywordLink {
    regex: RegExp
    url: string
    title: string
}

/**
 * Generate a set of contextual linking rules based on the post's metadata.
 * For example, if the post belongs to Uttar Pradesh, the word "Admit Card"
 * will be linked to /admit-card/in/uttar-pradesh.
 */
export function generateContextualLinks(context: PostContext): KeywordLink[] {
    const links: KeywordLink[] = []

    // 1. Organization Links
    if (context.orgSlug && context.orgName) {
        links.push({
            // Match the exact org name or short name
            regex: new RegExp(`\\b(${escapeRegExp(context.orgName)}|${escapeRegExp(context.orgShortName || context.orgName)})\\b`, 'i'),
            url: `/organizations/${context.orgSlug}`,
            title: `View all updates for ${context.orgName}`
        })
    }

    // 2. State & Programmatic Type Links
    if (context.stateSlug && context.stateName) {
        // Link state mentions to the state hub
        links.push({
            regex: new RegExp(`\\b(${escapeRegExp(context.stateName)})\\b(?!(?:\\s+Govt\\s+Jobs|\\s+Sarkari|\\s+Police))`, 'i'),
            url: `/states/${context.stateSlug}`,
            title: `Latest ${context.stateName} Govt Jobs & Results`
        })

        // Link core types to their programmatic SEO pages
        links.push({
            regex: /\b(Govt Jobs|Latest Jobs|Government Jobs)\b/i,
            url: `/job/in/${context.stateSlug}`,
            title: `Latest ${context.stateName} Govt Jobs`
        })
        links.push({
            regex: /\b(Syllabus|Exam Pattern)\b/i,
            url: `/syllabus/in/${context.stateSlug}`,
            title: `Download ${context.stateName} Syllabus PDF`
        })
        links.push({
            regex: /\b(Admit Card|Hall Ticket|Call Letter)\b/i,
            url: `/admit-card/in/${context.stateSlug}`,
            title: `Download ${context.stateName} Admit Card`
        })
        links.push({
            regex: /\b(Result|Sarkari Result|Merit List)\b/i,
            url: `/result/in/${context.stateSlug}`,
            title: `Check ${context.stateName} Results`
        })
        links.push({
            regex: /\b(Answer Key|Response Sheet)\b/i,
            url: `/answer-key/in/${context.stateSlug}`,
            title: `${context.stateName} Answer Keys`
        })
        links.push({
            regex: /\b(Cut Off|Cutoff Marks)\b/i,
            url: `/cut-off/in/${context.stateSlug}`,
            title: `${context.stateName} Cut Off Marks`
        })
    } else {
        // Fallback: Link to global type listings if no state is specified
        links.push({
            regex: /\b(Syllabus|Exam Pattern)\b/i,
            url: '/syllabus',
            title: 'Download Latest Exam Syllabus'
        })
        links.push({
            regex: /\b(Admit Card|Hall Ticket)\b/i,
            url: '/admit-card',
            title: 'Download Admit Cards'
        })
        links.push({
            regex: /\b(Sarkari Result)\b/i,
            url: '/result',
            title: 'Check Latest Sarkari Results'
        })
    }

    return links
}

/**
 * Escapes characters for safe RegExp creation
 */
function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Auto-inject internal links into HTML content.
 * Reads paragraph <p> and <li> text, ignores text inside existing <a>, <hX>, or <button> tags.
 * Only links a specific keyword once per document to avoid spammy link profiles.
 */
export function injectInternalLinks(html: string, context: PostContext): string {
    if (!html) return html

    const rules = generateContextualLinks(context)
    if (rules.length === 0) return html

    // Quick regex to find content within <p> or <li> tags (basic implementation targeting typical structures)
    let processedHtml = html
    const usedRegexIndexes = new Set<number>()

    // Replace within text nodes safely. We use a simple regex approach that splits by tags
    // to ensure we only replace text outside of existing links or headings.
    const chunks = processedHtml.split(/(<[^>]+>)/g)
    let inRestrictedTag = false

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        if (chunk === undefined) continue

        // Check if we are entering or exiting a tag that shouldn't have links injected
        if (chunk.match(/^<(a|h[1-6]|button|script|style|textarea)[>\s]/i)) {
            inRestrictedTag = true
            continue
        }
        if (chunk.match(/^<\/(a|h[1-6]|button|script|style|textarea)>/i)) {
            inRestrictedTag = false
            continue
        }

        // If it's a structural tag like <div> or <p>, just ignore
        if (chunk.startsWith('<')) {
            continue
        }

        // We are in a safe text chunk
        if (!inRestrictedTag && chunk.trim().length > 0) {
            let modifiedChunk = chunk

            for (let r = 0; r < rules.length; r++) {
                if (usedRegexIndexes.has(r)) continue // Only link once per keyword rule

                const rule = rules[r]
                if (!rule) continue

                const match = modifiedChunk.match(rule.regex)

                if (match && match[0]) {
                    // Replace the first occurrence
                    modifiedChunk = modifiedChunk.replace(
                        rule.regex,
                        `<a href="${rule.url}" title="${rule.title}" class="font-medium text-brand-600 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300 transition-colors">${match[0]}</a>`
                    )
                    usedRegexIndexes.add(r) // Mark rule as used
                }
            }

            chunks[i] = modifiedChunk
        }
    }

    return chunks.join('')
}

/**
 * Internal linking engine for Programmatic SEO.
 *
 * Injects contextual internal links into post HTML content based on:
 * 1. State-specific pages (e.g., mentioning "Bihar" → /job/in/bihar)
 * 2. Organization pages (e.g., mentioning "SSC" → /job/org/ssc)
 * 3. Type-specific listing pages (e.g., "admit card" → /admit-card)
 * 4. Year-based archive links
 *
 * Design principles:
 * - Never break existing HTML tags or links
 * - Respect max link density (1 link per ~150 words)
 * - Don't inject duplicate links
 * - Avoid linking inside headings, existing anchors, or tables
 */

import { ROUTE_PREFIXES } from '@/config/site'

interface LinkContext {
    stateSlug?: string | null
    stateName?: string | null
    orgSlug?: string | null
    orgName?: string | null
    orgShortName?: string | null
}

/** Maximum internal links per post to avoid over-optimization */
const MAX_LINKS_PER_POST = 8

/** Minimum words between injected links */
const MIN_WORDS_BETWEEN_LINKS = 100

// ── Type keyword matchers ──────────────────────────────────────────

const TYPE_LINK_RULES: Array<{
    patterns: RegExp
    href: string
    label: string
}> = [
    { patterns: /\b(?:admit\s*card|hall\s*ticket)\b/gi, href: ROUTE_PREFIXES.admit, label: 'Admit Card' },
    { patterns: /\b(?:answer\s*key)\b/gi, href: ROUTE_PREFIXES.answer_key, label: 'Answer Key' },
    { patterns: /\b(?:cut\s*off|cutoff)\b/gi, href: ROUTE_PREFIXES.cut_off, label: 'Cut Off' },
    { patterns: /\b(?:syllabus)\b/gi, href: ROUTE_PREFIXES.syllabus, label: 'Syllabus' },
    { patterns: /\b(?:exam\s*pattern|paper\s*pattern)\b/gi, href: ROUTE_PREFIXES.exam_pattern, label: 'Exam Pattern' },
    { patterns: /\b(?:previous\s*(?:year\s*)?paper|old\s*paper)\b/gi, href: ROUTE_PREFIXES.previous_paper, label: 'Previous Year Paper' },
    { patterns: /\b(?:scholarship|छात्रवृत्ति)\b/gi, href: ROUTE_PREFIXES.scholarship, label: 'Scholarship' },
    { patterns: /\b(?:scheme|yojana|योजना)\b/gi, href: ROUTE_PREFIXES.scheme, label: 'Government Scheme' },
]

// ── HTML-safe chunking ─────────────────────────────────────────────

/**
 * Split HTML into text-and-tag chunks so we only manipulate text nodes.
 * Tags (including attributes) are returned untouched.
 */
function chunkHtml(html: string): Array<{ type: 'text' | 'tag'; value: string }> {
    const chunks: Array<{ type: 'text' | 'tag'; value: string }> = []
    const tagRegex = /<[^>]+>/g
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = tagRegex.exec(html)) !== null) {
        if (match.index > lastIndex) {
            chunks.push({ type: 'text', value: html.slice(lastIndex, match.index) })
        }
        chunks.push({ type: 'tag', value: match[0] })
        lastIndex = match.index + match[0].length
    }

    if (lastIndex < html.length) {
        chunks.push({ type: 'text', value: html.slice(lastIndex) })
    }

    return chunks
}

/**
 * Detect if we're currently inside a tag that shouldn't have links injected.
 * Tags: <a>, <h1>-<h6>, <th>, <button>, <label>, <code>, <pre>
 */
function isInsideProtectedTag(chunks: Array<{ type: 'text' | 'tag'; value: string }>, index: number): boolean {
    const protectedTags = /^<(a|h[1-6]|th|button|label|code|pre|figcaption|script|style)\b/i
    const closingProtected = /^<\/(a|h[1-6]|th|button|label|code|pre|figcaption|script|style)>/i
    let depth = 0

    for (let i = 0; i < index; i++) {
        const chunk = chunks[i]
        if (chunk && chunk.type === 'tag') {
            if (protectedTags.test(chunk.value)) depth++
            if (closingProtected.test(chunk.value)) depth = Math.max(0, depth - 1)
        }
    }

    return depth > 0
}

// ── Main injection ─────────────────────────────────────────────────

/**
 * Inject contextual internal links into HTML content.
 * Returns the enhanced HTML with SEO-boosting internal links.
 */
export function injectInternalLinks(html: string, context: LinkContext): string {
    if (!html) return html

    const chunks = chunkHtml(html)
    let linksInjected = 0
    let wordsSinceLastLink = MIN_WORDS_BETWEEN_LINKS // Allow first link immediately
    const usedUrls = new Set<string>()
    const usedPatterns = new Set<string>()

    // Pre-scan: collect existing link URLs to avoid duplicates
    for (const chunk of chunks) {
        if (chunk.type === 'tag') {
            const hrefMatch = chunk.value.match(/href="([^"]*)"/)
            if (hrefMatch && hrefMatch[1]) usedUrls.add(hrefMatch[1])
        }
    }

    // Build priority-ordered link candidates
    const candidates: Array<{ pattern: RegExp; href: string; label: string; priority: number }> = []

    // Priority 1: State-specific org page (e.g., mentioning SSC → /job/org/ssc)
    if (context.orgShortName && context.orgSlug) {
        candidates.push({
            pattern: new RegExp(`\\b${escapeRegex(context.orgShortName ?? '')}\\b`, 'i'),
            href: `/organizations/${context.orgSlug}`,
            label: context.orgShortName,
            priority: 1,
        })
    }
    if (context.orgName && context.orgSlug && context.orgName !== context.orgShortName) {
        candidates.push({
            pattern: new RegExp(`\\b${escapeRegex(context.orgName ?? '')}\\b`, 'i'),
            href: `/organizations/${context.orgSlug}`,
            label: context.orgName,
            priority: 1,
        })
    }

    // Priority 2: State page links
    if (context.stateSlug && context.stateName) {
        candidates.push({
            pattern: new RegExp(`\\b${escapeRegex(context.stateName ?? '')}\\b`, 'i'),
            href: `/states/${context.stateSlug}`,
            label: context.stateName,
            priority: 2,
        })
    }

    // Priority 3: Type-specific listing page links
    for (const rule of TYPE_LINK_RULES) {
        candidates.push({
            pattern: rule.patterns,
            href: rule.href,
            label: rule.label,
            priority: 3,
        })
    }

    // Sort by priority (lower = higher priority)
    candidates.sort((a, b) => a.priority - b.priority)

    // Process text chunks
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        if (!chunk || chunk.type !== 'text') continue
        if (linksInjected >= MAX_LINKS_PER_POST) break
        if (isInsideProtectedTag(chunks, i)) continue

        const words = chunk.value.split(/\s+/).filter(Boolean).length
        wordsSinceLastLink += words

        if (wordsSinceLastLink < MIN_WORDS_BETWEEN_LINKS) continue

        // Try each candidate on this text chunk
        for (const candidate of candidates) {
            if (linksInjected >= MAX_LINKS_PER_POST) break
            if (usedUrls.has(candidate.href)) continue
            if (usedPatterns.has(candidate.label.toLowerCase())) continue

            const match = candidate.pattern.exec(chunk.value)
            if (!match) continue

            // Inject the link
            const matchedText = match[0]
            const before = chunk.value.slice(0, match.index)
            const after = chunk.value.slice(match.index + matchedText.length)
            const link = `<a href="${candidate.href}">${matchedText}</a>`

            chunk.value = `${before}${link}${after}`
            usedUrls.add(candidate.href)
            usedPatterns.add(candidate.label.toLowerCase())
            linksInjected++
            wordsSinceLastLink = 0

            // Reset regex lastIndex for global patterns
            candidate.pattern.lastIndex = 0
            break // Only one link per text chunk
        }
    }

    return chunks.map(c => c.value).join('')
}

// ── Helpers ────────────────────────────────────────────────────────

function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

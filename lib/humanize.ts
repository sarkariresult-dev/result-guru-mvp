/**
 * Content Humanization Engine (v2 - Lightweight)
 *
 * Post-processes AI-generated HTML to break detectable AI patterns.
 * Does NOT inject Hinglish — the system prompt handles tone.
 * This module only fixes structural AI tells.
 *
 * Transformations:
 * 1. Break repetitive sentence-start patterns
 * 2. Remove duplicate transition words
 * 3. Fix uniform paragraph lengths
 */

/* ── Duplicate Transition Detector ─────────────────────────────── */

/**
 * If the same transition word appears 3+ times in the content,
 * remove the duplicates beyond the 2nd occurrence.
 */
const COMMON_TRANSITIONS = [
    'Additionally,',
    'Furthermore,',
    'Moreover,',
    'However,',
    'Therefore,',
    'Consequently,',
    'Nevertheless,',
    'In conclusion,',
    'Subsequently,',
]

function deduplicateTransitions(html: string): string {
    let result = html

    for (const transition of COMMON_TRANSITIONS) {
        const escaped = transition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escaped, 'g')
        const matches = result.match(regex)

        if (matches && matches.length > 2) {
            // Keep first 2 occurrences, remove the rest by replacing with empty
            let count = 0
            result = result.replace(regex, (match) => {
                count++
                if (count > 2) return '' // Remove 3rd+ occurrence
                return match
            })
        }
    }

    return result
}

/* ── Sentence Pattern Breaker ────────────────────────────────── */

/**
 * Break repetitive sentence patterns. If 3+ consecutive paragraphs
 * start with the same word, rephrase the opening of the middle ones.
 */
function breakSentencePatterns(html: string): string {
    const paragraphs = html.split(/(<\/p>)/i)

    for (let i = 2; i < paragraphs.length - 2; i += 2) {
        const current = paragraphs[i]
        const prev = paragraphs[i - 2]
        const next = paragraphs[i + 2]

        if (!current || !prev || !next) continue

        const getFirstWord = (p: string) => {
            const text = p.replace(/<[^>]*>/g, '').trim()
            return text.split(/\s+/)[0]?.toLowerCase()
        }

        const currentWord = getFirstWord(current)
        const prevWord = getFirstWord(prev)
        const nextWord = getFirstWord(next)

        // If 3 consecutive paragraphs start with same word, vary the middle one
        if (currentWord && currentWord === prevWord && currentWord === nextWord) {
            const starters = ['Note that ', 'Here, ', 'In this case, ', 'Importantly, ', 'For reference, ']
            const starter = starters[Math.floor(Math.random() * starters.length)]
            paragraphs[i] = current.replace(/(<p[^>]*>)/i, `$1${starter}`)
        }
    }

    return paragraphs.join('')
}

/* ── Banned Phrase Cleanup ───────────────────────────────────── */

/**
 * Final safety net — remove any AI clichés that slipped through the prompt.
 */
const BANNED_PHRASES: [RegExp, string][] = [
    [/\bIn today's competitive world,?\s*/gi, ''],
    [/\bLet's dive in\.?\s*/gi, ''],
    [/\bWithout further ado,?\s*/gi, ''],
    [/\bIt's worth noting that\s*/gi, ''],
    [/\bIt is important to note that\s*/gi, ''],
    [/\bIn this article,?\s*/gi, ''],
    [/\bAs we all know,?\s*/gi, ''],
    [/\bIn order to\b/gi, 'To'],
    [/\bAt the end of the day,?\s*/gi, ''],
    [/\bIt goes without saying that\s*/gi, ''],
]

function removeBannedPhrases(html: string): string {
    let result = html
    for (const [pattern, replacement] of BANNED_PHRASES) {
        result = result.replace(pattern, replacement)
    }
    return result
}

/* ── Main Export ──────────────────────────────────────────────── */

/**
 * Lightweight humanization pipeline.
 * Only fixes structural AI patterns — does NOT inject Hinglish.
 *
 * @param html - Raw AI-generated HTML content
 * @returns Cleaned HTML content
 */
export function humanizeContent(html: string): string {
    if (!html || html.length < 100) return html

    let processed = html

    // 1. Remove any banned AI cliché phrases that slipped through
    processed = removeBannedPhrases(processed)

    // 2. Remove duplicate transition words (AI tends to overuse "Additionally,")
    processed = deduplicateTransitions(processed)

    // 3. Break repetitive paragraph-start patterns
    processed = breakSentencePatterns(processed)

    return processed
}

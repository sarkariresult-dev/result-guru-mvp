/**
 * Content Humanization Engine (v3 - Production)
 *
 * Post-processes AI-generated HTML to remove detectable AI patterns.
 * Does NOT inject Hinglish — the system prompt handles tone.
 * This module focuses on structural and linguistic AI tells.
 *
 * Transformations:
 * 1. Remove banned AI cliché phrases (50+ patterns)
 * 2. Break repetitive sentence-start patterns
 * 3. Remove duplicate transition words
 * 4. Validate placeholder links aren't shipped to production
 */

/* ── Banned Phrases (Comprehensive AI-Tell List) ──────────── */

/**
 * Final safety net — remove any AI clichés that slipped through the prompt.
 * Organized by category for maintainability.
 */
const BANNED_PHRASES: [RegExp, string | ((substring: string, ...args: unknown[]) => string)][] = [
    // ── Filler intros that add zero information ──
    [/\bIn today's competitive world,?\s*/gi, ''],
    [/\bIn today's digital age,?\s*/gi, ''],
    [/\bIn today's fast-paced world,?\s*/gi, ''],
    [/\bIn this article,?\s*/gi, ''],
    [/\bIn this comprehensive guide,?\s*/gi, ''],
    [/\bIn this detailed guide,?\s*/gi, ''],
    [/\bLet's dive in\.?\s*/gi, ''],
    [/\bLet's get started\.?\s*/gi, ''],
    [/\bLet's explore\.?\s*/gi, ''],
    [/\bWithout further ado,?\s*/gi, ''],
    [/\bAs we all know,?\s*/gi, ''],
    [/\bAs you may know,?\s*/gi, ''],
    [/\bAs we delve into,?\s*/gi, ''],

    // ── Pompous AI vocabulary ──
    [/\bdelve(?:s|d)?\s+into\b/gi, 'examine'],
    [/\blandscape\b(?!\s+(?:painting|photo|architecture))/gi, 'field'],
    [/\bleverag(?:e|ing|ed)\b/gi, (m: string) => m.startsWith('L') ? 'Use' : 'use'],
    [/\bseamless(?:ly)?\b/gi, 'smooth$1'],
    [/\bholistic\b/gi, 'complete'],
    [/\bparadigm\b/gi, 'model'],
    [/\bplethora\b/gi, 'range'],
    [/\btransformative\b/gi, 'significant'],
    [/\bgame[\s-]?changer\b/gi, 'major development'],
    [/\bcutting[\s-]?edge\b/gi, 'advanced'],
    [/\bembark(?:s|ed|ing)?\s+on\b/gi, 'start'],
    [/\bfoster(?:s|ed|ing)?\b/gi, (m: string) => m.startsWith('F') ? 'Support' : 'support'],
    [/\bshed(?:s|ding)?\s+light\s+on\b/gi, 'clarify'],
    [/\bunlock(?:s|ed|ing)?\s+(?:your\s+)?potential\b/gi, 'improve results'],
    [/\bnavigate\s+the\s+complexities\b/gi, 'handle the details'],
    [/\brobust\b/gi, 'strong'],
    [/\bpivotal\b/gi, 'important'],
    [/\bcrucial\b/gi, 'important'],
    [/\binvaluable\b/gi, 'useful'],
    [/\bensure\s+that\b/gi, 'make sure'],
    [/\butilize\b/gi, 'use'],
    [/\bfacilitate\b/gi, 'help'],
    [/\bcommence\b/gi, 'start'],
    [/\bascertain\b/gi, 'find out'],
    [/\bameliorate\b/gi, 'improve'],
    [/\bplays a (?:crucial|vital|pivotal|key) role\b/gi, 'matters'],

    // ── Redundant qualifiers ──
    [/\bIt's worth noting that\s*/gi, ''],
    [/\bIt is important to note that\s*/gi, ''],
    [/\bIt is worth mentioning that\s*/gi, ''],
    [/\bIt goes without saying that\s*/gi, ''],
    [/\bNeedless to say,?\s*/gi, ''],
    [/\bIt should be noted that\s*/gi, ''],

    // ── Wordy constructions → concise ──
    [/\bIn order to\b/gi, 'To'],
    [/\bAt the end of the day,?\s*/gi, ''],
    [/\bDue to the fact that\b/gi, 'Because'],
    [/\bIn light of the fact that\b/gi, 'Since'],
    [/\bWith regard to\b/gi, 'About'],
    [/\bIn the event that\b/gi, 'If'],
    [/\bPrior to\b/gi, 'Before'],
    [/\bSubsequent to\b/gi, 'After'],
    [/\bA wide range of\b/gi, 'Many'],
    [/\bA large number of\b/gi, 'Many'],
    [/\bIn the near future\b/gi, 'Soon'],

    // ── Generic motivational filler ──
    [/\bWork hard and you will succeed\.?\s*/gi, ''],
    [/\bSuccess is just around the corner\.?\s*/gi, ''],
    [/\bStay focused and keep preparing\.?\s*/gi, ''],
    [/\bBelieve in yourself\.?\s*/gi, ''],
    [/\bDon't give up\.?\s*/gi, ''],
    [/\bHard work always pays off\.?\s*/gi, ''],
]

function removeBannedPhrases(html: string): string {
    let result = html
    for (const [pattern, replacement] of BANNED_PHRASES) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result = result.replace(pattern, replacement as any)
    }
    return result
}

/* ── Duplicate Transition Detector ─────────────────────────── */

/**
 * If the same transition word appears 2+ times in the content,
 * remove duplicates beyond the 1st occurrence.
 * Threshold lowered from 3 to 2 to catch subtler AI patterns.
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
    'Notably,',
    'Specifically,',
    'Ultimately,',
    'Interestingly,',
    'Importantly,',
    'Significantly,',
]

function deduplicateTransitions(html: string): string {
    let result = html

    for (const transition of COMMON_TRANSITIONS) {
        const escaped = transition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escaped, 'g')
        const matches = result.match(regex)

        if (matches && matches.length > 2) {
            let count = 0
            result = result.replace(regex, (match) => {
                count++
                if (count > 1) return '' // Keep only first occurrence
                return match
            })
        }
    }

    return result
}

/* ── Sentence Pattern Breaker ────────────────────────────── */

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

        if (currentWord && currentWord === prevWord && currentWord === nextWord) {
            const starters = ['Note that ', 'Here, ', 'In this case, ', 'Importantly, ', 'For reference, ']
            const idx = i % starters.length // Deterministic selection for SSG
            const starter = starters[idx]
            paragraphs[i] = current.replace(/(<p[^>]*>)/i, `$1${starter}`)
        }
    }

    return paragraphs.join('')
}

/* ── Placeholder Link Validator ──────────────────────────── */

/**
 * Detect unresolved placeholder links that should never ship to production.
 * Returns array of found placeholders for logging.
 */
const PLACEHOLDER_PATTERNS = [
    /\[officialWebsiteUrl\]/g,
    /\[primaryLink\]/g,
    /\[notificationPdfUrl\]/g,
    /\[applyOnlineUrl\]/g,
    /href=["']#["']/g,
    /href=["']\[/g,
]

export function detectPlaceholderLinks(html: string): string[] {
    const found: string[] = []
    for (const pattern of PLACEHOLDER_PATTERNS) {
        const matches = html.match(pattern)
        if (matches) {
            found.push(...matches)
        }
    }
    return found
}

/* ── Main Export ──────────────────────────────────────────── */

/**
 * Production humanization pipeline.
 * Removes structural AI patterns and validates content quality.
 *
 * @param html - Raw AI-generated HTML content
 * @returns Cleaned HTML content
 */
export function humanizeContent(html: string): string {
    if (!html || html.length < 100) return html

    let processed = html

    // 1. Remove banned AI cliché phrases
    processed = removeBannedPhrases(processed)

    // 2. Deduplicate overused transition words
    processed = deduplicateTransitions(processed)

    // 3. Break repetitive paragraph-start patterns
    processed = breakSentencePatterns(processed)

    // 4. Log placeholder warnings (don't strip — let publish pipeline reject)
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        const placeholders = detectPlaceholderLinks(processed)
        if (placeholders.length > 0) {
            console.warn('[humanize] Unresolved placeholders detected:', placeholders)
        }
    }

    return processed
}

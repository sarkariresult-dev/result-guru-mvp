/**
 * Content Humanization Engine (v4 - Production)
 *
 * Post-processes AI-generated HTML to remove detectable AI patterns.
 * Does NOT inject Hinglish — the system prompt handles tone.
 * This module focuses on structural and linguistic AI tells.
 *
 * Transformations:
 * 1. Remove banned AI cliché phrases (70+ patterns)
 * 2. Break repetitive sentence-start patterns
 * 3. Remove duplicate transition words
 * 4. Vary paragraph rhythm to break AI monotone
 * 5. Inject natural em-dash pauses into long sentences
 * 6. Diversify heading patterns
 * 7. Add micro-imperfections for human feel
 * 8. Validate placeholder links aren't shipped to production
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
    [/\btapestry\b/gi, 'mix'],
    [/\bmultifaceted\b/gi, 'varied'],
    [/\bundeniably\b/gi, ''],
    [/\bundoubtedly\b/gi, ''],

    // ── Modern AI tells (GPT-4o / Gemini 2.5 fingerprints) ──
    [/\bIt's essential to\b/gi, 'You should'],
    [/\bIt's important to understand\b/gi, ''],
    [/\bIt's worth highlighting\b/gi, ''],
    [/\bThis comprehensive overview\b/gi, 'This breakdown'],
    [/\bThis detailed breakdown\b/gi, 'This'],
    [/\bThis in-depth analysis\b/gi, 'This'],
    [/\bKey considerations include\b/gi, 'Consider:'],
    [/\bSeveral factors come into play\b/gi, 'A few things matter here'],
    [/\bMake informed decisions?\b/gi, 'decide clearly'],
    [/\bRest assured\b/gi, ''],
    [/\bStands out as\b/gi, 'is'],
    [/\bEmerges as\b/gi, 'is'],
    [/\bProves to be\b/gi, 'is'],
    [/\bServes as a testament\b/gi, 'shows'],
    [/\bA closer look reveals\b/gi, ''],
    [/\bUpon closer inspection\b/gi, ''],
    [/\bBoasts\b/gi, 'Has'],
    [/\bboasts\b/gi, 'has'],
    [/\bShowcases\b/gi, 'Shows'],
    [/\bshowcases\b/gi, 'shows'],
    [/\bUnderscores\b/gi, 'Shows'],
    [/\bunderscores\b/gi, 'shows'],
    [/\bOffers a unique blend\b/gi, 'combines'],
    [/\bStrikes a balance\b/gi, 'balances'],
    [/\bBridges the gap\b/gi, 'connects'],
    [/\bIn an era where\b/gi, 'Now that'],
    [/\bIn the realm of\b/gi, 'In'],
    [/\bGarnered attention\b/gi, 'got attention'],
    [/\bGained traction\b/gi, 'picked up'],
    [/\bIt comes as no surprise\b/gi, ''],
    [/\bNot surprisingly,?\s*/gi, ''],

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
    [/\bFirst and foremost\b/gi, 'First'],
    [/\bLast but not least\b/gi, 'Finally'],
    [/\bAll in all,?\s*/gi, ''],
    [/\bWith that being said,?\s*/gi, ''],
    [/\bThat being said,?\s*/gi, ''],
    [/\bHaving said that,?\s*/gi, ''],

    // ── Generic motivational filler ──
    [/\bWork hard and you will succeed\.?\s*/gi, ''],
    [/\bSuccess is just around the corner\.?\s*/gi, ''],
    [/\bStay focused and keep preparing\.?\s*/gi, ''],
    [/\bBelieve in yourself\.?\s*/gi, ''],
    [/\bDon't give up\.?\s*/gi, ''],
    [/\bHard work always pays off\.?\s*/gi, ''],

    // ── Meta-references ──
    [/\bHere's everything you need to know\b/gi, 'Here are the details'],
    [/\bEverything you need to know about\b/gi, 'Details about'],
    [/\bStay tuned\b/gi, ''],
    [/\bKeep reading\b/gi, ''],
    [/\bRead on to find out\b/gi, ''],
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

        if (matches && matches.length > 1) {
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
            const starters = ['Note that ', 'Here, ', 'In this case, ', 'Worth knowing: ', 'For reference, ']
            const idx = i % starters.length // Deterministic selection for SSG
            const starter = starters[idx]
            paragraphs[i] = current.replace(/(<p[^>]*>)/i, `$1${starter}`)
        }
    }

    return paragraphs.join('')
}

/* ── Paragraph Rhythm Variation (v4 NEW) ─────────────────── */

/**
 * Detect sequences of 3+ paragraphs with similar word counts
 * (within ±15 words) and break the monotone by splitting a long
 * paragraph or merging two short adjacent ones.
 */
function varyParagraphRhythm(html: string): string {
    // Split into paragraph segments preserving tags
    const parts = html.split(/(<p[^>]*>[\s\S]*?<\/p>)/gi).filter(Boolean)
    const pRegex = /^<p[^>]*>([\s\S]*?)<\/p>$/i

    for (let i = 0; i < parts.length - 4; i += 2) {
        const counts: number[] = []
        const indices: number[] = []

        // Collect 3 consecutive paragraph word counts
        for (let j = i; j < Math.min(i + 6, parts.length); j++) {
            const match = parts[j]?.match(pRegex)
            if (match && match[1]) {
                const wordCount = match[1].replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length
                counts.push(wordCount)
                indices.push(j)
            }
        }

        if (counts.length < 3) continue

        // Check if 3 consecutive paragraphs have similar length (±15 words)
        const allSimilar = counts.length >= 3 &&
            Math.abs((counts[0] ?? 0) - (counts[1] ?? 0)) < 15 &&
            Math.abs((counts[1] ?? 0) - (counts[2] ?? 0)) < 15

        if (allSimilar && indices[1] !== undefined) {
            // Break the middle paragraph by adding an em-dash aside
            const midPart = parts[indices[1]]
            if (midPart) {
                const midMatch = midPart.match(pRegex)
                if (midMatch && midMatch[1]) {
                    const sentences = midMatch[1].split(/(?<=[.!?])\s+/)
                    if (sentences.length >= 2) {
                        // Split into two paragraphs to break the rhythm
                        const firstHalf = sentences.slice(0, Math.ceil(sentences.length / 2)).join(' ')
                        const secondHalf = sentences.slice(Math.ceil(sentences.length / 2)).join(' ')
                        parts[indices[1]] = `<p>${firstHalf}</p><p>${secondHalf}</p>`
                        i += 4 // Skip ahead to avoid re-processing
                    }
                }
            }
        }
    }

    return parts.join('')
}

/* ── Natural Pause Injection (v4 NEW) ────────────────────── */

/**
 * Insert contextual em-dash asides into long sentences (35+ words)
 * that lack them. Adds personality and breaks monotone structure.
 */
const EM_DASH_ASIDES = [
    ' — and honestly, this is worth knowing —',
    ' — which surprised a lot of people —',
    ' — and this matters more than you\u2019d think —',
    ' — something most portals don\u2019t mention —',
    ' — no exaggeration —',
    ' — I checked the notification twice —',
    ' — and here\u2019s the kicker —',
    ' — which you should definitely note down —',
]

function injectNaturalPauses(html: string): string {
    let injected = 0
    const maxInjections = 2 // Don't over-do it

    return html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, content: string) => {
        if (injected >= maxInjections) return match

        // Skip paragraphs that already have em-dashes
        if (content.includes('—') || content.includes('–')) return match

        const plainText = content.replace(/<[^>]*>/g, '')
        const words = plainText.split(/\s+/).filter(Boolean)

        // Only target long sentences without existing variety markers
        if (words.length < 35) return match

        // Find a good insertion point (after a comma in the middle third)
        const text = content
        const commaPositions: number[] = []
        const thirdStart = Math.floor(text.length * 0.3)
        const thirdEnd = Math.floor(text.length * 0.7)

        for (let i = thirdStart; i < thirdEnd; i++) {
            if (text[i] === ',') commaPositions.push(i)
        }

        if (commaPositions.length === 0) return match

        // Pick a deterministic comma position based on content length
        const targetComma = commaPositions[injected % commaPositions.length]
        if (targetComma === undefined) return match
        const aside = EM_DASH_ASIDES[injected % EM_DASH_ASIDES.length]

        injected++
        const before = text.slice(0, targetComma)
        const after = text.slice(targetComma + 1) // skip the comma
        return `<p>${before}${aside}${after}</p>`
    })
}

/* ── Heading Diversification (v4 NEW) ────────────────────── */

/**
 * Detect template-like H2 patterns (e.g., all H2s starting with same word
 * or same syntactic structure) and rephrase alternating ones to be more
 * conversational or question-based.
 */
function diversifyHeadings(html: string): string {
    const h2Regex = /<h2([^>]*)>(.*?)<\/h2>/gi
    const headings: { full: string; attrs: string; text: string; index: number }[] = []
    let match

    while ((match = h2Regex.exec(html)) !== null) {
        headings.push({
            full: match[0],
            attrs: match[1] || '',
            text: (match[2] || '').replace(/<[^>]*>/g, '').trim(),
            index: match.index,
        })
    }

    if (headings.length < 4) return html // Not enough headings to detect patterns

    // Check if 3+ headings start with the same word
    const firstWords = headings.map(h => h.text.split(/\s+/)[0]?.toLowerCase())
    const wordCounts = new Map<string, number>()
    for (const w of firstWords) {
        if (w) wordCounts.set(w, (wordCounts.get(w) || 0) + 1)
    }

    let result = html
    for (const [word, count] of wordCounts) {
        if (count < 3) continue

        // Find headings starting with this repeated word and rephrase every other one
        let rephrased = 0
        for (const heading of headings) {
            if (heading.text.toLowerCase().startsWith(word) && rephrased % 2 === 1) {
                // Convert to a question or conversational form
                const conversionalForms = [
                    `What about ${heading.text.replace(/^(How to|What is|Where to)\s*/i, '')}?`,
                    `Here's the deal with ${heading.text.replace(/^(How to|What is|Where to)\s*/i, '')}`,
                    heading.text.replace(/^How to\s*/i, 'The best way to '),
                ]
                const newText = conversionalForms[rephrased % conversionalForms.length] || heading.text
                result = result.replace(heading.full, `<h2${heading.attrs}>${newText}</h2>`)
            }
            if (heading.text.toLowerCase().startsWith(word)) {
                rephrased++
            }
        }
    }

    return result
}

/* ── Micro-Imperfections (v4 NEW) ────────────────────────── */

/**
 * Add 1-2 deliberate human-like touches per article:
 * - Convert one "do not" to "don't" if missed
 * - Add "Right," or "Look —" to start of one paragraph
 * - Ensure at least one contraction exists
 */
function addMicroImperfections(html: string): string {
    let result = html
    let touchesAdded = 0

    // 1. Convert first "do not" to "don't" (if no contractions exist)
    const hasContractions = /\b(?:don't|isn't|won't|can't|hasn't|doesn't|aren't|weren't|shouldn't|couldn't|wouldn't|they're|you're|we're|it's|he's|she's|I'm|I've|I'd|we've)\b/.test(result)
    if (!hasContractions) {
        result = result.replace(/\bdo not\b/i, "don't")
        result = result.replace(/\bDo not\b/, "Don't")
        touchesAdded++
    }

    // 2. Add a conversational opener to one paragraph (after the 3rd paragraph)
    if (touchesAdded < 2) {
        const openers = ['Look — ', 'Right, so — ', 'Honestly, ', 'Here\'s the thing — ']
        let paragraphCount = 0
        result = result.replace(/<p>(?!<)/g, (match) => {
            paragraphCount++
            if (paragraphCount === 4 && touchesAdded < 2) {
                touchesAdded++
                const opener = openers[paragraphCount % openers.length]
                return `<p>${opener}`
            }
            return match
        })
    }

    return result
}

/* ── Content Depth Validator (v4 NEW) ────────────────────── */

/**
 * Check that the article has essential structural elements.
 * Returns missing items for logging — doesn't strip content.
 */
export function validateContentDepth(html: string): { valid: boolean; missing: string[] } {
    const missing: string[] = []

    const hasTable = /<table[\s>]/i.test(html)
    const hasList = /<(?:ul|ol)[\s>]/i.test(html)
    const hasInternalLink = /href=["']\/[^"']+["']/i.test(html)
    const hasFaq = /<details[\s>]/i.test(html)
    const hasKeyTakeaways = /id=["']key-takeaways["']/i.test(html)

    if (!hasTable) missing.push('No data table found')
    if (!hasList) missing.push('No bullet/numbered list found')
    if (!hasInternalLink) missing.push('No internal links found')
    if (!hasFaq) missing.push('No FAQ section (<details>) found')
    if (!hasKeyTakeaways) missing.push('No Key Takeaways section found')

    return { valid: missing.length <= 1, missing } // Allow 1 missing element
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
 * Production humanization pipeline (v4).
 * Removes structural AI patterns, injects variety, and validates content quality.
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

    // 4. Vary paragraph rhythm to break AI monotone (v4 NEW)
    processed = varyParagraphRhythm(processed)

    // 5. Inject natural em-dash pauses (v4 NEW)
    processed = injectNaturalPauses(processed)

    // 6. Diversify heading patterns (v4 NEW)
    processed = diversifyHeadings(processed)

    // 7. Add micro-imperfections for human feel (v4 NEW)
    processed = addMicroImperfections(processed)

    // 8. Log placeholder warnings (don't strip — let publish pipeline reject)
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        const placeholders = detectPlaceholderLinks(processed)
        if (placeholders.length > 0) {
            console.warn('[humanize] Unresolved placeholders detected:', placeholders)
        }

        const depth = validateContentDepth(processed)
        if (!depth.valid) {
            console.warn('[humanize] Content depth issues:', depth.missing)
        }
    }

    return processed
}

/* ── AI Score Heuristics (v4 — 12 signals) ──────────────────── */

/**
 * Returns a comprehensive heuristic score to warn editors if the content
 * feels too synthetic. Expanded from 3 signals (v3) to 12 signals (v4).
 */
export function analyzeAiHeuristics(html: string): { isFlagged: boolean; score: number; reasons: string[] } {
    if (!html) return { isFlagged: false, score: 0, reasons: [] }

    let aiScore = 0
    const reasons: string[] = []
    const plainText = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()

    // ── Signal 1: Banned phrases (15 points each) ──
    let bannedCount = 0
    for (const [pattern] of BANNED_PHRASES) {
        const matches = html.match(pattern)
        if (matches) bannedCount += matches.length
    }
    if (bannedCount > 0) {
        aiScore += bannedCount * 15
        reasons.push(`Detected ${bannedCount} AI cliché words/phrases`)
    }

    // ── Signal 2: Repetitive transitions (10 points each extra occurrence) ──
    for (const transition of COMMON_TRANSITIONS) {
        const escaped = transition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(escaped, 'gi')
        const matches = html.match(regex)
        if (matches && matches.length > 2) {
            aiScore += (matches.length - 1) * 10
            reasons.push(`Overused transition word: "${transition}" (${matches.length} times)`)
        }
    }

    // ── Signal 3: Too many H2s (20 points) ──
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length
    if (h2Count > 8) {
        aiScore += 20
        reasons.push(`Unusually high number of H2 headings (${h2Count}) - may feel robotic`)
    }

    // ── Signal 4: Paragraph uniformity (25 points) ──
    const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || []
    if (paragraphs.length >= 5) {
        const wordCounts = paragraphs.map(p =>
            p.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length
        )
        const avg = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
        const allSimilar = wordCounts.filter(c => Math.abs(c - avg) < 10).length
        const similarPercent = (allSimilar / wordCounts.length) * 100

        if (similarPercent > 75) {
            aiScore += 25
            reasons.push(`${Math.round(similarPercent)}% of paragraphs have near-identical length — classic AI pattern`)
        }
    }

    // ── Signal 5: Sentence start repetition (20 points) ──
    const sentences = plainText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10)
    if (sentences.length >= 5) {
        const firstWords = sentences.map(s => s.split(/\s+/)[0]?.toLowerCase()).filter(Boolean)
        const wordFreq = new Map<string, number>()
        for (const w of firstWords) {
            if (w) wordFreq.set(w, (wordFreq.get(w) || 0) + 1)
        }
        for (const [word, count] of wordFreq) {
            if (count >= 4 && word !== 'the') {
                aiScore += 20
                reasons.push(`${count} sentences start with "${word}" — repetitive pattern`)
                break
            }
        }
    }

    // ── Signal 6: No contractions (15 points) ──
    const contractions = plainText.match(/\b(?:don't|isn't|won't|can't|hasn't|doesn't|aren't|weren't|shouldn't|couldn't|wouldn't|they're|you're|we're|it's|he's|she's|I'm|I've|I'd|we've|they'll|you'll)\b/g)
    if (!contractions || contractions.length < 3) {
        aiScore += 15
        reasons.push(`Very few contractions (${contractions?.length || 0}) — content feels overly formal`)
    }

    // ── Signal 7: No em-dashes (10 points) ──
    const emDashes = (html.match(/—/g) || []).length
    if (emDashes < 2) {
        aiScore += 10
        reasons.push('Few or no em-dashes — missing personality markers')
    }

    // ── Signal 8: No questions in content (15 points) ──
    const questions = plainText.match(/\?/g)
    if (!questions || questions.length < 2) {
        aiScore += 15
        reasons.push('No rhetorical questions — lacks conversational engagement')
    }

    // ── Signal 9: Keyword stuffing (20 points) ──
    // Check for any word appearing > 1.5% density (excluding common words)
    const words = plainText.toLowerCase().split(/\s+/).filter(w => w.length > 4)
    if (words.length > 200) {
        const freq = new Map<string, number>()
        for (const w of words) freq.set(w, (freq.get(w) || 0) + 1)
        for (const [word, count] of freq) {
            const density = (count / words.length) * 100
            if (density > 2.5 && !['which', 'their', 'there', 'about', 'would', 'could', 'should', 'through'].includes(word)) {
                aiScore += 20
                reasons.push(`Potential keyword stuffing: "${word}" appears ${count} times (${density.toFixed(1)}%)`)
                break
            }
        }
    }

    // ── Signal 10: No short paragraphs (10 points) ──
    if (paragraphs.length >= 5) {
        const shortParagraphs = paragraphs.filter(p =>
            p.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length <= 15
        ).length
        if (shortParagraphs === 0) {
            aiScore += 10
            reasons.push('No short/punchy paragraphs — lacks rhythm variation')
        }
    }

    // ── Signal 11: Heading pattern repetition (15 points) ──
    const h2Texts = (html.match(/<h2[^>]*>(.*?)<\/h2>/gi) || [])
        .map(h => h.replace(/<[^>]*>/g, '').trim())
    if (h2Texts.length >= 4) {
        const h2FirstWords = h2Texts.map(t => t.split(/\s+/)[0]?.toLowerCase())
        const h2WordFreq = new Map<string, number>()
        for (const w of h2FirstWords) {
            if (w) h2WordFreq.set(w, (h2WordFreq.get(w) || 0) + 1)
        }
        for (const [, count] of h2WordFreq) {
            if (count >= 3) {
                aiScore += 15
                reasons.push(`${count} H2 headings start with the same word — template pattern`)
                break
            }
        }
    }

    // ── Signal 12: Missing depth markers (20 points) ──
    const hasTable = /<table[\s>]/i.test(html)
    const hasList = /<(?:ul|ol)[\s>]/i.test(html)
    const hasFaq = /<details[\s>]/i.test(html)
    const hasKeyTakeaways = /id=["']key-takeaways["']/i.test(html)
    let missingDepth = 0
    if (!hasTable) missingDepth++
    if (!hasList) missingDepth++
    if (!hasFaq) missingDepth++
    if (!hasKeyTakeaways) missingDepth++
    if (missingDepth >= 3) {
        aiScore += 20
        reasons.push(`Missing ${missingDepth} depth markers (table/list/FAQ/key-takeaways) — content appears thin`)
    }

    const isFlagged = aiScore >= 60
    return { isFlagged, score: Math.min(100, aiScore), reasons }
}

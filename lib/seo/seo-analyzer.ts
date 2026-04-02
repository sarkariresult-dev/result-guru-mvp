/**
 * SEO Analysis Engine - Result Guru
 *
 * Comprehensive SEO analysis for post content.
 * Returns scored, prioritized, actionable recommendations.
 * Pure functions - safe for both server and client.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type SeoCheckPriority = 'critical' | 'important' | 'nice'
export type SeoCheckStatus = 'pass' | 'fail' | 'warn'

export interface SeoCheck {
    id: string
    label: string
    status: SeoCheckStatus
    priority: SeoCheckPriority
    value?: string | number
    recommendation?: string
}

export interface SeoAnalysisInput {
    title: string
    slug: string
    metaTitle: string
    metaDescription: string
    focusKeyword: string
    secondaryKeywords: string[]
    content: string
    excerpt: string
    featuredImage: string
    featuredImageAlt: string
    faqCount: number
    postType: string
}

export interface SeoAnalysisResult {
    checks: SeoCheck[]
    score: number
    summary: { critical: number; important: number; nice: number; total: number; passed: number }
    readability: ReadabilityResult
}

export interface ReadabilityResult {
    avgSentenceLength: number
    longSentences: number
    totalSentences: number
    avgParagraphLength: number
    passiveVoicePercent: number
    grade: string
    score: number // 0-100
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function countWords(text: string): number {
    return text.split(/\s+/).filter(Boolean).length
}

function countOccurrences(text: string, keyword: string): number {
    if (!keyword) return 0
    const kw = keyword.toLowerCase()
    const t = text.toLowerCase()
    let count = 0
    let pos = 0
    while ((pos = t.indexOf(kw, pos)) !== -1) {
        count++
        pos += kw.length
    }
    return count
}

function extractSentences(text: string): string[] {
    return text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 5) // ignore tiny fragments
}

function extractHeadings(html: string): { level: number; text: string }[] {
    const headings: { level: number; text: string }[] = []
    const regex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi
    let match
    while ((match = regex.exec(html)) !== null) {
        headings.push({ level: parseInt(match[1]!), text: stripHtml(match[2]!) })
    }
    return headings
}

function countInternalLinks(html: string): number {
    const regex = /href=["']\//g
    return (html.match(regex) || []).length
}

// Passive voice detection (simplified English + common patterns)
const PASSIVE_PATTERNS = [
    /\b(?:is|are|was|were|been|being|be)\s+(?:\w+ed|given|done|made|taken|found|seen|known|shown|held|kept|left|lost|met|paid|put|run|said|set|told)\b/gi,
]

function detectPassiveVoice(text: string): number {
    let count = 0
    for (const pattern of PASSIVE_PATTERNS) {
        pattern.lastIndex = 0
        const matches = text.match(pattern)
        if (matches) count += matches.length
    }
    return count
}

// ── Readability Analysis ─────────────────────────────────────────────────────

export function analyzeReadability(html: string): ReadabilityResult {
    const text = stripHtml(html)
    const sentences = extractSentences(text)
    const totalSentences = sentences.length
    const wordCount = countWords(text)

    if (totalSentences === 0) {
        return { avgSentenceLength: 0, longSentences: 0, totalSentences: 0, avgParagraphLength: 0, passiveVoicePercent: 0, grade: 'N/A', score: 0 }
    }

    const avgSentenceLength = Math.round(wordCount / totalSentences)
    const longSentences = sentences.filter(s => countWords(s) > 25).length

    // Paragraph analysis
    const paragraphs = html.split(/<\/p>/i).filter(p => stripHtml(p).length > 10)
    const avgParagraphLength = paragraphs.length > 0
        ? Math.round(paragraphs.reduce((sum, p) => sum + countWords(stripHtml(p)), 0) / paragraphs.length)
        : 0

    // Passive voice
    const passiveCount = detectPassiveVoice(text)
    const passiveVoicePercent = totalSentences > 0 ? Math.round((passiveCount / totalSentences) * 100) : 0

    // Score calculation (higher is better)
    let score = 100
    if (avgSentenceLength > 20) score -= Math.min(25, (avgSentenceLength - 20) * 3)
    if (avgSentenceLength < 8) score -= 10
    if (passiveVoicePercent > 15) score -= Math.min(20, (passiveVoicePercent - 15) * 2)
    if (avgParagraphLength > 150) score -= Math.min(15, Math.round((avgParagraphLength - 150) / 10))
    const longSentencePercent = (longSentences / totalSentences) * 100
    if (longSentencePercent > 25) score -= Math.min(20, Math.round(longSentencePercent - 25))
    score = Math.max(0, Math.min(100, score))

    // Grade
    let grade: string
    if (score >= 80) grade = 'Easy to read'
    else if (score >= 60) grade = 'Fairly readable'
    else if (score >= 40) grade = 'Needs improvement'
    else grade = 'Difficult to read'

    return { avgSentenceLength, longSentences, totalSentences, avgParagraphLength, passiveVoicePercent, grade, score }
}

// ── Main SEO Analysis ────────────────────────────────────────────────────────

export function runSeoAnalysis(input: SeoAnalysisInput): SeoAnalysisResult {
    const { title, slug, metaTitle, metaDescription, focusKeyword, secondaryKeywords, content, excerpt, featuredImage, featuredImageAlt, faqCount } = input

    const plainContent = stripHtml(content)
    const wordCount = countWords(plainContent)
    const contentLower = plainContent.toLowerCase()
    const fk = focusKeyword.toLowerCase().trim()
    const hasFk = fk.length > 0
    const headings = extractHeadings(content)
    const internalLinks = countInternalLinks(content)
    const sk = secondaryKeywords.filter(k => k.trim().length > 0)

    // Keyword density
    const fkCount = hasFk ? countOccurrences(contentLower, fk) : 0
    const fkDensity = wordCount > 0 && hasFk ? (fkCount / wordCount) * 100 : 0

    // First 100 words
    const first100Words = plainContent.split(/\s+/).slice(0, 100).join(' ').toLowerCase()

    // Heading checks
    const h2Count = headings.filter(h => h.level === 2).length
    const h3Count = headings.filter(h => h.level === 3).length
    const fkInHeading = hasFk && headings.some(h => h.text.toLowerCase().includes(fk))

    // Secondary keywords in content
    const skInContent = sk.filter(k => contentLower.includes(k.toLowerCase())).length

    const checks: SeoCheck[] = [
        // ═══ CRITICAL ═══
        {
            id: 'title-length',
            label: 'Title length (30-65 chars)',
            status: title.length >= 30 && title.length <= 65 ? 'pass' : title.length > 0 && title.length < 30 ? 'warn' : title.length > 65 ? 'warn' : 'fail',
            priority: 'critical',
            value: `${title.length} chars`,
            recommendation: title.length < 30 ? 'Title is too short. Add more detail.' : title.length > 65 ? 'Title may get truncated in search results. Trim to 65 chars.' : undefined,
        },
        {
            id: 'meta-title',
            label: 'Meta title set & ≤60 chars',
            status: metaTitle.length > 0 && metaTitle.length <= 60 ? 'pass' : metaTitle.length > 60 ? 'warn' : 'fail',
            priority: 'critical',
            value: metaTitle.length > 0 ? `${metaTitle.length}/60` : 'Missing',
            recommendation: metaTitle.length === 0 ? 'Add a meta title for search results.' : metaTitle.length > 60 ? 'Meta title will get truncated. Shorten to 60 chars.' : undefined,
        },
        {
            id: 'meta-desc',
            label: 'Meta description 120-155 chars',
            status: metaDescription.length >= 120 && metaDescription.length <= 155 ? 'pass' : metaDescription.length > 0 && metaDescription.length < 120 ? 'warn' : metaDescription.length > 155 ? 'warn' : 'fail',
            priority: 'critical',
            value: metaDescription.length > 0 ? `${metaDescription.length}/155` : 'Missing',
            recommendation: metaDescription.length === 0 ? 'Add a compelling meta description.' : metaDescription.length < 120 ? 'Too short - Google may replace it with auto-generated text.' : metaDescription.length > 155 ? 'May be truncated in search snippets.' : undefined,
        },
        {
            id: 'focus-keyword',
            label: 'Focus keyword set',
            status: hasFk ? 'pass' : 'fail',
            priority: 'critical',
            recommendation: !hasFk ? 'Set a primary keyword you want to rank for.' : undefined,
        },
        {
            id: 'fk-in-title',
            label: 'Keyword in title (first 60 chars)',
            status: hasFk && title.slice(0, 60).toLowerCase().includes(fk) ? 'pass' : !hasFk ? 'warn' : 'fail',
            priority: 'critical',
            recommendation: hasFk && !title.slice(0, 60).toLowerCase().includes(fk) ? `Add "${focusKeyword}" to the first 60 characters of the title.` : undefined,
        },
        {
            id: 'content-depth',
            label: 'Content has 500+ words',
            status: wordCount >= 500 ? 'pass' : wordCount >= 300 ? 'warn' : 'fail',
            priority: 'critical',
            value: `${wordCount} words`,
            recommendation: wordCount < 300 ? 'Thin content - Google penalizes pages under 300 words.' : wordCount < 500 ? 'Add more depth. Aim for 1000+ words for ranking power.' : undefined,
        },
        {
            id: 'featured-image',
            label: 'Featured image set (Discover requirement)',
            status: featuredImage.length > 0 ? 'pass' : 'fail',
            priority: 'critical',
            recommendation: !featuredImage ? 'Add a featured image ≥1200px wide for Google Discover eligibility.' : undefined,
        },

        // ═══ IMPORTANT ═══
        {
            id: 'fk-in-meta-desc',
            label: 'Keyword in meta description',
            status: hasFk && metaDescription.toLowerCase().includes(fk) ? 'pass' : !hasFk ? 'warn' : 'fail',
            priority: 'important',
            recommendation: hasFk && !metaDescription.toLowerCase().includes(fk) ? 'Include the focus keyword naturally in the meta description.' : undefined,
        },
        {
            id: 'fk-in-slug',
            label: 'Keyword in URL slug',
            status: hasFk && slug.includes(fk.replace(/\s+/g, '-')) ? 'pass' : !hasFk ? 'warn' : 'fail',
            priority: 'important',
        },
        {
            id: 'fk-in-first-100',
            label: 'Keyword in first 100 words',
            status: hasFk && first100Words.includes(fk) ? 'pass' : !hasFk ? 'warn' : 'fail',
            priority: 'important',
            recommendation: hasFk && !first100Words.includes(fk) ? 'Mention the focus keyword in the opening paragraph.' : undefined,
        },
        {
            id: 'fk-in-heading',
            label: 'Keyword in at least one heading',
            status: fkInHeading ? 'pass' : !hasFk ? 'warn' : 'fail',
            priority: 'important',
            recommendation: hasFk && !fkInHeading ? 'Include the focus keyword in at least one H2 or H3.' : undefined,
        },
        {
            id: 'fk-density',
            label: 'Keyword density 0.5-2.5%',
            status: hasFk && fkDensity >= 0.5 && fkDensity <= 2.5 ? 'pass' : hasFk && fkDensity > 2.5 ? 'warn' : !hasFk ? 'warn' : 'fail',
            priority: 'important',
            value: hasFk ? `${fkDensity.toFixed(1)}%` : 'N/A',
            recommendation: fkDensity > 2.5 ? 'Keyword stuffing detected - reduce usage for natural reading.' : fkDensity < 0.5 && hasFk ? 'Keyword appears too few times. Use it 3-5 more times naturally.' : undefined,
        },
        {
            id: 'secondary-keywords',
            label: 'Secondary keywords set (≥2)',
            status: sk.length >= 2 ? 'pass' : sk.length === 1 ? 'warn' : 'fail',
            priority: 'important',
            value: `${sk.length} set`,
            recommendation: sk.length < 2 ? 'Add at least 2 secondary keywords for long-tail ranking.' : undefined,
        },
        {
            id: 'sk-in-content',
            label: 'Secondary keywords used in content',
            status: sk.length > 0 && skInContent >= Math.ceil(sk.length * 0.5) ? 'pass' : sk.length > 0 ? 'warn' : 'fail',
            priority: 'important',
            value: sk.length > 0 ? `${skInContent}/${sk.length}` : 'N/A',
        },
        {
            id: 'excerpt-set',
            label: 'Excerpt set (listing & rich snippets)',
            status: excerpt.length >= 50 ? 'pass' : excerpt.length > 0 ? 'warn' : 'fail',
            priority: 'important',
            value: `${excerpt.length} chars`,
        },
        {
            id: 'heading-structure',
            label: 'H2 headings used (content structure)',
            status: h2Count >= 2 ? 'pass' : h2Count === 1 ? 'warn' : 'fail',
            priority: 'important',
            value: `${h2Count} H2, ${h3Count} H3`,
            recommendation: h2Count < 2 ? 'Use H2 headings every ~200 words to improve scannability.' : undefined,
        },
        {
            id: 'image-alt',
            label: 'Featured image alt text set',
            status: featuredImageAlt.length > 0 ? 'pass' : featuredImage.length > 0 ? 'warn' : 'pass',
            priority: 'important',
            recommendation: featuredImage && !featuredImageAlt ? 'Add descriptive alt text for accessibility and image SEO.' : undefined,
        },
        {
            id: 'internal-links',
            label: 'Internal links in content (≥2)',
            status: internalLinks >= 2 ? 'pass' : internalLinks === 1 ? 'warn' : 'fail',
            priority: 'important',
            value: `${internalLinks} links`,
            recommendation: internalLinks < 2 ? 'Add 2-3 internal links to related content (e.g., /syllabus, /admit-card).' : undefined,
        },

        // ═══ NICE TO HAVE ═══
        {
            id: 'slug-length',
            label: 'URL slug is short (≤60 chars)',
            status: slug.length > 0 && slug.length <= 60 ? 'pass' : slug.length > 60 ? 'warn' : 'fail',
            priority: 'nice',
            value: `${slug.length} chars`,
        },
        {
            id: 'no-stop-words',
            label: 'No stop words in slug',
            status: !/(^|-)(the|and|is|in|to|for|of|a|an)(-|$)/.test(slug) ? 'pass' : 'warn',
            priority: 'nice',
        },
        {
            id: 'pillar-content',
            label: 'Pillar content (1000+ words)',
            status: wordCount >= 1000 ? 'pass' : wordCount >= 500 ? 'warn' : 'fail',
            priority: 'nice',
            value: `${wordCount} words`,
        },
        {
            id: 'year-freshness',
            label: 'Year in title (freshness signal)',
            status: /202[4-9]/.test(title) ? 'pass' : 'warn',
            priority: 'nice',
            recommendation: !/202[4-9]/.test(title) ? 'Include the current year (2026) in the title for freshness.' : undefined,
        },
        {
            id: 'h3-nesting',
            label: 'H3 sub-headings used (deep structure)',
            status: h3Count >= 2 ? 'pass' : h3Count === 1 ? 'warn' : h2Count > 0 ? 'fail' : 'warn',
            priority: 'nice',
            recommendation: h3Count < 2 && h2Count > 0 ? 'Add H3 sub-headings under H2 sections for deeper topic coverage.' : undefined,
        },
        {
            id: 'faq-present',
            label: 'FAQ section added (FAQ schema)',
            status: faqCount >= 3 ? 'pass' : faqCount > 0 ? 'warn' : 'fail',
            priority: 'nice',
            value: `${faqCount} items`,
            recommendation: faqCount < 3 ? 'Add at least 5 FAQs for FAQ rich snippet eligibility.' : undefined,
        },
    ]

    // Score calculation
    const weights: Record<SeoCheckPriority, number> = { critical: 3, important: 2, nice: 1 }

    let totalWeight = 0
    let earnedWeight = 0

    for (const check of checks) {
        const w = weights[check.priority]
        totalWeight += w
        if (check.status === 'pass') earnedWeight += w
        else if (check.status === 'warn') earnedWeight += w * 0.5
    }

    const score = Math.round((earnedWeight / totalWeight) * 100)

    const critical = checks.filter(c => c.priority === 'critical' && c.status === 'fail').length
    const important = checks.filter(c => c.priority === 'important' && c.status === 'fail').length
    const nice = checks.filter(c => c.priority === 'nice' && c.status === 'fail').length
    const passed = checks.filter(c => c.status === 'pass').length

    return {
        checks,
        score,
        summary: { critical, important, nice, total: checks.length, passed },
        readability: analyzeReadability(content),
    }
}

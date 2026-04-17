/**
 * SEO Analysis Engine - Result Guru
 *
 * Comprehensive SEO analysis for post content.
 * Returns scored, prioritized, actionable recommendations.
 * Pure functions - safe for both server and client.
 */

/**
 * Helper to get the semantic label for the primary action button on the public page
 */
export function getActionLinkPageLabel(postType: string): string {
    switch (postType) {
        case 'job': return 'Apply Online'
        case 'result': return 'Check Result'
        case 'admit': return 'Download Admit Card'
        case 'answer_key': return 'Download Answer Key'
        case 'syllabus': return 'Download Syllabus'
        case 'previous_paper': return 'Download Paper'
        case 'admission': return 'Admission / Apply'
        case 'scholarship': return 'Apply Online'
        case 'scheme': return 'View Scheme'
        case 'exam':
        case 'exam_pattern': return 'Official Exam Info'
        case 'notification': return 'Official Link'
        case 'cut_off': return 'Check Cut-off'
        default: return 'Primary Link'
    }
}

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
    authorId?: string
    // Guru SEO 2.0 Contextual Fields
    orgName?: string | null
    orgShortName?: string | null
    stateName?: string | null
    updatedAt?: string | null
    admitCardLink?: string | null
    resultLink?: string | null
    answerKeyLink?: string | null
    primaryLink?: string | null
    notificationPdf?: string | null
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

// ── Registries (Guru SEO 2.0) ────────────────────────────────────────────────

const MUST_HAVE_HEADINGS: Record<string, string[]> = {
    job: ['eligibility', 'vacancy', 'salary', 'date', 'fee', 'how to apply', 'important link'],
    result: ['how to check', 'date', 'cut off', 'merit list', 'direct link'],
    admit: ['how to download', 'exam date', 'center', 'instruction', 'direct link'],
    syllabus: ['subject', 'exam pattern', 'topic', 'marking scheme', 'download pdf'],
    scheme: ['objective', 'benefit', 'eligibility', 'document', 'how to apply'],
    scholarship: ['eligibility', 'amount', 'document', 'date', 'how to apply'],
    answer_key: ['objection', 'how to download', 'date', 'direct link'],
    cut_off: ['category', 'previous year', 'expected', 'official'],
    exam_pattern: ['marking', 'duration', 'subject', 'negative marking'],
    previous_paper: ['download pdf', 'year', 'solution', 'exam name'],
    exam: ['date', 'shift', 'analysis', 'review'],
    admission: ['eligibility', 'course', 'college', 'counseling', 'last date'],
    notification: ['official pdf', 'summary', 'important date', 'short info'],
}

const BOARD_ENTITIES = [
    'SSC', 'UPSC', 'IBPS', 'RRB', 'NTA', 'CBSE', 'ICSE', 'UPPSC', 'BPSC', 'MPPSC',
    'HSSC', 'UKSSSC', 'DSSSB', 'KVS', 'NVS', 'DRDO', 'ISRO', 'BARC', 'NPCIL',
    'HAL', 'BEL', 'GAIL', 'SAIL', 'IOCL', 'ONGC', 'SBI', 'RBI', 'LIC', 'NIACL'
]

const INTENT_VERBS: Record<string, string[]> = {
    transactional: ['download', 'apply', 'check', 'link', 'register', 'login'],
    informational: ['guide', 'syllabus', 'pattern', 'detail', 'information', 'about'],
}

// ── Advanced Analysis Helpers (Guru SEO 2.0) ─────────────────────────────────

export const TRANSACTIONAL_TYPES = ['job', 'result', 'admit', 'answer_key', 'scholarship', 'admission', 'previous_paper']

function detectSearchIntent(title: string, postType: string): { intent: string; score: number } {
    const t = title.toLowerCase()
    const expectedIntent = TRANSACTIONAL_TYPES.includes(postType) ? 'transactional' : 'informational'

    const verbs = INTENT_VERBS[expectedIntent] || []
    const matchCount = verbs.filter(v => t.includes(v)).length
    const score = matchCount > 0 ? 100 : 0

    return { intent: expectedIntent, score }
}

function detectEntities(html: string, input: Partial<SeoAnalysisInput>): string[] {
    const text = stripHtml(html)
    const entities = new Set<string>()

    // Check against Board Registry
    BOARD_ENTITIES.forEach(e => {
        if (text.includes(e)) entities.add(e)
    })

    // Add provided Org Entities
    if (input.orgName) entities.add(input.orgName)
    if (input.orgShortName) entities.add(input.orgShortName)
    if (input.stateName) entities.add(input.stateName)

    // Detect Capitalized Acronyms (3-5 letters)
    const acronymMatches = text.match(/\b[A-Z]{3,5}\b/g)
    if (acronymMatches) acronymMatches.forEach(a => entities.add(a))

    return Array.from(entities)
}

function calculateTopicCoverage(html: string, postType: string): { score: number; missing: string[] } {
    const headings = extractHeadings(html).map(h => h.text.toLowerCase())
    const required = MUST_HAVE_HEADINGS[postType] || []

    if (required.length === 0) return { score: 100, missing: [] }

    const missing = required.filter(req => !headings.some(h => h.includes(req)))
    const score = Math.round(((required.length - missing.length) / required.length) * 100)

    return { score, missing }
}

function assessScannability(html: string): { score: number; issues: string[] } {
    const paragraphs = html.split(/<\/p>/i).filter(p => stripHtml(p).length > 20)
    const longParagraphs = paragraphs.filter(p => countWords(stripHtml(p)) > 50).length
    const boldCount = (html.match(/<strong[^>]*>|<b>/gi) || []).length
    const listCount = (html.match(/<li[^>]*>/gi) || []).length
    const tableCount = (html.match(/<table[^>]*>/gi) || []).length

    const issues: string[] = []
    let score = 100

    if (longParagraphs > 0) {
        score -= 20
        issues.push(`${longParagraphs} paragraphs are too long (>50 words).`)
    }
    if (boldCount < 3) {
        score -= 10
        issues.push('Use more bold text to highlight key info.')
    }
    if (listCount < 5) {
        score -= 10
        issues.push('Use bullet points for better scannability.')
    }
    if (tableCount === 0) {
        score -= 10
        issues.push('No tables found. Tables improve structural authority.')
    }

    return { score: Math.max(0, score), issues }
}

function checkSchemaHealth(input: SeoAnalysisInput): { status: SeoCheckStatus; issues: string[] } {
    const issues: string[] = []

    // Critical fields check for specific types
    if (input.postType === 'job' && !input.orgName) {
        issues.push('Missing Organization Name (required for Google Job Card).')
    }

    // Direct Action Link validation
    if (!input.primaryLink) {
        if (input.postType === 'result') issues.push('Result Link is missing. Users expect a direct path.')
        else if (input.postType === 'admit') issues.push('Admit Card Link is missing.')
        else if (input.postType === 'answer_key') issues.push('Answer Key Link is missing.')
        else if (['job', 'scholarship', 'admission'].includes(input.postType)) issues.push('Primary Action Link (Apply Link) is missing.')
    }

    // Check for FAQ richness
    if (input.faqCount < 3) {
        issues.push('Fewer than 3 FAQs. Aim for 5+ to trigger rich snippets.')
    }

    return {
        status: issues.length > 0 ? 'warn' : 'pass',
        issues
    }
}

function checkFreshness(input: SeoAnalysisInput): { status: SeoCheckStatus; recommendation?: string } {
    const currentYear = '2026'
    const titleHasYear = input.title.includes(currentYear)

    if (!titleHasYear) {
        return { status: 'warn', recommendation: `Include the current year (${currentYear}) in the title for freshness signals.` }
    }

    return { status: 'pass' }
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

function extractExternalLinks(html: string): string[] {
    const regex = /href=["'](https?:\/\/[^"']+)["']/gi
    const links: string[] = []
    let match
    while ((match = regex.exec(html)) !== null) {
        if (match[1]) links.push(match[1])
    }
    return links
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
    const { 
        title, focusKeyword, 
        secondaryKeywords, content, postType,
        metaDescription,
        authorId
    } = input

    const plainContent = stripHtml(content)
    const wordCount = countWords(plainContent)
    const contentLower = plainContent.toLowerCase()
    const fk = focusKeyword.toLowerCase().trim()
    const hasFk = fk.length > 0
    const internalLinks = countInternalLinks(content)
    const externalLinks = extractExternalLinks(content)
    const sk = secondaryKeywords.filter(k => k.trim().length > 0)
    void sk // Acknowledge secondary keywords for future use

    // Advanced Analysis Modules (Guru SEO 2.0)
    const intentAnalysis = detectSearchIntent(title, postType)
    const entities = detectEntities(content, input)
    const topicCoverage = calculateTopicCoverage(content, postType)
    const scannability = assessScannability(content)
    const schemaHealth = checkSchemaHealth(input)
    const freshness = checkFreshness(input)

    // Technical Metrics
    const metadataLinks = [input.primaryLink, input.notificationPdf].filter(Boolean).length
    const govLinks = externalLinks.filter(l => /\.(gov|nic|edu|org)/.test(l)).length + (metadataLinks * 2) // Metadata links are high-trust
    const fkCount = hasFk ? countOccurrences(contentLower, fk) : 0
    const fkDensity = wordCount > 0 && hasFk ? (fkCount / wordCount) * 100 : 0
    const first100Words = plainContent.split(/\s+/).slice(0, 100).join(' ').toLowerCase()
    const hasDirectAnswer = hasFk && first100Words.includes(fk) && first100Words.length > 50

    const checks: SeoCheck[] = [
        // ═══ CRITICAL ═══
        {
            id: 'search-intent',
            label: 'Search intent match',
            status: intentAnalysis.score > 0 ? 'pass' : 'fail',
            priority: 'critical',
            recommendation: intentAnalysis.score === 0 ? `Target ${intentAnalysis.intent} intent more clearly in your title using verbs like ${INTENT_VERBS[intentAnalysis.intent]?.join(', ')}.` : undefined,
        },
        {
            id: 'topic-coverage',
            label: 'Topical coverage (Category Authority)',
            status: topicCoverage.score >= 80 ? 'pass' : topicCoverage.score >= 50 ? 'warn' : 'fail',
            priority: 'critical',
            value: `${topicCoverage.score}%`,
            recommendation: (topicCoverage.missing.length > 0 || (metadataLinks === 0 && TRANSACTIONAL_TYPES.includes(postType))) 
                ? `Missing key sections or direct links: ${topicCoverage.missing.join(', ')}.` 
                : undefined,
        },
        {
            id: 'title-length',
            label: 'Title length (30-65 chars)',
            status: title.length >= 30 && title.length <= 65 ? 'pass' : title.length > 0 && title.length < 30 ? 'warn' : title.length > 65 ? 'warn' : 'fail',
            priority: 'critical',
            value: `${title.length} chars`,
        },
        {
            id: 'focus-keyword',
            label: 'Focus keyword set',
            status: hasFk ? 'pass' : 'fail',
            priority: 'critical',
        },
        {
            id: 'content-depth',
            label: 'Content length (Topic depth)',
            status: wordCount >= 1000 ? 'pass' : wordCount >= 500 ? 'warn' : 'fail',
            priority: 'critical',
            value: `${wordCount} words`,
            recommendation: wordCount < 500 ? 'Thin content detected. Aim for 1000+ words to cover all relevant subtopics.' : undefined,
        },

        // ═══ IMPORTANT ═══
        {
            id: 'entities',
            label: 'Entity SEO (Semantic Authority)',
            status: entities.length >= 5 ? 'pass' : entities.length >= 3 ? 'warn' : 'fail',
            priority: 'important',
            value: `${entities.length} entities`,
            recommendation: entities.length < 5 ? 'Mention more specific organizations, boards, or exams to build semantic authority.' : undefined,
        },
        {
            id: 'scannability',
            label: 'UX Scannability (User Signals)',
            status: scannability.score >= 80 ? 'pass' : scannability.score >= 50 ? 'warn' : 'fail',
            priority: 'important',
            recommendation: scannability.issues.join(' '),
        },
        {
            id: 'schema-health',
            label: 'Structured Data Health (Schema.org)',
            status: schemaHealth.status,
            priority: 'important',
            recommendation: schemaHealth.issues.join(' '),
        },
        {
            id: 'sge-direct-answer',
            label: 'SGE Direct Answer (First 100 words)',
            status: hasDirectAnswer ? 'pass' : 'warn',
            priority: 'important',
            recommendation: !hasDirectAnswer ? 'Provide a clear, direct answer to the user query in the first paragraph.' : undefined,
        },
        {
            id: 'author-trust',
            label: 'Author Attribution (EEAT)',
            status: authorId ? 'pass' : 'fail',
            priority: 'important',
            recommendation: !authorId ? 'Assign an author to establish transparency and trust.' : undefined,
        },
        {
            id: 'fk-density',
            label: 'Keyword density (0.5-2.5%)',
            status: hasFk && fkDensity >= 0.5 && fkDensity <= 2.5 ? 'pass' : 'warn',
            priority: 'important',
            value: `${fkDensity.toFixed(1)}%`,
        },
        {
            id: 'gov-links',
            label: 'Official Trust Links (.gov, .nic)',
            status: govLinks > 0 ? 'pass' : 'warn',
            priority: 'important',
            value: `${govLinks} found`,
        },

        // ═══ NICE TO HAVE ═══
        {
            id: 'year-freshness',
            label: 'Content Freshness (2026)',
            status: freshness.status,
            priority: 'nice',
            recommendation: freshness.recommendation,
        },
        {
            id: 'internal-links',
            label: 'Internal link depth',
            status: internalLinks >= 3 ? 'pass' : 'warn',
            priority: 'nice',
            value: `${internalLinks} links`,
        },
        {
            id: 'meta-desc',
            label: 'Meta description optimization',
            status: metaDescription.length >= 120 && metaDescription.length <= 155 ? 'pass' : 'warn',
            priority: 'nice',
            value: `${metaDescription.length} chars`,
        },
    ]

    // Score calculation
    const weights: Record<SeoCheckPriority, number> = { critical: 4, important: 2, nice: 1 }

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
    const important = checks.filter(c => c.priority === 'important' && (c.status === 'fail' || c.status === 'warn')).length
    const nice = checks.filter(c => c.priority === 'nice' && c.status === 'fail').length
    const passed = checks.filter(c => c.status === 'pass').length

    return {
        checks: checks.sort((a,b) => {
            if (a.status === b.status) return weights[b.priority] - weights[a.priority]
            if (a.status === 'fail') return -1
            if (b.status === 'fail') return 1
            if (a.status === 'warn') return -1
            return 1
        }),
        score,
        summary: { critical, important, nice, total: checks.length, passed },
        readability: analyzeReadability(content),
    }
}

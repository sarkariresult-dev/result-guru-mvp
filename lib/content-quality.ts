/**
 * Content Quality Scoring System
 *
 * Comprehensive quality gate that evaluates content before publishing.
 * Checks humanLikeness, readability, SEO optimization, topical depth,
 * and AdSense readiness signals.
 *
 * Used by: publishPost() in features/posts/actions.ts
 */

import { analyzeAiHeuristics, validateContentDepth, detectPlaceholderLinks } from './humanize'

/* ── Types ────────────────────────────────────────────────── */

export interface ContentQualityReport {
    /** Overall quality score (0-100) */
    score: number
    /** AI detection resistance score (0-100) */
    humanLikeness: number
    /** Readability and accessibility score (0-100) */
    readability: number
    /** SEO optimization score (0-100) */
    seoOptimization: number
    /** Topical depth and substance score (0-100) */
    topicalDepth: number
    /** AdSense compliance score (0-100) */
    adsenseReadiness: number
    /** List of issues found */
    issues: string[]
    /** Whether the content can be published */
    canPublish: boolean
}

interface QualityMetadata {
    title?: string
    excerpt?: string
    metaTitle?: string
    metaDescription?: string
    focusKeyword?: string
    secondaryKeywords?: string[]
    faqCount?: number
    authorName?: string
    publishedAt?: string
    hasAuthor?: boolean
    internalLinksCount?: number
    hasFeaturedImage?: boolean
}

/* ── Helpers ──────────────────────────────────────────────── */

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function countSubstantiveWords(html: string): number {
    // Tables and pure data lists don't count toward substantive word count
    const withoutTables = html.replace(/<table[\s\S]*?<\/table>/gi, '')
    return stripHtml(withoutTables).split(/\s+/).filter(Boolean).length
}

function countH2s(html: string): number {
    return (html.match(/<h2[^>]*>/gi) || []).length
}


function countInternalLinks(html: string): number {
    const relativeLinks = html.match(/href=["']\/[^"']+["']/gi) || []
    const absoluteLinks = html.match(/href=["']https?:\/\/(www\.)?resultguru\.co\.in[^"']*["']/gi) || []
    return relativeLinks.length + absoluteLinks.length
}

function countExternalGovLinks(html: string): number {
    const govPatterns = [
        /href=["'][^"']*\.gov\.in[^"']*["']/gi,
        /href=["'][^"']*\.nic\.in[^"']*["']/gi,
        /href=["'][^"']*\.nta\.ac\.in[^"']*["']/gi,
        /href=["'][^"']*\.upsc\.gov\.in[^"']*["']/gi,
        /href=["'][^"']*\.ssc\.nic\.in[^"']*["']/gi,
    ]
    let count = 0
    for (const pattern of govPatterns) {
        count += (html.match(pattern) || []).length
    }
    return count
}

function countFaqItems(html: string): number {
    return (html.match(/<details[\s>]/gi) || []).length
}

function keywordDensity(text: string, keyword: string): number {
    if (!keyword || !text) return 0
    const words = text.toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length === 0) return 0

    const keywordWords = keyword.toLowerCase().split(/\s+/)
    let count = 0

    for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const slice = words.slice(i, i + keywordWords.length).join(' ')
        if (slice === keyword.toLowerCase()) count++
    }

    return (count * keywordWords.length / words.length) * 100
}

/* ── Score Components ────────────────────────────────────── */

function scoreHumanLikeness(html: string): { score: number; issues: string[] } {
    const { score: aiScore, reasons } = analyzeAiHeuristics(html)

    // Invert AI score: 0 AI score = 100 human, 100 AI score = 0 human
    const humanScore = Math.max(0, 100 - aiScore)

    return {
        score: humanScore,
        issues: reasons,
    }
}

function scoreReadability(html: string): { score: number; issues: string[] } {
    const issues: string[] = []
    let score = 100

    const plainText = stripHtml(html)
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 5)

    // Check average sentence length
    if (sentences.length > 0) {
        const avgWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
        if (avgWords > 25) {
            score -= 15
            issues.push(`Average sentence is ${Math.round(avgWords)} words — too long for web reading`)
        }
    }

    // Check for sentence length variation
    if (sentences.length >= 5) {
        const lengths = sentences.map(s => s.trim().split(/\s+/).length)
        const hasShort = lengths.some(l => l <= 8)
        const hasLong = lengths.some(l => l >= 20)
        if (!hasShort) {
            score -= 10
            issues.push('No short punchy sentences — lacks rhythm')
        }
        if (!hasLong) {
            score -= 5
            issues.push('No detailed explanatory sentences')
        }
    }

    // Check paragraph count and variation
    const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || []
    if (paragraphs.length < 8) {
        score -= 10
        issues.push(`Only ${paragraphs.length} paragraphs — content may feel like a wall of text`)
    }

    // Check for subheadings density (1 H2 per ~250 words)
    const wordCount = plainText.split(/\s+/).filter(Boolean).length
    const h2Count = countH2s(html)
    if (wordCount > 500 && h2Count < Math.floor(wordCount / 400)) {
        score -= 10
        issues.push('Insufficient subheadings for content length — reduces scannability')
    }

    return { score: Math.max(0, score), issues }
}

function scoreSeoOptimization(html: string, meta: QualityMetadata): { score: number; issues: string[] } {
    const issues: string[] = []
    let score = 100

    // Meta title check
    if (!meta.metaTitle) {
        score -= 15
        issues.push('Missing meta title')
    } else if (meta.metaTitle.length > 60) {
        score -= 5
        issues.push(`Meta title too long (${meta.metaTitle.length} chars, max 60)`)
    }

    // Meta description check
    if (!meta.metaDescription) {
        score -= 15
        issues.push('Missing meta description')
    } else if (meta.metaDescription.length > 155) {
        score -= 5
        issues.push(`Meta description too long (${meta.metaDescription.length} chars, max 155)`)
    }

    // Focus keyword check
    if (!meta.focusKeyword) {
        score -= 10
        issues.push('No focus keyword set')
    } else {
        const plainText = stripHtml(html)
        const density = keywordDensity(plainText, meta.focusKeyword)
        if (density < 0.3) {
            score -= 10
            issues.push(`Focus keyword density too low (${density.toFixed(1)}%)`)
        } else if (density > 2.5) {
            score -= 30
            issues.push(`CRITICAL: Focus keyword density extremely high (${density.toFixed(1)}%) — keyword stuffing detected`)
        } else if (density > 1.8) {
            score -= 15
            issues.push(`Focus keyword density high (${density.toFixed(1)}%) — borderline stuffing`)
        }

        // Check keyword in meta title
        if (meta.metaTitle && !meta.metaTitle.toLowerCase().includes(meta.focusKeyword.toLowerCase())) {
            score -= 5
            issues.push('Focus keyword not found in meta title')
        }
    }

    // Semantic Richness / LSI check
    if (meta.secondaryKeywords && meta.secondaryKeywords.length > 0) {
        const plainText = stripHtml(html).toLowerCase()
        let foundLSI = 0
        for (const lsi of meta.secondaryKeywords) {
            if (plainText.includes(lsi.toLowerCase())) {
                foundLSI++
            }
        }
        if (foundLSI === 0) {
            score -= 15
            issues.push('Zero secondary keywords (LSI) found in content — poor semantic richness')
        } else if (foundLSI < meta.secondaryKeywords.length / 2) {
            score -= 5
            issues.push(`Only ${foundLSI}/${meta.secondaryKeywords.length} secondary keywords used`)
        }
    }

    // Internal links
    const internalLinks = meta.internalLinksCount ?? countInternalLinks(html)
    if (internalLinks < 3) {
        score -= 10
        issues.push(`Only ${internalLinks} internal links — need at least 3`)
    }

    // Featured image
    if (!meta.hasFeaturedImage) {
        score -= 5
        issues.push('No featured image set')
    }

    return { score: Math.max(0, score), issues }
}

function scoreTopicalDepth(html: string, meta: QualityMetadata): { score: number; issues: string[] } {
    const issues: string[] = []
    let score = 100

    // Substantive word count (excluding tables)
    const substantiveWords = countSubstantiveWords(html)
    if (substantiveWords < 1500) {
        score -= 25
        issues.push(`Only ${substantiveWords} substantive words (excluding tables) — minimum 1500 for quality`)
    } else if (substantiveWords < 1800) {
        score -= 10
        issues.push(`${substantiveWords} substantive words — slightly below 1800 target`)
    }

    // Section count
    const h2Count = countH2s(html)
    if (h2Count < 5) {
        score -= 15
        issues.push(`Only ${h2Count} H2 sections — need at least 5 for topical depth`)
    }

    // Content depth markers
    const depth = validateContentDepth(html)
    if (!depth.valid) {
        score -= 15
        issues.push(...depth.missing.map(m => `Missing depth element: ${m}`))
    }

    // FAQ count
    const faqCount = meta.faqCount ?? countFaqItems(html)
    if (faqCount < 5) {
        score -= 10
        issues.push(`Only ${faqCount} FAQ items — need at least 5 for SGE extraction`)
    }

    // External authority links
    const govLinks = countExternalGovLinks(html)
    if (govLinks < 1) {
        score -= 10
        issues.push('No external authority links (.gov.in / .nic.in) — hurts E-E-A-T')
    }

    return { score: Math.max(0, score), issues }
}

function scoreAdsenseReadiness(html: string, meta: QualityMetadata): { score: number; issues: string[] } {
    const issues: string[] = []
    let score = 100

    // Placeholder links check
    const placeholders = detectPlaceholderLinks(html)
    if (placeholders.length > 0) {
        score -= 30
        issues.push(`${placeholders.length} unresolved placeholder links detected — BLOCKS publishing`)
    }

    // Word count minimum
    const totalWords = stripHtml(html).split(/\s+/).filter(Boolean).length
    if (totalWords < 1000) {
        score -= 30
        issues.push(`Only ${totalWords} words — minimum 1000 for AdSense quality`)
    }

    // Author attribution
    if (!meta.hasAuthor) {
        score -= 10
        issues.push('No author attribution — weakens E-E-A-T')
    }

    // Publish date
    if (!meta.publishedAt) {
        score -= 5
        issues.push('No publish date set')
    }

    // Excerpt check
    if (!meta.excerpt) {
        score -= 5
        issues.push('No excerpt — weakens SERP and social sharing')
    }

    // Unique section count
    const h2Count = countH2s(html)
    if (h2Count < 5) {
        score -= 10
        issues.push(`Only ${h2Count} unique sections — AdSense prefers structured in-depth content`)
    }

    // Check that no single section is > 40% of total content (homogeneous content flag)
    const sections = html.split(/<h2[^>]*>/gi)
    if (sections.length > 2) {
        const sectionLengths = sections.map(s => stripHtml(s).split(/\s+/).filter(Boolean).length)
        const maxSection = Math.max(...sectionLengths)
        if (maxSection / totalWords > 0.4) {
            score -= 10
            issues.push('One section contains >40% of content — unbalanced structure')
        }
    }

    return { score: Math.max(0, score), issues }
}

/* ── Main Scoring Function ───────────────────────────────── */

/**
 * Run comprehensive quality analysis on content before publishing.
 *
 * @param html - The HTML content to analyze
 * @param metadata - Additional metadata about the post
 * @returns Complete quality report with scores and issues
 */
export function scoreContentQuality(html: string, metadata: QualityMetadata = {}): ContentQualityReport {
    if (!html || html.length < 50) {
        return {
            score: 0,
            humanLikeness: 0,
            readability: 0,
            seoOptimization: 0,
            topicalDepth: 0,
            adsenseReadiness: 0,
            issues: ['No content provided'],
            canPublish: false,
        }
    }

    const humanLikeness = scoreHumanLikeness(html)
    const readability = scoreReadability(html)
    const seoOptimization = scoreSeoOptimization(html, metadata)
    const topicalDepth = scoreTopicalDepth(html, metadata)
    const adsenseReadiness = scoreAdsenseReadiness(html, metadata)

    // Weighted average: humanLikeness and adsenseReadiness are most critical
    const overallScore = Math.round(
        humanLikeness.score * 0.30 +
        readability.score * 0.15 +
        seoOptimization.score * 0.20 +
        topicalDepth.score * 0.15 +
        adsenseReadiness.score * 0.20
    )

    const allIssues = [
        ...humanLikeness.issues,
        ...readability.issues,
        ...seoOptimization.issues,
        ...topicalDepth.issues,
        ...adsenseReadiness.issues,
    ]

    // Publishing gate: overall score >= 70, no placeholder links, minimum word count, no critical stuffing
    const hasPlaceholders = detectPlaceholderLinks(html).length > 0
    const wordCount = stripHtml(html).split(/\s+/).filter(Boolean).length
    const hasCriticalStuffing = allIssues.some(i => i.includes('CRITICAL: Focus keyword density extremely high'))

    return {
        score: overallScore,
        humanLikeness: humanLikeness.score,
        readability: readability.score,
        seoOptimization: seoOptimization.score,
        topicalDepth: topicalDepth.score,
        adsenseReadiness: adsenseReadiness.score,
        issues: allIssues,
        canPublish: overallScore >= 70 && !hasPlaceholders && wordCount >= 1000 && !hasCriticalStuffing,
    }
}

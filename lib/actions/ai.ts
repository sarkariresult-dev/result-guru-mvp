'use server'

import { GoogleGenAI, Type } from '@google/genai'
import fs from 'fs'
import path from 'path'
import { env } from '@/config/env'
import { generatePostSchema, type GeneratePostInput } from '@/lib/validations/post'
import { createServerClient } from '@/lib/supabase/server'
import { humanizeContent, analyzeAiHeuristics } from '@/lib/humanize'
import { sanitizeHtml } from '@/lib/sanitize'
import { injectContextualLinks } from '@/lib/seo/internal-linking'
import { PostStatus } from '@/types/enums'

/* ── Gemini Client ────────────────────────────────────────────────── */

const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GENAI_API_KEY })

/* ── Writing Style Seeds ─────────────────────────────────────────── */

/**
 * Randomly selected writing directives injected into each generation
 * to break template fatigue and ensure creative variance.
 */
const STYLE_SEEDS = [
    // ── Data-Forward Openings ──
    'Start with a raw number: "142.5 marks. That was the cut-off." Then unpack what it means.',
    'Open with a year-over-year comparison that immediately shows the trend.',
    'Begin with the single most important statistic — vacancy count, cut-off, or salary figure.',
    // ── Question Openings ──
    'Start with the exact question the reader typed into Google. Answer it in the first sentence.',
    'Open with a rhetorical question that challenges a common assumption about this topic.',
    'Begin with: "What happens when [X lakh] people compete for [Y] seats?" Then break it down.',
    // ── Urgency Openings ──
    'Start with the deadline: "You have [X] days. Here\'s exactly what to do."',
    'Open with breaking-news energy: "[Board] just dropped this [time] — here\'s the breakdown."',
    'Begin with the consequence of missing the deadline. Make it visceral.',
    // ── Empathy Openings ──
    'Start with: "I know you\'ve been checking the portal since 6 AM. Let me save you time."',
    'Open by acknowledging the reader\'s frustration with outdated info on other sites.',
    'Begin with: "If your friends are telling you [myth], they\'re wrong. Here\'s the real picture."',
    // ── Myth-Busting Openings ──
    'Start by naming the #1 misconception about this topic. Correct it immediately.',
    'Open with: "Everyone says [X]. The data says otherwise." Then show the data.',
    'Begin with what the official notification says vs. what YouTube/Telegram is telling people.',
    // ── Opinion Openings ──
    'Start with a strong personal take: "This is genuinely the best opportunity I\'ve seen this year."',
    'Open with: "I\'ve tracked [Org] for [X] years. This notification is different. Here\'s why."',
    'Begin with an insider observation that shows you\'ve actually read the full notification.',
    // ── Inverted Pyramid Openings ──
    'Give the complete answer in 2 sentences. Then spend the rest of the article proving it.',
    'Open with the TL;DR — who, what, when, where, how. Then go deep.',
    'Start with: "Short answer: [direct answer]. Long answer: it\'s complicated. Let me explain."',
    // ── Story/Anecdote Openings ──
    'Start with a specific scenario: "Imagine you\'re at the exam center and [situation]."',
    'Open with what happened last year when a similar notification dropped.',
    'Begin with the most interesting detail buried on page 12 of the notification PDF.',
    // ── Contrarian Openings ──
    'Start with: "Everyone\'s excited about [vacancy count]. But here\'s what they\'re missing."',
    'Open with why this opportunity isn\'t for everyone — then explain who it IS for.',
    'Begin with: "Forget [popular exam]. This is the smarter play right now."',
    // ── Action-First Openings ──
    'Open with a 3-step checklist of what to do RIGHT NOW before anything else.',
    'Start with the download/apply link and key dates. Save analysis for after.',
    'Begin with: "Stop scrolling. Here are the 3 things that matter." Then go deep on each.',
]

/* ── Structure Seeds ─────────────────────────────────────────────── */

/**
 * Controls article skeleton to prevent template detection.
 * Randomly selected per generation to ensure structural variety.
 */
const STRUCTURE_SEEDS = [
    'Start with the most actionable section (How to Apply / How to Check). Put background context in the middle. End with analysis.',
    'Lead with a data table (vacancy / dates / cut-off). Follow with narrative analysis. End with action steps.',
    'Open with a mini-FAQ — answer the top 3 questions immediately as H2s. Then go deep on context.',
    'Use an inverted pyramid: give the complete answer in 3 paragraphs, then expand each point as separate H2s.',
    'Start with "What Changed This Year" — make comparison to last year the organizing principle of the entire article.',
    'Lead with eligibility + who should apply. Middle: selection process deep-dive. End: salary/career growth.',
    'Open with the most controversial or surprising aspect. Build the rest of the article around explaining it.',
    'Structure as a problem → solution arc: what makes this confusing → here\'s the clear breakdown.',
    'Lead with key dates + direct links (what they came for). Then add the analysis they didn\'t know they needed.',
    'Start with a "Quick Check" section (3-4 bullet facts), then go deep. Readers who want speed get it; readers who want depth scroll down.',
]

/* ── Conclusion Seeds ────────────────────────────────────────────── */

/**
 * Randomized ending directives to prevent formulaic conclusions.
 */
const CONCLUSION_SEEDS = [
    'End with a forward-looking prediction about what happens next in this recruitment/exam cycle.',
    'End with a provocative question that makes the reader think or take action immediately.',
    'End by calling back to your opening hook — close the loop. Make it feel intentional.',
    'End with a practical 3-4 item next-step checklist. No fluff, just "do this now."',
    'End with a contrarian take — suggest an alternative path or exam that might be smarter.',
    'End with empathy and a promise: "I\'ll update this the moment [X] happens. Bookmark it."',
    'End with a "one more thing" reveal — a detail from the notification that most people miss.',
    'End with deadline urgency — the exact date and time the portal closes. Make it visceral.',
]

/* ── Tone Mapper ─────────────────────────────────────────────────── */

/**
 * Maps post types to specific tone directives for more natural,
 * context-appropriate writing.
 */
function getToneForType(type: string): string {
    const tones: Record<string, string> = {
        job: 'Write like a friend who just found an amazing opportunity and is texting you about it. Excited but factual — every sentence has real info.',
        result: 'Urgent energy — you know they\'re refreshing the page anxiously. Get to the point fast. Empathize, then deliver.',
        admit: 'Calm and reassuring — like a senior who\'s been through this before. Step-by-step, no panic.',
        answer_key: 'Think exam coach mode — analytical, strategic. Show them exactly how to verify marks and whether to file objections.',
        cut_off: 'Data nerd energy — you love comparing numbers across years. Share the trends like you\'re breaking down a cricket scorecard.',
        syllabus: 'Study buddy who\'s already cracked this — share what to prioritize and what to skip.',
        exam_pattern: 'Strategic friend — "here\'s the hack" energy. Show how understanding the pattern directly improves marks.',
        previous_paper: 'Resource-sharing mode — you\'ve done the analysis so they don\'t have to. Highlight patterns.',
        scheme: 'Helpful neighbor — explain the bureaucracy simply so a first-time applicant can follow along.',
        scholarship: 'Encouraging tone — "you qualify for free money, here\'s how to grab it."',
        admission: 'Guiding senior — clear steps, common mistakes to avoid, insider tips.',
        notification: 'Breaking news energy — deliver the facts fast, then add context that official portals miss.',
        exam: 'Motivating prep partner — focus on strategy and career growth, not generic motivation.',
    }
    return tones[type] || 'Write like a knowledgeable friend explaining this over chai — helpful, direct, real.'
}

/* ── Keyword Seed Builder ─────────────────────────────────────────── */

/**
 * Generates a contextual keyword seed string to enrich the Gemini prompt.
 * Enhanced with competitor-gap patterns, voice search, and People Also Ask triggers.
 */
function buildKeywordSeed(topic: string, postType: string, primaryKeywords: string): string {
    const year = new Date().getFullYear()
    const topicLower = topic.toLowerCase()

    // Common long-tail patterns per post type - enhanced with Hindi transliterations
    const patterns: Record<string, string[]> = {
        job: [
            `${topicLower} vacancy ${year}`,
            `${topicLower} notification pdf download`,
            `${topicLower} eligibility criteria age limit`,
            `${topicLower} salary pay scale 7th pay commission`,
            `${topicLower} apply online direct link`,
            `${topicLower} selection process exam pattern`,
            `${topicLower} bharti apply online`,
            `${topicLower} sarkari naukri`,
            `${topicLower} vacancy kitni hai`,
            `${topicLower} last date kab hai`,
        ],
        result: [
            `${topicLower} result ${year} check online`,
            `${topicLower} scorecard download link`,
            `${topicLower} cut off marks category wise`,
            `${topicLower} merit list pdf download`,
            `${topicLower} result date kab aayega`,
            `${topicLower} marks normalization formula`,
            `${topicLower} result kaise check kare`,
            `${topicLower} result link direct`,
            `${topicLower} topper marks`,
        ],
        admit: [
            `${topicLower} admit card ${year} download`,
            `${topicLower} hall ticket direct link`,
            `${topicLower} exam center city slip`,
            `${topicLower} exam day guidelines instructions`,
            `${topicLower} admit card kaise download kare`,
            `${topicLower} photo signature size for admit card`,
        ],
        answer_key: [
            `${topicLower} answer key ${year} pdf`,
            `${topicLower} objection link last date`,
            `${topicLower} expected cut off after answer key`,
            `${topicLower} marks calculation method`,
            `${topicLower} answer key set wise pdf download`,
        ],
        cut_off: [
            `${topicLower} cut off ${year} category wise`,
            `${topicLower} qualifying marks general obc sc st`,
            `${topicLower} previous year cut off comparison`,
            `${topicLower} safe score to qualify`,
            `${topicLower} cut off kitna jayega`,
        ],
        syllabus: [
            `${topicLower} syllabus ${year} subject wise`,
            `${topicLower} exam pattern marking scheme`,
            `${topicLower} best books preparation strategy`,
            `${topicLower} topic wise weightage analysis`,
            `${topicLower} syllabus pdf download hindi english`,
        ],
        exam_pattern: [
            `${topicLower} paper pattern ${year}`,
            `${topicLower} negative marking scheme`,
            `${topicLower} sectional time strategy`,
            `${topicLower} difficulty level analysis`,
        ],
        previous_paper: [
            `${topicLower} previous year paper pdf`,
            `${topicLower} solved papers with solution`,
            `${topicLower} topic wise question analysis`,
        ],
        scheme: [
            `${topicLower} yojana ${year} apply online`,
            `${topicLower} eligibility documents required`,
            `${topicLower} benefit amount status check`,
            `${topicLower} scheme ka labh kaise le`,
        ],
        scholarship: [
            `${topicLower} scholarship ${year} last date`,
            `${topicLower} eligibility income criteria`,
            `${topicLower} apply online renewal process`,
            `${topicLower} scholarship kitna milega`,
        ],
        admission: [
            `${topicLower} admission ${year} application form`,
            `${topicLower} courses fee structure cutoff`,
            `${topicLower} counseling schedule seat allotment`,
        ],
        exam: [
            `${topicLower} ${year} notification exam date`,
            `${topicLower} preparation strategy books`,
            `${topicLower} salary career growth promotion`,
        ],
        notification: [
            `${topicLower} notification ${year} pdf`,
            `${topicLower} vacancy details category wise`,
            `${topicLower} apply online last date link`,
        ],
    }

    const seeds = patterns[postType] ?? patterns.job!
    const pkw = primaryKeywords?.trim()

    return [
        `Target long-tail keyword patterns for "${topic}" (${postType}):`,
        ...seeds,
        ...(pkw ? [`Primary keyword context: ${pkw}`] : []),
        `Current year: ${year}`,
        '',
        'SEO CONTEXT:',
        '- Target "People Also Ask" questions in Google India.',
        '- Include Hinglish keyword variations (e.g., "kab aayega", "kaise kare").',
        '- Focus on voice search patterns (conversational queries).',
        '- Always include the organization full name AND abbreviation in content.',
        '- Maintain focus keyword density 0.5-1.2% to avoid over-optimization penalties.',
    ].join('\n')
}

/* ── Response Schema ──────────────────────────────────────────────── */

const aiResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: `SEO title (30-65 chars). MUST contain focus keyword + year ${new Date().getFullYear()}.`,
        },
        ctrTitle: {
            type: Type.STRING,
            description: 'High-CTR alternative title with urgency triggers (≤65 chars). NO emojis, symbols, or icons allowed.',
        },
        metaTitle: {
            type: Type.STRING,
            description: 'SERP meta title (MAX 60 chars). Truncation-safe. Uses most-searched keyword variation.',
        },
        metaDescription: {
            type: Type.STRING,
            description: 'Meta description (120-155 chars). MUST contain focus keyword. End with CTA.',
        },
        slug: {
            type: Type.STRING,
            description: 'Clean URL slug (≤75 chars). No stop words. Contains focus keyword. Hyphens only.',
        },
        focusKeyword: {
            type: Type.STRING,
            description: 'Primary long-tail keyword phrase (3-5 words, specific not generic).',
        },
        secondaryKeywords: {
            type: Type.ARRAY,
            description: 'Minimum 3 secondary keywords including semantic variations and Hinglish forms.',
            items: { type: Type.STRING },
        },
        suggestedTags: {
            type: Type.ARRAY,
            description: '3-5 relevant tag slugs adapted to entity context (e.g., ["btech", "police", "state-level"]).',
            items: { type: Type.STRING },
        },
        suggestedQualifications: {
            type: Type.ARRAY,
            description: 'Required qualifications (e.g., ["10th", "12th", "graduation", "pg"]).',
            items: { type: Type.STRING },
        },
        excerpt: {
            type: Type.STRING,
            description: 'Rich snippet excerpt (50-200 chars). Direct answer to the user query.',
        },
        content: {
            type: Type.STRING,
            description: 'Full HTML content (1800+ words). Human-like tone with natural conversational flow and varied sentence lengths. DO NOT use em-dashes (—) as they look artificial in Hinglish. Uses [officialWebsiteUrl], [primaryLink], [notificationPdfUrl] placeholders. MUST wrap Key Takeaways in <section id="key-takeaways" data-nosnippet="false">. DO NOT include a Quick Summary box at the beginning. CRITICAL: DO NOT write an FAQ section inside this content block. FAQs are handled separately via the faq array field.',
        },
        keyTakeaways: {
            type: Type.ARRAY,
            description: '3-5 bullet points summarizing the most essential facts and action items from the article.',
            items: { type: Type.STRING },
        },
        proTip: {
            type: Type.STRING,
            description: 'One practical insider tip that adds unique value — something a first-time reader wouldn\'t know.',
        },
        officialWebsiteUrl: {
            type: Type.STRING,
            description: 'Official .gov.in / .nic.in domain URL. REQUIRED.',
        },
        primaryLink: {
            type: Type.STRING,
            description: 'Primary action link (Apply, Check Result, Download, etc.). REQUIRED.',
        },
        notificationPdfUrl: {
            type: Type.STRING,
            description: 'Direct PDF link or best estimate. REQUIRED.',
        },
        faq: {
            type: Type.ARRAY,
            description: '5-8 FAQs targeting "People Also Ask" in Google India. Mix English and Hinglish questions.',
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
            },
        },
    },
    required: [
        'title', 'ctrTitle', 'metaTitle', 'metaDescription', 'slug',
        'focusKeyword', 'secondaryKeywords',
        'suggestedTags', 'suggestedQualifications',
        'excerpt', 'content',
        'officialWebsiteUrl', 'primaryLink', 'notificationPdfUrl',
        'faq',
    ],
}

/* ── Prompt File Reader (cached) ──────────────────────────────────── */

const promptCache = new Map<string, string>()

function readPromptFile(filename: string): string {
    const cached = promptCache.get(filename)
    if (cached) return cached

    const filePath = path.join(process.cwd(), 'config', 'prompts', filename)
    try {
        const content = fs.readFileSync(filePath, 'utf8')
        promptCache.set(filename, content)
        return content
    } catch {
        return ''
    }
}

/* ── Factual Context Builder ─────────────────────────────────────── */

/**
 * Builds a structured factual context block from available form data.
 * This is the key to grounding the AI in real-world data instead of hallucination.
 */
function buildFactualContext(data: GeneratePostInput): string {
    const lines: string[] = []

    lines.push('═══ FACTUAL CONTEXT (Use these REAL values - do NOT guess or hallucinate) ═══')

    if (data.organizationName) {
        lines.push(`Organization Name: ${data.organizationName}`)
    }
    if (data.organizationShortName) {
        lines.push(`Organization Short Name / Abbreviation: ${data.organizationShortName}`)
    }
    if (data.officialWebsite) {
        lines.push(`Official Website URL: ${data.officialWebsite}`)
        lines.push(`→ Use this for [officialWebsiteUrl] placeholder`)
    }
    if (data.stateOrRegion) {
        lines.push(`State / Region: ${data.stateOrRegion}`)
    }
    if (data.existingPrimaryLink) {
        lines.push(`Primary Action Link: ${data.existingPrimaryLink}`)
        lines.push(`→ Use this for [primaryLink] placeholder`)
    }
    if (data.existingNotificationPdf) {
        lines.push(`Notification PDF URL: ${data.existingNotificationPdf}`)
        lines.push(`→ Use this for [notificationPdfUrl] placeholder`)
    }

    lines.push(`Current Year: ${new Date().getFullYear()}`)
    lines.push(`Current Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`)

    if (lines.length <= 3) {
        lines.push('NOTE: No specific context provided. Use placeholders [officialWebsiteUrl], [primaryLink], [notificationPdfUrl] where needed.')
    }

    lines.push('═══════════════════════════════════════════════════════════════════════════')

    return lines.join('\n')
}

/* ── Main Generation Function ─────────────────────────────────────── */

/** Max auto-retry attempts when content quality is too low */
const MAX_GENERATION_ATTEMPTS = 3
/** AI heuristic score threshold — content scoring above this triggers retry */
const QUALITY_THRESHOLD = 60

export async function generateContentWithGemini(data: GeneratePostInput) {
    const parsed = generatePostSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const input = parsed.data
    const { topic, postType, primaryKeywords } = input

    // 1. Load prompts (cached)
    const systemPrompt = readPromptFile('system.md') || 'You are a specialized content generation assistant.'
    const typePrompt = readPromptFile(`${postType}.md`) || readPromptFile('generic.md') || 'Generate a structured article for this topic.'
    const hinglishPrompt = input.contentLanguage === 'hinglish' ? (readPromptFile('hinglish-guide.md') || '') : ''
    const discoverAiSeoPrompt = readPromptFile('discover-ai-seo.md') || ''
    const keywordSeed = buildKeywordSeed(topic, postType, primaryKeywords || '')
    const factualContext = buildFactualContext(input)
    const tone = getToneForType(postType)

    let lastError = ''
    let bestResult: Record<string, unknown> | null = null
    let bestScore = Infinity

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
        try {
            // 2. Select random seeds — different each attempt to ensure variety on retry
            const styleSeed = STYLE_SEEDS[Math.floor(Math.random() * STYLE_SEEDS.length)]
            const structureSeed = STRUCTURE_SEEDS[Math.floor(Math.random() * STRUCTURE_SEEDS.length)]
            const conclusionSeed = CONCLUSION_SEEDS[Math.floor(Math.random() * CONCLUSION_SEEDS.length)]

            // 3. Construct the full prompt with all randomization layers
            const fullPrompt = [
                `═══ TOPIC ═══`,
                topic,
                '',
                hinglishPrompt ? `═══ STRICT LANGUAGE REQUIREMENT: HINGLISH ═══\n${hinglishPrompt}\n` : '',
                `═══ POST TYPE: ${postType.toUpperCase()} ═══`,
                '',
                factualContext,
                '',
                `═══ TONE & STYLE ═══`,
                `Tone: ${tone}`,
                `Opening Style: ${styleSeed}`,
                `Article Structure: ${structureSeed}`,
                `Ending Style: ${conclusionSeed}`,
                `Target Audience: Government Job Seekers in India (primarily Hindi-belt, 18-35 age group)`,
                '',
                attempt > 1 ? `═══ QUALITY NOTE (Attempt ${attempt}) ═══\nPrevious generation was flagged as too AI-like. This attempt MUST:\n- Use dramatically different sentence lengths\n- Include more one-sentence paragraphs\n- Add more conversational asides (but DO NOT use em-dashes '—')\n- Avoid repetitive paragraph structures\n- Start paragraphs with different words\n` : '',
                `═══ DISCOVER & AI SEO ENGINES ═══`,
                discoverAiSeoPrompt,
                '',
                `═══ KEYWORD RESEARCH ═══`,
                keywordSeed,
                '',
                `═══ TYPE-SPECIFIC INSTRUCTIONS ═══`,
                typePrompt,
            ].filter(Boolean).join('\n')

            // 4. Execute Gemini generation
            const response = await ai.models.generateContent({
                model: env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash-preview-05-20',
                contents: fullPrompt,
                config: {
                    systemInstruction: systemPrompt,
                    responseMimeType: 'application/json',
                    responseSchema: aiResponseSchema as unknown,
                    temperature: env.GOOGLE_GENAI_TEMPERATURE !== undefined ? env.GOOGLE_GENAI_TEMPERATURE : 0.85,
                    topP: 0.92, // Nucleus sampling to reduce repetitive token selection
                },
            })

            if (!response.text) {
                throw new Error('No text response received from Gemini.')
            }

            const jsonResult = JSON.parse(response.text)

            // 5. Run humanization, HTML sanitization, and SEO internal linking
            if (jsonResult.content && typeof jsonResult.content === 'string') {
                let processedContent = sanitizeHtml(humanizeContent(jsonResult.content))
                processedContent = injectContextualLinks(processedContent, jsonResult.focusKeyword || '')
                jsonResult.content = processedContent
            }

            // 6. Quality gate — check AI heuristic score
            const heuristics = analyzeAiHeuristics(jsonResult.content || '')

            if (heuristics.score < bestScore) {
                bestScore = heuristics.score
                bestResult = jsonResult
            }

            // If quality is good enough, return immediately
            if (!heuristics.isFlagged || heuristics.score < QUALITY_THRESHOLD) {
                return { success: true, data: jsonResult }
            }

            // Log retry reason for debugging
            void 0;

        } catch (e: unknown) {
            lastError = e instanceof Error ? e.message : 'An unexpected error occurred during AI generation'
        }
    }

    // All attempts exhausted — return best result with human review flag
    if (bestResult) {
        (bestResult as Record<string, unknown>).needsHumanReview = true
        return { success: true, data: bestResult }
    }

    return { error: lastError || 'All generation attempts failed' }
}

/* ── Post-Creation SEO Enhancement ────────────────────────────────── */

/**
 * Call this AFTER creating a post to compute and store related posts.
 * Cleaned of ghost column writes and non-existent RPC calls.
 */
export async function enhancePostSEO(postId: string) {
    try {
        const supabase = await createServerClient()

        // Compute related posts using full-text search similarity
        const { data: currentPost } = await supabase
            .from('posts')
            .select('type, organization_id, state_slug, title')
            .eq('id', postId)
            .single()

        if (!currentPost) return { success: true }

        // Find related posts by type + organization match
        const { data: related } = await supabase
            .from('posts')
            .select('id')
            .eq('status', PostStatus.Published)
            .neq('id', postId)
            .or(`type.eq.${currentPost.type},organization_id.eq.${currentPost.organization_id}`)
            .order('published_at', { ascending: false })
            .limit(6)

        if (related && related.length > 0) {
            const relatedIds = related.map(r => r.id)
            await supabase
                .from('posts')
                .update({ related_post_ids: relatedIds })
                .eq('id', postId)
        }

        return { success: true }
    } catch (e: unknown) {
        const error = e instanceof Error ? e.message : 'Unknown SEO enhancement error'
        return { error }
    }
}

/* ── Affiliate Product Generation ─────────────────────────────────── */

const affiliateResponseSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'Short, clean product name (e.g. SSC Mathematics Guide)' },
        short_description: { type: Type.STRING, description: 'Catchy 5-10 word tagline' },
        description: { type: Type.STRING, description: 'Detailed 2-3 paragraph product description highlighting features/benefits' },
        category: { type: Type.STRING, description: 'One of: books, stationery, electronics, software, tools, other' },
        badge_text: { type: Type.STRING, description: 'One of: HOT, NEW, TRENDING, BEST SELLER' },
        mrp: { type: Type.NUMBER, description: 'Estimated original price (MRP)' },
        selling_price: { type: Type.NUMBER, description: 'Estimated discounted price' },
        rating: { type: Type.NUMBER, description: 'Realistic rating out of 5.0 (e.g. 4.3, 4.7). Base on product quality and reviews if visible.' },
        faq: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    q: { type: Type.STRING, description: 'A question a student would ask about this product' },
                    a: { type: Type.STRING, description: 'A helpful, concise answer (1-2 sentences)' },
                },
                required: ['q', 'a'],
            },
            description: 'Generate 3-4 FAQ pairs that students commonly ask about this type of product.',
        },
    },
    required: ['name', 'short_description', 'description', 'category'],
}

/**
 * Generates product details from an affiliate URL.
 * Includes a lightweight scraper to get Title/Meta-Description for better accuracy.
 */
export async function generateAffiliateData(url: string) {
    if (!url) return { error: 'URL is required' }

    let metaTitle = ''
    let metaDesc = ''

    // 1. Attempt to fetch metadata to improve AI accuracy
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
            signal: controller.signal
        })

        if (response.ok) {
            const html = await response.text()
            metaTitle = html.match(/<title>(.*?)<\/title>/i)?.[1] || ''
            metaDesc = html.match(/<meta name="description" content="(.*?)"/i)?.[1] || ''
        }
        clearTimeout(timeoutId)
    } catch {
        // Fallback to URL-only analysis if fetch is blocked or fails
    }

    try {
        const systemPrompt = `You are a precise data extraction specialist for Result Guru (Indian Education Portal). 
        Your task is to deconstruct a store URL and its metadata to return structured JSON. 
        If Metadata is provided, prioritize it for the product name.`

        const prompt = `URL TO ANALYZE: "${url}"
        ${metaTitle ? `OFFICIAL PAGE TITLE: "${metaTitle}"` : ''}
        ${metaDesc ? `OFFICIAL META DESCRIPTION: "${metaDesc}"` : ''}
        
        INSTRUCTIONS:
        1. Extract the product name. Use the Page Title if available, otherwise deconstruct the URL slug.
        2. Identify the category: [books, stationery, electronics, software, tools, other].
        3. WRITING STYLE (HUMAN-LIKE):
           - Write like a senior mentor (Bhaiya/Sir) talking to a student.
           - AVOID AI CLICHÉS: Do not use "In today's world", "Unlock your potential", "Transformative", "Comprehensive", "Crucial", or "Vital".
           - Use simple, direct Indian English. Keep sentences short and punchy.
           - Mention real-life student context (e.g., "useful for revising during travel", "fits in your library bag", "best for late-night prep").
           - Use 2-3 distinct paragraphs. Mix short and long sentences for a natural flow.
        4. MRP/Price: Guess a REALISTIC price in INR based on product type.
        5. RATING: Give a realistic rating (e.g. 4.2, 4.5, 4.8). Don't just say 5.0.
        6. FAQ: Generate 3-4 questions that a student would realistically ask before buying this product. Keep answers short and helpful.
        
        CRITICAL: The goal is to look like it was hand-written by the Result Guru team.`

        const response = await ai.models.generateContent({
            model: env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash-preview-05-20',
            contents: prompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: affiliateResponseSchema as unknown,
                temperature: env.GOOGLE_GENAI_TEMPERATURE !== undefined ? env.GOOGLE_GENAI_TEMPERATURE : 0.3,
            },
        })

        if (!response.text) throw new Error('No response from AI')

        return { success: true, data: JSON.parse(response.text) }
    } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : 'AI Generation failed' }
    }
}

/* ── Social Media Generation ────────────────────────────────────────── */

export async function generateTwitterThread(postId: string) {
    try {
        const supabase = await createServerClient()
        const { data: post } = await supabase
            .from('posts')
            .select('title, excerpt, content, slug, type')
            .eq('id', postId)
            .single()

        if (!post) throw new Error('Post not found')

        const prompt = `
        Create an engaging Twitter/X thread for this article.
        
        Title: ${post.title}
        Excerpt: ${post.excerpt || ''}
        Content (raw HTML/text): ${(post.content || '').substring(0, 3000)} // Truncated to avoid huge payloads
        
        RULES:
        1. Create 3-5 tweets for the thread.
        2. First tweet should be a hook that makes them stop scrolling. Don't use words like "Unlock", "Delve", "Transform".
        3. Break down the core value in the middle tweets (dates, facts, or key insights). Use emojis appropriately but sparingly.
        4. The final tweet MUST include a strong call-to-action asking them to read the full guide on Result Guru.
        5. Return the thread as a JSON array of strings (one string per tweet).
        `

        const responseSchema = {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of tweets forming a cohesive thread.",
        }

        const response = await ai.models.generateContent({
            model: env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash-preview-05-20',
            contents: prompt,
            config: {
                systemInstruction: "You are a viral Twitter ghostwriter for an Indian education platform. You write punchy, relatable, and high-engagement threads.",
                responseMimeType: 'application/json',
                responseSchema: responseSchema as unknown,
                temperature: env.GOOGLE_GENAI_TEMPERATURE !== undefined ? env.GOOGLE_GENAI_TEMPERATURE : 0.7,
            },
        })

        if (!response.text) throw new Error('No response from AI')
        
        const tweets: string[] = JSON.parse(response.text)
        return { success: true, data: tweets }
    } catch (error) {
        void 0;
        return { error: error instanceof Error ? error.message : 'Failed to generate Twitter thread' }
    }
}

/* ── Monitoring Schema ────────────────────────────────────────────── */

const monitoringResponseSchema = {
    type: Type.OBJECT,
    properties: {
        isRelevant: {
            type: Type.BOOLEAN,
            description: 'Set to true ONLY if there is a new announcement relevant to job aspirants (jobs, results, admit cards, syllabus, answer keys, schemes). Set to false for tenders, holidays, office orders, internal administrative notifications, or if no new updates are present.'
        },
        relevanceReason: {
            type: Type.STRING,
            description: 'Brief reason why this update was classified as relevant or irrelevant.'
        },
        postType: {
            type: Type.STRING,
            description: 'The post type classification. Must be one of: job, result, admit, answer_key, cut_off, syllabus, exam_pattern, previous_paper, scheme, exam, admission, scholarship, notification.'
        },
        draft: {
            type: Type.OBJECT,
            description: 'The full drafted post content. Populate ONLY if isRelevant is true.',
            properties: {
                title: { type: Type.STRING, description: 'SEO title (30-65 chars). MUST contain focus keyword + current year.' },
                ctrTitle: { type: Type.STRING, description: 'High-CTR alternative title with urgency triggers (≤65 chars). NO emojis or icons.' },
                metaTitle: { type: Type.STRING, description: 'SERP meta title (MAX 60 chars).' },
                metaDescription: { type: Type.STRING, description: 'Meta description (120-155 chars). Must contain focus keyword.' },
                slug: { type: Type.STRING, description: 'Clean URL slug (≤75 chars). contains focus keyword, hyphens only.' },
                focusKeyword: { type: Type.STRING, description: 'Primary focus keyword (3-5 words).' },
                secondaryKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'At least 3 secondary keywords.' },
                suggestedQualifications: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Suggested qualification slugs: 10th, 12th, graduation, pg, diploma, etc.' },
                excerpt: { type: Type.STRING, description: 'Brief excerpt (50-200 chars) summarizing the announcement.' },
                content: { type: Type.STRING, description: 'Full HTML content of the article (1200+ words). Write like a senior mentor in simple direct Indian English. Wrap Key Takeaways in a section. DO NOT write FAQs here.' },
                officialWebsiteUrl: { type: Type.STRING, description: 'Official domain URL.' },
                primaryLink: { type: Type.STRING, description: 'Action link for candidates.' },
                notificationPdfUrl: { type: Type.STRING, description: 'Direct PDF URL if found, or base official URL.' },
                faq: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING },
                        },
                        required: ['question', 'answer']
                    },
                    description: '3-5 FAQs matching candidate queries.'
                }
            },
            required: [
                'title', 'ctrTitle', 'metaTitle', 'metaDescription', 'slug',
                'focusKeyword', 'secondaryKeywords', 'suggestedQualifications',
                'excerpt', 'content', 'officialWebsiteUrl', 'primaryLink', 'faq'
            ]
        }
    },
    required: ['isRelevant', 'relevanceReason']
}

/* ── Monitoring Update Scraper & Draft Auto-Generation ──────────────── */

export async function generateDraftFromSourceUpdate(opts: {
    organizationName: string
    organizationShortName: string | null
    stateOrRegion: string | null
    sourceUrl: string
    scrapedContent: string
}) {
    try {
        const { organizationName, organizationShortName, stateOrRegion, sourceUrl, scrapedContent } = opts

        const prompt = `
        You are a specialized content generator and verification assistant for Result Guru (an Indian Sarkari job portal).
        An automated script checked the following organization source URL:
        Organization: ${organizationName} (${organizationShortName || 'N/A'})
        State/Region: ${stateOrRegion || 'Central'}
        Source URL: ${sourceUrl}
        
        SCRAPED NOTICE LIST:
        """
        ${scrapedContent}
        """

        TASK:
        1. Determine if there is any new announcement in the notice list that is highly relevant to Result Guru (e.g., new recruitment/vacancy, admit card release, exam results, exam schedule, answer key, syllabus, or major government scheme).
        2. Set "isRelevant" to false if:
           - The notice is about tenders, holiday notices, office orders, transfer lists, staff promotions, website maintenance, or routine administrative reports.
           - There are no clear, actionable updates for students/candidates.
        3. If "isRelevant" is true:
           - Identify the correct "postType" (one of: job, result, admit, answer_key, cut_off, syllabus, exam_pattern, previous_paper, scheme, exam, admission, scholarship, notification).
           - Generate a complete, SEO-optimized draft post in English/Hinglish in the "draft" object.
           - Ground the content details strictly on the notices scraped (e.g. if the notice lists 'SSC CGL Result 2026 out on 01 June', write the post about that exact result announcement).
           - Do NOT hallucinate dates or facts that are not present. If the notice links to a PDF, capture that PDF URL and put it in "notificationPdfUrl".
           - The drafted "content" HTML must be high quality, mentor-style, and at least 800 words, including key details like how to check, important dates, and eligibility if available.
        `

        const response = await ai.models.generateContent({
            model: env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash-preview-05-20',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert editor for Sarkari Result portals. You analyze raw notifications, filter out administrative noise (tenders, transfers), and draft detailed posts for relevant updates.",
                responseMimeType: 'application/json',
                responseSchema: monitoringResponseSchema as unknown,
                temperature: env.GOOGLE_GENAI_TEMPERATURE !== undefined ? env.GOOGLE_GENAI_TEMPERATURE : 0.3,
            },
        })

        if (!response.text) throw new Error('No response from Gemini')

        const result = JSON.parse(response.text)

        // Run post-processing on draft content if relevant and present
        if (result.isRelevant && result.draft?.content) {
            let processedContent = sanitizeHtml(humanizeContent(result.draft.content))
            processedContent = injectContextualLinks(processedContent, result.draft.focusKeyword || '')
            result.draft.content = processedContent
        }

        return { success: true, data: result }
    } catch (e: unknown) {
        void 0;
        return { error: e instanceof Error ? e.message : 'AI Draft Generation failed' }
    }
}

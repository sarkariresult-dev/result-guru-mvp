'use server'

import { GoogleGenAI, Type } from '@google/genai'
import fs from 'fs'
import path from 'path'
import { env } from '@/config/env'
import { generatePostSchema, type GeneratePostInput } from '@/lib/validations/post'
import { createServerClient } from '@/lib/supabase/server'
import { humanizeContent } from '@/lib/humanize'

/* ── Gemini Client ────────────────────────────────────────────────── */

const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GENAI_API_KEY })

/* ── Writing Style Seeds ─────────────────────────────────────────── */

/**
 * Randomly selected writing directives injected into each generation
 * to break template fatigue and ensure creative variance.
 */
const STYLE_SEEDS = [
    'Start the article with a bold, factual statement about the opportunity or event. Jump straight into the value without a long introduction.',
    'Open the article by addressing a common problem or question students face regarding this specific topic.',
    'Begin the article with a direct question to the reader to build engagement.',
    'Start the article by highlighting the most important date, deadline, or timeline to create urgency.',
    'Open the article with a myth-busting approach, clarifying a common misconception about the exam or recruitment.',
    'Start the article with a concise data point (e.g., number of vacancies, expected competition level).',
    'Begin the article with a mentor-like hook, acknowledging that this is a frequently asked topic.',
    'Open the article by briefly comparing this year\'s update to previous years (e.g., changes in vacancies or pattern).',
    'Start with an inverted pyramid style: give the direct answer immediately, then dive into details.',
    'Begin the article with an enthusiastic tone announcing that the long-awaited update is finally here.',
    'Open the article by empathizing with the confusion students often face on official portals, promising a simplified guide.',
    'Start the article with a mini-checklist of the 3 most important things the reader needs to know right now.',
    'Begin the article by focusing on the timeline and the immediate next steps the candidate must take.',
    'Open the article by highlighting that this update is relevant for candidates across different regions.',
    'Start the article conversationally, getting straight to the point about what the post covers.',
]

/* ── Tone Mapper ─────────────────────────────────────────────────── */

/**
 * Maps post types to specific tone directives for more natural,
 * context-appropriate writing.
 */
function getToneForType(type: string): string {
    const tones: Record<string, string> = {
        job: 'Excited career counselor — guide the student through every step of the opportunity.',
        result: 'Urgent and celebratory — fast, direct information delivery. Empathize with student anxiety.',
        admit: 'Reassuring and helpful — calm anxious candidates and provide step-by-step instructions.',
        answer_key: 'Analytical and strategic — act as an exam coach explaining how to verify marks and file objections.',
        cut_off: 'Data-driven analyst — provide trend insights and practical advice based on numbers.',
        syllabus: 'Study mentor — organized, structured, and motivating. Focus on preparation strategy.',
        exam_pattern: 'Strategic coach — emphasize how understanding the pattern leads to better marks.',
        previous_paper: 'Resource-sharing mentor — emphasize the value of practicing past papers to understand trends.',
        scheme: 'Empathetic welfare advisor — help beneficiaries navigate bureaucracy clearly and simply.',
        scholarship: 'Encouraging opportunity finder — motivate students to apply for financial aid.',
        admission: 'Guiding counselor — provide clear steps to avoid mistakes in the admission process.',
        notification: 'Breaking news energy — deliver official details quickly and accurately.',
        exam: 'Motivating prep partner — focus on preparation strategy and career growth.',
    }
    return tones[type] || 'Informative, helpful, and professional mentor-like authority.'
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
            description: 'Full HTML content (1200+ words). Uses [officialWebsiteUrl], [primaryLink], [notificationPdfUrl] placeholders. DO NOT include a Quick Summary box at the beginning.',
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

export async function generateContentWithGemini(data: GeneratePostInput) {
    const parsed = generatePostSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const input = parsed.data
    const { topic, postType, primaryKeywords } = input

    try {
        // 1. Load system prompt
        const systemPrompt = readPromptFile('system.md') || 'You are a specialized content generation assistant.'

        // 2. Load type-specific prompt (fallback to generic)
        const typePrompt = readPromptFile(`${postType}.md`) || readPromptFile('generic.md') || 'Generate a structured article for this topic.'

        // 3. Build keyword seed for enrichment
        const keywordSeed = buildKeywordSeed(topic, postType, primaryKeywords || '')

        // 4. Build factual context from available form data
        const factualContext = buildFactualContext(input)

        // 5. Select random writing style seed for creative variance
        const styleSeed = STYLE_SEEDS[Math.floor(Math.random() * STYLE_SEEDS.length)]

        // 6. Get tone for this post type
        const tone = getToneForType(postType)

        // 7. Construct the full prompt with structured sections
        const fullPrompt = [
            `═══ TOPIC ═══`,
            topic,
            '',
            `═══ POST TYPE: ${postType.toUpperCase()} ═══`,
            '',
            factualContext,
            '',
            `═══ TONE & STYLE ═══`,
            `Tone: ${tone}`,
            `Writing Style Directive: ${styleSeed}`,
            `Target Audience: Government Job Seekers in India (primarily Hindi-belt, 18-35 age group)`,
            '',
            `═══ KEYWORD RESEARCH ═══`,
            keywordSeed,
            '',
            `═══ TYPE-SPECIFIC INSTRUCTIONS ═══`,
            typePrompt,
        ].join('\n')

        // 8. Execute Gemini generation with higher temperature for natural variance
        const response = await ai.models.generateContent({
            model: env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash-preview-05-20',
            contents: fullPrompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: aiResponseSchema as unknown,
                temperature: 0.7, // Higher for natural, creative writing (was 0.5)
            },
        })

        if (!response.text) {
            throw new Error('No text response received from Gemini.')
        }

        const jsonResult = JSON.parse(response.text)

        // 9. Run humanization post-processor on content
        if (jsonResult.content && typeof jsonResult.content === 'string') {
            jsonResult.content = humanizeContent(jsonResult.content)
        }

        return { success: true, data: jsonResult }
    } catch (e: unknown) {
        const error = e instanceof Error ? e.message : 'An unexpected error occurred during AI generation'
        return { error }
    }
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
            .eq('status', 'published')
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
                temperature: 0.3, // Lower temperature for more factual data
            },
        })

        if (!response.text) throw new Error('No response from AI')

        return { success: true, data: JSON.parse(response.text) }
    } catch (e: unknown) {
        return { error: e instanceof Error ? e.message : 'AI Generation failed' }
    }
}

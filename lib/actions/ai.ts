'use server'

import { GoogleGenAI, Type } from '@google/genai'
import fs from 'fs'
import path from 'path'
import { env } from '@/config/env'
import { generatePostSchema, type GeneratePostInput } from '@/lib/validations/post'
import { createServerClient } from '@/lib/supabase/server'
import { humanizeContent } from '@/lib/humanize'
import { sanitizeHtml } from '@/lib/sanitize'

/* ── Gemini Client ────────────────────────────────────────────────── */

const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GENAI_API_KEY })

/* ── Writing Style Seeds ─────────────────────────────────────────── */

/**
 * Randomly selected writing directives injected into each generation
 * to break template fatigue and ensure creative variance.
 */
const STYLE_SEEDS = [
    'Start with a bold factual claim that drops the reader right into the story. No warm-up paragraph.',
    'Open by addressing a common frustration or myth — then promise to set the record straight.',
    'Begin with a direct question that mirrors what the reader is actually searching for.',
    'Start with the most urgent date or deadline — create a "this matters right now" energy.',
    'Open with a surprising data point or year-over-year comparison that hooks attention.',
    'Begin with a personal observation: "I\'ve tracked this exam for years, and here\'s what changed..."',
    'Start by acknowledging what everyone gets wrong about this topic, then correct it.',
    'Open with an inverted pyramid: give the direct answer in the first sentence, then explain why.',
    'Begin with a "but wait" moment — a counterintuitive fact most people don\'t know.',
    'Start conversationally: "Right, so — here\'s what you actually need to know about this."',
    'Open with a mini-checklist of the 3 things that matter most. Then go deep on each.',
    'Begin with empathy: "I know the portal is a mess. Here\'s the no-BS walkthrough."',
    'Start with a strong opinion: "This is the most underrated opportunity this year. Here\'s why."',
    'Open with a comparison to a more popular exam to frame the opportunity correctly.',
    'Begin with the consequence of NOT taking action: "If you miss this deadline, you wait another year."',
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
            description: 'Full HTML content (1800+ words). Human-like tone with contractions, em dashes, varied sentence lengths. Uses [officialWebsiteUrl], [primaryLink], [notificationPdfUrl] placeholders. MUST wrap Key Takeaways in <section id="key-takeaways" data-nosnippet="false">. MUST include an FAQ section using native HTML5 <details> and <summary> tags. DO NOT include a Quick Summary box at the beginning.',
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
                temperature: 0.8, // Higher for human-like creative variance (was 0.7)
            },
        })

        if (!response.text) {
            throw new Error('No text response received from Gemini.')
        }

        const jsonResult = JSON.parse(response.text)

        // 9. Run humanization and HTML sanitization post-processor on content
        if (jsonResult.content && typeof jsonResult.content === 'string') {
            jsonResult.content = sanitizeHtml(humanizeContent(jsonResult.content))
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
                temperature: 0.7,
            },
        })

        if (!response.text) throw new Error('No response from AI')
        
        const tweets: string[] = JSON.parse(response.text)
        return { success: true, data: tweets }
    } catch (error) {
        console.error('Failed to generate Twitter thread:', error)
        return { error: error instanceof Error ? error.message : 'Failed to generate Twitter thread' }
    }
}

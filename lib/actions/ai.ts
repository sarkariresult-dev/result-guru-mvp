'use server'

import { GoogleGenAI, Type } from '@google/genai'
import fs from 'fs'
import path from 'path'
import { env } from '@/config/env'
import { generatePostSchema, type GeneratePostInput } from '@/lib/validations/post'
import { createServerClient } from '@/lib/supabase/server'

/* ── Gemini Client ────────────────────────────────────────────────── */

const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GENAI_API_KEY })

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
            `${topicLower} bharti apply online`, // Removed year
            `${topicLower} sarkari naukri`, // Removed year
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
            `${topicLower} topper marks`, // Removed year
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
            `${topicLower} cut off kitna jayega`, // Removed year
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
        'IMPORTANT SEO CONTEXT:',
        '- Target "People Also Ask" questions in Google India.',
        '- Include Hinglish keyword variations (e.g., "kab aayega", "kaise kare").',
        '- Focus on voice search patterns (conversational queries).',
        '- Always include the organization full name AND abbreviation in content.',
        '- Maintain focus keyword density below 1.2% to avoid over-optimization penalties.',
    ].join('\n')
}

/* ── Response Schema ──────────────────────────────────────────────── */

const aiResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'SEO title (30-65 chars). MUST contain focus keyword + year 2026.',
        },
        ctrTitle: {
            type: Type.STRING,
            description: 'High-CTR alternative title with urgency triggers (≤65 chars). NO emojis, symbols, or icons allowed. Use clean text only.',
        },
        seoTitle: {
            type: Type.STRING,
            description: 'SERP-optimized title, different from display title. Includes the most searched variation of the keyword. MAX 60 chars.',
        },
        metaTitle: {
            type: Type.STRING,
            description: 'SERP meta title (MAX 60 chars). Truncation-safe.',
        },
        metaDescription: {
            type: Type.STRING,
            description: 'Meta description (120-155 chars). MUST contain focus keyword and end with CTA.',
        },
        slug: {
            type: Type.STRING,
            description: 'Clean URL slug (≤60 chars). No stop words. Contains focus keyword.',
        },
        focusKeyword: {
            type: Type.STRING,
            description: 'Primary long-tail keyword phrase (3-5 words, specific not generic).',
        },
        secondaryKeywords: {
            type: Type.ARRAY,
            description: 'Minimum 3 secondary keywords including semantic variations.',
            items: { type: Type.STRING },
        },
        longTailKeywords: {
            type: Type.ARRAY,
            description: '5-8 highly specific long-tail keyword phrases targeting PAA, voice search, and featured snippets.',
            items: { type: Type.STRING },
        },
        semanticKeywords: {
            type: Type.ARRAY,
            description: '5-10 NLP entity terms (full-form expansions, related bodies, processes) Google associates with topic.',
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
            description: 'Rich snippet excerpt (50-200 chars).',
        },
        content: {
            type: Type.STRING,
            description: 'Full HTML content (1200+ words). Uses [officialWebsiteUrl], [primaryLink], [notificationPdfUrl] placeholders. MUST start with a Quick Summary Box.',
        },
        officialWebsiteUrl: {
            type: Type.STRING,
            description: 'Official domain URL. REQUIRED.',
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
            description: '5-8 frequently asked questions with concise answers. Target PAA questions.',
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
            },
        },
        readabilityScore: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                level: { type: Type.STRING },
            },
            required: ['score', 'level'],
        },
    },
    required: [
        'title', 'ctrTitle', 'seoTitle', 'metaTitle', 'metaDescription', 'slug',
        'focusKeyword', 'secondaryKeywords', 'longTailKeywords', 'semanticKeywords',
        'suggestedTags', 'suggestedQualifications',
        'excerpt', 'content',
        'officialWebsiteUrl', 'primaryLink', 'notificationPdfUrl',
        'faq', 'readabilityScore',
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

/* ── Auto-assign Content Cluster ──────────────────────────────────── */

/**
 * Find the matching content_cluster for a post based on organization.
 * Returns the cluster ID if found.
 */
async function findContentCluster(organizationId: string | null | undefined): Promise<string | null> {
    if (!organizationId) return null
    try {
        const supabase = await createServerClient()
        // Find the org slug first
        const { data: org } = await supabase
            .from('organizations')
            .select('slug')
            .eq('id', organizationId)
            .single()
        if (!org) return null

        // Find matching cluster
        const { data: cluster } = await supabase
            .from('content_clusters')
            .select('id')
            .eq('slug', org.slug)
            .eq('cluster_type', 'org')
            .single()

        return cluster?.id ?? null
    } catch {
        return null
    }
}

/* ── Auto-compute Related Posts ───────────────────────────────────── */

/**
 * Uses the database function to compute related posts after creation.
 */
async function computeRelatedPosts(postId: string): Promise<string[]> {
    try {
        const supabase = await createServerClient()
        const { data } = await supabase.rpc('fn_compute_related_posts', {
            target_post_id: postId,
        })
        return (data as string[]) ?? []
    } catch {
        return []
    }
}

/* ── Main Generation Function ─────────────────────────────────────── */

export async function generateContentWithGemini(data: GeneratePostInput) {
    const parsed = generatePostSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const { topic, postType, tone, targetAudience, primaryKeywords } = parsed.data

    try {
        // 1. Load system prompt
        const systemPrompt = readPromptFile('system.md') || 'You are a specialized content generation assistant.'

        // 2. Load type-specific prompt (fallback to generic)
        const typePrompt = readPromptFile(`${postType}.md`) || readPromptFile('generic.md') || 'Generate a structured article for this topic.'

        // 3. Build keyword seed for enrichment
        const keywordSeed = buildKeywordSeed(topic, postType, primaryKeywords || '')

        // 4. Construct the full prompt
        const fullPrompt = [
            `Topic: ${topic}`,
            `Post Type: ${postType}`,
            `Tone: ${tone}`,
            `Target Audience: ${targetAudience}`,
            primaryKeywords ? `Primary Keywords: ${primaryKeywords}` : '',
            '',
            '--- Keyword Research Context ---',
            keywordSeed,
            '',
            '--- Post Type Instructions ---',
            typePrompt,
        ].filter(Boolean).join('\n')

        // 5. Execute Gemini generation
        const response = await ai.models.generateContent({
            model: env.GOOGLE_GENAI_MODEL || 'gemini-2.5-flash-preview-05-20',
            contents: fullPrompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
                responseSchema: aiResponseSchema as any, // Typed as any due to Gemini SDK complexity
                temperature: env.GOOGLE_GENAI_TEMPERATURE ?? 0.5,
            },
        })

        if (!response.text) {
            throw new Error('No text response received from Gemini.')
        }

        const jsonResult = JSON.parse(response.text)
        return { success: true, data: jsonResult }
    } catch (e: unknown) {
        const error = e instanceof Error ? e.message : 'An unexpected error occurred during AI generation'

        return { error }
    }
}

/* ── Post-Creation SEO Enhancement ────────────────────────────────── */

/**
 * Call this AFTER creating a post to enhance it with SEO intelligence.
 * Stores long-tail keywords, computes related posts, and assigns content clusters.
 */
export async function enhancePostSEO(postId: string, aiData: Record<string, unknown>, organizationId?: string | null) {
    try {
        const supabase = await createServerClient()

        const updates: Record<string, unknown> = {}

        // 1. Store long-tail and semantic keywords
        if (aiData.longTailKeywords && Array.isArray(aiData.longTailKeywords)) {
            updates.long_tail_keywords = aiData.longTailKeywords
        }
        if (aiData.semanticKeywords && Array.isArray(aiData.semanticKeywords)) {
            updates.semantic_keywords = aiData.semanticKeywords
        }

        // 2. Store SEO title
        if (aiData.seoTitle && typeof aiData.seoTitle === 'string') {
            updates.seo_title = aiData.seoTitle
        }

        // 3. Auto-assign content cluster
        const clusterId = await findContentCluster(organizationId)
        if (clusterId) {
            updates.content_cluster_id = clusterId
        }

        // 4. Compute and store related posts
        const relatedIds = await computeRelatedPosts(postId)
        if (relatedIds.length > 0) {
            updates.related_post_ids = relatedIds
        }

        // 5. Apply updates
        if (Object.keys(updates).length > 0) {
            await supabase.from('posts').update(updates).eq('id', postId)
        }

        // 6. Update cluster post count (non-critical)
        if (clusterId) {
            try {
                const { count: clusterPostCount } = await supabase
                    .from('posts')
                    .select('id', { count: 'exact', head: true })
                    .eq('content_cluster_id', clusterId)
                    .eq('status', 'published')

                if (clusterPostCount !== null) {
                    await supabase
                        .from('content_clusters')
                        .update({ post_count: clusterPostCount })
                        .eq('id', clusterId)
                }
            } catch {
                // Non-critical - cluster count will eventually correct itself
            }
        }

        return { success: true }
    } catch (e: unknown) {
        const error = e instanceof Error ? e.message : 'Unknown SEO enhancement error'

        return { error }
    }
}

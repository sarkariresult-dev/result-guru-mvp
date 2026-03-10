'use server'

import { z } from 'zod'
import { GoogleGenAI, Type } from '@google/genai'
import fs from 'fs'
import path from 'path'
import { env } from '@/config/env'


// Initialize the Gemini client
// Note: Requires GOOGLE_GENAI_API_KEY environment variable (it falls back to process.env if empty object passed)
const ai = new GoogleGenAI({
    apiKey: env.GOOGLE_GENAI_API_KEY
})

// Define the expected output schema matching the prompt's request for structured data
const aiResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "Catchy SEO Title (30-65 chars). MUST contain Focus Keyword in first 60 chars. MUST include current year (2026)."
        },
        metaTitle: {
            type: Type.STRING,
            description: "SEO Meta Title (MAX 60 chars). Truncation-safe."
        },
        metaDescription: {
            type: Type.STRING,
            description: "Meta Description (120-155 chars). MUST contain Focus Keyword."
        },
        slug: {
            type: Type.STRING,
            description: "Clean URL slug (MAX 60 chars). No stop words (the, and, for, etc.). MUST contain Focus Keyword."
        },
        focusKeyword: {
            type: Type.STRING,
            description: "Primary Keyword"
        },
        secondaryKeywords: {
            type: Type.ARRAY,
            description: "Minimum 2 Secondary keywords, naturally used in content.",
            items: {
                type: Type.STRING
            }
        },
        suggestedTags: {
            type: Type.ARRAY,
            description: "A list of 3-5 highly relevant tag slugs (e.g. ['btech', 'police', 'state-level']) specifically adapted to the entity context.",
            items: {
                type: Type.STRING
            }
        },
        suggestedQualifications: {
            type: Type.ARRAY,
            description: "A list of required qualifications (e.g. ['10th', '12th', 'graduation', 'pg'])",
            items: {
                type: Type.STRING
            }
        },
        excerpt: {
            type: Type.STRING,
            description: "Rich snippet excerpt (MIN 50 chars)."
        },
        content: {
            type: Type.STRING,
            description: "Full HTML formatted content. Use placeholders [officialWebsiteUrl], [applyOnlineUrl], and [notificationPdfUrl] for all external links."
        },
        officialWebsiteUrl: {
            type: Type.STRING,
            description: "Official domain (e.g., https://uppcb.up.nic.in). REQUIRED."
        },
        applyOnlineUrl: {
            type: Type.STRING,
            description: "Direct recruitment/apply link. REQUIRED."
        },
        notificationPdfUrl: {
            type: Type.STRING,
            description: "Direct PDF link or best guess. REQUIRED."
        },
        faq: {
            type: Type.ARRAY,
            description: "Frequently Asked Questions",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
            }
        },
        schemaJson: {
            // Note: Specifying this as Type.OBJECT allows any standard schema structure
            type: Type.OBJECT,
            description: "Generate valid JSON-LD for Article or BlogPosting here."
        },
        readabilityScore: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER },
                level: { type: Type.STRING }
            },
            required: ["score", "level"]
        }
    },
    required: ["title", "metaTitle", "metaDescription", "focusKeyword", "secondaryKeywords", "suggestedTags", "suggestedQualifications", "excerpt", "content", "officialWebsiteUrl", "applyOnlineUrl", "notificationPdfUrl", "faq", "schemaJson", "readabilityScore"],
}

import { generatePostSchema, type GeneratePostInput } from '@/lib/validations/post'

export async function generateContentWithGemini(data: GeneratePostInput) {
    const parsed = generatePostSchema.safeParse(data)
    if (!parsed.success) {
        return { error: parsed.error.issues.map(i => i.message).join(', ') }
    }

    const { topic, postType, tone, targetAudience, primaryKeywords } = parsed.data

    try {
        // Read the system prompt
        const systemPromptPath = path.join(process.cwd(), 'config', 'prompts', 'system.md')
        let systemPrompt = "You are a specialized content generation assistant."
        try {
            systemPrompt = fs.readFileSync(systemPromptPath, 'utf8')
        } catch (e) {
            console.warn("Could not load config/prompts/system.md, using fallback")
        }

        // Read the specific type prompt, fallback to generic
        const typePromptPath = path.join(process.cwd(), 'config', 'prompts', `${postType}.md`)
        const genericPromptPath = path.join(process.cwd(), 'config', 'prompts', `generic.md`)

        let typePrompt = ""
        try {
            if (fs.existsSync(typePromptPath)) {
                typePrompt = fs.readFileSync(typePromptPath, 'utf8')
            } else {
                typePrompt = fs.readFileSync(genericPromptPath, 'utf8')
            }
        } catch (e) {
            typePrompt = "Generate a structured article for this topic."
        }

        // Construct the full prompt
        const fullPrompt = `
Topic: ${topic}
Tone: ${tone}
Target Audience: ${targetAudience}
Primary Keywords (if any): ${primaryKeywords || 'None provided'}

Specific Post Type Instructions:
${typePrompt}
        `

        // Execute Gemini generation
        const response = await ai.models.generateContent({
            model: env.GOOGLE_GENAI_MODEL || 'gemini-3-flash-preview',
            contents: fullPrompt,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: aiResponseSchema as any,
                temperature: env.GOOGLE_GENAI_TEMPERATURE ?? 0.4 // Slightly deterministic but creative enough
            }
        })

        if (!response.text) {
            throw new Error("No text response received from Gemini.")
        }

        // At this point we are confident the response parses as JSON because of responseSchema
        const jsonResult = JSON.parse(response.text)

        return { success: true, data: jsonResult }

    } catch (e: any) {
        console.error("Error generating content:", e)
        return { error: e.message || 'An unexpected error occurred during AI generation' }
    }
}

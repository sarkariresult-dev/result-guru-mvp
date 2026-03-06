// =============================================================
// automation.types.ts — Result Guru
// Mirrors 009_automation.sql — AI pipeline, templates.
// =============================================================

import type { PostType } from './enums'

// ── Raw inbound topic ──────────────────────────────────────
export interface Topic {
    id: string
    source_url: string
    source_name: string | null
    raw_title: string | null
    raw_text: string | null
    suggested_type: PostType | null
    suggested_state: string | null
    suggested_org_id: string | null
    priority: number
    processed: boolean
    processing_error: string | null
    generated_post_id: string | null
    created_at: string
    processed_at: string | null
}

// ── LLM prompt template ────────────────────────────────────
export interface AiTemplate {
    id: string
    name: string
    post_type: PostType | null
    system_prompt: string
    /** Supports {{title}}, {{org}}, {{state}} placeholders */
    user_prompt: string
    model: string
    max_tokens: number
    temperature: number
    is_active: boolean
    created_at: string
}

// ── JSON-LD schema template ────────────────────────────────
export interface SchemaTemplate {
    id: string
    name: string
    post_type: PostType | null
    schema_type: string           // e.g. 'JobPosting', 'FAQPage'
    /** Template JSON with {{placeholder}} variables */
    template: Record<string, unknown>
    description: string | null
    is_active: boolean
    created_at: string
}

// ── Topic create payload ───────────────────────────────────
export interface CreateTopicPayload {
    source_url: string
    source_name?: string
    raw_title?: string
    raw_text?: string
    suggested_type?: PostType
    suggested_state?: string
    suggested_org_id?: string
    priority?: number
}

// ── AI generation request ──────────────────────────────────
export interface AiGenerationRequest {
    topic_id: string
    template_id?: string
    overrides?: {
        title?: string
        org_id?: string
        state?: string
        post_type?: PostType
    }
}

// ── AI generation result ───────────────────────────────────
export interface AiGenerationResult {
    success: boolean
    post_id?: string
    error?: string
    tokens_used?: number
}

// ── Schema render context ──────────────────────────────────
// Values to substitute into schema template {{placeholders}}
export interface SchemaRenderContext {
    title: string
    excerpt?: string | null
    org_name?: string | null
    org_official_url?: string | null
    state_name?: string | null
    published_at?: string | null
    content_updated_at?: string | null
    og_image?: string | null
    apply_end?: string | null
    pay_scale_min?: number | null
    exam_date?: string | null
    site_name?: string
    site_logo?: string
    faq_items?: unknown
}
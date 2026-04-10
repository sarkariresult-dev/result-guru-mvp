/**
 * PostForm Context - Centralized state management for the post editor.
 *
 * Replaces 40+ useState calls with a single useReducer.
 * Provides auto-save, SEO scoring, and type-safe state access.
 */
'use client'

import { createContext, useContext, useReducer, useEffect, useMemo, type ReactNode } from 'react'
import { runSeoAnalysis, type SeoAnalysisResult } from '@/lib/seo/seo-analyzer'

// ── State Shape ──────────────────────────────────────────────────────────────

export interface FaqItem { question: string; answer: string }

export interface PostFormState {
    // Identity
    type: string
    status: string
    title: string
    slug: string
    slugManual: boolean // true = user has manually edited slug

    // Content
    excerpt: string
    content: string

    // Dates
    applicationStartDate: string
    applicationEndDate: string

    // Taxonomy
    stateSlug: string
    organizationId: string
    categoryId: string
    qualifications: string[]
    tagIds: string[]

    // Files
    featuredImage: string
    featuredImageAlt: string
    notificationPdf: string

    // Structured
    faq: FaqItem[]

    // Links
    primaryLink: string

    // SEO
    metaTitle: string
    metaDescription: string
    focusKeyword: string
    secondaryKeywords: string[]
    noindex: boolean
    canonicalUrl: string

    // Social
    ogTitle: string
    ogDescription: string
    ogImage: string

    // Publishing
    authorId: string
    publishedAt: string
    scheduledAt: string

    // UI state
    isDirty: boolean
    lastSavedAt: number | null
}

// ── Actions ──────────────────────────────────────────────────────────────────

type PostFormAction =
    | { type: 'SET_FIELD'; field: keyof PostFormState; value: unknown }
    | { type: 'SET_TITLE'; value: string }
    | { type: 'SET_SLUG'; value: string }
    | { type: 'SET_TYPE'; value: string }
    | { type: 'SET_PRIMARY_LINK'; payload: string }
    | { type: 'SET_FAQ'; value: FaqItem[] }
    | { type: 'ADD_FAQ' }
    | { type: 'REMOVE_FAQ'; index: number }
    | { type: 'UPDATE_FAQ'; index: number; field: 'question' | 'answer'; value: string }
    | { type: 'ADD_SECONDARY_KEYWORD'; keyword: string }
    | { type: 'REMOVE_SECONDARY_KEYWORD'; index: number }
    | { type: 'TOGGLE_QUALIFICATION'; slug: string }
    | { type: 'SET_QUALIFICATIONS'; slugs: string[] }
    | { type: 'TOGGLE_TAG'; tagId: string }
    | { type: 'SET_TAGS'; tagIds: string[] }
    | { type: 'MARK_SAVED' }
    | { type: 'LOAD_FROM_AI'; data: Partial<PostFormState> }
    | { type: 'LOAD_DRAFT'; data: Partial<PostFormState> }
    | { type: 'RESET' }

// ── Slug helper ──────────────────────────────────────────────────────────────

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 120)
}

// ── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: PostFormState, action: PostFormAction): PostFormState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value, isDirty: true }

        case 'SET_TITLE': {
            const next: PostFormState = { ...state, title: action.value, isDirty: true }
            // Auto-slug only if user hasn't manually edited slug
            if (!state.slugManual) next.slug = slugify(action.value || 'untitled')
            return next
        }

        case 'SET_SLUG':
            return { ...state, slug: action.value, slugManual: true, isDirty: true }

        case 'SET_TYPE':
            return { ...state, type: action.value, isDirty: true }

        case 'SET_PRIMARY_LINK':
            return { ...state, primaryLink: action.payload, isDirty: true }

        case 'SET_FAQ':
            return { ...state, faq: action.value, isDirty: true }

        case 'ADD_FAQ':
            return { ...state, faq: [...state.faq, { question: '', answer: '' }], isDirty: true }

        case 'REMOVE_FAQ':
            return { ...state, faq: state.faq.filter((_, i) => i !== action.index), isDirty: true }

        case 'UPDATE_FAQ': {
            const faq = [...state.faq]
            const item = faq[action.index]
            if (item) faq[action.index] = { ...item, [action.field]: action.value }
            return { ...state, faq, isDirty: true }
        }

        case 'ADD_SECONDARY_KEYWORD': {
            const kw = action.keyword.trim()
            if (!kw || state.secondaryKeywords.includes(kw)) return state
            return { ...state, secondaryKeywords: [...state.secondaryKeywords, kw], isDirty: true }
        }

        case 'REMOVE_SECONDARY_KEYWORD':
            return { ...state, secondaryKeywords: state.secondaryKeywords.filter((_, i) => i !== action.index), isDirty: true }

        case 'TOGGLE_QUALIFICATION': {
            const next = state.qualifications.includes(action.slug)
                ? state.qualifications.filter(q => q !== action.slug)
                : [...state.qualifications, action.slug]
            return { ...state, qualifications: next, isDirty: true }
        }

        case 'SET_QUALIFICATIONS':
            return { ...state, qualifications: action.slugs, isDirty: true }

        case 'TOGGLE_TAG': {
            const next = state.tagIds.includes(action.tagId)
                ? state.tagIds.filter(t => t !== action.tagId)
                : [...state.tagIds, action.tagId]
            return { ...state, tagIds: next, isDirty: true }
        }

        case 'SET_TAGS':
            return { ...state, tagIds: action.tagIds, isDirty: true }

        case 'MARK_SAVED':
            return { ...state, isDirty: false, lastSavedAt: Date.now() }

        case 'LOAD_FROM_AI':
            return { ...state, ...action.data, isDirty: true }

        case 'LOAD_DRAFT':
            return { ...state, ...action.data, isDirty: false }

        case 'RESET':
            return createInitialState({ author_id: state.authorId })

        default:
            return state
    }
}

// ── Initial State ────────────────────────────────────────────────────────────

function createInitialState(initialData?: Record<string, unknown>): PostFormState {
    const d = initialData ?? {}
    // FAQ comes from DB as {q, a} → remap to {question, answer}
    const rawFaq = (d.faq as Array<{ q?: string; a?: string; question?: string; answer?: string }>) ?? []
    const faq: FaqItem[] = rawFaq.map(f => ({
        question: f.question ?? f.q ?? '',
        answer: f.answer ?? f.a ?? '',
    }))

    // Tags come from post_tags join: [{post_id, tag_id}, ...]
    const rawTags = (d.post_tags as Array<{ tag_id: string }>) ?? []
    const tagIds = rawTags.map(t => t.tag_id)

    return {
        type: (d.type as string) ?? 'job',
        status: (d.status as string) ?? 'draft',
        title: (d.title as string) ?? '',
        slug: (d.slug as string) ?? '',
        slugManual: !!d.slug,
        excerpt: (d.excerpt as string) ?? '',
        content: (d.content as string) ?? '',
        applicationStartDate: (d.application_start_date as string) ?? '',
        applicationEndDate: (d.application_end_date as string) ?? '',
        stateSlug: (d.state_slug as string) ?? '',
        organizationId: (d.organization_id as string) ?? '',
        categoryId: (d.category_id as string) ?? '',
        qualifications: (d.qualification as string[]) ?? [],
        tagIds,
        featuredImage: (d.featured_image as string) ?? '',
        featuredImageAlt: (d.featured_image_alt as string) ?? '',
        notificationPdf: (d.notification_pdf as string) ?? '',
        faq,
        primaryLink: (d.primary_link as string) ?? '',
        metaTitle: (d.meta_title as string) ?? '',
        metaDescription: (d.meta_description as string) ?? '',
        focusKeyword: (d.focus_keyword as string) ?? '',
        secondaryKeywords: (d.secondary_keywords as string[]) ?? [],
        noindex: (d.noindex as boolean) ?? false,
        canonicalUrl: (d.canonical_url as string) ?? '',
        ogTitle: (d.og_title as string) ?? '',
        ogDescription: (d.og_description as string) ?? '',
        ogImage: (d.og_image as string) ?? '',
        authorId: (d.author_id as string) ?? '',
        publishedAt: (d.published_at as string) ?? '',
        scheduledAt: (d.scheduled_at as string) ?? '',
        isDirty: false,
        lastSavedAt: null,
    }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface PostFormContextValue {
    state: PostFormState
    dispatch: React.Dispatch<PostFormAction>
    seo: SeoAnalysisResult
    mode: 'create' | 'edit'
    initialData?: Record<string, unknown>
}

const PostFormContext = createContext<PostFormContextValue | null>(null)

export function usePostForm(): PostFormContextValue {
    const ctx = useContext(PostFormContext)
    if (!ctx) throw new Error('usePostForm must be used within PostFormProvider')
    return ctx
}

// ── Auto-Save Hook ───────────────────────────────────────────────────────────

const DRAFT_KEY = 'rg_post_draft_v2'

function useAutoSave(state: PostFormState, mode: 'create' | 'edit') {
    // Save to localStorage (only for new post creation)
    useEffect(() => {
        if (mode !== 'create' || !state.isDirty) return

        const timer = setTimeout(() => {
            try {
                const draft: Partial<PostFormState> = {
                    type: state.type,
                    title: state.title,
                    slug: state.slug,
                    slugManual: state.slugManual,
                    excerpt: state.excerpt,
                    content: state.content,
                    applicationStartDate: state.applicationStartDate,
                    applicationEndDate: state.applicationEndDate,
                    stateSlug: state.stateSlug,
                    organizationId: state.organizationId,
                    categoryId: state.categoryId,
                    qualifications: state.qualifications,
                    tagIds: state.tagIds,
                    metaTitle: state.metaTitle,
                    metaDescription: state.metaDescription,
                    focusKeyword: state.focusKeyword,
                    secondaryKeywords: state.secondaryKeywords,
                    faq: state.faq,
                    primaryLink: state.primaryLink,
                }
                localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
            } catch { /* storage full or unavailable */ }
        }, 1500)

        return () => clearTimeout(timer)
    }, [state, mode])
}

// ── Provider ─────────────────────────────────────────────────────────────────

interface PostFormProviderProps {
    children: ReactNode
    mode: 'create' | 'edit'
    initialData?: Record<string, unknown>
    authorId: string
}

export function PostFormProvider({ children, mode, initialData, authorId }: PostFormProviderProps) {
    const [state, dispatch] = useReducer(reducer, { ...initialData, author_id: authorId }, createInitialState)

    // Restore draft for new posts
    useEffect(() => {
        if (mode !== 'create') return
        try {
            const draftStr = localStorage.getItem(DRAFT_KEY)
            if (draftStr) {
                const draft = JSON.parse(draftStr) as Partial<PostFormState>
                if (draft.title) dispatch({ type: 'LOAD_DRAFT', data: draft })
            }
        } catch { /* ignore */ }
    }, [mode])

    useAutoSave(state, mode)

    // Compute SEO analysis (memoized)
    const seo = useMemo(() => runSeoAnalysis({
        title: state.title,
        slug: state.slug,
        metaTitle: state.metaTitle,
        metaDescription: state.metaDescription,
        focusKeyword: state.focusKeyword,
        secondaryKeywords: state.secondaryKeywords,
        content: state.content,
        excerpt: state.excerpt,
        featuredImage: state.featuredImage,
        featuredImageAlt: state.featuredImageAlt,
        faqCount: state.faq.length,
        postType: state.type,
        authorId: state.authorId,
        // Guru SEO 2.0 Contextual Fields
        orgName: (initialData?.org_name as string) ?? null,
        orgShortName: (initialData?.org_short_name as string) ?? null,
        stateName: (initialData?.state_name as string) ?? null,
        updatedAt: (initialData?.updated_at as string) || new Date().toISOString(),
        primaryLink: state.primaryLink,
        notificationPdf: state.notificationPdf,
    }), [
        state.title, state.slug, state.metaTitle, state.metaDescription,
        state.focusKeyword, state.secondaryKeywords, state.content,
        state.excerpt, state.featuredImage, state.featuredImageAlt,
        state.faq.length, state.type, state.authorId, 
        state.primaryLink, state.notificationPdf,
        initialData?.org_name, initialData?.org_short_name, initialData?.state_name, initialData?.updated_at
    ])

    const value = useMemo<PostFormContextValue>(() => ({
        state,
        dispatch,
        seo,
        mode,
        initialData,
    }), [state, dispatch, seo, mode, initialData])

    return <PostFormContext value={value}>{children}</PostFormContext>
}

// ── Helper to clear draft ────────────────────────────────────────────────────

export function clearPostDraft(): void {
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
}

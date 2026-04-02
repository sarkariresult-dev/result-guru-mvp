/**
 * PostForm v2 - Modular orchestrator.
 *
 * Thin wrapper that composes section components with context.
 * All form state lives in PostFormContext via useReducer.
 */
'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Keyboard, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createPost, updatePost } from '@/features/posts/actions'
import { PostFormProvider, usePostForm, clearPostDraft } from './PostFormContext'
import { ContentSection } from './ContentSection'
import { TaxonomySection } from './TaxonomySection'
import { SeoSection } from './SeoSection'
import { PublishSection } from './PublishSection'
import { MediaSection } from './MediaSection'
import { SeoModal } from './SeoScoreWidget'

// ── Types ────────────────────────────────────────────────────────────────────

interface Option { value: string; label: string }
interface TagOption extends Option { tag_type?: string }

interface PostFormV2Props {
    authorId: string
    authUserId: string
    states: Option[]
    organizations: Option[]
    categories: Option[]
    qualifications: Option[]
    tags: TagOption[]
    initialData?: Record<string, unknown>
    mode?: 'create' | 'edit'
}

// ── Inner Form (has access to context) ───────────────────────────────────────

function PostFormInner({
    authUserId,
    states,
    organizations,
    categories,
    qualifications,
    tags,
}: Omit<PostFormV2Props, 'authorId' | 'initialData'>) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [showSeoModal, setShowSeoModal] = useState(false)
    const [pendingSaveAs, setPendingSaveAs] = useState<'draft' | 'published'>('draft')
    const { state, dispatch, mode, initialData } = usePostForm()

    // ── Keyboard shortcuts ──
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Ctrl/Cmd + S = Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault()
                if (state.title) triggerSave('draft')
            }
            // Ctrl/Cmd + Shift + P = Publish
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
                e.preventDefault()
                if (state.title) triggerSave('published')
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [state.title]) // eslint-disable-line react-hooks/exhaustive-deps

    const triggerSave = useCallback((saveAs: 'draft' | 'published') => {
        setPendingSaveAs(saveAs)
        setShowSeoModal(true)
    }, [])

    const doSubmit = useCallback(() => {
        setShowSeoModal(false)
        setError(null)

        startTransition(async () => {
            // Map context state → DB column names (matches 007_posts.sql)
            const data = {
                type: state.type,
                status: pendingSaveAs as import('@/types/enums').PostStatus,
                application_start_date: state.applicationStartDate || null,
                application_end_date: state.applicationEndDate || null,
                title: state.title,
                slug: state.slug,
                excerpt: state.excerpt || null,
                content: state.content || null,
                state_slug: state.stateSlug || null,
                organization_id: state.organizationId || null,
                qualification: state.qualifications.length > 0 ? state.qualifications : null,
                category_id: state.categoryId || null,
                notification_pdf: state.notificationPdf || null,
                featured_image: state.featuredImage || null,
                featured_image_alt: state.featuredImageAlt || state.title || null,
                faq: state.faq.map(f => ({ q: f.question, a: f.answer })),
                admit_card_link: state.admitCardLink || null,
                result_link: state.resultLink || null,
                answer_key_link: state.answerKeyLink || null,
                meta_title: state.metaTitle || null,
                meta_description: state.metaDescription || null,
                focus_keyword: state.focusKeyword || null,
                secondary_keywords: state.secondaryKeywords.length > 0 ? state.secondaryKeywords : null,
                noindex: state.noindex,
                canonical_url: state.canonicalUrl || null,
                og_title: state.ogTitle || state.metaTitle || state.title || null,
                og_description: state.ogDescription || state.metaDescription || state.excerpt || null,
                og_image: state.ogImage || state.featuredImage || null,
                author_id: state.authorId || null,
                published_at: pendingSaveAs === 'published' ? new Date().toISOString() : null,
                tag_ids: state.tagIds.filter(id => !!id).length > 0
                    ? state.tagIds.filter(id => !!id)
                    : undefined,
            }

            const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '/author'

            try {
                if (mode === 'edit' && initialData?.id) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const result = await updatePost(initialData.id as string, data as any)
                    if (result?.error) {
                        setError(typeof result.error === 'string' ? result.error : 'Failed to update')
                    } else {
                        clearPostDraft()
                        dispatch({ type: 'RESET' })
                        router.push(`${basePath}/posts`)
                    }
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const result: { error?: string; success?: boolean } = await createPost(data as any)
                    if (result?.error) {
                        setError(result.error)
                    } else if (result?.success) {
                        clearPostDraft()
                        dispatch({ type: 'RESET' })
                        router.push(`${basePath}/posts`)
                    }
                }
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred')
            }
        })
    }, [state, pendingSaveAs, mode, initialData, dispatch, router])

    const handleCancel = () => {
        dispatch({ type: 'RESET' })
        clearPostDraft()
        router.back()
    }

    return (
        <div className="min-h-screen -m-6">
            {/* SEO Modal */}
            {showSeoModal && (
                <SeoModal
                    onClose={() => setShowSeoModal(false)}
                    onProceed={doSubmit}
                    saveLabel={pendingSaveAs === 'published' ? 'Publish' : 'Save'}
                />
            )}

            {/* ── Top Bar ── */}
            <div className="border-b border-border bg-surface/95 backdrop-blur-sm p-3">
                <div className="flex items-center gap-3">
                    <input
                        aria-label="Post Title"
                        value={state.title}
                        onChange={e => dispatch({ type: 'SET_TITLE', value: e.target.value })}
                        placeholder="Enter post title…"
                        className="flex-1 min-w-0 border-0 bg-transparent text-xl font-bold text-foreground placeholder:text-foreground-subtle/40 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Save status indicator */}
                        {state.isDirty && (
                            <span className="text-[10px] text-yellow-600 dark:text-yellow-400 animate-pulse">
                                Unsaved
                            </span>
                        )}
                        {state.lastSavedAt && !state.isDirty && (
                            <span className="text-[10px] text-green-600 dark:text-green-400">
                                ✓ Saved
                            </span>
                        )}
                        <Button variant="ghost" onClick={handleCancel} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button variant="secondary" disabled={isPending || !state.title} onClick={() => triggerSave('draft')}>
                            <Save className="size-4" /> {isPending ? 'Saving…' : 'Save Draft'}
                        </Button>
                        <Button disabled={isPending || !state.title} onClick={() => triggerSave('published')}>
                            <CheckCircle2 className="size-4" />{' '}
                            {isPending
                                ? (mode === 'edit' ? 'Updating…' : 'Publishing…')
                                : (mode === 'edit' ? 'Update' : 'Publish')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* ── Main Layout ── */}
            <div className="flex gap-6 p-6">
                {/* LEFT: Main Content */}
                <div className="flex-1 min-w-0">
                    <ContentSection authUserId={authUserId} />
                </div>

                {/* RIGHT: Sidebar */}
                <div className="w-80 shrink-0 space-y-4">
                    <PublishSection qualifications={qualifications} tags={tags} />
                    <TaxonomySection
                        states={states}
                        organizations={organizations}
                        categories={categories}
                        qualifications={qualifications}
                        tags={tags}
                    />
                    <MediaSection authUserId={authUserId} />
                    <SeoSection />
                </div>
            </div>
        </div>
    )
}

// ── Exported component (wraps with Provider) ─────────────────────────────────

export function PostForm({
    authorId,
    authUserId,
    states,
    organizations,
    categories,
    qualifications,
    tags,
    initialData,
    mode = 'create',
}: PostFormV2Props) {
    return (
        <PostFormProvider mode={mode} initialData={initialData} authorId={authorId}>
            <PostFormInner
                authUserId={authUserId}
                states={states}
                organizations={organizations}
                categories={categories}
                qualifications={qualifications}
                tags={tags}
                mode={mode}
            />
        </PostFormProvider>
    )
}

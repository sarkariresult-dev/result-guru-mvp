/**
 * Publish Section - Post type, AI generation, application dates.
 */
'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import { usePostForm } from './PostFormContext'
import { Panel, Field, inputCls, selectCls, toISODate } from './primitives'
import { TYPE_CONFIG } from './type-config'
import { generateContentWithGemini } from '@/lib/actions/ai'
import { replacePlaceholders } from '@/lib/content-processing'

const POST_TYPES = Object.entries(TYPE_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
}))

interface PublishSectionProps {
    qualifications: { value: string; label: string }[]
    tags: { value: string; label: string; tag_type?: string }[]
}

export function PublishSection({ qualifications, tags }: PublishSectionProps) {
    const { state, dispatch, mode } = usePostForm()
    const cfg = TYPE_CONFIG[state.type] ?? TYPE_CONFIG.job!
    const [isGenerating, setIsGenerating] = useState(false)
    const [aiGenerated, setAiGenerated] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGenerateAI = async () => {
        if (!state.title.trim()) {
            setError('Please enter a Post Title first.')
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            const result = await generateContentWithGemini({
                topic: state.title,
                postType: state.type,
                tone: 'Informative and Urgent',
                targetAudience: 'Government Job Seekers in India',
                primaryKeywords: state.focusKeyword || '',
            })

            if (result.error) {
                setError(result.error)
                return
            }

            if (result.success && result.data) {
                const d = result.data

                /* eslint-disable @typescript-eslint/no-explicit-any */
                const update: Record<string, any> = {}

                // Prefer CTR title (has urgency triggers) over plain title
                if (d.ctrTitle) update.title = d.ctrTitle
                else if (d.title) update.title = d.title

                if (d.slug) { update.slug = d.slug; update.slugManual = true }
                if (d.excerpt) update.excerpt = d.excerpt
                if (d.metaTitle) update.metaTitle = d.metaTitle
                if (d.metaDescription) update.metaDescription = d.metaDescription
                if (d.focusKeyword) update.focusKeyword = d.focusKeyword

                // Merge secondary + long-tail + semantic keywords (deduplicated)
                const allKeywords = new Set<string>()
                for (const kw of d.secondaryKeywords ?? []) allKeywords.add(kw)
                for (const kw of d.longTailKeywords ?? []) allKeywords.add(kw)
                for (const kw of d.semanticKeywords ?? []) allKeywords.add(kw)
                if (allKeywords.size > 0) update.secondaryKeywords = [...allKeywords]

                // Process content placeholders
                if (d.content) {
                    update.content = replacePlaceholders(d.content, {
                        officialWebsiteUrl: d.officialWebsiteUrl,
                        applyOnlineUrl: d.applyOnlineUrl,
                        notificationPdfUrl: d.notificationPdfUrl,
                    })
                }

                // FAQ
                if (d.faq) {
                    update.faq = d.faq.map((f: any) => ({
                        question: f.question ?? f.q ?? '',
                        answer: f.answer ?? f.a ?? '',
                    }))
                }

                // Links
                if (d.notificationPdfUrl) update.notificationPdf = d.notificationPdfUrl
                if (d.applyOnlineUrl) {
                    const t = state.type
                    if (t === 'admit') update.admitCardLink = d.applyOnlineUrl
                    else if (t === 'result' || t === 'cut_off') update.resultLink = d.applyOnlineUrl
                    else if (t === 'answer_key') update.answerKeyLink = d.applyOnlineUrl
                }

                // Validate suggested qualifications against available options
                if (d.suggestedQualifications?.length) {
                    const valid = d.suggestedQualifications
                        .map((s: string) => s.toLowerCase())
                        .filter((slug: string) => qualifications.some(q => q.value === slug))
                    if (valid.length > 0) update.qualifications = valid
                }

                // Validate suggested tags against available options
                if (d.suggestedTags?.length) {
                    const valid = d.suggestedTags
                        .map((s: string) => s.toLowerCase())
                        .filter((slug: string) => tags.some(t => t.value === slug))
                    if (valid.length > 0) update.tagIds = valid
                }

                dispatch({ type: 'LOAD_FROM_AI', data: update })
                setAiGenerated(true)
                setTimeout(() => setAiGenerated(false), 3000)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'AI generation failed')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Panel title="Publish" defaultOpen>
            <Field label="Post Type" required>
                <select
                    value={state.type}
                    onChange={e => dispatch({ type: 'SET_TYPE', value: e.target.value })}
                    className={selectCls}
                >
                    {POST_TYPES.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </Field>

            {/* Type description */}
            <p className="text-[10px] text-foreground-subtle -mt-1">{cfg.description}</p>

            {/* AI Generate button (create mode only) */}
            {mode === 'create' && (
                <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !state.title.trim() || aiGenerated}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${aiGenerated
                        ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                        : 'border-brand-200 bg-brand-50/50 text-brand-700 hover:bg-brand-100/50 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300 hover:dark:bg-brand-900/40'
                        } ${(!state.title.trim() || isGenerating) && !aiGenerated ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isGenerating
                        ? <><Loader2 className="size-3.5 animate-spin" /> Generating...</>
                        : aiGenerated
                            ? <><CheckCircle2 className="size-3.5" /> Content Generated</>
                            : <><Sparkles className="size-3.5" /> Generate with AI</>}
                </button>
            )}

            {error && (
                <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg px-3 py-2 border border-red-200 dark:border-red-800">
                    {error}
                </p>
            )}

            {/* Application dates (conditional) */}
            {cfg.showAppStatus && (
                <div className="space-y-3">
                    <Field label="Apply Start Date">
                        <input
                            type="date"
                            value={toISODate(state.applicationStartDate)}
                            onChange={e => dispatch({ type: 'SET_FIELD', field: 'applicationStartDate', value: e.target.value })}
                            className={inputCls}
                        />
                    </Field>
                    <Field label="Apply End Date">
                        <input
                            type="date"
                            value={toISODate(state.applicationEndDate)}
                            onChange={e => dispatch({ type: 'SET_FIELD', field: 'applicationEndDate', value: e.target.value })}
                            className={inputCls}
                        />
                    </Field>
                </div>
            )}
        </Panel>
    )
}

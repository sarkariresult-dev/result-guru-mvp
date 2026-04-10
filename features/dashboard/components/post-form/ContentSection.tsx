/**
 * Content Section - Title, slug, excerpt, editor, FAQ, direct links.
 */
'use client'

import dynamic from 'next/dynamic'
import { Plus } from 'lucide-react'
import { usePostForm } from './PostFormContext'
import { inputCls, Field } from './primitives'
import { TYPE_CONFIG } from './type-config'


const TiptapEditor = dynamic(
    () => import('@/features/dashboard/components/TiptapEditor').then(m => m.TiptapEditor),
    {
        ssr: false,
        loading: () => (
            <div className="flex min-h-80 items-center justify-center rounded-lg border border-border bg-background-muted animate-pulse">
                <span className="text-sm text-foreground-subtle">Loading editor…</span>
            </div>
        ),
    },
)

interface ContentSectionProps {
    authUserId: string
}

export function ContentSection({ authUserId }: ContentSectionProps) {
    const { state, dispatch, mode } = usePostForm()
    const cfg = TYPE_CONFIG[state.type] ?? TYPE_CONFIG.job!
    const s = cfg.sections



    return (
        <div className="space-y-5">
            <Field label="Post Excerpt" counter={`${state.excerpt.length}/500`} hint="Brief summary for search snippets and cards">
                <textarea
                    id="post-excerpt"
                    value={state.excerpt}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'excerpt', value: e.target.value })}
                    placeholder="Write a brief excerpt…"
                    rows={2}
                    maxLength={500}
                    className={`${inputCls} resize-none`}
                />
            </Field>

            <Field label="Main Content" hint="⌨️ Ctrl+S Save · Ctrl+Shift+P Publish">
                <TiptapEditor
                    content={state.content}
                    onChange={(val: string) => dispatch({ type: 'SET_FIELD', field: 'content', value: val })}
                    uploadBucket="posts"
                    uploadFolder={authUserId}
                />
            </Field>

            {/* FAQ */}
            {s.faq && (
                <Field 
                    label={`Frequently Asked Questions (${state.faq.length})`}
                >
                    <div className="flex justify-end mb-2 -mt-7">
                        <button
                            type="button"
                            onClick={() => dispatch({ type: 'ADD_FAQ' })}
                            className="flex items-center gap-1 text-[10px] bg-brand-50 text-brand-600 hover:bg-brand-100 px-2 py-1 rounded font-bold uppercase tracking-wider transition-colors"
                        >
                            <Plus className="size-3" /> Add Question
                        </button>
                    </div>
                    <div className="space-y-3">
                        {state.faq.map((item, i) => (
                            <div key={i} className="rounded-lg border border-border bg-background p-3 space-y-2">
                                <input
                                    aria-label={`FAQ Question ${i + 1}`}
                                    placeholder="Question"
                                    value={item.question}
                                    onChange={e => dispatch({ type: 'UPDATE_FAQ', index: i, field: 'question', value: e.target.value })}
                                    className={inputCls}
                                />
                                <textarea
                                    aria-label={`FAQ Answer ${i + 1}`}
                                    placeholder="Answer"
                                    value={item.answer}
                                    rows={2}
                                    onChange={e => dispatch({ type: 'UPDATE_FAQ', index: i, field: 'answer', value: e.target.value })}
                                    className={`${inputCls} min-h-0`}
                                />
                                <button
                                    type="button"
                                    onClick={() => dispatch({ type: 'REMOVE_FAQ', index: i })}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </Field>
            )}
        </div>
    )
}

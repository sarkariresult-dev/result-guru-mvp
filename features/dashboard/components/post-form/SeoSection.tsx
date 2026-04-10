/**
 * SEO Section - Focus keyword, secondary keywords, meta fields, SERP preview.
 */
'use client'

import { useState } from 'react'
import { usePostForm } from './PostFormContext'
import { Panel, Field, inputCls } from './primitives'

// ── Readability Badge ────────────────────────────────────────────────────────

function ReadabilityBadge({ score, grade }: { score: number; grade: string }) {
    const color = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'
    const bg = score >= 70 ? 'bg-green-50' : score >= 40 ? 'bg-yellow-50' : 'bg-red-50'
    return (
        <div className={`flex items-center gap-2 rounded-lg border border-border px-3 py-2 ${bg}`}>
            <span className={`text-lg font-bold ${color}`}>{score}</span>
            <div>
                <p className={`text-xs font-semibold ${color}`}>{grade}</p>
                <p className="text-[10px] text-foreground-muted">Readability</p>
            </div>
        </div>
    )
}

// ── Main SEO Section ─────────────────────────────────────────────────────────

export function SeoSection() {
    const { state, dispatch, seo } = usePostForm()
    const [skInput, setSkInput] = useState('')

    return (
        <Panel title="SEO" badge={seo.score} defaultOpen>
            {/* Focus keyword */}
            <Field label="Focus Keyword (Primary)" hint="Main keyword you want this post to rank for">
                <input
                    value={state.focusKeyword}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'focusKeyword', value: e.target.value })}
                    placeholder="e.g. SSC CGL 2026"
                    className={inputCls}
                />
                {state.focusKeyword && (
                    <p className="mt-1 text-[10px] text-foreground-subtle">
                        Density: {seo.checks.find(c => c.id === 'fk-density')?.value || 'N/A'}
                    </p>
                )}
            </Field>

            {/* Secondary keywords */}
            <Field label="Secondary Keywords" hint="Press Enter or comma to add">
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {state.secondaryKeywords.map((kw, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50/50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300"
                        >
                            {kw}
                            <button
                                type="button"
                                onClick={() => dispatch({ type: 'REMOVE_SECONDARY_KEYWORD', index: i })}
                                className="hover:text-red-500"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    value={skInput}
                    onChange={e => setSkInput(e.target.value)}
                    onKeyDown={e => {
                        if ((e.key === 'Enter' || e.key === ',') && skInput.trim()) {
                            e.preventDefault()
                            dispatch({ type: 'ADD_SECONDARY_KEYWORD', keyword: skInput.replace(/,/g, '').trim() })
                            setSkInput('')
                        }
                    }}
                    placeholder="e.g. SSC CGL Apply Online"
                    className={inputCls}
                />
            </Field>

            {/* Meta Title */}
            <Field label="Meta Title" counter={`${state.metaTitle.length}/60`}>
                <input
                    value={state.metaTitle}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'metaTitle', value: e.target.value })}
                    maxLength={70}
                    placeholder="Page title for search engines"
                    className={`${inputCls} ${state.metaTitle.length > 60 ? 'border-red-400' : ''}`}
                />
            </Field>

            {/* Meta Description */}
            <Field label="Meta Description" counter={`${state.metaDescription.length}/155`}>
                <textarea
                    value={state.metaDescription}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'metaDescription', value: e.target.value })}
                    maxLength={165}
                    rows={3}
                    placeholder="Compelling description for search snippets…"
                    className={`${inputCls} resize-none ${state.metaDescription.length > 155 ? 'border-red-400' : ''}`}
                />
            </Field>

            {/* Noindex toggle */}
            <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                    type="checkbox"
                    checked={state.noindex}
                    onChange={e => dispatch({ type: 'SET_FIELD', field: 'noindex', value: e.target.checked })}
                    className="size-4 rounded border-border text-brand-600"
                />
                <span className="text-xs text-foreground">Noindex (hide from Google)</span>
            </label>

            {/* Readability */}
            <ReadabilityBadge score={seo.readability.score} grade={seo.readability.grade} />
        </Panel>
    )
}

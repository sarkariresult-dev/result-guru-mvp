/**
 * SEO Score Widget - Always visible mini gauge + expandable checklist.
 * Also contains the pre-save SEO modal.
 */
'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { usePostForm } from './PostFormContext'
import { Button } from '@/components/ui/Button'
import type { SeoCheck, SeoCheckPriority } from '@/lib/seo/seo-analyzer'

// ── Score Gauge (compact) ────────────────────────────────────────────────────

export function SeoScoreWidget() {
    const { seo } = usePostForm()
    const [expanded, setExpanded] = useState(false)

    const color = seo.score >= 80 ? 'text-green-500' : seo.score >= 50 ? 'text-yellow-500' : 'text-red-500'
    const strokeColor = seo.score >= 80 ? 'stroke-green-500' : seo.score >= 50 ? 'stroke-yellow-500' : 'stroke-red-500'

    return (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-background-subtle/50 transition-colors"
            >
                {/* Mini gauge */}
                <div className="relative size-10 shrink-0">
                    <svg className="size-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-border" strokeWidth="2.5" />
                        <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            className={strokeColor}
                            strokeWidth="2.5"
                            strokeDasharray={`${seo.score} 100`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${color}`}>
                        {seo.score}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                        SEO Score
                    </p>
                    <p className="text-[10px] text-foreground-muted">
                        {seo.summary.passed}/{seo.summary.total} checks passed
                        {seo.summary.critical > 0 && ` · ${seo.summary.critical} critical`}
                    </p>
                </div>
            </button>

            {expanded && (
                <div className="border-t border-border px-4 py-3 space-y-3 max-h-[400px] overflow-y-auto">
                    <CheckGroup title="🔴 Critical" priority="critical" checks={seo.checks} />
                    <CheckGroup title="🟡 Important" priority="important" checks={seo.checks} />
                    <CheckGroup title="🟢 Nice to Have" priority="nice" checks={seo.checks} />
                </div>
            )}
        </div>
    )
}

// ── Check Group ──────────────────────────────────────────────────────────────

function CheckGroup({ title, priority, checks }: {
    title: string
    priority: SeoCheckPriority
    checks: SeoCheck[]
}) {
    const items = checks.filter(c => c.priority === priority)
    if (items.length === 0) return null

    return (
        <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                {title}
            </p>
            <div className="space-y-1">
                {items.map(c => (
                    <div key={c.id} className="flex items-start gap-2 text-xs group">
                        {c.status === 'pass'
                            ? <CheckCircle2 className="size-3.5 text-green-500 shrink-0 mt-0.5" />
                            : c.status === 'warn'
                                ? <Info className="size-3.5 text-yellow-500 shrink-0 mt-0.5" />
                                : <AlertTriangle className="size-3.5 text-red-500 shrink-0 mt-0.5" />
                        }
                        <div className="flex-1 min-w-0">
                            <span className={c.status === 'pass' ? 'text-foreground-muted' : 'text-foreground'}>
                                {c.label}
                            </span>
                            {c.value && (
                                <span className="ml-1.5 text-foreground-subtle">({c.value})</span>
                            )}
                            {c.recommendation && c.status !== 'pass' && (
                                <p className="mt-0.5 text-[10px] text-foreground-subtle leading-tight">
                                    💡 {c.recommendation}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Pre-Save SEO Modal ───────────────────────────────────────────────────────

export function SeoModal({ onClose, onProceed, saveLabel }: {
    onClose: () => void
    onProceed: () => void
    saveLabel: string
}) {
    const { seo } = usePostForm()

    const color = seo.score >= 80 ? 'text-green-500' : seo.score >= 50 ? 'text-yellow-500' : 'text-red-500'
    const strokeColor = seo.score >= 80 ? 'stroke-green-500' : seo.score >= 50 ? 'stroke-yellow-500' : 'stroke-red-500'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h3 className="text-lg font-bold text-foreground">SEO Analysis</h3>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-background-subtle">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Score + summary */}
                    <div className="flex items-center gap-4">
                        <div className="relative size-16 shrink-0">
                            <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-border" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="15.9" fill="none"
                                    className={strokeColor}
                                    strokeWidth="3"
                                    strokeDasharray={`${seo.score} 100`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>
                                {seo.score}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">
                                {seo.score >= 80 ? 'Great SEO!' : seo.score >= 50 ? 'Needs Improvement' : 'Poor SEO'}
                            </p>
                            <p className="text-xs text-foreground-muted">
                                {seo.summary.critical > 0
                                    ? `${seo.summary.critical} critical issue${seo.summary.critical > 1 ? 's' : ''} found`
                                    : 'All critical checks passed'}
                            </p>
                        </div>
                    </div>

                    {/* Readability */}
                    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                        <span className="text-sm font-bold text-foreground">{seo.readability.score}</span>
                        <div>
                            <p className="text-xs font-medium text-foreground">{seo.readability.grade}</p>
                            <p className="text-[10px] text-foreground-muted">
                                Avg {seo.readability.avgSentenceLength} words/sentence ·{' '}
                                {seo.readability.passiveVoicePercent}% passive
                            </p>
                        </div>
                    </div>

                    {/* Checks */}
                    <CheckGroup title="🔴 Critical" priority="critical" checks={seo.checks} />
                    <CheckGroup title="🟡 Important" priority="important" checks={seo.checks} />
                    <CheckGroup title="🟢 Nice to Have" priority="nice" checks={seo.checks} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                    <Button variant="ghost" onClick={onClose}>Go Back & Fix</Button>
                    <Button onClick={onProceed}>
                        {seo.score < 50 && <AlertTriangle className="size-4" />}
                        {saveLabel} {seo.score < 50 ? 'Anyway' : ''}
                    </Button>
                </div>
            </div>
        </div>
    )
}

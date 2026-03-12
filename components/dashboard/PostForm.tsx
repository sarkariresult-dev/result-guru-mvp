'use client'

import { useTransition, useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/Button'
import { createPost, updatePost } from '@/lib/actions/posts'
import { FileUpload } from '@/components/dashboard/FileUpload'
import { Save, Eye, Plus, Trash2, ChevronDown, ChevronUp, X, AlertTriangle, CheckCircle2, Link as LinkIcon, Info, Wand2, Sparkles, Loader2 } from 'lucide-react'
import { generateContentWithGemini } from '@/lib/actions/ai'
import { processContentHtml, extractHowToSteps, replacePlaceholders } from '@/lib/content-processing'

/* Heavy editor - 13 tiptap packages + 25 lucide icons → lazy-load, no SSR */
const TiptapEditor = dynamic(
    () => import('@/components/dashboard/TiptapEditor').then(m => m.TiptapEditor),
    {
        ssr: false,
        loading: () => (
            <div className="flex min-h-80 items-center justify-center rounded-lg border border-border bg-background-muted animate-pulse">
                <span className="text-sm text-foreground-subtle">Loading editor…</span>
            </div>
        ),
    },
)

// ── Types ───────────────────────────────────────────────────────
interface Option { value: string; label: string }
interface TagOption extends Option { tag_type?: string }

interface PostFormProps {
    authorId: string
    authUserId: string
    states: Option[]
    organizations: Option[]
    categories: Option[]
    qualifications: Option[]
    tags: TagOption[]
    initialData?: Record<string, any>
    mode?: 'create' | 'edit'
}

// Map post type → matching tag_types
const TYPE_TO_TAG_TYPES: Record<string, string[]> = {
    job: ['job'], notification: ['job'], result: ['result'],
    admit: ['admit'], exam: ['exam', 'syllabus', 'exam_pattern'],
    scheme: ['scheme'], admission: ['admission'],
    answer_key: ['answer_key'], syllabus: ['syllabus', 'exam_pattern'],
    exam_pattern: ['exam_pattern', 'syllabus'],
    previous_paper: ['previous_paper', 'exam'],
    cut_off: ['cut_off', 'result'],
}

function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// Defines which structured data sections are visible for each post type
const TYPE_CONFIG: Record<string, {
    label: string
    emoji: string
    description: string
    showAppStatus: boolean
    sections: {
        dates: boolean
        eligibility: boolean
        applicationFee: boolean
        vacancyDetails: boolean
        totalVacancies: boolean
        ageLimit: boolean
        payScale: boolean
        selectionProcess: boolean
        howToApply: boolean
        admitCardLink: boolean
        resultLink: boolean
        cutOffMarks: boolean
        syllabus: boolean
        examPattern: boolean
        preparationTips: boolean
        previousPapers: boolean
        faq: boolean
    }
}> = {
    job: {
        label: 'Job', emoji: '💼',
        description: 'Government job vacancy with full recruitment details',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: true, vacancyDetails: true, totalVacancies: true, ageLimit: true, payScale: true, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    notification: {
        label: 'Notification', emoji: '📢',
        description: 'Official notification for recruitment or exam',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: true, vacancyDetails: true, totalVacancies: true, ageLimit: true, payScale: true, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    admission: {
        label: 'Admission', emoji: '🎓',
        description: 'College/university admission notice',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: true, vacancyDetails: false, totalVacancies: false, ageLimit: true, payScale: false, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: true, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    result: {
        label: 'Result', emoji: '📊',
        description: 'Exam results with cut-off marks',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: true, cutOffMarks: true, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    admit: {
        label: 'Admit Card', emoji: '🎫',
        description: 'Admit card / Hall ticket download',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: true, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    answer_key: {
        label: 'Answer Key', emoji: '🔑',
        description: 'Official/unofficial answer key with objection details',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: true, cutOffMarks: true, syllabus: false, examPattern: false, preparationTips: false, previousPapers: true, faq: true },
    },
    exam: {
        label: 'Exam', emoji: '📝',
        description: 'Competitive exam overview with pattern and syllabus',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: true, vacancyDetails: false, totalVacancies: false, ageLimit: true, payScale: false, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: true, examPattern: true, preparationTips: true, previousPapers: true, faq: true },
    },
    scheme: {
        label: 'Scheme', emoji: '📋',
        description: 'Government scheme',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: true, payScale: false, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    syllabus: {
        label: 'Syllabus', emoji: '📚',
        description: 'Detailed exam syllabus with subject breakdown',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: true, examPattern: true, preparationTips: true, previousPapers: true, faq: true },
    },
    exam_pattern: {
        label: 'Exam Pattern', emoji: '📐',
        description: 'Paper pattern - marking, duration, question types',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: true, examPattern: true, preparationTips: true, previousPapers: true, faq: true },
    },
    previous_paper: {
        label: 'Previous Paper', emoji: '📄',
        description: 'Past year question papers with PDF downloads',
        showAppStatus: false,
        sections: { dates: false, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: true, preparationTips: true, previousPapers: true, faq: true },
    },
    cut_off: {
        label: 'Cut Off', emoji: '✂️',
        description: 'Category-wise cut-off marks for exams',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: true, cutOffMarks: true, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
}

const POST_TYPES = Object.entries(TYPE_CONFIG).map(([value, cfg]) => ({
    value, label: `${cfg.emoji} ${cfg.label}`,
}))

const APP_STATUSES: Option[] = [
    { value: 'na', label: 'N/A' }, { value: 'upcoming', label: 'Upcoming' },
    { value: 'open', label: 'Open' }, { value: 'closing_soon', label: 'Closing Soon' },
    { value: 'closed', label: 'Closed' }, { value: 'result_out', label: 'Result Out' },
]

// ── Sidebar Panel ──────────────────────────────────────────────
function Panel({ title, defaultOpen, children }: {
    title: string; defaultOpen?: boolean; children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    return (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
            <button
                type="button" onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-background-subtle/50 transition-colors"
            >
                <span className="flex-1">{title}</span>
                {isOpen ? <ChevronUp className="size-3.5 text-foreground-subtle" /> : <ChevronDown className="size-3.5 text-foreground-subtle" />}
            </button>
            {isOpen && <div className="border-t border-border px-4 py-3.5 space-y-3">{children}</div>}
        </div>
    )
}

// ── Field Components ───────────────────────────────────────────
function Field({ label, children, required, hint }: { label: string; children: React.ReactNode; required?: boolean; hint?: string }) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-foreground-muted">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
            {children}
            {hint && <span className="mt-1 block text-xs text-foreground-subtle">{hint}</span>}
        </label>
    )
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
const selectCls = inputCls

// ── Key-Value Editor ───────────────────────────────────────────
function KVEditor({ label, value, onChange, keyPlaceholder = 'Key', valuePlaceholder = 'Value' }: {
    label: string; value: Record<string, string>; onChange: (v: Record<string, string>) => void;
    keyPlaceholder?: string; valuePlaceholder?: string
}) {
    const entries = Object.entries(value)
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-wider text-foreground-muted">{label}</label>
                <button type="button" onClick={() => onChange({ ...value, '': '' })} className="flex items-center gap-1 text-xs text-brand-600 hover:underline font-medium"><Plus className="size-3" /> Add</button>
            </div>
            <div className="space-y-2">
                {entries.map(([k, v], i) => (
                    <div key={i} className="flex gap-2">
                        <input aria-label={`${label} Key`} placeholder={keyPlaceholder} value={k} onChange={(e) => { const n = [...entries]; n[i] = [e.target.value, v]; onChange(Object.fromEntries(n)) }} className={`flex-1 ${inputCls}`} />
                        <input aria-label={`${label} Value`} placeholder={valuePlaceholder} value={v} onChange={(e) => { const n = [...entries]; n[i] = [k, e.target.value]; onChange(Object.fromEntries(n)) }} className={`flex-1 ${inputCls}`} />
                        <button type="button" aria-label={`Remove ${label} item`} onClick={() => { const o = { ...value }; delete o[k]; onChange(o) }} className="size-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="size-3.5" /></button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ListEditor({ label, value, onChange, placeholder = 'Enter item...' }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-wider text-foreground-muted">{label}</label>
                <button type="button" onClick={() => onChange([...value, ''])} className="flex items-center gap-1 text-xs text-brand-600 hover:underline font-medium"><Plus className="size-3" /> Add</button>
            </div>
            <div className="space-y-2">
                {value.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <input aria-label={`${label} Item ${i + 1}`} value={item} placeholder={placeholder} onChange={(e) => { const c = [...value]; c[i] = e.target.value; onChange(c) }} className={`flex-1 ${inputCls}`} />
                        <button type="button" aria-label={`Remove ${label} item`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="size-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="size-3.5" /></button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function FaqEditor({ value, onChange }: { value: { question: string; answer: string }[]; onChange: (v: { question: string; answer: string }[]) => void }) {
    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-wider text-foreground-muted">FAQ</label>
                <button type="button" onClick={() => onChange([...value, { question: '', answer: '' }])} className="flex items-center gap-1 text-xs text-brand-600 hover:underline font-medium"><Plus className="size-3" /> Add</button>
            </div>
            <div className="space-y-3">
                {value.map((item, i) => (
                    <div key={i} className="rounded-lg border border-border bg-background p-3 space-y-2">
                        <input aria-label="FAQ Question" placeholder="Question" value={item.question} onChange={(e) => { const c = [...value]; c[i] = { question: e.target.value, answer: c[i]!.answer }; onChange(c) }} className={inputCls} />
                        <textarea aria-label="FAQ Answer" placeholder="Answer" value={item.answer} rows={2} onChange={(e) => { const c = [...value]; c[i] = { question: c[i]!.question, answer: e.target.value }; onChange(c) }} className={`${inputCls} min-h-0`} />
                        <button type="button" aria-label="Remove FAQ item" onClick={() => onChange(value.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:underline">Remove</button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function ChipSelect({ label, options, value, onChange }: { label: string; options: Option[]; value: string[]; onChange: (v: string[]) => void }) {
    return (
        <fieldset>
            <legend className="mb-1 block text-xs font-medium uppercase tracking-wider text-foreground-muted">{label}</legend>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
                {options.map((o) => {
                    const sel = value.includes(o.value)
                    return (
                        <button key={o.value} type="button" aria-pressed={sel} onClick={() => onChange(sel ? value.filter((v) => v !== o.value) : [...value, o.value])}
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${sel ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 shadow-sm' : 'border-border text-foreground-muted hover:border-brand-300 hover:bg-brand-50/50'}`}>
                            {o.label}
                        </button>
                    )
                })}
                {options.length === 0 && <span className="text-xs text-foreground-subtle">No options available</span>}
            </div>
        </fieldset>
    )
}

// ── Smart Tag Selector (grouped by relevance) ──────────────────
function TagSelector({ allTags, postType, value, onChange }: {
    allTags: TagOption[]; postType: string; value: string[]; onChange: (v: string[]) => void
}) {
    const [showOther, setShowOther] = useState(false)
    const relevantTypes = TYPE_TO_TAG_TYPES[postType] ?? []

    const relevant = allTags.filter((t: TagOption) => relevantTypes.includes(t.tag_type ?? ''))
    const general = allTags.filter((t: TagOption) => t.tag_type === 'general')
    const other = allTags.filter((t: TagOption) => t.tag_type !== 'general' && !relevantTypes.includes(t.tag_type ?? ''))

    const renderChips = (tags: TagOption[]) => (
        <div className="flex flex-wrap gap-1.5">
            {tags.map((t: TagOption) => {
                const sel = value.includes(t.value)
                return (
                    <button key={t.value} type="button" aria-pressed={sel} onClick={() => onChange(sel ? value.filter((v: string) => v !== t.value) : [...value, t.value])}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${sel ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 shadow-sm' : 'border-border text-foreground-muted hover:border-brand-300 hover:bg-brand-50/50'}`}>
                        {t.label}
                    </button>
                )
            })}
        </div>
    )

    if (allTags.length === 0) {
        return (
            <Field label="Tags">
                <span className="text-xs text-foreground-subtle">No tags available. Seed tags in Supabase first.</span>
            </Field>
        )
    }

    return (
        <fieldset>
            <legend className="mb-1 block text-xs font-medium uppercase tracking-wider text-foreground-muted">Tags</legend>
            <div className="space-y-2.5">
                {relevant.length > 0 && (
                    <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-brand-600">⭐ Suggested for {TYPE_CONFIG[postType]?.label ?? postType}</p>
                        {renderChips(relevant)}
                    </div>
                )}
                {general.length > 0 && (
                    <div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">General</p>
                        {renderChips(general)}
                    </div>
                )}
                {other.length > 0 && (
                    <div>
                        <button type="button" aria-expanded={showOther} aria-controls="other-tags" onClick={() => setShowOther(!showOther)} className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle hover:text-foreground-muted">
                            {showOther ? '▾' : '▸'} Other Tags ({other.length})
                        </button>
                        {showOther && <div id="other-tags">{renderChips(other)}</div>}
                    </div>
                )}
            </div>
        </fieldset>
    )
}

// ── SEO Analysis (2026 guidelines) ────────────────────────────
function runSeoAnalysis(p: { title: string; slug: string; metaTitle: string; metaDescription: string; focusKeyword: string; secondaryKeywords: string[]; content: string; excerpt: string; featuredImage: string; featuredImageAlt: string; type: string }) {
    const wordCount = p.content.split(/\s+/).filter(Boolean).length
    const contentLower = p.content.toLowerCase()
    const fk = p.focusKeyword.toLowerCase()
    const hasFk = fk.length > 0
    const sk = p.secondaryKeywords.filter(k => k.trim().length > 0)
    const skInContent = sk.length > 0 ? sk.filter(k => contentLower.includes(k.toLowerCase())).length : 0
    return [
        { label: 'Title length 30-65 chars (Google 2026)', ok: p.title.length >= 30 && p.title.length <= 65, priority: 'high' as const },
        { label: 'Meta title ≤60 chars (truncation fix)', ok: p.metaTitle.length > 0 && p.metaTitle.length <= 60, priority: 'high' as const },
        { label: 'Meta description 120-155 chars (snippet)', ok: p.metaDescription.length >= 120 && p.metaDescription.length <= 155, priority: 'high' as const },
        { label: 'Focus keyword set', ok: hasFk, priority: 'high' as const },
        { label: 'Keyword in title (first 60 chars)', ok: hasFk && p.title.slice(0, 60).toLowerCase().includes(fk), priority: 'high' as const },
        { label: 'Keyword in meta description', ok: hasFk && p.metaDescription.toLowerCase().includes(fk), priority: 'medium' as const },
        { label: 'Keyword in slug', ok: hasFk && p.slug.toLowerCase().includes(fk.replace(/\s+/g, '-')), priority: 'medium' as const },
        { label: 'Content 500+ words (E-E-A-T depth)', ok: wordCount >= 500, priority: 'high' as const },
        { label: 'Secondary keywords set (≥2)', ok: sk.length >= 2, priority: 'medium' as const },
        { label: 'Secondary keywords in content', ok: sk.length > 0 && skInContent >= Math.ceil(sk.length * 0.5), priority: 'medium' as const },
        { label: 'Excerpt set (listing & rich snippets)', ok: p.excerpt.length >= 50, priority: 'medium' as const },
        { label: 'Featured image set (visual SEO)', ok: p.featuredImage.length > 0, priority: 'medium' as const },
        // COUNCIL P2 (Area 1): Discover requires images ≥1200px wide
        { label: 'Featured image for Discover (≥1200px wide)', ok: p.featuredImage.length > 0, priority: 'high' as const },
        { label: 'Image alt text set (accessibility)', ok: p.featuredImageAlt.length > 0, priority: 'medium' as const },
        { label: 'Slug is short & clean (≤60 chars)', ok: p.slug.length > 0 && p.slug.length <= 60, priority: 'low' as const },
        { label: 'No stop words in slug', ok: !/(\b(the|and|is|in|to|for|of|a|an)\b)/.test(p.slug), priority: 'low' as const },
        { label: 'Content has 1000+ words (pillar quality)', ok: wordCount >= 1000, priority: 'low' as const },
        { label: 'Year in title (freshness signal)', ok: /202[4-9]/.test(p.title), priority: 'low' as const },
    ]
}

function SeoModal({ checks, score, onClose, onProceed, saveLabel }: {
    checks: ReturnType<typeof runSeoAnalysis>; score: number; onClose: () => void; onProceed: () => void; saveLabel: string
}) {
    const color = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500'
    const bgColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
    const highFails = checks.filter(c => !c.ok && c.priority === 'high')
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h3 className="text-lg font-bold text-foreground">SEO Analysis</h3>
                    <button onClick={onClose} className="rounded-lg p-1 hover:bg-background-subtle"><X className="size-5" /></button>
                </div>
                <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center gap-4">
                        <div className="relative size-16">
                            <svg className="size-16 -rotate-90" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" className="text-border" strokeWidth="3" /><circle cx="18" cy="18" r="15.9" fill="none" className={color} strokeWidth="3" strokeDasharray={`${score} 100`} strokeLinecap="round" /></svg>
                            <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>{score}</span>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{score >= 80 ? 'Great SEO!' : score >= 50 ? 'Needs Improvement' : 'Poor SEO'}</p>
                            <p className="text-xs text-foreground-muted">{highFails.length > 0 ? `${highFails.length} critical issue${highFails.length > 1 ? 's' : ''} found` : 'All critical checks passed'}</p>
                        </div>
                    </div>
                    {(['high', 'medium', 'low'] as const).map(pri => {
                        const items = checks.filter(c => c.priority === pri)
                        if (items.length === 0) return null
                        return (
                            <div key={pri}>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                                    {pri === 'high' ? '🔴 Critical' : pri === 'medium' ? '🟡 Important' : '🟢 Nice to Have'}
                                </p>
                                <div className="space-y-1">
                                    {items.map(c => (
                                        <div key={c.label} className="flex items-center gap-2 text-sm">
                                            {c.ok ? <CheckCircle2 className="size-4 text-green-500 shrink-0" /> : <AlertTriangle className={`size-4 shrink-0 ${pri === 'high' ? 'text-red-500' : 'text-yellow-500'}`} />}
                                            <span className={c.ok ? 'text-foreground-muted' : 'text-foreground'}>{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                    <Button variant="ghost" onClick={onClose}>Go Back & Fix</Button>
                    <Button onClick={onProceed}>
                        {score < 50 && <AlertTriangle className="size-4" />}
                        {saveLabel} {score < 50 ? 'Anyway' : ''}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function PostForm({ authorId, authUserId, states, organizations, categories, qualifications, tags, initialData, mode = 'create' }: PostFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    // ── Basic ──
    const [type, setType] = useState(initialData?.type ?? 'job')
    const [title, setTitle] = useState(initialData?.title ?? '')
    // In edit mode, preserve the existing slug; in create mode, auto-compute from title
    const [customSlug, setCustomSlug] = useState(mode === 'edit' ? (initialData?.slug ?? '') : '')
    const slug = mode === 'edit' ? customSlug : slugify(title || 'untitled')
    const [showSeoModal, setShowSeoModal] = useState(false)
    const [pendingSaveAs, setPendingSaveAs] = useState<'draft' | 'published'>('draft')
    const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '')
    const [content, setContent] = useState(initialData?.content ?? '')
    const [applicationStatus, setApplicationStatus] = useState(initialData?.application_status ?? 'na')
    const [draftLoaded, setDraftLoaded] = useState(false)

    // ── Taxonomy ──
    const [state, setState] = useState(initialData?.state_slug ?? '')
    const [organizationId, setOrganizationId] = useState(initialData?.organization_id ?? '')
    const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '')
    const [selectedQualifications, setSelectedQualifications] = useState<string[]>(initialData?.qualification ?? [])
    // Tags come from post_tags join: [{post_id, tag_id}, ...]
    const [selectedTags, setSelectedTags] = useState<string[]>((initialData?.post_tags ?? []).map((t: any) => t.tag_id))

    // ── Files ──
    const [notificationPdf, setNotificationPdf] = useState(initialData?.notification_pdf ?? '')
    const [featuredImage, setFeaturedImage] = useState(initialData?.featured_image ?? '')
    const [featuredImageAlt, setFeaturedImageAlt] = useState(initialData?.featured_image_alt ?? '')

    // ── Structured Data ──
    // DB stores FAQ as {q, a} - convert to {question, answer} for the form
    const [faq, setFaq] = useState<{ question: string; answer: string }[]>(
        (initialData?.faq ?? []).map((f: any) => ({
            question: f.question ?? f.q ?? '',
            answer: f.answer ?? f.a ?? '',
        }))
    )

    // ── Student-Helpful ──
    const [admitCardLink, setAdmitCardLink] = useState(initialData?.admit_card_link ?? '')
    const [resultLinkUrl, setResultLinkUrl] = useState(initialData?.result_link ?? '')
    const [answerKeyLink, setAnswerKeyLink] = useState(initialData?.answer_key_link ?? '')

    // ── SEO ──
    const [metaTitle, setMetaTitle] = useState(initialData?.meta_title ?? '')
    const [metaDescription, setMetaDescription] = useState(initialData?.meta_description ?? '')
    const [focusKeyword, setFocusKeyword] = useState(initialData?.focus_keyword ?? '')
    const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>(initialData?.secondary_keywords ?? [])
    const [skInput, setSkInput] = useState('')
    const [noindex, setNoindex] = useState(initialData?.noindex ?? false)
    const [ogTitle, setOgTitle] = useState(initialData?.og_title ?? '')
    const [ogDescription, setOgDescription] = useState(initialData?.og_description ?? '')
    const [ogImage, setOgImage] = useState(initialData?.og_image ?? '')

    // ── Publishing ──
    const [scheduledAt, setScheduledAt] = useState(initialData?.scheduled_at ?? '')
    const [expiresAt, setExpiresAt] = useState(initialData?.expires_at ?? '')

    // ── Auto-Save to Local Storage ──
    useEffect(() => {
        if (mode !== 'create') return // Only auto-save local drafts for new posts
        const draftStr = localStorage.getItem('post_draft_v1')
        if (draftStr) {
            try {
                const d = JSON.parse(draftStr)
                if (d.title) setTitle(d.title)
                if (d.type) setType(d.type)
                if (d.content) setContent(d.content)
                if (d.excerpt) setExcerpt(d.excerpt)
                // Restore other major fields if needed
            } catch { /* ignore */ }
        }
        setDraftLoaded(true)
    }, [mode])

    useEffect(() => {
        if (!draftLoaded || mode !== 'create') return
        const timer = setTimeout(() => {
            const draft = { title, type, content, excerpt, state, organizationId, categoryId }
            localStorage.setItem('post_draft_v1', JSON.stringify(draft))
        }, 1500)
        return () => clearTimeout(timer)
    }, [title, type, content, excerpt, state, organizationId, categoryId, draftLoaded, mode])

    // ── Derived config ──
    const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.job!
    const s = cfg.sections

    // ── AI Generation Application ──
    const [aiGenerated, setAiGenerated] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerateAI = async () => {
        if (!title.trim()) {
            setError('Please enter a Post Title first to generate content.')
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            const result = await generateContentWithGemini({
                topic: title,
                postType: type,
                tone: 'Informative and Urgent',
                targetAudience: 'Government Job Seekers in India',
                primaryKeywords: ''
            })

            if (result.error) {
                setError(result.error)
            } else if (result.success && result.data) {
                const {
                    title: newTitle, excerpt: newExcerpt, content: newContent,
                    metaTitle: newMetaTitle, metaDescription: newMetaDescription,
                    slug: newSlug,
                    focusKeyword: newFocusKeyword, secondaryKeywords: newSecondaryKeywords,
                    faq: newFaq, suggestedTags, suggestedQualifications,
                    officialWebsiteUrl, applyOnlineUrl, notificationPdfUrl
                } = result.data

                if (newTitle) setTitle(newTitle)
                if (newSlug) setCustomSlug(newSlug)
                if (newExcerpt) setExcerpt(newExcerpt)

                // Process content to replace dynamic placeholders [applyOnlineUrl] etc.
                if (newContent) {
                    const processedContent = replacePlaceholders(newContent, {
                        officialWebsiteUrl,
                        applyOnlineUrl,
                        notificationPdfUrl
                    })
                    setContent(processedContent)
                }

                if (newMetaTitle) setMetaTitle(newMetaTitle)
                if (newMetaDescription) setMetaDescription(newMetaDescription)
                if (newFocusKeyword) setFocusKeyword(newFocusKeyword)
                if (newSecondaryKeywords) setSecondaryKeywords(newSecondaryKeywords)
                if (newFaq) setFaq(newFaq)

                // Map official links
                if (notificationPdfUrl) setNotificationPdf(notificationPdfUrl)
                if (applyOnlineUrl) {
                    if (type === 'admit') setAdmitCardLink(applyOnlineUrl)
                    else if (type === 'result' || type === 'cut_off') setResultLinkUrl(applyOnlineUrl)
                    else if (type === 'answer_key') setAnswerKeyLink(applyOnlineUrl)
                } else if (officialWebsiteUrl) {
                    // Fallback to official website if specific apply link not found
                    if (type === 'admit' && !admitCardLink) setAdmitCardLink(officialWebsiteUrl)
                    else if ((type === 'result' || type === 'cut_off') && !resultLinkUrl) setResultLinkUrl(officialWebsiteUrl)
                    else if (type === 'answer_key' && !answerKeyLink) setAnswerKeyLink(officialWebsiteUrl)
                }

                // Map suggested taxonomic data against existing props to prevent DB relation errors
                if (suggestedQualifications && Array.isArray(suggestedQualifications)) {
                    const validQuals = suggestedQualifications
                        .map(sq => sq.toLowerCase())
                        .filter(slug => qualifications.some(q => q.value === slug))
                    if (validQuals.length > 0) setSelectedQualifications(validQuals)
                }

                if (suggestedTags && Array.isArray(suggestedTags)) {
                    const validTags = suggestedTags
                        .map(st => st.toLowerCase())
                        .filter(slug => tags.some(t => t.value === slug))
                    if (validTags.length > 0) setSelectedTags(validTags)
                }

                // Show success
                setAiGenerated(true)
                setTimeout(() => setAiGenerated(false), 3000)
            }
        } catch (err: any) {
            setError(err.message || 'Error communicating with AI service')
        } finally {
            setIsGenerating(false)
        }
    }

    // Auto-apply type changes
    const handleTypeChange = useCallback((newType: string) => {
        setType(newType)
    }, [])


    // SEO checks
    const seoChecks = useMemo(() => runSeoAnalysis({ title, slug, metaTitle, metaDescription, focusKeyword, secondaryKeywords, content, excerpt, featuredImage, featuredImageAlt, type }), [title, slug, metaTitle, metaDescription, focusKeyword, secondaryKeywords, content, excerpt, featuredImage, featuredImageAlt, type])
    const seoScore = Math.round((seoChecks.filter(c => c.ok).length / seoChecks.length) * 100)

    const handleOrgChange = useCallback((id: string) => {
        setOrganizationId(id)
    }, [])

    const triggerSave = (saveAs: 'draft' | 'published') => {
        setPendingSaveAs(saveAs)
        setShowSeoModal(true)
    }

    const doSubmit = () => {
        setShowSeoModal(false)
        setError(null)
        startTransition(async () => {
            // Map form state → DB column names (matches 007_posts.sql)
            const data = {
                // Identity
                type, status: pendingSaveAs as import('@/types/enums').PostStatus, application_status: applicationStatus,
                // Content
                title, slug,
                excerpt: excerpt || null, content: content || null,
                // Taxonomy - use correct DB column names
                state_slug: state || null,
                organization_id: organizationId || null,
                qualification: selectedQualifications.length > 0 ? selectedQualifications : null,
                category_id: categoryId || null,
                // Media
                notification_pdf: notificationPdf || null,
                featured_image: featuredImage || null, featured_image_alt: featuredImageAlt || null,
                // Structured content (JSONB)
                faq: faq.map(f => ({ q: f.question, a: f.answer })),
                // Key links
                admit_card_link: admitCardLink || null, result_link: resultLinkUrl || null, answer_key_link: answerKeyLink || null,
                // SEO
                meta_title: metaTitle || null, meta_description: metaDescription || null,
                focus_keyword: focusKeyword || null,
                secondary_keywords: secondaryKeywords.length > 0 ? secondaryKeywords : null,
                noindex,
                // Open Graph
                og_title: ogTitle || null, og_description: ogDescription || null, og_image: ogImage || null,
                // Publishing
                author_id: authorId,
                published_at: pendingSaveAs === 'published' ? new Date().toISOString() : null,
                scheduled_at: scheduledAt || null, expires_at: expiresAt || null,
                // Tags (handled separately by createPost/updatePost)
                tag_ids: selectedTags.length > 0 ? selectedTags : undefined,
            }

            const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '/author'

            try {
                if (mode === 'edit' && initialData?.id) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const result = await updatePost(initialData.id, data as any)
                    if (result?.error) setError(typeof result.error === 'string' ? result.error : 'Failed to update')
                    else router.push(`${basePath}/posts`)
                } else {
                    const result: { error?: string; success?: boolean } = await createPost(data as any)
                    if (result?.error) setError(result.error)
                    else if (result?.success) {
                        if (mode === 'create') {
                            localStorage.removeItem('post_draft_v1')

                            // Fully reset form state to prevent leftover data if user comes back
                            setTitle('')
                            setCustomSlug('')
                            setExcerpt('')
                            setContent('')
                            setFaq([])
                            setAdmitCardLink('')
                            setResultLinkUrl('')
                            setAnswerKeyLink('')
                            setMetaTitle('')
                            setMetaDescription('')
                            setFocusKeyword('')
                            setSecondaryKeywords([])
                            setOgTitle('')
                            setOgDescription('')
                            setOgImage('')
                            setScheduledAt('')
                            setExpiresAt('')
                            setNoindex(false)
                        }
                        router.push(`${basePath}/posts`)
                    }
                }
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred')
            }
        })
    }

    // Count active structured data sections for the current type
    const activeSectionCount = Object.values(s).filter(Boolean).length

    return (
        <div className="min-h-screen -mx-6">
            {/* SEO Modal */}
            {showSeoModal && (
                <SeoModal
                    checks={seoChecks}
                    score={seoScore}
                    onClose={() => setShowSeoModal(false)}
                    onProceed={doSubmit}
                    saveLabel={pendingSaveAs === 'published' ? 'Publish' : 'Save Draft'}
                />
            )}

            {/* ────────── Top Bar ────────── */}
            <div className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-sm px-6 pb-3">
                <div className="flex items-center gap-3">
                    <input
                        aria-label="Post Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title…"
                        className="flex-1 min-w-0 border-0 bg-transparent text-xl font-bold text-foreground placeholder:text-foreground-subtle/40 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" onClick={() => router.back()} disabled={isPending}>Cancel</Button>
                        <Button variant="secondary" disabled={isPending || !title} onClick={() => triggerSave('draft')}>
                            <Save className="size-4" /> {isPending ? 'Saving…' : 'Save Draft'}
                        </Button>
                        <Button disabled={isPending || !title} onClick={() => triggerSave('published')}>
                            <Eye className="size-4" /> {isPending ? (mode === 'edit' ? 'Updating…' : 'Publishing…') : (mode === 'edit' ? 'Update' : 'Publish')}
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">{error}</div>
            )}

            {/* ────────── Main Layout: Content + Sidebar ────────── */}
            <div className="flex gap-6 p-6">
                {/* ═══ LEFT: Main Content ═══ */}
                <div className="flex-1 min-w-0 space-y-5">
                    {/* Excerpt */}
                    <div>
                        <label htmlFor="post-excerpt" className="mb-2 block text-sm font-semibold text-foreground">Excerpt</label>
                        <textarea
                            id="post-excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Write a brief excerpt for listing cards and meta descriptions…"
                            rows={2}
                            maxLength={500}
                            className={`${inputCls} resize-none`}
                        />
                    </div>

                    {/* Content Editor */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label className="block text-sm font-semibold text-foreground">Content</label>
                            {mode === 'create' && <span className="text-[10px] text-foreground-subtle">Draft saved to browser</span>}
                        </div>
                        <TiptapEditor
                            content={content}
                            onChange={setContent}
                            uploadBucket="posts"
                            uploadFolder={authUserId}
                        />
                    </div>

                    {/* Structured Data */}
                    <div className="space-y-5">
                        <label className="mb-2 block text-sm font-semibold text-foreground">Structured Data</label>
                        {/* Direct Links (Admit/Result/Answer Key) */}
                        {(s.admitCardLink || s.resultLink || type === 'answer_key') && (
                            <>
                                <label className="mb-2 block text-sm font-semibold text-foreground">Direct Links</label>
                                {s.admitCardLink && (
                                    <Field label="Admit Card Download Link" hint="Direct link where students can download their admit card">
                                        <input type="url" value={admitCardLink} onChange={(e) => setAdmitCardLink(e.target.value)} placeholder="https://…" className={inputCls} />
                                    </Field>
                                )}
                                {s.resultLink && (
                                    <Field label="Result / Score Check Link" hint="Direct link to check marks or download scorecard">
                                        <input type="url" value={resultLinkUrl} onChange={(e) => setResultLinkUrl(e.target.value)} placeholder="https://…" className={inputCls} />
                                    </Field>
                                )}
                                {type === 'answer_key' && (
                                    <Field label="Answer Key Link" hint="Direct link to the official/provisional answer key">
                                        <input type="url" value={answerKeyLink} onChange={(e) => setAnswerKeyLink(e.target.value)} placeholder="https://…" className={inputCls} />
                                    </Field>
                                )}
                            </>
                        )}

                        {/* ── FAQ (always last) ── */}
                        {s.faq && (
                            <>
                                <label className="mb-2 block text-sm font-semibold text-foreground">Frequently Asked Questions</label>
                                <FaqEditor value={faq} onChange={setFaq} />
                            </>
                        )}
                    </div>
                </div>

                {/* ═══ RIGHT: Sidebar ═══ */}
                <div className="w-80 shrink-0 space-y-4">

                    {/* Publish Panel */}
                    <Panel title="Publish" defaultOpen>
                        <Field label="Post Type" required>
                            <select value={type} onChange={(e) => handleTypeChange(e.target.value)} className={selectCls}>
                                {POST_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </Field>
                        {mode === 'create' && (
                            <button
                                type="button"
                                onClick={handleGenerateAI}
                                disabled={isGenerating || !title.trim() || aiGenerated}
                                className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${aiGenerated
                                    ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400 cursor-default'
                                    : 'border-brand-200 bg-brand-50/50 text-brand-700 hover:bg-brand-100/50 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300 hover:dark:bg-brand-900/40'
                                    } ${(!title.trim() || isGenerating) && !aiGenerated ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isGenerating ? <><Loader2 className="size-3.5 animate-spin" /> Generating...</> : aiGenerated ? <><CheckCircle2 className="size-3.5" /> Content Generated</> : <><Sparkles className="size-3.5" /> Generate with AI</>}
                            </button>
                        )}
                        {cfg.showAppStatus && (
                            <Field label="Application Status">
                                <select value={applicationStatus} onChange={(e) => setApplicationStatus(e.target.value)} className={selectCls}>
                                    {APP_STATUSES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </Field>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <Field label="Schedule">
                                <input type="datetime-local" value={scheduledAt ? scheduledAt.slice(0, 16) : ''} onChange={(e) => setScheduledAt(e.target.value ? new Date(e.target.value).toISOString() : '')} className={`${inputCls} text-xs`} />
                            </Field>
                            <Field label="Expires">
                                <input type="datetime-local" value={expiresAt ? expiresAt.slice(0, 16) : ''} onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : '')} className={`${inputCls} text-xs`} />
                            </Field>
                        </div>
                    </Panel>

                    {/* Taxonomy Panel */}
                    <Panel title="Taxonomy" defaultOpen>
                        <Field label="State">
                            <select value={state} onChange={(e) => setState(e.target.value)} className={selectCls}>
                                <option value="">All India</option>
                                {states.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Organization">
                            <select value={organizationId} onChange={(e) => handleOrgChange(e.target.value)} className={selectCls}>
                                <option value="">Select…</option>
                                {organizations.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Category">
                            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectCls}>
                                <option value="">Select…</option>
                                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </Field>
                        <ChipSelect label="Qualifications" options={qualifications} value={selectedQualifications} onChange={setSelectedQualifications} />
                        <TagSelector allTags={tags} postType={type} value={selectedTags} onChange={setSelectedTags} />
                    </Panel>

                    {/* Featured Image Panel */}
                    <Panel title="Featured Image" defaultOpen>
                        <FileUpload
                            bucket="posts"
                            folder={authUserId}
                            value={featuredImage}
                            onChange={setFeaturedImage}
                            accept="image/jpeg,image/png,image/webp"
                            maxSizeMB={5}
                            preview="image"
                            hint="JPG, PNG, WebP - max 5 MB (1200×630 recommended)"
                        />
                        {featuredImage && (
                            <p className="text-[10px] text-foreground-subtle flex items-center gap-1">
                                <Info className="size-3" /> Alt text auto-generated from post title for SEO
                            </p>
                        )}
                    </Panel>

                    {/* Links Panel */}
                    <Panel title="Links & Documents" defaultOpen>
                        <Field label="Notification PDF">
                            <FileUpload
                                bucket="posts"
                                folder={authUserId}
                                value={notificationPdf}
                                onChange={setNotificationPdf}
                                accept="application/pdf"
                                maxSizeMB={5}
                                preview="pdf"
                                hint="Upload official notification PDF - max 5 MB"
                            />
                        </Field>
                    </Panel>

                    {/* SEO Panel */}
                    <Panel title="SEO" defaultOpen>
                        <Field label="Focus Keyword (Primary)" hint="Main keyword you want this post to rank for">
                            <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="e.g. SSC CGL 2025" className={inputCls} />
                        </Field>
                        <Field label="Secondary Keywords" hint="Press Enter or comma to add. These help rank for long-tail queries.">
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {secondaryKeywords.map((kw, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50/50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300">
                                        {kw}
                                        <button type="button" onClick={() => setSecondaryKeywords(secondaryKeywords.filter((_, j) => j !== i))} className="hover:text-red-500">&times;</button>
                                    </span>
                                ))}
                            </div>
                            <input
                                value={skInput}
                                onChange={(e) => setSkInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if ((e.key === 'Enter' || e.key === ',') && skInput.trim()) {
                                        e.preventDefault()
                                        const kw = skInput.replace(/,/g, '').trim()
                                        if (kw && !secondaryKeywords.includes(kw)) setSecondaryKeywords([...secondaryKeywords, kw])
                                        setSkInput('')
                                    }
                                }}
                                placeholder="e.g. SSC CGL Apply Online"
                                className={inputCls}
                            />
                        </Field>
                        <Field label={`Meta Title (${metaTitle.length}/70)`}>
                            <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={70} placeholder="Page title for search engines" className={inputCls} />
                        </Field>
                        <Field label={`Meta Description (${metaDescription.length}/165)`}>
                            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={165} rows={3} placeholder="Compelling description for search snippets…" className={`${inputCls} resize-none`} />
                        </Field>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} className="size-4 rounded border-border text-brand-600" />
                            <span className="text-xs text-foreground">Noindex (hide from Google)</span>
                        </label>
                    </Panel>
                </div>
            </div>
        </div>
    )
}

function sanitizeKV(obj: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {}
    Object.entries(obj).forEach(([k, v]) => {
        if (typeof k === 'string' && k.trim() && typeof v === 'string') {
            out[k.trim()] = v.trim()
        }
    })
    return out
}

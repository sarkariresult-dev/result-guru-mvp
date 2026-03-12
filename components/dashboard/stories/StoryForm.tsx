'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { WebStory, WebStorySlide } from '@/types/stories.types'
import { createWebStory, updateWebStory, saveStorySlides, publishStory } from '@/lib/actions/stories'
import { FileUpload } from '@/components/dashboard/FileUpload'
import { Button } from '@/components/ui/Button'
import {
    Save, Eye, EyeOff, Plus, Trash2, ArrowLeft,
    ChevronLeft, ChevronRight, Layout, Settings,
    Type, Link as LinkIcon, Image as ImageIcon,
    Sparkles, Info, AlertTriangle, CheckCircle2,
    Monitor, Tablet, Smartphone, MoveVertical
} from 'lucide-react'
import { slugify } from '@/lib/utils'

// ── Types ───────────────────────────────────────────────────────
interface StoryFormProps {
    authorId: string
    authUserId: string
    initialStory?: WebStory
    initialSlides?: WebStorySlide[]
    mode?: 'create' | 'edit'
    baseUrl: string
}

const MAX_STORY_TITLE = 70
const MAX_META_TITLE = 60
const MAX_META_DESC = 160
const MAX_SLIDE_HEADLINE = 80
const MAX_SLIDE_DESC = 200

// ── Shared UI Components ────────────────────────────────────────

function Panel({ title, icon: Icon, defaultOpen = true, children }: {
    title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    return (
        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-sm">
            <button
                type="button" onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-background-subtle/50 transition-colors"
            >
                <Icon className="size-4 text-brand-600" />
                <span className="flex-1">{title}</span>
                {isOpen ? <ChevronRight className="size-3.5 rotate-90 text-foreground-subtle" /> : <ChevronRight className="size-3.5 text-foreground-subtle" />}
            </button>
            {isOpen && <div className="border-t border-border px-4 py-4 space-y-4">{children}</div>}
        </div>
    )
}

function Field({ label, children, required, hint, current, max }: { 
    label: string; 
    children: React.ReactNode; 
    required?: boolean; 
    hint?: string;
    current?: number;
    max?: number
}) {
    const isWarning = current && max && current > max * 0.8
    const isError = current && max && current >= max

    return (
        <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
                <span className="block text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                </span>
                {max && (
                    <span className={`text-[10px] font-mono font-bold ${isError ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-foreground-subtle'}`}>
                        {current || 0}/{max}
                    </span>
                )}
            </div>
            {children}
            {hint && <span className="mt-1.5 block text-[10px] text-foreground-subtle italic">{hint}</span>}
        </label>
    )
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"

// ── Main Component ──────────────────────────────────────────────

export function StoryForm({
    authorId,
    authUserId,
    initialStory,
    initialSlides = [],
    mode = 'create',
    baseUrl
}: StoryFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // ── Story Metadata State ──
    const [title, setTitle] = useState(initialStory?.title ?? '')
    const [slug, setSlug] = useState(initialStory?.slug ?? '')
    const [coverImage, setCoverImage] = useState(initialStory?.cover_image ?? '')
    const [metaTitle, setMetaTitle] = useState(initialStory?.meta_title ?? '')
    const [metaDesc, setMetaDesc] = useState(initialStory?.meta_desc ?? '')
    const [status, setStatus] = useState<'draft' | 'published'>(initialStory?.status ?? 'draft')

    // ── Slides State ──
    const [slides, setSlides] = useState<Partial<WebStorySlide>[]>(
        initialSlides.length > 0 ? initialSlides : [{ bg_image: '', headline: '', position: 0 }]
    )
    const [activeIndex, setActiveIndex] = useState(0)

    // ── UI State ──
    const [view, setView] = useState<'slides' | 'settings'>('slides')

    const activeSlide = slides[activeIndex] || {}

    // ── Handlers ──

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setTitle(val)
        if (mode === 'create') {
            setSlug(slugify(val))
        }
    }

    const addSlide = () => {
        const newSlide = { bg_image: '', headline: '', position: slides.length }
        setSlides([...slides, newSlide])
        setActiveIndex(slides.length)
        setView('slides')
    }

    const removeSlide = (index: number) => {
        if (slides.length <= 1) return
        const newSlides = slides.filter((_, i) => i !== index)
        setSlides(newSlides)
        if (activeIndex >= index && activeIndex > 0) {
            setActiveIndex(activeIndex - 1)
        }
    }

    const updateActiveSlide = (updates: Partial<WebStorySlide>) => {
        const newSlides = [...slides]
        newSlides[activeIndex] = { ...newSlides[activeIndex], ...updates }
        setSlides(newSlides)
    }

    const moveSlide = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newSlides = [...slides]
            const temp = newSlides[index - 1] as Partial<WebStorySlide>
            newSlides[index - 1] = newSlides[index] as Partial<WebStorySlide>
            newSlides[index] = temp
            setSlides(newSlides)
            setActiveIndex(index - 1)
        } else if (direction === 'down' && index < slides.length - 1) {
            const newSlides = [...slides]
            const temp = newSlides[index + 1] as Partial<WebStorySlide>
            newSlides[index + 1] = newSlides[index] as Partial<WebStorySlide>
            newSlides[index] = temp
            setSlides(newSlides)
            setActiveIndex(index + 1)
        }
    }

    const handleSubmit = async (publish: boolean = false) => {
        setError(null)
        setSuccess(null)

        // Validation
        if (!title.trim()) { setError('Story title is required'); return }
        if (!slug.trim()) { setError('Story slug is required'); return }
        if (!coverImage) { setError('Cover image is required'); return }
        if (slides.some(s => !s.bg_image)) { setError('All slides must have a background image'); return }
        if (publish && slides.length < 4) { setError('Google Discover requires at least 4 slides to be valid'); return }

        startTransition(async () => {
            try {
                let storyId = initialStory?.id

                const storyData = {
                    title,
                    slug,
                    cover_image: coverImage,
                    meta_title: metaTitle || undefined,
                    meta_desc: metaDesc || undefined,
                    status: publish ? 'published' : 'draft',
                    published_at: publish ? new Date().toISOString() : (initialStory?.published_at || null)
                }

                if (mode === 'create') {
                    const res = await createWebStory(storyData, baseUrl)
                    if (res.error) throw new Error(res.error)
                    storyId = res.data?.id
                } else if (storyId) {
                    const res = await updateWebStory(storyId, storyData as any, baseUrl)
                    if (res.error) throw new Error(res.error)
                }

                if (storyId) {
                    const slideRes = await saveStorySlides(storyId, slides, baseUrl)
                    if (slideRes.error) throw new Error(slideRes.error)
                }

                setSuccess(publish ? 'Story published successfully!' : 'Story saved successfully!')

                if (mode === 'create' && storyId) {
                    router.push(`${baseUrl}/${storyId}`)
                } else {
                    router.refresh()
                }
            } catch (err: any) {
                setError(err.message || 'Failed to save story')
            }
        })
    }

    // ── Rendering Helpers ──

    return (
        <div className="flex flex-col h-full -mx-6">
            {/* Top Toolbar */}
            <div className="border-b -mt-6 border-border bg-surface/95 backdrop-blur-sm px-6 py-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <input
                        value={title}
                        onChange={handleTitleChange}
                        maxLength={MAX_STORY_TITLE}
                        placeholder="Story Title..."
                        className="flex-1 bg-transparent text-lg font-bold outline-none placeholder:text-foreground-subtle/40 truncate"
                    />
                    <div className={`text-[10px] font-black shrink-0 px-2 py-1 rounded bg-background border ${title.length >= MAX_STORY_TITLE ? 'text-red-500 border-red-200' : title.length > MAX_STORY_TITLE * 0.8 ? 'text-amber-500 border-amber-200' : 'text-foreground-muted border-border'}`}>
                        {title.length}/{MAX_STORY_TITLE}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => router.push(baseUrl)} className="p-2 flex items-center gap-2 hover:bg-background-subtle rounded-lg transition-colors">
                        <ArrowLeft className="size-5" /> Back
                    </button>
                    <Button variant="secondary" onClick={() => handleSubmit(false)} disabled={isPending}>
                        <Save className="size-4" /> {isPending ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button onClick={() => handleSubmit(true)} disabled={isPending}>
                        {status === 'published' ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        {status === 'published' ? 'Update Live' : 'Publish'}
                    </Button>
                </div>
            </div>

            {error && <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200 animate-in fade-in slide-in-from-top-1 z-50">{error}</div>}
            {success && <div className="mx-6 mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 animate-in fade-in slide-in-from-top-1 z-50">{success}</div>}

            <div className="flex flex-1 overflow-hidden">
                {/* 1. Left Column: Story Configuration */}
                <div className="w-[320px] shrink-0 border-r border-border bg-background-subtle/20 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground-muted flex items-center gap-2 mb-6">
                            <Settings className="size-3.5 text-brand-600" /> Configuration
                        </h3>

                        <div className="space-y-6">
                            <Field label="URL Slug" required>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-foreground-subtle uppercase tracking-widest px-1.5 py-0.5 bg-background-subtle rounded border border-border">/stories/</span>
                                    <input
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        className={`${inputCls} pl-24 font-mono text-xs`}
                                        placeholder="recruitment-2026"
                                    />
                                </div>
                            </Field>

                            <Field label="Main Cover Image" required hint="1200x1200px or vertical">
                                <FileUpload
                                    bucket="stories"
                                    folder={`author-${authorId}/covers`}
                                    value={coverImage}
                                    onChange={setCoverImage}
                                    accept="image/jpeg,image/png,image/webp"
                                    preview="image"
                                />
                            </Field>

                            <div className="pt-4 border-t border-border space-y-5">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-muted">SEO Metadata</h4>
                                <Field label="SEO Title" current={metaTitle.length} max={MAX_META_TITLE}>
                                    <input
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        maxLength={MAX_META_TITLE}
                                        className={inputCls}
                                        placeholder={title.substring(0, MAX_META_TITLE)}
                                    />
                                </Field>
                                <Field label="Meta Description" current={metaDesc.length} max={MAX_META_DESC}>
                                    <textarea
                                        rows={3}
                                        value={metaDesc}
                                        onChange={(e) => setMetaDesc(e.target.value)}
                                        maxLength={MAX_META_DESC}
                                        className={`${inputCls} resize-none text-xs`}
                                        placeholder="Brief summary for Google..."
                                    />
                                </Field>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4 space-y-3 dark:border-brand-900/30 dark:bg-brand-900/10">
                        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
                            <Sparkles className="size-3.5" /> Discovery Tips
                        </h4>
                        <ul className="space-y-2 text-[10px] text-brand-800/80 dark:text-brand-300/80 leading-relaxed font-medium">
                            <li className="flex gap-2"><span>•</span> Min 4 slides required</li>
                            <li className="flex gap-2"><span>•</span> High-res vertical images</li>
                            <li className="flex gap-2"><span>•</span> Action-oriented buttons</li>
                        </ul>
                    </div>
                </div>

                {/* 2. Center Column: Slide Editor */}
                <div className="flex-1 bg-surface border-r border-border overflow-y-auto custom-scrollbar p-8 @container">
                    <div className="max-w-3xl mx-auto space-y-10">
                        {/* Slide Sorter */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-foreground-muted flex items-center gap-2">
                                    <Layout className="size-3.5 text-brand-600" /> Story Sequence ({slides.length})
                                </h3>
                                <button onClick={addSlide} className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 transition-colors">
                                    <Plus className="size-3.5" /> Add New Slide
                                </button>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2">
                                {slides.map((s, i) => (
                                    <div key={i} className="relative group shrink-0">
                                        <button
                                            onClick={() => setActiveIndex(i)}
                                            className={`relative h-32 w-24 rounded-xl border-2 transition-all duration-300 overflow-hidden ${i === activeIndex
                                                ? 'border-brand-500 ring-4 ring-brand-500/10 scale-105 shadow-xl'
                                                : 'border-border hover:border-brand-300 hover:scale-102 bg-background-muted/50'
                                                }`}
                                        >
                                            {s.bg_image ? (
                                                <img src={s.bg_image} className="size-full object-cover" />
                                            ) : (
                                                <div className="size-full flex items-center justify-center opacity-10"><ImageIcon className="size-6" /></div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 bg-black/40 p-1.5 flex justify-center">
                                                <span className="text-[10px] font-black text-white">{i + 1}</span>
                                            </div>
                                        </button>
                                        {slides.length > 1 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeSlide(i) }}
                                                className="absolute -top-2 -right-2 size-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-md z-10"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Current Slide Form */}
                        <div className="space-y-10 pb-20">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <span className="flex size-7 items-center justify-center rounded-lg bg-brand-600 text-[11px] font-black text-white">{activeIndex + 1}</span>
                                    Slide Editor
                                </h2>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => moveSlide(activeIndex, 'up')} disabled={activeIndex === 0}><ChevronLeft className="size-4" /></Button>
                                    <Button size="sm" variant="secondary" onClick={() => moveSlide(activeIndex, 'down')} disabled={activeIndex === slides.length - 1}><ChevronRight className="size-4" /></Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 @xl:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-6">
                                    <Field label="Slide Background" required hint="9:16 portrait style">
                                        <FileUpload
                                            bucket="stories"
                                            folder={`author-${authorId}/slides`}
                                            value={activeSlide.bg_image || ''}
                                            onChange={(url) => updateActiveSlide({ bg_image: url })}
                                            accept="image/jpeg,image/png,image/webp"
                                            preview="image"
                                        />
                                    </Field>

                                    <Field label="Layer Styles">
                                        <div className="flex gap-4">
                                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border p-2 bg-background-muted/30">
                                                <Type className="size-3.5 text-foreground-muted" />
                                                <input
                                                    type="color"
                                                    value={activeSlide.text_color || '#ffffff'}
                                                    onChange={(e) => updateActiveSlide({ text_color: e.target.value })}
                                                    className="size-6 p-0 bg-transparent border-0 cursor-pointer"
                                                />
                                                <span className="text-[10px] font-mono opacity-60 uppercase">{activeSlide.text_color || '#ffffff'}</span>
                                            </div>
                                            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border p-2 bg-background-muted/30">
                                                <ImageIcon className="size-3.5 text-foreground-muted" />
                                                <input
                                                    type="color"
                                                    value={activeSlide.bg_color || '#000000'}
                                                    onChange={(e) => updateActiveSlide({ bg_color: e.target.value })}
                                                    className="size-6 p-0 bg-transparent border-0 cursor-pointer"
                                                />
                                                <span className="text-[10px] font-mono opacity-60 uppercase">{activeSlide.bg_color || '#000000'}</span>
                                            </div>
                                        </div>
                                    </Field>
                                </div>

                                <div className="space-y-6">
                                    <Field label="Primary Headline" current={activeSlide.headline?.length || 0} max={MAX_SLIDE_HEADLINE}>
                                        <input
                                            value={activeSlide.headline || ''}
                                            onChange={(e) => updateActiveSlide({ headline: e.target.value })}
                                            maxLength={MAX_SLIDE_HEADLINE}
                                            className={`${inputCls} font-bold h-11`}
                                            placeholder="Catchy slide title..."
                                        />
                                    </Field>

                                    <Field label="Description Text" current={activeSlide.description?.length || 0} max={MAX_SLIDE_DESC}>
                                        <textarea
                                            rows={3}
                                            value={activeSlide.description || ''}
                                            onChange={(e) => updateActiveSlide({ description: e.target.value })}
                                            maxLength={MAX_SLIDE_DESC}
                                            className={`${inputCls} resize-none py-3`}
                                            placeholder="Briefly support the headline..."
                                        />
                                    </Field>

                                    <div className="p-5 rounded-2xl bg-background-subtle/50 border border-border space-y-5">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground-muted">Interactive Call-to-Action</h4>
                                        <div className="space-y-4">
                                            <Field label="Button Text">
                                                <input
                                                    value={activeSlide.cta_text || ''}
                                                    onChange={(e) => updateActiveSlide({ cta_text: e.target.value })}
                                                    className={inputCls}
                                                    placeholder="Learn More"
                                                />
                                            </Field>
                                            <Field label="Link URL">
                                                <div className="relative">
                                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-foreground-subtle" />
                                                    <input
                                                        value={activeSlide.cta_link || ''}
                                                        onChange={(e) => updateActiveSlide({ cta_link: e.target.value })}
                                                        className={`${inputCls} pl-10 text-xs`}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Right Column: Mobile Preview */}
                <div className="w-[400px] shrink-0 bg-background-subtle/30 overflow-y-auto custom-scrollbar flex flex-col items-center p-8">
                    <div className="flex items-center justify-between w-full mb-10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground-muted self-start">Live Preview</h3>
                        <span className={`hidden sm:inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-border mr-2 ${status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'}`}>
                            {status === 'published' ? 'Live' : 'Draft'}
                        </span>
                    </div>

                    {/* Smartphone Preview Mockup */}
                    <div className="relative aspect-9/16 w-full max-w-[280px] rounded-[3rem] bg-slate-950 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] ring-12 ring-slate-900 border-4 border-slate-800 overflow-hidden group">
                        {/* Status bar */}
                        <div className="absolute top-0 inset-x-0 h-8 z-40 flex justify-between px-8 items-center text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                            <div className="flex gap-1.5 items-center">
                                <Monitor className="size-3" />
                                <div className="size-2 rounded-full bg-white/40" />
                            </div>
                    </div>

                        {/* Background */}
                        {activeSlide.bg_image ? (
                            <img src={activeSlide.bg_image} alt="Slide Preview" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="absolute inset-0 bg-linear-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 text-center text-slate-700">
                                <ImageIcon className="size-12 mb-4 opacity-10" />
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-50">Background Missing</p>
                            </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-80" />

                        {/* Text Content */}
                        <div className="absolute inset-x-0 bottom-0 p-8 pt-24 z-20 flex flex-col gap-3 text-center transition-transform duration-500 ease-out">
                            {activeSlide.headline && (
                                <h3 className="text-lg font-black text-white leading-tight drop-shadow-2xl" style={{ color: activeSlide.text_color || '#ffffff' }}>
                                    {activeSlide.headline}
                                </h3>
                            )}
                            {activeSlide.description && (
                                <p className="text-[11px] font-medium text-white/80 line-clamp-3 leading-relaxed" style={{ color: activeSlide.text_color || '#ffffff' }}>
                                    {activeSlide.description}
                                </p>
                            )}

                            {activeSlide.cta_link && (
                                <div className="mt-4 flex flex-col items-center gap-3">
                                    <div className="px-6 py-2.5 rounded-full bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-xl">
                                        {activeSlide.cta_text || 'Learn More'}
                                    </div>
                                    <ChevronRight className="size-4 text-white/50 -rotate-90 animate-bounce" />
                                </div>
                            )}
                        </div>

                        {/* Progress Bars */}
                        <div className="absolute top-10 inset-x-6 flex gap-1 z-30">
                            {slides.map((_, i) => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-white' : 'bg-white/20'}`} />
                            ))}
                        </div>

                        {/* Navigation Overlay Hints */}
                        <div className="absolute inset-0 z-10 flex">
                            <div onClick={() => activeIndex > 0 && setActiveIndex(activeIndex - 1)} className="flex-1 cursor-w-resize" />
                            <div onClick={() => activeIndex < slides.length - 1 && setActiveIndex(activeIndex + 1)} className="flex-1 cursor-e-resize" />
                        </div>
                    </div>

                    <div className="mt-8 p-4 rounded-xl border border-border bg-surface w-full max-w-[280px]">
                        <p className="text-[10px] text-foreground-subtle italic text-center">
                            Interactive Preview: Click left/right of device to navigate slides
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

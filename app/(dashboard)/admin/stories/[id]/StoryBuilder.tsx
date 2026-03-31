'use client'

import { useState } from 'react'
import { WebStory, WebStorySlide } from '@/types/stories.types'
import { saveStorySlides, publishStory, updateWebStory } from '@/lib/actions/stories'
import { Plus, Trash2, ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function StoryBuilder({
    story,
    initialSlides
}: {
    story: WebStory
    initialSlides: WebStorySlide[]
}) {
    const router = useRouter()

    // Core state
    const [slides, setSlides] = useState<Partial<WebStorySlide>[]>(
        initialSlides.length > 0
            ? initialSlides
            : [{ bg_image: '', headline: 'New Headline' }] // Start with 1 empty slide if none exist
    )
    const [activeIndex, setActiveIndex] = useState(0)

    // Story metadata state (editable in sidebar)
    const [metaTitle, setMetaTitle] = useState(story.meta_title || '')
    const [metaDesc, setMetaDesc] = useState(story.meta_desc || '')

    // UI state
    const [isSaving, setIsSaving] = useState(false)
    const [isPublishing, setIsPublishing] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const activeSlide = slides[activeIndex] || { bg_image: '' }

    // ── Handlers ──

    const goBack = () => router.push('/admin/stories')

    const addSlide = () => {
        setSlides([...slides, { bg_image: '', headline: 'New Slide' }])
        setActiveIndex(slides.length)
    }

    const removeSlide = (index: number) => {
        if (slides.length <= 1) return // Prevent deleting the last slide
        const newSlides = slides.filter((_, i) => i !== index)
        setSlides(newSlides)
        if (activeIndex >= index && activeIndex > 0) {
            setActiveIndex(activeIndex - 1)
        }
    }

    const updateActiveSlide = (key: keyof WebStorySlide, value: string) => {
        const newSlides = [...slides]
        newSlides[activeIndex] = { ...newSlides[activeIndex], [key]: value }
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

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)

        try {
            // Validate: check if all slides have images
            const missingImages = slides.some(s => !s.bg_image)
            if (missingImages) {
                setMessage({ type: 'error', text: 'All slides must have a background image url.' })
                setIsSaving(false)
                return
            }

            // Save story metadata first
            await updateWebStory(story.id, {
                meta_title: metaTitle,
                meta_desc: metaDesc
            })

            // Save slides (replaces all existing)
            const slideRes = await saveStorySlides(story.id, slides)
            if (slideRes.error) throw new Error(slideRes.error)

            setMessage({ type: 'success', text: 'Story saved successfully' })
            setTimeout(() => setMessage(null), 3000)
        } catch (error) {
            setMessage({ type: 'error', text: (error as Error).message || 'Failed to save' })
        } finally {
            setIsSaving(false)
        }
    }

    const handleTogglePublish = async () => {
        if (slides.length < 4 && story.status === 'draft') {
            setMessage({ type: 'error', text: 'Google Discover requires a minimum of 4 slides to be indexed.' })
            return
        }

        setIsPublishing(true)
        setMessage(null)
        try {
            const newStatus = story.status === 'published' ? false : true
            const res = await publishStory(story.id, newStatus)
            if (res.error) throw new Error(res.error)

            setMessage({ type: 'success', text: newStatus ? 'Story published!' : 'Reverted to draft.' })
        } catch (error) {
            setMessage({ type: 'error', text: (error as Error).message || 'Failed to change status' })
        } finally {
            setIsPublishing(false)
        }
    }

    // ── Render ──

    return (
        <div className="flex h-full min-h-[800px] gap-6 overflow-hidden pb-8">
            {/* Left: Device Preview Panel */}
            <div className="flex w-[350px] shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
                <div className="mb-4 flex items-center justify-between">
                    <button onClick={goBack} className="flex flex-row items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <div className="text-xs font-medium text-slate-500">
                        Slide {activeIndex + 1} of {slides.length}
                    </div>
                </div>

                {/* Simulated 9:16 Device Screen */}
                <div className="relative mx-auto flex aspect-9/16 w-[300px] shrink-0 flex-col overflow-hidden rounded-2xl bg-black shadow-xl ring-4 ring-slate-800">
                    {/* Background */}
                    {activeSlide.bg_image ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${activeSlide.bg_image})` }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-xs text-slate-500">
                            No Image Set
                        </div>
                    )}

                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/40" />

                    {/* Content Overlay */}
                    <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white">
                        {activeSlide.headline && (
                            <h2
                                className="mb-2 text-2xl font-bold leading-tight"
                                style={{ color: activeSlide.text_color || '#ffffff' }}
                            >
                                {activeSlide.headline}
                            </h2>
                        )}
                        {activeSlide.description && (
                            <p
                                className="mb-6 text-sm opacity-90"
                                style={{ color: activeSlide.text_color || '#ffffff' }}
                            >
                                {activeSlide.description}
                            </p>
                        )}

                        {/* Fake Swipe Up */}
                        {activeSlide.cta_link && (
                            <div className="mt-4 flex flex-col items-center opacity-80 pb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider">
                                    {activeSlide.cta_text || 'Swipe Up'}
                                </span>
                                <div className="mt-1 h-1 w-12 rounded-full bg-white/50" />
                            </div>
                        )}
                    </div>

                    {/* Slide progress bars (fake) */}
                    <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                        {slides.map((_, i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full ${i === activeIndex ? 'bg-white' : 'bg-white/30'}`} />
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex justify-between gap-2">
                    <button
                        onClick={() => moveSlide(activeIndex, 'up')}
                        disabled={activeIndex === 0}
                        className="flex-1 rounded-md bg-white p-2 text-xs font-medium text-slate-700 shadow-sm disabled:opacity-50"
                    >
                        Move Left
                    </button>
                    <button
                        onClick={() => moveSlide(activeIndex, 'down')}
                        disabled={activeIndex === slides.length - 1}
                        className="flex-1 rounded-md bg-white p-2 text-xs font-medium text-slate-700 shadow-sm disabled:opacity-50"
                    >
                        Move Right
                    </button>
                    <button
                        onClick={() => removeSlide(activeIndex)}
                        disabled={slides.length <= 1}
                        className="rounded-md bg-red-50 p-2 text-red-600 shadow-sm hover:bg-red-100 disabled:opacity-50"
                        title="Delete Slide"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Right: Editing Controls */}
            <div className="flex flex-1 flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-4 backdrop-blur">
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${story.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                            {story.status === 'published' ? 'LIVE' : 'DRAFT'}
                        </span>
                        {message && (
                            <span className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {message.text}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button
                            onClick={handleTogglePublish}
                            disabled={isPublishing || isSaving}
                            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50 ${story.status === 'published' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                        >
                            {story.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {story.status === 'published' ? 'Unpublish' : 'Publish Story'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 p-6">
                    {/* Slide Navigation Strip */}
                    <div className="mb-8 overflow-x-auto pb-4">
                        <div className="flex gap-4">
                            {slides.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`relative flex h-24 w-16 shrink-0 flex-col overflow-hidden rounded-md border-2 transition-all ${i === activeIndex ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 hover:border-blue-400'
                                        }`}
                                >
                                    {s.bg_image ? (
                                        <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${s.bg_image})` }} />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-100" />
                                    )}
                                    <div className="relative z-10 m-auto flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/50 text-xs font-bold text-white">
                                        {i + 1}
                                    </div>
                                </button>
                            ))}
                            <button
                                onClick={addSlide}
                                className="flex h-24 w-16 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-500"
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Slide Editor */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Edit Slide {activeIndex + 1}</h3>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Background Image URL</label>
                                <input
                                    type="url"
                                    value={activeSlide.bg_image || ''}
                                    onChange={(e) => updateActiveSlide('bg_image', e.target.value)}
                                    className="block w-full rounded-md border-slate-300 sm:text-sm"
                                    placeholder="https://"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Headline</label>
                                <input
                                    type="text"
                                    value={activeSlide.headline || ''}
                                    onChange={(e) => updateActiveSlide('headline', e.target.value)}
                                    className="block w-full rounded-md border-slate-300 font-bold sm:text-sm"
                                    placeholder="Keep it punchy"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    value={activeSlide.description || ''}
                                    onChange={(e) => updateActiveSlide('description', e.target.value)}
                                    rows={3}
                                    className="block w-full rounded-md border-slate-300 sm:text-sm"
                                    placeholder="Optional supporting text..."
                                />
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <h4 className="text-sm font-semibold text-slate-900">Swipe Up Link (Optional)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Button Text</label>
                                        <input
                                            type="text"
                                            value={activeSlide.cta_text || ''}
                                            onChange={(e) => updateActiveSlide('cta_text', e.target.value)}
                                            className="block w-full rounded-md border-slate-300 sm:text-sm"
                                            placeholder="e.g. Read More"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Destination URL</label>
                                        <input
                                            type="url"
                                            value={activeSlide.cta_link || ''}
                                            onChange={(e) => updateActiveSlide('cta_link', e.target.value)}
                                            className="block w-full rounded-md border-slate-300 sm:text-sm"
                                            placeholder="/jobs/..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Story Meta Editor */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Story SEO Settings</h3>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Meta Title</label>
                                <input
                                    type="text"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    className="block w-full rounded-md border-slate-300 sm:text-sm"
                                    placeholder={story.title}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">Meta Description</label>
                                <textarea
                                    value={metaDesc}
                                    onChange={(e) => setMetaDesc(e.target.value)}
                                    rows={3}
                                    className="block w-full rounded-md border-slate-300 sm:text-sm"
                                />
                            </div>

                            <div className="rounded-md bg-blue-50 p-4 mt-6">
                                <h4 className="text-sm font-medium text-blue-800">Google Discover Rules</h4>
                                <ul className="mt-2 list-disc pl-5 text-sm text-blue-700 space-y-1">
                                    <li>Minimum 4 slides required.</li>
                                    <li>Videos should be max 15s (using images here for MVP).</li>
                                    <li>Keep text minimal. Let the image speak.</li>
                                    <li>Cover image must be high-res 9:16 portrait.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

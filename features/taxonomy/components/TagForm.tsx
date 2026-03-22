'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { createTag, updateTag } from '@/features/taxonomy/actions'
import type { Tag } from '@/types/taxonomy.types'

const TAG_TYPES = ['general', 'job', 'exam', 'result', 'admission', 'scheme', 'scholarship'] as const

interface TagFormProps {
    open: boolean
    onClose: () => void
    tag?: Tag | null
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

export function TagForm({ open, onClose, tag }: TagFormProps) {
    const isEditing = !!tag
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')
    const [slugTouched, setSlugTouched] = useState(false)

    const [form, setForm] = useState({
        name: '',
        slug: '',
        tag_type: 'general' as string,
        description: '',
        is_active: true,
        meta_title: '',
        meta_description: '',
        meta_robots: 'index,follow',
        canonical_tag_id: '',
    })

    useEffect(() => {
        if (open) {
            if (tag) {
                setForm({
                    name: tag.name,
                    slug: tag.slug,
                    tag_type: tag.tag_type,
                    description: tag.description ?? '',
                    is_active: tag.is_active,
                    meta_title: tag.meta_title ?? '',
                    meta_description: tag.meta_description ?? '',
                    meta_robots: tag.meta_robots ?? 'index,follow',
                    canonical_tag_id: tag.canonical_tag_id ?? '',
                })
                setSlugTouched(true)
            } else {
                setForm({
                    name: '', slug: '', tag_type: 'general', description: '',
                    is_active: true, meta_title: '', meta_description: '',
                    meta_robots: 'index,follow', canonical_tag_id: '',
                })
                setSlugTouched(false)
            }
            setError('')
        }
    }, [open, tag])

    function handleNameChange(name: string) {
        setForm(prev => ({
            ...prev,
            name,
            slug: slugTouched ? prev.slug : slugify(name),
        }))
    }

    function handleSubmit() {
        setError('')
        startTransition(async () => {
            const payload = {
                name: form.name,
                slug: form.slug,
                tag_type: form.tag_type as typeof TAG_TYPES[number],
                description: form.description || null,
                is_active: form.is_active,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                meta_robots: form.meta_robots || 'index,follow',
                canonical_tag_id: form.canonical_tag_id || null,
            }

            const result = isEditing
                ? await updateTag(tag!.id, payload)
                : await createTag(payload)

            if (result.error) {
                setError(result.error)
            } else {
                onClose()
                router.refresh()
            }
        })
    }

    return (
        <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Tag' : 'Add Tag'}>
            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">Name *</label>
                    <Input
                        value={form.name}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="e.g. SSC CGL 2025"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Slug *</label>
                    <Input
                        value={form.slug}
                        onChange={e => { setSlugTouched(true); setForm(prev => ({ ...prev, slug: e.target.value })) }}
                        placeholder="e.g. ssc-cgl-2025"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Tag Type</label>
                    <Select
                        value={form.tag_type}
                        onChange={e => setForm(prev => ({ ...prev, tag_type: e.target.value }))}
                    >
                        {TAG_TYPES.map(t => (
                            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                    </Select>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <textarea
                        value={form.description}
                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Short description..."
                        rows={2}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="tag-active"
                        checked={form.is_active}
                        onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="size-4 rounded border-border"
                    />
                    <label htmlFor="tag-active" className="text-sm font-medium">Active</label>
                </div>

                <details className="rounded-lg border border-border">
                    <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-foreground-muted">
                        SEO Settings
                    </summary>
                    <div className="space-y-3 px-4 pb-4 pt-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-foreground-muted">Meta Title</label>
                            <Input
                                value={form.meta_title}
                                onChange={e => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                                placeholder="Custom meta title..."
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-foreground-muted">Meta Description</label>
                            <textarea
                                value={form.meta_description}
                                onChange={e => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
                                placeholder="Custom meta description (max 165 chars)..."
                                maxLength={165}
                                rows={2}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-foreground-muted">Meta Robots</label>
                            <select
                                value={form.meta_robots}
                                onChange={e => setForm(prev => ({ ...prev, meta_robots: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            >
                                <option value="index,follow">Index, Follow</option>
                                <option value="noindex,follow">NoIndex, Follow</option>
                                <option value="noindex,nofollow">NoIndex, NoFollow</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-foreground-muted">Canonical Tag ID</label>
                            <Input
                                value={form.canonical_tag_id}
                                onChange={e => setForm(prev => ({ ...prev, canonical_tag_id: e.target.value }))}
                                placeholder="Paste UUID of another tag..."
                            />
                            <p className="mt-1 text-xs text-foreground-subtle">
                                Point duplicate tags to a single primary tag to consolidate SEO ranking.
                            </p>
                        </div>
                    </div>
                </details>

                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSubmit} loading={isPending}>
                        {isEditing ? 'Save Changes' : 'Create Tag'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

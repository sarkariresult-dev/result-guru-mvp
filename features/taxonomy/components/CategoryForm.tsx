'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { createCategory, updateCategory } from '@/features/taxonomy/actions'
import type { Category } from '@/types/taxonomy.types'

interface CategoryFormProps {
    open: boolean
    onClose: () => void
    category?: Category | null
    parentOptions: Pick<Category, 'id' | 'slug' | 'name' | 'parent_id'>[]
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

export function CategoryForm({ open, onClose, category, parentOptions }: CategoryFormProps) {
    const isEditing = !!category
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')
    const [slugTouched, setSlugTouched] = useState(false)

    const [form, setForm] = useState({
        name: '',
        slug: '',
        parent_id: '',
        description: '',
        icon: '',
        sort_order: 0,
        is_active: true,
        meta_title: '',
        meta_description: '',
        meta_robots: 'index,follow',
        h1_override: '',
        intro_html: '',
    })

    useEffect(() => {
        if (open) {
            if (category) {
                setForm({
                    name: category.name,
                    slug: category.slug,
                    parent_id: category.parent_id ?? '',
                    description: category.description ?? '',
                    icon: category.icon ?? '',
                    sort_order: category.sort_order,
                    is_active: category.is_active,
                    meta_title: category.meta_title ?? '',
                    meta_description: category.meta_description ?? '',
                    meta_robots: category.meta_robots ?? 'index,follow',
                    h1_override: category.h1_override ?? '',
                    intro_html: category.intro_html ?? '',
                })
                setSlugTouched(true)
            } else {
                setForm({
                    name: '', slug: '', parent_id: '', description: '',
                    icon: '', sort_order: 0, is_active: true,
                    meta_title: '', meta_description: '',
                    meta_robots: 'index,follow', h1_override: '', intro_html: '',
                })
                setSlugTouched(false)
            }
            setError('')
        }
    }, [open, category])

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
                parent_id: form.parent_id || null,
                description: form.description || null,
                icon: form.icon || null,
                sort_order: form.sort_order,
                is_active: form.is_active,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                meta_robots: form.meta_robots || 'index,follow',
                h1_override: form.h1_override || null,
                intro_html: form.intro_html || null,
            }

            const result = isEditing
                ? await updateCategory(category!.id, payload)
                : await createCategory(payload)

            if (result.error) {
                setError(result.error)
            } else {
                onClose()
                router.refresh()
            }
        })
    }

    // Filter out current category from parent options (can't be its own parent)
    const filteredParents = parentOptions.filter(p => !category || p.id !== category.id)

    return (
        <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Category' : 'Add Category'}>
            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">Name *</label>
                    <Input
                        value={form.name}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="e.g. Railway Jobs"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Slug *</label>
                    <Input
                        value={form.slug}
                        onChange={e => { setSlugTouched(true); setForm(prev => ({ ...prev, slug: e.target.value })) }}
                        placeholder="e.g. railway-jobs"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Parent Category</label>
                    <Select
                        value={form.parent_id}
                        onChange={e => setForm(prev => ({ ...prev, parent_id: e.target.value }))}
                    >
                        <option value="">None (Top Level)</option>
                        {filteredParents.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Icon</label>
                        <Input
                            value={form.icon}
                            onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
                            placeholder="e.g. Train"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Sort Order</label>
                        <Input
                            type="number"
                            value={form.sort_order}
                            onChange={e => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
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
                        id="cat-active"
                        checked={form.is_active}
                        onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="size-4 rounded border-border"
                    />
                    <label htmlFor="cat-active" className="text-sm font-medium">Active</label>
                </div>

                {/* SEO fields (collapsed by default) */}
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
                            <label className="mb-1 block text-xs font-medium text-foreground-muted">H1 Override</label>
                            <Input
                                value={form.h1_override}
                                onChange={e => setForm(prev => ({ ...prev, h1_override: e.target.value }))}
                                placeholder="Custom H1 heading..."
                            />
                        </div>
                    </div>
                </details>

                <details className="rounded-lg border border-border">
                    <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-foreground-muted">
                        Page Content (Bottom)
                    </summary>
                    <div className="space-y-3 px-4 pb-4 pt-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-foreground-muted">Intro HTML</label>
                            <textarea
                                value={form.intro_html}
                                onChange={e => setForm(prev => ({ ...prev, intro_html: e.target.value }))}
                                placeholder="<p>Long description or HTML content...</p>"
                                rows={4}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
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
                        {isEditing ? 'Save Changes' : 'Create Category'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

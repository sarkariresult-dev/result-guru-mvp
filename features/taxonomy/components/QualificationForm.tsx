'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createQualification, updateQualification } from '@/features/taxonomy/actions'
import type { Qualification } from '@/types/taxonomy.types'

interface QualificationFormProps {
    open: boolean
    onClose: () => void
    qualification?: Qualification | null
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

export function QualificationForm({ open, onClose, qualification }: QualificationFormProps) {
    const isEditing = !!qualification
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')
    const [slugTouched, setSlugTouched] = useState(false)

    const [form, setForm] = useState({
        slug: '',
        name: '',
        short_name: '',
        sort_order: 0,
        is_active: true,
        meta_title: '',
        meta_description: '',
        meta_robots: 'index,follow',
    })

    useEffect(() => {
        if (open) {
            if (qualification) {
                // eslint-disable-next-line react-hooks/set-state-in-effect -- form initialization
                setForm({
                    slug: qualification.slug,
                    name: qualification.name,
                    short_name: qualification.short_name ?? '',
                    sort_order: qualification.sort_order,
                    is_active: qualification.is_active,
                    meta_title: qualification.meta_title ?? '',
                    meta_description: qualification.meta_description ?? '',
                    meta_robots: qualification.meta_robots ?? 'index,follow',
                })
                setSlugTouched(true)
            } else {
                setForm({
                    slug: '', name: '', short_name: '', sort_order: 0,
                    is_active: true, meta_title: '', meta_description: '',
                    meta_robots: 'index,follow',
                })
                setSlugTouched(false)
            }
            setError('')
        }
    }, [open, qualification])

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
                slug: form.slug,
                name: form.name,
                short_name: form.short_name || null,
                sort_order: form.sort_order,
                is_active: form.is_active,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                meta_robots: form.meta_robots || 'index,follow',
            }

            const result = isEditing
                ? await updateQualification(qualification!.slug, payload)
                : await createQualification(payload)

            if (result.error) {
                setError(result.error)
            } else {
                onClose()
                router.refresh()
            }
        })
    }

    return (
        <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Qualification' : 'Add Qualification'}>
            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">Name *</label>
                    <Input
                        value={form.name}
                        onChange={e => handleNameChange(e.target.value)}
                        placeholder="e.g. Graduation"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Slug * {isEditing && <span className="text-xs text-foreground-subtle">(read-only)</span>}</label>
                        <Input
                            value={form.slug}
                            onChange={e => { setSlugTouched(true); setForm(prev => ({ ...prev, slug: e.target.value })) }}
                            placeholder="e.g. graduation"
                            disabled={isEditing}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Short Name</label>
                        <Input
                            value={form.short_name}
                            onChange={e => setForm(prev => ({ ...prev, short_name: e.target.value }))}
                            placeholder="e.g. Deg"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Sort Order</label>
                        <Input
                            type="number"
                            value={form.sort_order}
                            onChange={e => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
                    <div className="flex items-end pb-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="qual-active"
                                checked={form.is_active}
                                onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="size-4 rounded border-border"
                            />
                            <label htmlFor="qual-active" className="text-sm font-medium">Active</label>
                        </div>
                    </div>
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
                                placeholder="Custom meta description..."
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
                        {isEditing ? 'Save Changes' : 'Create Qualification'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { POST_TYPES, APPLICATION_STATUSES } from '@/config/constants'

interface Props {
    initialData?: Record<string, unknown>
    onSubmit: (data: Record<string, unknown>) => Promise<void>
    loading?: boolean
}

export function PostEditor({ initialData, onSubmit, loading }: Props) {
    const [data, setData] = useState<Record<string, unknown>>(initialData ?? {
        title: '', slug: '', type: 'job', status: 'draft', application_status: 'na',
        excerpt: '', content: '', state_slug: '', organization_id: '',
    })

    const update = (key: string, value: unknown) => {
        setData((prev) => {
            const next = { ...prev, [key]: value }
            // Auto-generate slug from title
            if (key === 'title' && !prev['_slugManual']) {
                next['slug'] = String(value)
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .slice(0, 120)
            }
            return next
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit(data)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium">Title</label>
                    <Input value={String(data['title'] ?? '')} onChange={(e) => update('title', e.target.value)} required />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Slug</label>
                    <Input value={String(data['slug'] ?? '')} onChange={(e) => update('slug', e.target.value)} required />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <label className="mb-1 block text-sm font-medium">Type</label>
                    <Select value={String(data['type'] ?? '')} onChange={(e) => update('type', e.target.value)}>
                        {POST_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Status</label>
                    <Select value={String(data['status'] ?? 'draft')} onChange={(e) => update('status', e.target.value)}>
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="archived">Archived</option>
                    </Select>
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium">Application Status</label>
                    <Select value={String(data['application_status'] ?? 'na')} onChange={(e) => update('application_status', e.target.value)}>
                        {APPLICATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Excerpt</label>
                <Textarea value={String(data['excerpt'] ?? '')} onChange={(e) => update('excerpt', e.target.value)} rows={2} />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">Content (HTML)</label>
                <Textarea value={String(data['content'] ?? '')} onChange={(e) => update('content', e.target.value)} rows={12} />
            </div>

            <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary">Cancel</Button>
                <Button type="submit" loading={loading}>Save Post</Button>
            </div>
        </form>
    )
}

'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/features/dashboard/components/FileUpload'
import { createOrganization, updateOrganization } from '@/features/taxonomy/actions'
import type { Organization, State } from '@/types/taxonomy.types'

interface OrgFormProps {
    open: boolean
    onClose: () => void
    organization?: Organization | null
    stateOptions: Pick<State, 'slug' | 'name'>[]
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

export function OrgForm({ open, onClose, organization, stateOptions }: OrgFormProps) {
    const isEditing = !!organization
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')
    const [slugTouched, setSlugTouched] = useState(false)

    const [form, setForm] = useState({
        name: '',
        slug: '',
        short_name: '',
        state_slug: '',
        official_url: '',
        logo_url: '',
        description: '',
        is_active: true,
        meta_title: '',
        meta_description: '',
        meta_robots: 'index,follow',
        schema_json: '',
    })

    useEffect(() => {
        if (open) {
            if (organization) {
                setForm({
                    name: organization.name,
                    slug: organization.slug,
                    short_name: organization.short_name ?? '',
                    state_slug: organization.state_slug ?? '',
                    official_url: organization.official_url ?? '',
                    logo_url: organization.logo_url ?? '',
                    description: organization.description ?? '',
                    is_active: organization.is_active,
                    meta_title: organization.meta_title ?? '',
                    meta_description: organization.meta_description ?? '',
                    meta_robots: organization.meta_robots ?? 'index,follow',
                    schema_json: organization.schema_json ? JSON.stringify(organization.schema_json, null, 2) : '',
                })
                setSlugTouched(true)
            } else {
                setForm({
                    name: '', slug: '', short_name: '', state_slug: '',
                    official_url: '', logo_url: '', description: '',
                    is_active: true, meta_title: '', meta_description: '',
                    meta_robots: 'index,follow', schema_json: '',
                })
                setSlugTouched(false)
            }
            setError('')
        }
    }, [open, organization])

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
                short_name: form.short_name || null,
                state_slug: form.state_slug || null,
                official_url: form.official_url || null,
                logo_url: form.logo_url || null,
                description: form.description || null,
                is_active: form.is_active,
                meta_title: form.meta_title || null,
                meta_description: form.meta_description || null,
                meta_robots: form.meta_robots || 'index,follow',
                schema_json: form.schema_json || null,
            }

            const result = isEditing
                ? await updateOrganization(organization!.id, payload)
                : await createOrganization(payload)

            if (result.error) {
                setError(result.error)
            } else {
                onClose()
                router.refresh()
            }
        })
    }

    return (
        <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Organization' : 'Add Organization'} className="max-w-xl">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1 block text-sm font-medium">Name *</label>
                        <Input
                            value={form.name}
                            onChange={e => handleNameChange(e.target.value)}
                            placeholder="e.g. Staff Selection Commission"
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1 block text-sm font-medium">Short Name</label>
                        <Input
                            value={form.short_name}
                            onChange={e => setForm(prev => ({ ...prev, short_name: e.target.value }))}
                            placeholder="e.g. SSC"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Slug *</label>
                    <Input
                        value={form.slug}
                        onChange={e => { setSlugTouched(true); setForm(prev => ({ ...prev, slug: e.target.value })) }}
                        placeholder="e.g. staff-selection-commission"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">State</label>
                        <Select
                            value={form.state_slug}
                            onChange={e => setForm(prev => ({ ...prev, state_slug: e.target.value }))}
                        >
                            <option value="">Select State</option>
                            {stateOptions.map(s => (
                                <option key={s.slug} value={s.slug}>{s.name}</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Official URL</label>
                        <Input
                            type="url"
                            value={form.official_url}
                            onChange={e => setForm(prev => ({ ...prev, official_url: e.target.value }))}
                            placeholder="https://ssc.nic.in"
                        />
                    </div>
                </div>

                <div>
                    <FileUpload
                        label="Organization Logo"
                        bucket="organizations"
                        folder={form.slug || 'uncategorized'}
                        value={form.logo_url}
                        onChange={(url) => setForm((prev) => ({ ...prev, logo_url: url }))}
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        maxSizeMB={2}
                        hint="Recommended: Square SVG, PNG, or WebP up to 2MB"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Description</label>
                    <textarea
                        value={form.description}
                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="About this organization..."
                        rows={3}
                        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="org-active"
                        checked={form.is_active}
                        onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="size-4 rounded border-border"
                    />
                    <label htmlFor="org-active" className="text-sm font-medium">Active</label>
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
                            <label className="mb-1 block text-xs font-medium text-foreground-muted">JSON-LD Schema</label>
                            <textarea
                                value={form.schema_json}
                                onChange={e => setForm(prev => ({ ...prev, schema_json: e.target.value }))}
                                placeholder='{"@context": "https://schema.org", "@type": "Organization", ...}'
                                rows={8}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                            <p className="mt-1 text-xs text-foreground-subtle">
                                Valid JSON only. Leave empty for none.
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
                        {isEditing ? 'Save Changes' : 'Create Organization'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

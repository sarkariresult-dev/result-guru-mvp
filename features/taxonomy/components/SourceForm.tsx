'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { createOrganizationSource, updateOrganizationSource } from '@/features/taxonomy/actions'
import type { OrganizationSource } from '@/types/taxonomy.types'

interface SourceFormProps {
    open: boolean
    onClose: () => void
    source?: OrganizationSource | null
    organizationId: string
}

export function SourceForm({ open, onClose, source, organizationId }: SourceFormProps) {
    const isEditing = !!source
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')

    const [form, setForm] = useState<{
        name: string
        url: string
        selector: string
        source_type: string
        is_active: boolean
    }>({
        name: '',
        url: '',
        selector: '',
        source_type: 'webpage',
        is_active: true,
    })

    useEffect(() => {
        if (open) {
            if (source) {
                setForm({
                    name: source.name,
                    url: source.url,
                    selector: source.selector ?? '',
                    source_type: source.source_type || 'webpage',
                    is_active: source.is_active,
                })
            } else {
                setForm({
                    name: '',
                    url: '',
                    selector: '',
                    source_type: 'webpage',
                    is_active: true,
                })
            }
            setError('')
        }
    }, [open, source])

    function handleSubmit() {
        setError('')
        startTransition(async () => {
            const payload = {
                organization_id: organizationId,
                name: form.name,
                url: form.url,
                selector: form.selector || null,
                source_type: form.source_type,
                is_active: form.is_active,
            }

            const result = isEditing
                ? await updateOrganizationSource(source!.id, payload)
                : await createOrganizationSource(payload)

            if (result.error) {
                setError(result.error)
            } else {
                onClose()
                router.refresh()
            }
        })
    }

    return (
        <Modal open={open} onClose={onClose} title={isEditing ? 'Edit Source' : 'Add Source'} className="max-w-md">
            <div className="space-y-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">Name *</label>
                    <Input
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Latest Notices"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">URL *</label>
                    <Input
                        type="url"
                        value={form.url}
                        onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://ssc.nic.in/notices"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">CSS Selector (Optional)</label>
                    <Input
                        value={form.selector}
                        onChange={e => setForm(prev => ({ ...prev, selector: e.target.value }))}
                        placeholder="e.g. .notice-list li"
                    />
                    <p className="mt-1 text-xs text-foreground-subtle">
                        If provided, only changes within this selector trigger updates.
                    </p>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Source Type</label>
                    <Select
                        value={form.source_type}
                        onChange={e => setForm(prev => ({ ...prev, source_type: e.target.value }))}
                    >
                        <option value="webpage">Webpage (HTML)</option>
                        <option value="rss">RSS Feed</option>
                        <option value="json_api">JSON API</option>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="source-active"
                        checked={form.is_active}
                        onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="size-4 rounded border-border"
                    />
                    <label htmlFor="source-active" className="text-sm font-medium">Active (Will be crawled)</label>
                </div>

                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSubmit} loading={isPending}>
                        {isEditing ? 'Save Changes' : 'Add Source'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

'use client'

import { useState } from 'react'
import { SourceForm } from '@/features/taxonomy/components/SourceForm'
import { deleteOrganizationSource } from '@/features/taxonomy/actions'
import type { Organization, OrganizationSource } from '@/types/taxonomy.types'
import { Plus, ExternalLink, ArrowLeft, Trash2, Edit2, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface SourcesClientProps {
    organization: Organization
    sources: OrganizationSource[]
}

export function SourcesClient({ organization, sources }: SourcesClientProps) {
    const [showForm, setShowForm] = useState(false)
    const [editSource, setEditSource] = useState<OrganizationSource | null>(null)
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    function handleEdit(source: OrganizationSource) {
        setEditSource(source)
        setShowForm(true)
    }

    function handleClose() {
        setShowForm(false)
        setEditSource(null)
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this source? This action cannot be undone.')) {
            return
        }

        setDeletingId(id)
        const result = await deleteOrganizationSource(id)
        setDeletingId(null)
        
        if (result.error) {
            alert('Failed to delete source: ' + result.error)
        } else {
            router.refresh()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/organizations" className="rounded-lg p-2 hover:bg-background-subtle">
                    <ArrowLeft className="size-5 text-foreground-muted" />
                </Link>
                <div className="flex-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{organization.name} Sources</h1>
                        <p className="mt-1 text-sm text-foreground-muted">
                            Manage automated crawling endpoints for this organization
                        </p>
                    </div>
                    <Button size="sm" onClick={() => { setEditSource(null); setShowForm(true) }}>
                        <Plus className="size-4" /> Add Source
                    </Button>
                </div>
            </div>

            <SourceForm
                open={showForm}
                onClose={handleClose}
                source={editSource}
                organizationId={organization.id}
            />

            {sources.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
                    <LinkIcon className="size-10 text-foreground-subtle" />
                    <p className="font-medium text-foreground">
                        No sources found for {organization.name}
                    </p>
                    <p className="text-sm text-foreground-muted">
                        Add a source URL to start crawling and monitoring this organization.
                    </p>
                    <Button size="sm" variant="secondary" onClick={() => { setEditSource(null); setShowForm(true) }} className="mt-2">
                        Add First Source
                    </Button>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-border bg-surface">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-background-subtle">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-foreground-muted">Name & URL</th>
                                <th className="px-4 py-3 text-left font-medium text-foreground-muted">Type</th>
                                <th className="px-4 py-3 text-left font-medium text-foreground-muted">Selector</th>
                                <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                                <th className="px-4 py-3 text-left font-medium text-foreground-muted">Last Checked</th>
                                <th className="px-4 py-3 text-right font-medium text-foreground-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {sources.map((source) => (
                                <tr key={source.id} className="transition-colors hover:bg-background-subtle">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{source.name}</div>
                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
                                            {source.url.length > 50 ? source.url.substring(0, 50) + '...' : source.url} <ExternalLink className="size-3" />
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 text-foreground-muted">
                                        <span className="rounded bg-background-subtle px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground-muted">
                                            {source.source_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-foreground-muted font-mono text-xs">
                                        {source.selector ? (
                                            <span className="rounded bg-background-subtle px-1.5 py-0.5 border border-border">
                                                {source.selector}
                                            </span>
                                        ) : (
                                            <span className="text-foreground-subtle italic">None</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${source.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {source.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-foreground-subtle">
                                        {source.last_checked_at ? (
                                            formatDistanceToNow(new Date(source.last_checked_at), { addSuffix: true })
                                        ) : (
                                            'Never'
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(source)}
                                                className="rounded p-1.5 text-foreground-muted hover:bg-background-subtle hover:text-foreground transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="size-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(source.id)}
                                                disabled={deletingId === source.id}
                                                className="rounded p-1.5 text-foreground-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

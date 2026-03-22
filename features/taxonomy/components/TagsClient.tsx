'use client'

import { useState } from 'react'
import { TagForm } from '@/features/taxonomy/components/TagForm'
import { TaxonomyActions } from '@/features/taxonomy/components/TaxonomyActions'
import { deleteTag } from '@/features/taxonomy/actions'
import type { Tag } from '@/types/taxonomy.types'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const TAG_TYPE_COLORS: Record<string, string> = {
    general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    job: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    exam: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    result: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    admission: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    scheme: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    scholarship: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
}

import type { ReactNode } from 'react'

interface TagsClientProps {
    tags: Tag[]
    count: number
    children?: ReactNode
}

export function TagsClient({ tags, count, children }: TagsClientProps) {
    const [showForm, setShowForm] = useState(false)
    const [editTag, setEditTag] = useState<Tag | null>(null)

    function handleEdit(tag: Tag) {
        setEditTag(tag)
        setShowForm(true)
    }

    function handleClose() {
        setShowForm(false)
        setEditTag(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Tags</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count} {count === 1 ? 'tag' : 'tags'} total
                    </p>
                </div>
                <Button size="sm" onClick={() => { setEditTag(null); setShowForm(true) }}>
                    <Plus className="size-4" /> Add Tag
                </Button>
            </div>

            {/* Render search, filters, and empty state passed from server */}
            {children}

            <TagForm open={showForm} onClose={handleClose} tag={editTag} />

            {tags.length > 0 && (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-background-subtle">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Type</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Posts</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Created</th>
                                    <th className="px-4 py-3 text-right font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {tags.map((tag) => (
                                    <tr key={tag.id} className="transition-colors hover:bg-background-subtle">
                                        <td className="px-4 py-3 font-medium">{tag.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${TAG_TYPE_COLORS[tag.tag_type] ?? TAG_TYPE_COLORS.general}`}>
                                                {tag.tag_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{tag.post_count}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tag.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {tag.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-subtle">
                                            {new Date(tag.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <TaxonomyActions
                                                entityId={tag.id}
                                                entityName={tag.name}
                                                onEdit={() => handleEdit(tag)}
                                                deleteAction={deleteTag}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 lg:hidden">
                        {tags.map((tag) => (
                            <div key={tag.id} className="rounded-xl border border-border bg-surface p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium">{tag.name}</p>
                                    </div>
                                    <TaxonomyActions
                                        entityId={tag.id}
                                        entityName={tag.name}
                                        onEdit={() => handleEdit(tag)}
                                        deleteAction={deleteTag}
                                    />
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${TAG_TYPE_COLORS[tag.tag_type] ?? TAG_TYPE_COLORS.general}`}>
                                        {tag.tag_type}
                                    </span>
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${tag.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {tag.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-foreground-muted">{tag.post_count} posts</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

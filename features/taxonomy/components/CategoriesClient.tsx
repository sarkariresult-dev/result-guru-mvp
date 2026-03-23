'use client'

import { useState } from 'react'
import { CategoryForm } from '@/features/taxonomy/components/CategoryForm'
import { TaxonomyActions } from '@/features/taxonomy/components/TaxonomyActions'
import { deleteCategory } from '@/features/taxonomy/actions'
import type { Category } from '@/types/taxonomy.types'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

import type { ReactNode } from 'react'

interface CategoriesClientProps {
    categories: (Category & { parent_name?: string | null })[]
    parentOptions: Pick<Category, 'id' | 'slug' | 'name' | 'parent_id'>[]
    count: number
    children?: ReactNode
}

export function CategoriesClient({ categories, parentOptions, count, children }: CategoriesClientProps) {
    const [showForm, setShowForm] = useState(false)
    const [editCategory, setEditCategory] = useState<Category | null>(null)

    function handleEdit(category: Category) {
        setEditCategory(category)
        setShowForm(true)
    }

    function handleClose() {
        setShowForm(false)
        setEditCategory(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count} {count === 1 ? 'category' : 'categories'} total
                    </p>
                </div>
                <Button size="sm" onClick={() => { setEditCategory(null); setShowForm(true) }}>
                    <Plus className="size-4" /> Add Category
                </Button>
            </div>

            {/* Render search, filters, and empty state passed from server */}
            {children}

            <CategoryForm
                open={showForm}
                onClose={handleClose}
                category={editCategory}
                parentOptions={parentOptions}
            />

            {categories.length > 0 && (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-background-subtle">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Parent</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Order</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Created</th>
                                    <th className="px-4 py-3 text-right font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="transition-colors hover:bg-background-subtle">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {cat.icon && <span className="text-foreground-subtle">{cat.icon}</span>}
                                                <span className="font-medium">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-foreground-muted">
                                            {cat.parent_name ?? <span className="text-foreground-subtle">-</span>}
                                        </td>
                                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{cat.sort_order}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${cat.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {cat.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-subtle">
                                            {new Date(cat.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <TaxonomyActions
                                                entityId={cat.id}
                                                entityName={cat.name}
                                                onEdit={() => handleEdit(cat)}
                                                deleteAction={deleteCategory}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 lg:hidden">
                        {categories.map((cat) => (
                            <div key={cat.id} className="rounded-xl border border-border bg-surface p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium">{cat.icon ? `${cat.icon} ` : ''}{cat.name}</p>
                                    </div>
                                    <TaxonomyActions
                                        entityId={cat.id}
                                        entityName={cat.name}
                                        onEdit={() => handleEdit(cat)}
                                        deleteAction={deleteCategory}
                                    />
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {cat.parent_name && (
                                        <span className="text-xs text-foreground-muted">Parent: {cat.parent_name}</span>
                                    )}
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${cat.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {cat.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-foreground-subtle">Order: {cat.sort_order}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

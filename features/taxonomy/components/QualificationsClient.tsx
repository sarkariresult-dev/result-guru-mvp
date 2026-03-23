'use client'

import { useState } from 'react'
import { Plus, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { QualificationForm } from './QualificationForm'
import { TaxonomyActions } from './TaxonomyActions'
import { deleteQualification } from '@/features/taxonomy/actions'
import type { Qualification } from '@/types/taxonomy.types'
import type { ReactNode } from 'react'

interface QualificationsClientProps {
    qualifications: Qualification[]
    count: number
    children?: ReactNode
}

export function QualificationsClient({ qualifications, count, children }: QualificationsClientProps) {
    const [showForm, setShowForm] = useState(false)
    const [editQualification, setEditQualification] = useState<Qualification | null>(null)

    function handleEdit(qualification: Qualification) {
        setEditQualification(qualification)
        setShowForm(true)
    }

    function handleClose() {
        setShowForm(false)
        setEditQualification(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Qualifications</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count} {count === 1 ? 'qualification' : 'qualifications'} total
                    </p>
                </div>
                <Button size="sm" onClick={() => { setEditQualification(null); setShowForm(true) }} className="gap-2">
                    <Plus className="size-4" /> Add Qualification
                </Button>
            </div>

            {/* Render search, filters, and empty state passed from server */}
            {children}

            <QualificationForm open={showForm} onClose={handleClose} qualification={editQualification} />

            {qualifications.length > 0 && (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-background-subtle">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Short Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Order</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Created</th>
                                    <th className="px-4 py-3 text-right font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {qualifications.map((q) => (
                                    <tr key={q.slug} className="transition-colors hover:bg-background-subtle">
                                        <td className="px-4 py-3 font-medium">{q.name}</td>
                                        <td className="px-4 py-3 text-foreground-muted">{q.short_name ?? '-'}</td>
                                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{q.sort_order}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${q.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {q.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-subtle">
                                            {new Date(q.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <TaxonomyActions
                                                entityId={q.slug}
                                                entityName={q.name}
                                                onEdit={() => handleEdit(q)}
                                                deleteAction={deleteQualification}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 lg:hidden">
                        {qualifications.map((q) => (
                            <div key={q.slug} className="rounded-xl border border-border bg-surface p-4">
                                <div className="mb-3 flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                                            <GraduationCap className="size-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{q.name}</h3>
                                            <div className="flex items-center gap-2 text-xs text-foreground-subtle">
                                                <span>{q.short_name || 'No Short Name'}</span>
                                                <span>•</span>
                                                <span>Order: {q.sort_order}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <TaxonomyActions
                                        entityId={q.slug}
                                        entityName={q.name}
                                        onEdit={() => handleEdit(q)}
                                        deleteAction={deleteQualification}
                                    />
                                </div>
                                <div className="flex items-center justify-between border-t border-border pt-3">
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${q.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {q.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-[10px] text-foreground-subtle">
                                        Added {new Date(q.created_at).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

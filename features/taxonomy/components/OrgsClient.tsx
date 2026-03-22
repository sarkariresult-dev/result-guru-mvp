'use client'

import { useState } from 'react'
import { OrgForm } from '@/features/taxonomy/components/OrgForm'
import { TaxonomyActions } from '@/features/taxonomy/components/TaxonomyActions'
import { deleteOrganization } from '@/features/taxonomy/actions'
import type { Organization, State } from '@/types/taxonomy.types'
import { Plus, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'

import type { ReactNode } from 'react'

interface OrgsClientProps {
    organizations: Organization[]
    stateOptions: Pick<State, 'slug' | 'name'>[]
    count: number
    children?: ReactNode
}

export function OrgsClient({ organizations, stateOptions, count, children }: OrgsClientProps) {
    const [showForm, setShowForm] = useState(false)
    const [editOrg, setEditOrg] = useState<Organization | null>(null)

    function handleEdit(org: Organization) {
        setEditOrg(org)
        setShowForm(true)
    }

    function handleClose() {
        setShowForm(false)
        setEditOrg(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count} {count === 1 ? 'organization' : 'organizations'} total
                    </p>
                </div>
                <Button size="sm" onClick={() => { setEditOrg(null); setShowForm(true) }}>
                    <Plus className="size-4" /> Add Organization
                </Button>
            </div>

            {/* Render search, filters, and empty state passed from server */}
            {children}

            <OrgForm
                open={showForm}
                onClose={handleClose}
                organization={editOrg}
                stateOptions={stateOptions}
            />

            {organizations.length > 0 && (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-background-subtle">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">State</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Website</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Created</th>
                                    <th className="px-4 py-3 text-right font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {organizations.map((org) => (
                                    <tr key={org.id} className="transition-colors hover:bg-background-subtle">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {org.logo_url && (
                                                    <img
                                                        src={org.logo_url}
                                                        alt=""
                                                        className="size-6 rounded object-contain"
                                                    />
                                                )}
                                                <div>
                                                    <span className="font-medium">{org.name}</span>
                                                    {org.short_name && (
                                                        <span className="ml-1.5 text-xs text-foreground-subtle">({org.short_name})</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-foreground-muted">
                                            {org.state_slug ?? <span className="text-foreground-subtle">Central</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {org.official_url ? (
                                                <a
                                                    href={org.official_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                                                >
                                                    Visit <ExternalLink className="size-3" />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-foreground-subtle">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${org.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {org.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-subtle">
                                            {new Date(org.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <TaxonomyActions
                                                entityId={org.id}
                                                entityName={org.name}
                                                onEdit={() => handleEdit(org)}
                                                deleteAction={deleteOrganization}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 lg:hidden">
                        {organizations.map((org) => (
                            <div key={org.id} className="rounded-xl border border-border bg-surface p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        {org.logo_url && (
                                            <img src={org.logo_url} alt="" className="size-8 rounded object-contain" />
                                        )}
                                        <div>
                                            <p className="font-medium">{org.name}</p>
                                            {org.short_name && (
                                                <p className="text-xs text-foreground-subtle">{org.short_name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <TaxonomyActions
                                        entityId={org.id}
                                        entityName={org.name}
                                        onEdit={() => handleEdit(org)}
                                        deleteAction={deleteOrganization}
                                    />
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${org.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {org.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    {org.state_slug && (
                                        <span className="text-xs text-foreground-muted">{org.state_slug}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

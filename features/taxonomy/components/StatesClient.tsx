'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StateForm } from '@/features/taxonomy/components/StateForm'
import { deleteState } from '@/features/taxonomy/actions'
import type { State } from '@/types/taxonomy.types'
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useTransition } from 'react'

import type { ReactNode } from 'react'

interface StatesClientProps {
    states: State[]
    count: number
    children?: ReactNode
}

function StateActions({ state, onEdit }: { state: State; onEdit: () => void }) {
// ... The StateActions component was here but I don't want to replace it. Let's fix the targeting.
    const [showMenu, setShowMenu] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')
    const router = useRouter()

    function handleDelete() {
        setError('')
        startTransition(async () => {
            const result = await deleteState(state.slug)
            if (result.error) {
                setError(result.error)
            } else {
                setShowDelete(false)
                router.refresh()
            }
        })
    }

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                    aria-label="Actions"
                >
                    <MoreHorizontal className="size-4" />
                </button>
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-border bg-surface py-1 shadow-lg">
                            <button
                                onClick={() => { setShowMenu(false); onEdit() }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background-subtle"
                            >
                                <Pencil className="size-3.5" /> Edit
                            </button>
                            <button
                                onClick={() => { setShowMenu(false); setShowDelete(true) }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="size-3.5" /> Delete
                            </button>
                        </div>
                    </>
                )}
            </div>

            <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Confirm Delete">
                <div className="space-y-4">
                    <p className="text-sm text-foreground-muted">
                        Are you sure you want to delete <strong className="text-foreground">{state.name}</strong>? This action cannot be undone.
                    </p>
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
                        <Button variant="danger" size="sm" onClick={handleDelete} loading={isPending}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export function StatesClient({ states, count, children }: StatesClientProps) {
    const [showForm, setShowForm] = useState(false)
    const [editState, setEditState] = useState<State | null>(null)

    function handleEdit(state: State) {
        setEditState(state)
        setShowForm(true)
    }

    function handleClose() {
        setShowForm(false)
        setEditState(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">States</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count} {count === 1 ? 'state' : 'states'} total
                    </p>
                </div>
                <Button size="sm" onClick={() => { setEditState(null); setShowForm(true) }}>
                    <Plus className="size-4" /> Add State
                </Button>
            </div>

            {/* Render search, filters, and empty state passed from server */}
            {children}

            <StateForm open={showForm} onClose={handleClose} state={editState} />

            {states.length > 0 && (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-background-subtle">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Abbr</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Order</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Created</th>
                                    <th className="px-4 py-3 text-right font-medium text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {states.map((st) => (
                                    <tr key={st.slug} className="transition-colors hover:bg-background-subtle">
                                        <td className="px-4 py-3 font-medium">{st.name}</td>
                                        <td className="px-4 py-3 text-foreground-muted">{st.abbr ?? '—'}</td>
                                        <td className="px-4 py-3 tabular-nums text-foreground-muted">{st.sort_order}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${st.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {st.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-subtle">
                                            {new Date(st.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <StateActions state={st} onEdit={() => handleEdit(st)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 lg:hidden">
                        {states.map((st) => (
                            <div key={st.slug} className="rounded-xl border border-border bg-surface p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium">{st.name}</p>
                                    </div>
                                    <StateActions state={st} onEdit={() => handleEdit(st)} />
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {st.abbr && (
                                        <span className="inline-flex rounded bg-background-muted px-1.5 py-0.5 text-xs font-medium text-foreground-muted">{st.abbr}</span>
                                    )}
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${st.is_active
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {st.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="text-xs text-foreground-subtle">Order: {st.sort_order}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

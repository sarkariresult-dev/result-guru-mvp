'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface TaxonomyActionsProps {
    entityId: string
    entityName: string
    onEdit: () => void
    deleteAction: (id: string) => Promise<{ error?: string; success?: boolean }>
}

export function TaxonomyActions({ entityId, entityName, onEdit, deleteAction }: TaxonomyActionsProps) {
    const [showMenu, setShowMenu] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')
    const router = useRouter()

    function handleDelete() {
        setError('')
        startTransition(async () => {
            const result = await deleteAction(entityId)
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
                                <Pencil className="size-3.5" />
                                Edit
                            </button>
                            <button
                                onClick={() => { setShowMenu(false); setShowDelete(true) }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="size-3.5" />
                                Delete
                            </button>
                        </div>
                    </>
                )}
            </div>

            <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Confirm Delete">
                <div className="space-y-4">
                    <p className="text-sm text-foreground-muted">
                        Are you sure you want to delete <strong className="text-foreground">{entityName}</strong>? This action cannot be undone.
                    </p>
                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" size="sm" onClick={() => setShowDelete(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleDelete} loading={isPending}>
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

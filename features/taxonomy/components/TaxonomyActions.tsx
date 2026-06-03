'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface TaxonomyActionsProps {
    entityId: string
    entityName: string
    onEdit: () => void
    deleteAction: (id: string) => Promise<{ error?: string; success?: boolean }>
}

export function TaxonomyActions({ entityId, entityName, onEdit, deleteAction }: TaxonomyActionsProps) {
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
            <div className="flex items-center gap-1">
                <button
                    onClick={onEdit}
                    className="rounded p-1.5 text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                    title="Edit"
                >
                    <Pencil className="size-4" />
                </button>
                <button
                    onClick={() => setShowDelete(true)}
                    className="rounded p-1.5 text-foreground-muted transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    title="Delete"
                >
                    <Trash2 className="size-4" />
                </button>
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

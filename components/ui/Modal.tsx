'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
    open: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (open) {
            dialog.showModal()
        } else {
            dialog.close()
        }
    }, [open])

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            className={cn(
                'fixed inset-0 m-auto max-h-[85vh] w-full max-w-lg rounded-xl border border-border bg-surface p-0 shadow-xl backdrop:bg-black/50',
                className
            )}
        >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                <button
                    onClick={onClose}
                    className="ml-auto rounded-lg p-1 text-foreground-muted hover:bg-background-subtle"
                    aria-label="Close"
                >
                    <X className="size-5" />
                </button>
            </div>
            <div className="p-6">{children}</div>
        </dialog>
    )
}

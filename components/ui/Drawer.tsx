'use client'

import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DrawerProps {
    open: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    side?: 'left' | 'right'
    className?: string
}

export function Drawer({ open, onClose, title, children, side = 'right', className }: DrawerProps) {
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
            )}
            <div
                className={cn(
                    'fixed top-0 z-50 h-full w-80 bg-surface shadow-xl transition-transform duration-300 ease-in-out',
                    side === 'right' ? 'right-0' : 'left-0',
                    open
                        ? 'translate-x-0'
                        : side === 'right'
                            ? 'translate-x-full'
                            : '-translate-x-full',
                    className
                )}
            >
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    {title && <h2 className="text-lg font-semibold">{title}</h2>}
                    <button
                        onClick={onClose}
                        className="ml-auto rounded-lg p-1 text-foreground-muted hover:bg-background-subtle"
                        aria-label="Close drawer"
                    >
                        <X className="size-5" />
                    </button>
                </div>
                <div className="overflow-y-auto p-6">{children}</div>
            </div>
        </>
    )
}

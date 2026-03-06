'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DropdownProps {
    trigger: ReactNode
    children: ReactNode
    align?: 'left' | 'right'
    className?: string
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div className="relative" ref={ref}>
            <div onClick={() => setOpen(!open)}>{trigger}</div>
            {open && (
                <div
                    className={cn(
                        'absolute z-50 mt-2 min-w-45 rounded-lg border border-border bg-surface py-1 shadow-lg',
                        align === 'right' ? 'right-0' : 'left-0',
                        className
                    )}
                    onClick={() => setOpen(false)}
                >
                    {children}
                </div>
            )}
        </div>
    )
}

export function DropdownItem({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={cn(
                'flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-background-muted transition-colors',
                className
            )}
            {...props}
        />
    )
}

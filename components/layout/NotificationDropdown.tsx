'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative inline-flex size-9 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                aria-label="Notifications"
            >
                <Bell className="size-4.5" strokeWidth={1.75} />
                {/* Optional: Add a red dot here if there are unread notifications in the future */}
                {/* <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-surface" /> */}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                        <div className="flex items-center justify-between border-b border-border bg-background-subtle px-4 py-3">
                            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                        </div>
                        <div className="flex flex-col items-center justify-center p-8 text-center text-foreground-subtle">
                            <div className="mb-3 rounded-full bg-background-muted p-3">
                                <Bell className="size-6 text-foreground-muted" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-medium text-foreground">No new notifications</p>
                            <p className="mt-1 text-xs">We&apos;ll notify you when there&apos;s an update on exams you follow.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

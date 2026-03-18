'use client'

import { type ReactNode, useState, useCallback, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Sidebar, GroupedSidebar } from '@/components/layout/Sidebar'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { LogoutButton } from '@/features/dashboard/components/LogoutButton'
import { Logo } from '@/features/shared/components/Logo'
import type { NavItem, NavGroup } from '@/components/layout/Sidebar'
import type { PublicUser } from '@/types/user.types'

interface Props {
    user: PublicUser
    children: ReactNode
    navItems?: NavItem[]
    navGroups?: NavGroup[]
}

export function DashboardShell({ user, navItems, navGroups, children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    /* Close mobile sidebar on route change */
    useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    /* Close mobile sidebar on Escape key */
    useEffect(() => {
        if (!sidebarOpen) return
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') setSidebarOpen(false)
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [sidebarOpen])

    /* Lock body scroll when mobile sidebar is open */
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [sidebarOpen])

    const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])
    const closeSidebar = useCallback(() => setSidebarOpen(false), [])

    const sidebarContent = (
        <>
            <div className="flex-1 overflow-y-auto px-3 py-4">
                {navGroups ? (
                    <GroupedSidebar groups={navGroups} onNavigate={closeSidebar} />
                ) : navItems ? (
                    <Sidebar items={navItems} onNavigate={closeSidebar} />
                ) : null}
            </div>
            <div className="border-t border-border px-3 py-3">
                <LogoutButton variant="full" />
            </div>
        </>
    )

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside className="hidden w-56 shrink-0 border-r border-border bg-surface lg:flex lg:flex-col">
                <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                    <Logo height={30} />
                </div>
                {sidebarContent}
            </aside>

            {/* ── Mobile sidebar overlay ── */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
                        onClick={closeSidebar}
                        aria-hidden="true"
                    />
                    {/* Drawer */}
                    <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-surface shadow-xl animate-in slide-in-from-left duration-200">
                        <div className="flex h-14 items-center justify-between border-b border-border px-4 sm:h-16 sm:px-6">
                            <Logo height={30} />
                            <button
                                type="button"
                                onClick={closeSidebar}
                                className="inline-flex size-8 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                                aria-label="Close sidebar"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>
                        {sidebarContent}
                    </aside>
                </div>
            )}

            {/* ── Main content ── */}
            <div className="flex flex-1 flex-col">
                <DashboardHeader user={user} onMenuToggle={toggleSidebar} />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
            </div>
        </>
    )
}

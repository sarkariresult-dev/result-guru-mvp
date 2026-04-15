'use client'

import Link from 'next/link'
import { X, ChevronRight, LayoutDashboard, User as UserIcon, Settings, LogOut, Loader2 } from 'lucide-react'
import { useEffect, useTransition, useState } from 'react'
import { createPortal } from 'react-dom'
import { TOP_NAV_LINKS, MAIN_NAV } from '@/config/site'
import { Logo } from '@/features/shared/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { signOut } from '@/features/auth/actions'
import type { PublicUser } from '@/types/user.types'

interface MobileNavProps {
    open: boolean
    onClose: () => void
    initialUser?: PublicUser | null
}

export function MobileNav({ open, onClose, initialUser }: MobileNavProps) {
    const { user, isAdmin, isAuthor, isLoggedIn, loading } = useAuth()
    const [isPending, startTransition] = useTransition()
    const [mounted, setMounted] = useState(false)

    // Use server-provided user during loading to avoid flash
    const showProfile = loading ? !!initialUser : isLoggedIn && !!user
    const effectiveIsAdmin = loading ? initialUser?.role === 'admin' : isAdmin
    const effectiveIsAuthor = loading ? (initialUser?.role === 'author' || initialUser?.role === 'admin') : isAuthor

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    if (!open || !mounted) return null

    const dashboardHref = effectiveIsAdmin ? '/admin' : effectiveIsAuthor ? '/author' : '/user'
    const displayName = loading
        ? (initialUser?.name || 'User')
        : (user?.displayName || user?.email?.split('@')[0] || 'User')

    function handleSignOut() {
        startTransition(async () => {
            await signOut()
        })
    }

    const content = (
        <div className="fixed inset-0 z-100 lg:hidden">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div className="absolute inset-y-0 left-0 w-72 bg-surface shadow-2xl flex flex-col animate-drawer-in border-r border-border">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                    <Logo height={32} />
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-background-subtle transition-colors focus:ring-2 focus:ring-brand-500"
                        aria-label="Close menu"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Main links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {/* Synchronized Desktop Links */}
                    {TOP_NAV_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground active:bg-background-subtle"
                        >
                            {link.label}
                            <ChevronRight className="size-3.5 text-foreground-subtle" />
                        </Link>
                    ))}

                    {/* Posts Categories */}
                    <div className="pt-4">
                        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-foreground-subtle border-t border-border/50 pt-4 mt-2">
                            Posts & Updates
                        </p>
                        <div className="space-y-0.5">
                            {MAIN_NAV.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground active:bg-background-subtle"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-1.5 rounded-full bg-brand-500" />
                                        {link.label}
                                    </div>
                                    <ChevronRight className="size-3 text-foreground-subtle/50" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Bottom - Auth aware */}
                <div className="shrink-0 border-t border-border bg-background-subtle/50 px-4 py-4">
                    {/* HIDE AUTH IN RESTRICTED IFRAMES (ADSENSE PREVIEW) */}
                    {(typeof window !== 'undefined' && window.self !== window.top) ? null : (
                        showProfile ? (
                            <div className="space-y-1">
                                {/* User info */}
                                <div className="flex items-center gap-3 px-1 pb-2">
                                    <Avatar 
                                        src={(loading ? initialUser?.avatar_url : user?.avatarUrl)} 
                                        alt={displayName} 
                                        fallback={displayName} 
                                        size="sm" 
                                        className="ring-1 ring-border" 
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                                        <p className="truncate text-xs text-foreground-subtle">{loading ? '' : user?.email}</p>
                                    </div>
                                </div>

                                <Link
                                    href={dashboardHref}
                                    onClick={onClose}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                                >
                                    <LayoutDashboard className="size-4" />
                                    Dashboard
                                </Link>
                                <Link
                                    href={`${dashboardHref}/profile`}
                                    onClick={onClose}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                                >
                                    <UserIcon className="size-4" />
                                    Profile
                                </Link>
                                {effectiveIsAdmin && (
                                    <Link
                                        href="/admin/settings"
                                        onClick={onClose}
                                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                                    >
                                        <Settings className="size-4" />
                                        Settings
                                    </Link>
                                )}
                                <button
                                    onClick={handleSignOut}
                                    disabled={isPending}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                                >
                                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                                    {isPending ? 'Signing out…' : 'Log out'}
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={onClose}
                                className="flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors shadow-sm"
                            >
                                Login / Register
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    )

    return createPortal(content, document.body)
}

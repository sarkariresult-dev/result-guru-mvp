'use client'

import Link from 'next/link'
import { X, ChevronRight, LayoutDashboard, User as UserIcon, Settings, LogOut, Loader2 } from 'lucide-react'
import { useEffect, useTransition } from 'react'
import { MAIN_NAV, ROUTE_PREFIXES } from '@/config/site'
import { POST_TYPE_CONFIG } from '@/config/constants'
import { Logo } from '@/components/shared/Logo'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/lib/actions/auth'
import type { PostTypeKey } from '@/config/site'
import type { PublicUser } from '@/types/user.types'

interface MobileNavProps {
    open: boolean
    onClose: () => void
    initialUser?: PublicUser | null
}

export function MobileNav({ open, onClose, initialUser }: MobileNavProps) {
    const { user, isAdmin, isAuthor, isLoggedIn, loading } = useAuth()
    const [isPending, startTransition] = useTransition()

    // Use server-provided user during loading to avoid flash
    const showProfile = loading ? !!initialUser : isLoggedIn && !!user
    const effectiveIsAdmin = loading ? initialUser?.role === 'admin' : isAdmin
    const effectiveIsAuthor = loading ? (initialUser?.role === 'author' || initialUser?.role === 'admin') : isAuthor

    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    if (!open) return null

    const dashboardHref = effectiveIsAdmin ? '/admin' : effectiveIsAuthor ? '/author' : '/user'
    const displayName = loading
        ? (initialUser?.name || 'User')
        : (user?.displayName || user?.email?.split('@')[0] || 'User')
    const initials = displayName.substring(0, 2).toUpperCase()

    function handleSignOut() {
        startTransition(async () => {
            await signOut()
        })
    }

    /** All post types for grid display */
    const allPostTypes = (Object.keys(ROUTE_PREFIXES) as PostTypeKey[])
        .filter((k) => POST_TYPE_CONFIG[k])

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onClose} />

            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-xl lg:hidden flex flex-col animate-slide-right">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                    <Logo height={32} />
                    <button onClick={onClose} className="rounded-lg p-1.5 text-foreground-muted hover:bg-background-subtle transition-colors" aria-label="Close menu">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Main links */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {MAIN_NAV.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                        >
                            {link.label}
                            <ChevronRight className="size-3.5 text-foreground-subtle" />
                        </Link>
                    ))}

                    {/* All post types in grid */}
                    <div className="pt-4">
                        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                            Browse by Category
                        </p>
                        <div className="grid grid-cols-2 gap-1 px-1">
                            {allPostTypes.map((key) => {
                                const config = POST_TYPE_CONFIG[key]
                                return (
                                    <Link
                                        key={key}
                                        href={ROUTE_PREFIXES[key]}
                                        onClick={onClose}
                                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                                    >
                                        <span className={`inline-flex size-6 items-center justify-center rounded-md text-xs font-bold ${config.color} ${config.textColor}`}>
                                            {config.label.charAt(0)}
                                        </span>
                                        <span className="truncate text-xs">{config.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </nav>

                {/* Bottom - Auth aware */}
                <div className="shrink-0 border-t border-border px-4 py-4">
                    {showProfile ? (
                        <div className="space-y-1">
                            {/* User info */}
                            <div className="flex items-center gap-3 px-1 pb-2">
                                {(loading ? initialUser?.avatar_url : user?.avatarUrl) ? (
                                    <img src={(loading ? initialUser?.avatar_url : user?.avatarUrl)!} alt={displayName} className="size-8 rounded-full object-cover ring-1 ring-border" />
                                ) : (
                                    <span className="flex size-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                                        {initials}
                                    </span>
                                )}
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
                            className="flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
                        >
                            Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </>
    )
}

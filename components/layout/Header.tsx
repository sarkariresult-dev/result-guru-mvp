'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { ChevronDown, LogOut, LayoutDashboard, User as UserIcon, Loader2, type LucideIcon, FileText, Briefcase, Trophy, CreditCard, Key, BarChart2, BookOpen, ClipboardList, Star, CalendarCheck, GraduationCap, Bell } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { MobileNavClient } from './MobileNavClient'
import { Avatar } from '@/components/ui/Avatar'
import { Logo } from '@/features/shared/components/Logo'
import { ROUTE_PREFIXES, TOP_NAV_LINKS } from '@/config/site'
import { POST_TYPE_CONFIG } from '@/config/constants'
import { useAuth } from '@/hooks/useAuth'
import { signOut } from '@/features/auth/actions'
import type { PostTypeKey } from '@/config/site'
import type { PublicUser } from '@/types/user.types'


/* Icon map for post types */
const ICON_MAP: Record<string, LucideIcon> = {
    Briefcase, Trophy, CreditCard, Key, BarChart2, BookOpen,
    ClipboardList, FileText, Star, CalendarCheck, GraduationCap, Bell,
}

/* Build post type grid items */
const POST_TYPE_ITEMS = (Object.keys(ROUTE_PREFIXES) as PostTypeKey[]).map((key) => ({
    key,
    label: POST_TYPE_CONFIG[key].label,
    href: ROUTE_PREFIXES[key],
    icon: POST_TYPE_CONFIG[key].icon,
    color: POST_TYPE_CONFIG[key].color,
    textColor: POST_TYPE_CONFIG[key].textColor,
}))

interface HeaderProps {
    /** Server-fetched user - eliminates loading skeleton flash */
    initialUser?: PublicUser | null
}

export function Header({ initialUser }: HeaderProps) {
    const [postsOpen, setPostsOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const { user, isAdmin, isAuthor, isLoggedIn, loading } = useAuth()
    const [isPending, startTransition] = useTransition()

    function handlePostsEnter() {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setPostsOpen(true)
    }

    function handlePostsLeave() {
        timeoutRef.current = setTimeout(() => setPostsOpen(false), 150)
    }

    function handleSignOut() {
        startTransition(async () => {
            await signOut()
        })
    }

    /* Close on outside click */
    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setPostsOpen(false)
            }
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    useEffect(() => {
        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
    }, [])

    const showProfile = loading ? !!initialUser : isLoggedIn && !!user
    const showLoading = loading && !initialUser

    const effectiveIsAdmin = loading ? initialUser?.role === 'admin' : isAdmin
    const effectiveIsAuthor = loading ? (initialUser?.role === 'author' || initialUser?.role === 'admin') : isAuthor
    const dashboardHref = effectiveIsAdmin ? '/admin' : effectiveIsAuthor ? '/author' : '/user'

    const displayName = loading ? (initialUser?.name || 'User') : (user?.displayName || user?.email?.split('@')[0] || 'User')
    const avatarUrl = loading ? initialUser?.avatar_url : user?.avatarUrl

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur-md shadow-xs">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="shrink-0" aria-label="Result Guru home">
                    <Logo height={36} />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-1 lg:flex">
                    {TOP_NAV_LINKS.slice(0, 2).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                        >
                            {item.label}
                        </Link>
                    ))}

                    {/* Posts dropdown - Grid */}
                    <div
                        ref={dropdownRef}
                        className="relative"
                        onMouseEnter={handlePostsEnter}
                        onMouseLeave={handlePostsLeave}
                    >
                        <button
                            onClick={() => setPostsOpen((v) => !v)}
                            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle hover:text-foreground ${postsOpen ? 'bg-background-subtle text-foreground' : 'text-foreground-muted'}`}
                        >
                            Posts
                            <ChevronDown className={`size-3.5 transition-transform duration-200 ${postsOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {postsOpen && (
                            <div className="absolute left-1/2 top-full -translate-x-1/2 pt-2 z-50">
                                <div className="w-105 rounded-xl border border-border bg-surface p-3 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                                    <div className="grid grid-cols-3 gap-1">
                                        {POST_TYPE_ITEMS.map((item) => {
                                            const Icon = ICON_MAP[item.icon] ?? FileText
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setPostsOpen(false)}
                                                    className="group flex flex-col items-center gap-1.5 rounded-lg p-3 text-center transition-colors hover:bg-background-subtle"
                                                >
                                                    <span className={`inline-flex size-8 items-center justify-center rounded-lg ${item.color} ${item.textColor} transition-transform group-hover:scale-110`}>
                                                        <Icon className="size-4" />
                                                    </span>
                                                    <span className="text-xs font-medium text-foreground-muted group-hover:text-foreground">
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {TOP_NAV_LINKS.slice(2).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    {/* Auth-aware: Profile dropdown or Get Started */}
                    {showLoading ? (
                        /* Skeleton - only if no server user available */
                        <div className="hidden h-9 w-28 animate-pulse rounded-full bg-background-subtle sm:block" />
                    ) : showProfile ? (
                        <div className="relative hidden sm:block" ref={profileRef}>
                            <button
                                onClick={() => setProfileOpen((v) => !v)}
                                className="flex size-9 items-center justify-center rounded-full border border-border bg-surface shadow-sm transition-colors hover:bg-background-subtle"
                                aria-label="Profile menu"
                            >
                                <Avatar src={avatarUrl} alt={displayName} fallback={displayName} size="xs" className="ring-1 ring-border" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-border bg-surface py-1 shadow-xl">
                                    {/* User info */}
                                    <div className="border-b border-border px-4 py-3">
                                        <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                                        <p className="truncate text-xs text-foreground-subtle">{loading ? '' : user?.email}</p>
                                    </div>

                                    {/* Menu items */}
                                    <div className="py-1">
                                        <Link
                                            href={dashboardHref}
                                            onClick={() => setProfileOpen(false)}
                                            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground transition-colors hover:bg-background-subtle"
                                        >
                                            <LayoutDashboard className="size-4 text-foreground-muted" />
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={effectiveIsAdmin ? `${dashboardHref}/settings` : `${dashboardHref}/profile`}
                                            onClick={() => setProfileOpen(false)}
                                            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-foreground transition-colors hover:bg-background-subtle"
                                        >
                                            <UserIcon className="size-4 text-foreground-muted" />
                                            {effectiveIsAdmin ? 'Settings' : 'Profile'}
                                        </Link>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-border py-1">
                                        <button
                                            onClick={handleSignOut}
                                            disabled={isPending}
                                            className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                                        >
                                            {isPending ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <LogOut className="size-4" />
                                            )}
                                            {isPending ? 'Signing out…' : 'Log out'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="hidden rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 sm:inline-flex"
                        >
                            Get Started
                        </Link>
                    )}

                    <MobileNavClient initialUser={initialUser} />
                </div>
            </div>
        </header>
    )
}

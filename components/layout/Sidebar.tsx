'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FileText,
    Users,
    Megaphone,
    ShoppingBag,
    Image,
    Search,
    SearchCheck,
    Settings,
    BarChart3,
    Bell,
    Bookmark,
    User,
    MapPin,
    Building2,
    FolderTree,
    Tag,
    Bot,
    Globe,
    ArrowRightLeft,
    Mail,
    ChevronDown,
    Layers,
    type LucideIcon,
} from 'lucide-react'
import { useState, useCallback, useEffect, useMemo } from 'react'

/* ── Icon name → component map ──────────────────────────────── */

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    FileText,
    Users,
    Megaphone,
    ShoppingBag,
    Image,
    Search,
    SearchCheck,
    Settings,
    BarChart3,
    Bell,
    Bookmark,
    User,
    MapPin,
    Building2,
    FolderTree,
    Tag,
    Bot,
    Globe,
    ArrowRightLeft,
    Mail,
    Layers,
}

/* ── Types ───────────────────────────────────────────────────── */

export interface NavItem {
    title: string
    href: string
    icon: string
    /** Optional badge text (e.g. "New", count) */
    badge?: string
    /** Mark disabled items that aren't built yet */
    disabled?: boolean
}

export interface NavGroup {
    label: string
    items: NavItem[]
    /** Whether this group starts collapsed */
    defaultCollapsed?: boolean
}

/* ── Admin navigation (grouped by feature) ───────────────────── */
/* Mirrors migration files:
   006_users, 007_posts, 004_taxonomy (states, orgs, categories, tags),
   010_media, 011_advertising, 012_affiliate, 013_seo, 014_newsletter,
   008_post_analytics, 009_automation                                   */

export const adminNavGroups: NavGroup[] = [
    {
        label: 'Main',
        items: [
            { title: 'Dashboard', href: '/admin', icon: 'LayoutDashboard' },
            { title: 'Posts', href: '/admin/posts', icon: 'FileText' },
            { title: 'Stories', href: '/admin/stories', icon: 'Layers' },
            { title: 'Media', href: '/admin/media', icon: 'Image' },
        ],
        defaultCollapsed: false,
    },
    {
        label: 'Taxonomy',
        items: [
            { title: 'Categories', href: '/admin/categories', icon: 'FolderTree', disabled: true },
            { title: 'Tags', href: '/admin/tags', icon: 'Tag', disabled: true },
            { title: 'Organizations', href: '/admin/organizations', icon: 'Building2', disabled: true },
            { title: 'States', href: '/admin/states', icon: 'MapPin', disabled: true },
        ],
        defaultCollapsed: false,
    },
    {
        label: 'Monetization',
        items: [
            { title: 'Advertising', href: '/admin/ads', icon: 'Megaphone' },
            { title: 'Affiliates', href: '/admin/affiliates', icon: 'ShoppingBag', disabled: true },
        ],
        defaultCollapsed: false,
    },
    {
        label: 'Growth',
        items: [
            { title: 'Subscribers', href: '/admin/subscribers', icon: 'Mail' },
            { title: 'Analytics', href: '/admin/analytics', icon: 'BarChart3', disabled: true },
            { title: 'SEO', href: '/admin/seo', icon: 'Search' },
            { title: 'Redirects', href: '/admin/redirects', icon: 'ArrowRightLeft' },
            { title: 'Search Analytics', href: '/admin/search-analytics', icon: 'SearchCheck' },
        ],
        defaultCollapsed: false,
    },
    {
        label: 'System',
        items: [
            { title: 'Users', href: '/admin/users', icon: 'Users' },
            { title: 'Automation', href: '/admin/automation', icon: 'Bot', disabled: true },
            { title: 'Settings', href: '/admin/settings', icon: 'Settings' },
        ],
        defaultCollapsed: false,
    },
]

/* Flat list for backward compat */
export const adminNav: NavItem[] = adminNavGroups.flatMap((g) => g.items)

/* ── Author navigation ───────────────────────────────────────── */

export const authorNavGroups: NavGroup[] = [
    {
        label: 'Content',
        items: [
            { title: 'Dashboard', href: '/author', icon: 'LayoutDashboard' },
            { title: 'My Posts', href: '/author/posts', icon: 'FileText' },
            { title: 'Stories', href: '/author/stories', icon: 'Layers' },
            { title: 'Media', href: '/author/media', icon: 'Image', disabled: true },
        ],
        defaultCollapsed: false,
    },
    {
        label: 'Account',
        items: [
            { title: 'Profile', href: '/author/profile', icon: 'User' },
        ],
        defaultCollapsed: false,
    },
]

export const authorNav: NavItem[] = authorNavGroups.flatMap((g) => g.items)

/* ── User navigation ─────────────────────────────────────────── */

export const userNavGroups: NavGroup[] = [
    {
        label: 'Dashboard',
        items: [
            { title: 'Overview', href: '/user', icon: 'LayoutDashboard' },
            { title: 'Saved Posts', href: '/user/saved', icon: 'Bookmark' },
            { title: 'Job Alerts', href: '/user/alerts', icon: 'Bell' },
        ],
        defaultCollapsed: false,
    },
    {
        label: 'Account',
        items: [
            { title: 'Profile', href: '/user/profile', icon: 'User' },
        ],
        defaultCollapsed: false,
    },
]

export const userNav: NavItem[] = userNavGroups.flatMap((g) => g.items)

/* ── Active-link detection ───────────────────────────────────── */

function useIsActive(href: string, allItems: NavItem[]) {
    const pathname = usePathname()
    const cleanPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname

    const isActive = cleanPathname === href || (href !== '/' && cleanPathname.startsWith(href + '/'))
    const hasMoreSpecificMatch = allItems.some(
        (other) =>
            other.href !== href &&
            other.href.length > href.length &&
            (cleanPathname === other.href || cleanPathname.startsWith(other.href + '/')),
    )
    return isActive && !hasMoreSpecificMatch
}

/* ── NavLink ─────────────────────────────────────────────────── */

function NavLink({
    item,
    allItems,
    onNavigate,
}: {
    item: NavItem
    allItems: NavItem[]
    onNavigate?: () => void
}) {
    const isActive = useIsActive(item.href, allItems)
    const Icon = iconMap[item.icon] ?? LayoutDashboard

    if (item.disabled) {
        return (
            <span
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground-subtle/50"
                title={`${item.title} - coming soon`}
            >
                <Icon className="size-4 shrink-0" />
                <span>{item.title}</span>
                <span className="ml-auto rounded bg-background-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-subtle">
                    Soon
                </span>
            </span>
        )
    }

    return (
        <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm dark:bg-brand-900/20 dark:text-brand-300'
                    : 'text-foreground-muted hover:bg-background-subtle hover:text-foreground',
            )}
        >
            <Icon
                className={cn(
                    'size-4 shrink-0 transition-colors',
                    isActive ? 'text-brand-600 dark:text-brand-400' : 'text-foreground-subtle group-hover:text-foreground-muted',
                )}
            />
            <span className="truncate">{item.title}</span>
            {item.badge && (
                <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                    {item.badge}
                </span>
            )}
        </Link>
    )
}

/* ── CollapsibleGroup ────────────────────────────────────────── */

function CollapsibleGroup({
    group,
    allItems,
    onNavigate,
}: {
    group: NavGroup
    allItems: NavItem[]
    onNavigate?: () => void
}) {
    const pathname = usePathname()

    /* Auto-expand if any child is active */
    const hasActiveChild = useMemo(() => {
        const clean = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname
        return group.items.some(
            (item) => clean === item.href || (item.href !== '/' && clean.startsWith(item.href + '/')),
        )
    }, [pathname, group.items])

    const [isOpen, setIsOpen] = useState(!group.defaultCollapsed || hasActiveChild)

    /* If user navigates to a child in a collapsed group, expand it */
    useEffect(() => {
        if (hasActiveChild && !isOpen) setIsOpen(true)
    }, [hasActiveChild, isOpen])

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="mb-1 flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle transition-colors hover:text-foreground-muted"
            >
                {group.label}
                <ChevronDown
                    className={cn(
                        'size-3.5 transition-transform duration-200',
                        isOpen ? 'rotate-0' : '-rotate-90',
                    )}
                />
            </button>
            <div
                className={cn(
                    'grid transition-[grid-template-rows] duration-200',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                )}
            >
                <div className="overflow-hidden">
                    <div className="space-y-0.5">
                        {group.items.map((item) => (
                            <NavLink key={item.href} item={item} allItems={allItems} onNavigate={onNavigate} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Sidebar (flat mode - for simple nav) ─────────────────────── */

interface SidebarProps {
    items: NavItem[]
    className?: string
    onNavigate?: () => void
}

export function Sidebar({ items, className, onNavigate }: SidebarProps) {
    return (
        <nav className={cn('space-y-1', className)} aria-label="Sidebar navigation">
            {items.map((item) => (
                <NavLink key={item.href} item={item} allItems={items} onNavigate={onNavigate} />
            ))}
        </nav>
    )
}

/* ── GroupedSidebar (for grouped nav - shows collapsible sections) ── */

interface GroupedSidebarProps {
    groups: NavGroup[]
    className?: string
    onNavigate?: () => void
}

export function GroupedSidebar({ groups, className, onNavigate }: GroupedSidebarProps) {
    const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups])

    return (
        <nav className={cn('space-y-4', className)} aria-label="Sidebar navigation">
            {groups.map((group) => (
                <CollapsibleGroup key={group.label} group={group} allItems={allItems} onNavigate={onNavigate} />
            ))}
        </nav>
    )
}

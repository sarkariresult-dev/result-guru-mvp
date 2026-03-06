'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, MapPin, Building2, FileText } from 'lucide-react'
import { MAIN_NAV, ROUTE_PREFIXES } from '@/config/site'
import type { PostCard as PostCardType } from '@/types/post.types'
import type { Organization } from '@/types/taxonomy.types'
import type { State } from '@/types/taxonomy.types'

/** Nav items that have mega-menu dropdowns */
const MEGA_MENU_LABELS = ['Job', 'Result', 'Admit Card']

interface DesktopNavProps {
    recentPosts: PostCardType[]
    organizations: Organization[]
    states: State[]
}

export function DesktopNav({ recentPosts, organizations, states }: DesktopNavProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleMouseEnter = (label: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (MEGA_MENU_LABELS.includes(label)) {
            setActiveMenu(label)
        } else {
            setActiveMenu(null)
        }
    }

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setActiveMenu(null), 150)
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <nav className="hidden items-center gap-0.5 lg:flex relative" onMouseLeave={handleMouseLeave}>
            {MAIN_NAV.map((link) => {
                const hasMegaMenu = MEGA_MENU_LABELS.includes(link.label)

                return (
                    <div key={link.href} className="relative">
                        <Link
                            href={link.href}
                            onMouseEnter={() => handleMouseEnter(link.label)}
                            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle hover:text-foreground ${activeMenu === link.label ? 'bg-background-subtle text-foreground' : 'text-foreground-muted'
                                }`}
                        >
                            {link.label}
                            {hasMegaMenu && (
                                <ChevronDown className={`size-3.5 transition-transform duration-200 ${activeMenu === link.label ? 'rotate-180' : ''}`} />
                            )}
                        </Link>

                        {/* Mega Menu Dropdown */}
                        {activeMenu === link.label && hasMegaMenu && (
                            <div
                                className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-fade-up"
                                onMouseEnter={() => handleMouseEnter(link.label)}
                            >
                                <div className="w-150 rounded-xl border border-border bg-surface p-4 shadow-xl ring-1 ring-black/5 dark:ring-white/10 flex flex-col gap-4">
                                    {/* POSTS MEGA MENU */}
                                    <div className="flex items-center justify-between border-b border-border pb-2">
                                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <FileText className="size-4 text-brand-500" />
                                            {link.label} — Latest
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-2 pb-2">
                                        {recentPosts
                                            .filter((p) => {
                                                // Match posts to the current menu tab
                                                const prefix = ROUTE_PREFIXES[p.type as keyof typeof ROUTE_PREFIXES]
                                                return prefix === link.href
                                            })
                                            .slice(0, 20)
                                            .map((post) => {
                                                const prefix = ROUTE_PREFIXES[post.type as keyof typeof ROUTE_PREFIXES] ?? `/${post.type}`
                                                return (
                                                    <Link
                                                        key={post.id}
                                                        href={`${prefix}/${post.slug}`}
                                                        className="group flex flex-col gap-1 rounded-lg p-2.5 hover:bg-background-subtle transition-colors"
                                                    >
                                                        <span className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                                                            {post.title}
                                                        </span>
                                                        <span className="text-xs text-foreground-subtle">
                                                            {post.org_short_name || post.org_name}
                                                        </span>
                                                    </Link>
                                                )
                                            })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}

            {/* States dropdown */}
            <div className="relative">
                <button
                    onMouseEnter={() => handleMouseEnter('__states')}
                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle hover:text-foreground ${activeMenu === '__states' ? 'bg-background-subtle text-foreground' : 'text-foreground-muted'
                        }`}
                >
                    States
                    <ChevronDown className={`size-3.5 transition-transform duration-200 ${activeMenu === '__states' ? 'rotate-180' : ''}`} />
                </button>

                {activeMenu === '__states' && (
                    <div
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-fade-up"
                        onMouseEnter={() => handleMouseEnter('__states')}
                    >
                        <div className="w-125 rounded-xl border border-border bg-surface p-4 shadow-xl ring-1 ring-black/5 dark:ring-white/10 flex flex-col gap-3">
                            <div className="flex items-center border-b border-border pb-2">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <MapPin className="size-4 text-brand-500" />
                                    Browse by State
                                </h3>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 max-h-[60vh] overflow-y-auto pr-2">
                                {states.map((state) => (
                                    <Link
                                        key={state.slug}
                                        href={`/states/${state.slug}`}
                                        className="rounded-lg px-2.5 py-2 text-sm font-medium text-foreground hover:bg-background-subtle hover:text-brand-600 transition-colors truncate"
                                    >
                                        {state.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useBookmarks, type BookmarkEntry } from '@/hooks/useBookmarks'
import { ROUTE_PREFIXES } from '@/config/site'
import { POST_TYPE_CONFIG } from '@/config/constants'
import { Badge } from '@/components/ui/Badge'
import {
    Bookmark,
    Trash2,
    ExternalLink,
    Search,
    Filter,
    BookmarkX,
} from 'lucide-react'

/* ── Helpers ──────────────────────────────────────────────── */

function typePrefix(type: string): string {
    return ROUTE_PREFIXES[type as keyof typeof ROUTE_PREFIXES] ?? `/${type}`
}

function typeLabel(type: string): string {
    return (
        POST_TYPE_CONFIG[type as keyof typeof POST_TYPE_CONFIG]?.label ?? type
    )
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

/* ── Page ──────────────────────────────────────────────────── */

export default function UserSavedPage() {
    const { bookmarks, remove, clear, count } = useBookmarks()
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    /* Unique post types in bookmarks for filter */
    const availableTypes = useMemo(() => {
        const types = new Set(bookmarks.map((b) => b.type))
        return Array.from(types).sort()
    }, [bookmarks])

    /* Filtered + searched bookmarks (newest first) */
    const filtered = useMemo(() => {
        let list = [...bookmarks].reverse() // newest first
        if (typeFilter !== 'all') {
            list = list.filter((b) => b.type === typeFilter)
        }
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter((b) => b.title.toLowerCase().includes(q))
        }
        return list
    }, [bookmarks, search, typeFilter])

    function handleClearAll() {
        if (
            count > 0 &&
            window.confirm(
                `Remove all ${count} saved post${count > 1 ? 's' : ''}? This cannot be undone.`,
            )
        ) {
            clear()
        }
    }

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Saved Posts
                    </h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count > 0
                            ? `${count} bookmark${count > 1 ? 's' : ''} saved locally in your browser.`
                            : 'Your bookmarked jobs, results, and more.'}
                    </p>
                </div>

                {count > 0 && (
                    <button
                        type="button"
                        onClick={handleClearAll}
                        className="inline-flex items-center gap-2 self-start rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30 sm:self-auto"
                    >
                        <Trash2 className="size-3.5" />
                        Clear all
                    </button>
                )}
            </div>

            {/* ── Search & filter bar ────────────────────────── */}
            {count > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search saved posts…"
                            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                        />
                    </div>
                    {availableTypes.length > 1 && (
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-foreground-subtle" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            >
                                <option value="all">All types</option>
                                {availableTypes.map((t) => (
                                    <option key={t} value={t}>
                                        {typeLabel(t)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* ── Bookmark list ──────────────────────────────── */}
            {count === 0 ? (
                <EmptyState />
            ) : filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                    <p className="text-sm text-foreground-muted">
                        No bookmarks match your search.
                    </p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                    <div className="divide-y divide-border">
                        {filtered.map((entry) => (
                            <BookmarkRow
                                key={entry.slug}
                                entry={entry}
                                onRemove={() => remove(entry.slug)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

/* ── Bookmark row ─────────────────────────────────────────── */

function BookmarkRow({
    entry,
    onRemove,
}: {
    entry: BookmarkEntry
    onRemove: () => void
}) {
    return (
        <div className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-background-subtle sm:px-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Bookmark className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
                <Link
                    href={`${typePrefix(entry.type)}/${entry.slug}`}
                    className="line-clamp-1 text-sm font-medium text-foreground hover:text-brand-600"
                >
                    {entry.title}
                </Link>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-foreground-subtle">
                    <Badge
                        variant="gray"
                        className="text-[10px]"
                    >
                        {typeLabel(entry.type)}
                    </Badge>
                    <span>
                        Saved {formatDate(entry.savedAt)}
                    </span>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
                <Link
                    href={`${typePrefix(entry.type)}/${entry.slug}`}
                    className="rounded-lg p-2 text-foreground-subtle opacity-0 transition-all hover:bg-background-subtle hover:text-foreground group-hover:opacity-100"
                    title="View post"
                >
                    <ExternalLink className="size-4" />
                </Link>
                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-lg p-2 text-foreground-subtle opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    title="Remove bookmark"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>
        </div>
    )
}

/* ── Empty state ──────────────────────────────────────────── */

function EmptyState() {
    return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
                <BookmarkX className="size-8 text-amber-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
                No saved posts yet
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-foreground-muted">
                When you find a job, result, or admit card you like, tap
                the bookmark icon to save it here for quick access later.
            </p>
            <Link
                href={ROUTE_PREFIXES.job}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
                Browse Jobs
                <ExternalLink className="size-4" />
            </Link>
        </div>
    )
}
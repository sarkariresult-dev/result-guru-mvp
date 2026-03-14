'use client'

/**
 * PostActionBar - Result Guru
 *
 * Floating action bar on post detail pages with:
 *  - Copy link (useCopyToClipboard)
 *  - WhatsApp / Twitter / Telegram share
 *  - Bookmark toggle (useBookmarks + localStorage)
 *  - Passive page view tracking (fires once per session)
 *
 * Designed as a sticky bar that sits below the post header.
 */

import { useEffect, useRef, useState } from 'react'
import {
    Link2,
    Check,
    Share2,
    Bookmark,
    BookmarkCheck,
    MessageCircle,
    Send,
} from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useBookmarks } from '@/hooks/useBookmarks'
import { SITE } from '@/config/site'

interface Props {
    postId: string
    slug: string
    title: string
    type: string
    initialViewCount: number
    /** Full canonical URL - built server-side */
    url: string
}

// ── Twitter / X icon (inline - avoids extra dependency) ──────────────────

function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

// ── Bot detection (skip view tracking for crawlers) ──────────────────────

const BOT_RE = /bot|crawl|spider|slurp|mediapartners|adsbot|lighthouse|prerender|headless/i

function isBot(): boolean {
    if (typeof navigator === 'undefined') return true
    return BOT_RE.test(navigator.userAgent)
}

function getDevice(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    if (w < 768) return 'mobile'
    if (w < 1024) return 'tablet'
    return 'desktop'
}

export function PostActionBar({ postId, slug, title, type, initialViewCount, url }: Props) {
    const { copy, copied } = useCopyToClipboard()
    const { toggle, isBookmarked } = useBookmarks()
    const bookmarked = isBookmarked(slug)
    const [shareOpen, setShareOpen] = useState(false)
    const shareRef = useRef<HTMLDivElement>(null)
    const viewTracked = useRef(false)

    // ── Track page view once per session ────────────────────────────────
    useEffect(() => {
        if (viewTracked.current || isBot()) return
        const key = `pv_${postId}`
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) return
        viewTracked.current = true
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, '1')

        fetch('/api/analytics/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, referrer: document.referrer || '', device: getDevice() }),
            keepalive: true,
        }).catch(() => { /* analytics must never break the page */ })
    }, [postId])

    // ── Close share dropdown on outside click ──────────────────────────
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
                setShareOpen(false)
            }
        }
        if (shareOpen) document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [shareOpen])

    // ── Share URLs ────────────────────────────────────────────────────────
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(`${title} - ${SITE.name}`)
    const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-sm">
            {/* Share dropdown */}
            <div className="relative" ref={shareRef}>
                <button
                    type="button"
                    onClick={() => setShareOpen((p) => !p)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                    aria-label="Share this post"
                    aria-expanded={shareOpen}
                >
                    <Share2 className="size-4" />
                    <span className="hidden sm:inline">Share</span>
                </button>

                {shareOpen && (
                    <div className="absolute right-0 top-full z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lg animate-fade-in">
                        <button
                            type="button"
                            onClick={() => { copy(url); setShareOpen(false) }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors"
                        >
                            {copied ? <Check className="size-4 text-green-600" /> : <Link2 className="size-4" />}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShareOpen(false)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors"
                        >
                            <MessageCircle className="size-4 text-green-600" />
                            WhatsApp
                        </a>
                        <a
                            href={twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShareOpen(false)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors"
                        >
                            <XIcon className="size-4" />
                            Twitter / X
                        </a>
                        <a
                            href={telegramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShareOpen(false)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors"
                        >
                            <Send className="size-4 text-blue-500" />
                            Telegram
                        </a>
                    </div>
                )}
            </div>

            {/* Copy link shortcut */}
            <button
                type="button"
                onClick={() => copy(url)}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-background-subtle hover:text-foreground"
                aria-label={copied ? 'Link copied' : 'Copy link'}
            >
                {copied ? <Check className="size-4 text-green-600" /> : <Link2 className="size-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {/* Bookmark toggle */}
            <button
                type="button"
                onClick={() => toggle({ slug, title, type })}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${bookmarked
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                        : 'text-foreground-muted hover:bg-background-subtle hover:text-foreground'
                    }`}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                aria-pressed={bookmarked}
            >
                {bookmarked ? (
                    <BookmarkCheck className="size-4" />
                ) : (
                    <Bookmark className="size-4" />
                )}
                <span className="hidden sm:inline">{bookmarked ? 'Saved' : 'Save'}</span>
            </button>
        </div>
    )
}

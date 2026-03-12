'use client'

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
    url: string
}

// Twitter / X icon
function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

export function ImageActionButtons({ postId, slug, title, type, url }: Props) {
    const { copy, copied } = useCopyToClipboard()
    const { toggle, isBookmarked } = useBookmarks()
    const bookmarked = isBookmarked(slug)
    const [shareOpen, setShareOpen] = useState(false)
    const shareRef = useRef<HTMLDivElement>(null)

    // Close share dropdown on outside click
    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
                setShareOpen(false)
            }
        }
        if (shareOpen) document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [shareOpen])

    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(`${title} - ${SITE.name}`)
    const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`

    const btnClass = "flex size-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/20 text-white hover:bg-white/30 transition-colors"

    return (
        <div className="flex items-center gap-2">
            {/* Share dropdown */}
            <div className="relative" ref={shareRef}>
                <button
                    type="button"
                    onClick={() => setShareOpen(p => !p)}
                    className={btnClass}
                    aria-label="Share this post"
                    aria-expanded={shareOpen}
                >
                    <Share2 className="size-4" />
                </button>

                {shareOpen && (
                    <div className="absolute right-0 bottom-full z-30 mb-2 w-44 overflow-hidden rounded-xl border border-border bg-surface shadow-lg animate-fade-in">
                        <button
                            type="button"
                            onClick={() => { copy(url); setShareOpen(false) }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors"
                        >
                            {copied ? <Check className="size-4 text-green-600" /> : <Link2 className="size-4" />}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors">
                            <MessageCircle className="size-4 text-green-600" /> WhatsApp
                        </a>
                        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors">
                            <XIcon className="size-4" /> Twitter / X
                        </a>
                        <a href={telegramUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShareOpen(false)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-background-subtle transition-colors">
                            <Send className="size-4 text-blue-500" /> Telegram
                        </a>
                    </div>
                )}
            </div>

            {/* Copy link */}
            <button
                type="button"
                onClick={() => copy(url)}
                className={btnClass}
                aria-label={copied ? 'Link copied' : 'Copy link'}
            >
                {copied ? <Check className="size-4 text-green-400" /> : <Link2 className="size-4" />}
            </button>

            {/* Bookmark toggle */}
            <button
                type="button"
                onClick={() => toggle({ slug, title, type })}
                className={`${btnClass} ${bookmarked ? 'bg-brand-600/60! border-brand-400/40!' : ''}`}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                aria-pressed={bookmarked}
            >
                {bookmarked ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
            </button>
        </div>
    )
}

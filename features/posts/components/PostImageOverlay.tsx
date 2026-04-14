'use client'

import { Bookmark, BookmarkCheck, FileText } from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'
import { cn } from '@/lib/utils'

interface Props {
    slug: string
    title: string
    type: string
    readingTime: number
}

import { LocalErrorBoundary } from '@/components/shared/LocalErrorBoundary'

export function PostImageOverlay({ slug, title, type, readingTime }: Props) {
    return (
        <LocalErrorBoundary name="PostImageOverlay">
            <PostImageOverlayInternal 
                slug={slug} 
                title={title} 
                type={type} 
                readingTime={readingTime} 
            />
        </LocalErrorBoundary>
    )
}

function PostImageOverlayInternal({ slug, title, type, readingTime }: Props) {
    const { toggle, isBookmarked } = useBookmarks()
    const bookmarked = isBookmarked(slug)

    const glassClass = "bg-black/20 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300"
    const activeGlassClass = "!bg-brand-600/60 !border-brand-400/40"

    return (
        <>
            {/* Top-Right: Save for Later */}
            <div className="absolute top-3 right-3 z-10">
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggle({ slug, title, type })
                    }}
                    className={cn(
                        "flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider",
                        glassClass,
                        bookmarked && activeGlassClass,
                        "hover:bg-white/30 active:scale-95"
                    )}
                    aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this post'}
                    aria-pressed={bookmarked}
                >
                    {bookmarked ? (
                        <>
                            <BookmarkCheck className="size-3.5 fill-current" />
                            <span>Saved</span>
                        </>
                    ) : (
                        <>
                            <Bookmark className="size-3.5" />
                            <span>Save</span>
                        </>
                    )}
                </button>
            </div>

            {/* Bottom-Right: Read Time */}
            <div className="absolute bottom-3 right-3 z-10">
                <div className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.25 text-[11px] font-bold uppercase tracking-wider",
                    glassClass
                )}>
                    <FileText className="size-3.5" />
                    <span>{readingTime} min read</span>
                </div>
            </div>
        </>
    )
}

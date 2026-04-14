import Link from 'next/link'
import { getRecentPosts } from '@/features/posts/queries'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { PostList } from '@/features/posts/components/PostList'
import { NumberedList } from '@/features/posts/components/NumberedList'
import { ArrowRight, ServerCrash, Inbox } from 'lucide-react'
import { AdZone } from '@/components/ads/AdZone'
import { headers } from 'next/headers'
import type { PostCard } from '@/types/post.types'

interface HomeSectionProps {
    /** Post type key, e.g. 'job', 'result' */
    typeKey: string
    /** Section heading displayed to user */
    heading: string
    /** Link the CTA routes to */
    route: string
    /** CTA button label */
    cta: string
    /** Max number of posts to fetch */
    limit: number
    /** Number of images to priority-load (LCP) */
    priority?: number
    /**
     * Pre-fetched posts from fn_homepage_sections() batched RPC.
     * When provided, skips the individual getRecentPosts() call - zero DB queries.
     * When omitted, falls back to fetching independently (backward compatible).
     */
    posts?: PostCard[]
    /** Layout variant to render */
    layout?: 'grid' | 'list' | 'numbered'
    /** Theme color class for UI accents (e.g. 'bg-brand-500', 'bg-amber-500') */
    themeColorClass?: string
    /** Optional identifier to inject an ad below this section's content */
    adSlot?: string
}

/**
 * Async Server Component for a homepage content section.
 * Each instance streams independently via Suspense - no waterfall.
 *
 * Performance: when `posts` prop is provided (from batched RPC),
 * this component does ZERO database work - pure rendering only.
 */
export async function HomeSection({
    typeKey, heading, route, cta, limit, priority, posts: prefetched,
    layout = 'grid', themeColorClass = 'bg-brand-500', adSlot
}: HomeSectionProps) {
    // Explicitly opt-in to dynamic rendering to avoid Date.now() prerender errors
    await headers()

    let posts: PostCard[] = prefetched ? prefetched.slice(0, limit) : []
    let hasError = false

    // Only fetch if no pre-fetched data was provided
    if (!prefetched) {
        try {
            posts = await getRecentPosts(typeKey, limit)
        } catch {
            hasError = true
        }
    }

    if (hasError) {
        return (
            <section aria-labelledby={`section-${typeKey}`}>
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                    <h2 id={`section-${typeKey}`} className="text-2xl font-bold tracking-tight">
                        {heading}
                    </h2>
                </div>
                <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-6 text-center">
                    <div className="flex items-center gap-3 text-sm text-foreground-muted">
                        <ServerCrash className="size-5 text-red-500" />
                        <span>Could not load {heading.toLowerCase()}. Try refreshing.</span>
                    </div>
                </div>
            </section>
        )
    }

    if (posts.length === 0) {
        return (
            <section aria-labelledby={`section-${typeKey}`} className="flex flex-col h-full">
                <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                    <h2 id={`section-${typeKey}`} className="text-2xl font-bold tracking-tight">
                        {heading}
                    </h2>
                </div>
                <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-surface-subtle p-6 text-center">
                    <div className="flex flex-col items-center gap-2 text-foreground-muted">
                        <div className="flex size-12 items-center justify-center rounded-full bg-surface shadow-sm ring-1 ring-border">
                            <Inbox className="size-5 text-brand-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">No recent updates</p>
                            <p className="text-xs">Check back soon for latest {heading.toLowerCase()}.</p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section aria-labelledby={`section-${typeKey}`} className="flex flex-col h-full">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    {/* Minimalist horizontal dash for heading accent */}
                    <span className={`h-1 w-6 rounded-full ${themeColorClass} opacity-80`} aria-hidden="true" />
                    <h2 id={`section-${typeKey}`} className="text-lg font-bold tracking-tight text-foreground">
                        {heading}
                    </h2>
                </div>
                {cta && route && (
                    <Link
                        href={route}
                        aria-label={`${cta} ${heading}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700 transition-colors dark:text-brand-500 dark:hover:text-brand-400"
                    >
                        {cta}
                        <ArrowRight className="size-3" />
                    </Link>
                )}
            </div>

            <div className="flex-1">
                {layout === 'list' && <PostList posts={posts} themeColorClass={themeColorClass} now={Date.now()} />}
                {layout === 'numbered' && <NumberedList posts={posts} now={Date.now()} />}
                {layout === 'grid' && <PostGrid posts={posts} priority={priority} />}
            </div>

            {adSlot && (
                <div className="mt-6">
                    <AdZone zoneSlug={adSlot} className="w-full bg-surface-subtle border border-border rounded-xl min-h-[100px]" />
                </div>
            )}
        </section>
    )
}


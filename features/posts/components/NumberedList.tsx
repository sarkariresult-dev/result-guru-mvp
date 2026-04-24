import Link from 'next/link'
import type { PostCard as PostCardType } from '@/types/post.types'
import { ROUTE_PREFIXES } from '@/config/site'

interface Props {
    posts: PostCardType[]
    /** Current timestamp to anchor 'NEW' badges on (avoids Next.js prerender error) */
    now?: number
}

export function NumberedList({ posts, now = Date.now() }: Props) {
    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center bg-surface-subtle">
                <p className="text-sm font-medium text-foreground-muted">No trending updates</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-5 w-full">
            {posts.map((post, index) => {
                // Show 'NEW' badge if published in last 48 hours
                const isNew = post.published_at && (now - new Date(post.published_at).getTime() < 48 * 60 * 60 * 1000)

                return (
                    <Link
                        key={post.id}
                        href={`${ROUTE_PREFIXES[post.type as keyof typeof ROUTE_PREFIXES] ?? `/${post.type}`}/${post.slug}`}
                        className="group relative flex items-start gap-4 transition-all"
                    >
                        {/* Giant Number Drop-cap matching the screenshot */}
                        <span className="text-4xl font-extrabold tracking-tighter text-border/60 group-hover:text-brand-300/40 transition-colors dark:text-border/20 select-none leading-none pt-0.5">
                            {index + 1}
                        </span>

                        <div className="flex flex-col gap-1 pr-2 min-w-0">
                            <div className="flex items-start gap-2">
                                <h3 className="text-sm font-bold leading-snug text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <div className="flex shrink-0 items-center gap-1 mt-0.5">
                                    {isNew && (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-inset ring-amber-200/50 dark:ring-amber-800/20">
                                            New
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 mt-1">
                                <p className="text-[10px] text-foreground-subtle leading-tight line-clamp-1 font-medium uppercase tracking-widest opacity-80">
                                    {post.excerpt || `Latest update from ${post.org_name || 'department'}`}
                                </p>
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

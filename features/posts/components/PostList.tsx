import Link from 'next/link'
import { ChevronRight, Clock } from 'lucide-react'
import type { PostCard as PostCardType } from '@/types/post.types'
import { ROUTE_PREFIXES } from '@/config/site'
import { cn, formatDate } from '@/lib/utils'

interface Props {
    posts: PostCardType[]
    themeColorClass?: string
    /** Current timestamp to anchor 'NEW' badges on (avoids Next.js prerender error) */
    now?: number
}

export function PostList({ posts, themeColorClass = 'bg-brand-500', now = Date.now() }: Props) {
    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center bg-surface-subtle">
                <p className="text-sm font-medium text-foreground-muted">No updates available</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-surface border border-border/60 rounded-xl overflow-hidden shadow-sm">
            {posts.map((post, index) => {
                const isLast = index === posts.length - 1
                const hasEndDate = !!post.application_end_date
                const isClosingSoon = post.application_status === 'closing_soon'
                
                // Show 'NEW' badge if published in last 48 hours
                const isNew = post.published_at && (now - new Date(post.published_at).getTime() < 48 * 60 * 60 * 1000)

                return (
                    <Link
                        key={post.id}
                        href={`${ROUTE_PREFIXES[post.type as keyof typeof ROUTE_PREFIXES] ?? `/${post.type}`}/${post.slug}`}
                        className={`group relative flex flex-col justify-center px-4 py-3.5 transition-colors hover:bg-surface-subtle ${!isLast ? 'border-b border-border/50' : ''}`}
                    >
                        {/* The thick colored left border accent */}
                        <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${themeColorClass} opacity-30 transition-opacity group-hover:opacity-100`} />

                        <div className="flex flex-col gap-1.5 pr-8 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="line-clamp-2 text-sm font-bold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                                    {post.title}
                                </h3>
                                {isNew && (
                                    <span className="shrink-0 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-inset ring-amber-200/50 dark:ring-amber-800/20">
                                        New
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                {(post.qualification || post.state_name) && (
                                    <div className="flex items-center gap-x-2 text-[10px] text-foreground-subtle font-medium uppercase tracking-widest opacity-80">
                                        {post.state_name && <span>{post.state_name}</span>}
                                        {post.state_name && post.qualification && <span className="size-0.5 rounded-full bg-border" />}
                                        {post.qualification && <span className="line-clamp-1">{post.qualification.join(', ')}</span>}
                                    </div>
                                )}
                                
                                {hasEndDate && (
                                    <div className={cn(
                                        "flex items-center gap-1 text-[10px] font-bold",
                                        isClosingSoon ? "text-orange-600 dark:text-orange-400" : "text-brand-600/70 dark:text-brand-400/70"
                                    )}>
                                        <Clock className={cn("size-3", isClosingSoon && "animate-pulse-subtle")} />
                                        <span className="uppercase tracking-tighter">Last Date: {formatDate(post.application_end_date)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 size-4 shrink-0 text-border group-hover:text-brand-500 transition-colors" />
                    </Link>
                )
            })}
        </div>
    )
}

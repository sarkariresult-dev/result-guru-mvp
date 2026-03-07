import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { PostCard as PostCardType } from '@/types/post.types'
import { ROUTE_PREFIXES } from '@/config/site'

interface Props {
    posts: PostCardType[]
    themeColorClass?: string
}

export function PostList({ posts, themeColorClass = 'bg-brand-500' }: Props) {
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
                return (
                    <Link
                        key={post.id}
                        href={`${ROUTE_PREFIXES[post.type as keyof typeof ROUTE_PREFIXES] ?? `/${post.type}`}/${post.slug}`}
                        className={`group relative flex flex-col justify-center px-4 py-3.5 transition-colors hover:bg-surface-subtle ${!isLast ? 'border-b border-border/50' : ''}`}
                    >
                        {/* The thick colored left border accent */}
                        {/* The thick colored left border accent — persistent but subtle, full on hover */}
                        <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${themeColorClass} opacity-30 transition-opacity group-hover:opacity-100`} />

                        <div className="flex flex-col gap-1.5 pr-6 min-w-0">
                            <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                                {post.title}
                            </h3>
                            {(post.qualification || post.state_name) && (
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground-subtle font-medium">
                                    {post.state_name && <span>{post.state_name}</span>}
                                    {post.state_name && post.qualification && <span className="size-1 rounded-full bg-border" />}
                                    {post.qualification && <span className="line-clamp-1">{post.qualification}</span>}
                                </div>
                            )}
                        </div>

                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 size-4 shrink-0 text-border group-hover:text-brand-500 transition-colors" />
                    </Link>
                )
            })}
        </div>
    )
}

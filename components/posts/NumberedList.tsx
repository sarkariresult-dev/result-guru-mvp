import Link from 'next/link'
import type { PostCard as PostCardType } from '@/types/post.types'
import { ROUTE_PREFIXES } from '@/config/site'

interface Props {
    posts: PostCardType[]
}

export function NumberedList({ posts }: Props) {
    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center bg-surface-subtle">
                <p className="text-sm font-medium text-foreground-muted">No trending updates</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {posts.map((post, index) => (
                <Link
                    key={post.id}
                    href={`${ROUTE_PREFIXES[post.type as keyof typeof ROUTE_PREFIXES] ?? `/${post.type}`}/${post.slug}`}
                    className="group relative flex items-start gap-4 transition-all"
                >
                    {/* Giant Number Drop-cap matching the screenshot */}
                    <span className="text-4xl font-extrabold tracking-tighter text-border/80 group-hover:text-brand-200 transition-colors dark:text-border/40 select-none">
                        {index + 1}
                    </span>

                    <div className="flex flex-col gap-1 -mt-0.5">
                        <h3 className="text-sm font-bold leading-snug text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                            {post.title}
                        </h3>
                        <p className="text-[11px] text-foreground-subtle leading-tight line-clamp-1">
                            {post.excerpt || `Latest update from ${post.org_name || 'department'}`}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    )
}

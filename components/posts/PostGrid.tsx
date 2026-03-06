import type { PostCard as PostCardType } from '@/types/post.types'
import { PostCard } from './PostCard'

interface Props {
    posts: PostCardType[]
    /** Number of cards to mark as priority for LCP image loading */
    priority?: number
}

export function PostGrid({ posts, priority = 0 }: Props) {
    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
                <p className="text-lg font-medium text-foreground-muted">No posts found</p>
                <p className="mt-1 text-sm text-foreground-subtle">Check back later for updates.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
                <PostCard key={post.id} post={post} priority={i < priority} />
            ))}
        </div>
    )
}

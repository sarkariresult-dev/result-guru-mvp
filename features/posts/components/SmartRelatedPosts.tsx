import { PostCard } from './PostCard'
import { getSmartRelatedPosts } from '@/features/posts/queries'
import { Sparkles } from 'lucide-react'

interface Props {
    postId: string
}

export async function SmartRelatedPosts({ postId }: Props) {
    const posts = await getSmartRelatedPosts(postId)

    if (posts.length === 0) return null

    return (
        <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="size-5 text-brand-500" /> Highly Recommended
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {posts.map((p) => (
                    <PostCard key={p.id} post={p} />
                ))}
            </div>
        </section>
    )
}

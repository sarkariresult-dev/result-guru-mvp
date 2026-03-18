import { PostCard } from './PostCard'
import { getPosts, getRecentPosts } from '@/features/posts/queries'
import type { PublishedPost } from '@/types/post.types'
import { PostType } from '@/types/enums'

interface Props {
    post: PublishedPost
    limit?: number
}

export async function RelatedPosts({ post, limit = 4 }: Props) {
    const recentPosts = await getRecentPosts(post.type, limit + 1)
    const filteredRecent = recentPosts.filter((p) => p.id !== post.id).slice(0, limit)

    // Deep-link to related Syllabus, Answer Keys, cut-offs for the same organization
    let relatedResources: any[] = []
    if ([PostType.Result, PostType.Job, PostType.Admit].includes(post.type as PostType) && post.organization_id) {
        relatedResources = await getPosts({
            organization_id: post.organization_id,
            type: [PostType.Syllabus, PostType.AnswerKey, PostType.PreviousPaper, PostType.CutOff],
        }, 1, 3)
        relatedResources = relatedResources.filter((p) => p.id !== post.id)
    }

    if (filteredRecent.length === 0 && relatedResources.length === 0) return null

    return (
        <div className="mt-12 animate-fade-in space-y-12">
            {relatedResources.length > 0 && (
                <section>
                    <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground">
                        Related Syllabus & Resources
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {relatedResources.map((p) => (
                            <PostCard key={p.id} post={p} />
                        ))}
                    </div>
                </section>
            )}

            {filteredRecent.length > 0 && (
                <section>
                    <h2 className="mb-6 text-xl font-bold tracking-tight text-foreground">
                        Similar Updates
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredRecent.map((p) => (
                            <PostCard key={p.id} post={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}

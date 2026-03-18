'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { publishPost, deletePost } from '@/features/posts/actions'
import { Button } from '@/components/ui/Button'

interface Props {
    postId: string
    status: string
}

export function PostActions({ postId, status }: Props) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handlePublish = () => {
        startTransition(async () => {
            await publishPost(postId)
            router.refresh()
        })
    }

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this post?')) return
        startTransition(async () => {
            await deletePost(postId)
            router.refresh()
        })
    }

    return (
        <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => router.push(`/author/posts/${postId}/edit`)} disabled={isPending}>
                Edit
            </Button>
            {status !== 'published' && (
                <Button size="sm" onClick={handlePublish} disabled={isPending}>
                    {isPending ? 'Publishing…' : 'Publish'}
                </Button>
            )}
            <Button size="sm" variant="secondary" onClick={handleDelete} disabled={isPending}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
                Delete
            </Button>
        </div>
    )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'

interface SavedPost {
    id: string
    title: string
    slug: string
    type: string
    savedAt: string
}

export function SavedPostsList() {
    const [posts, setPosts] = useState<SavedPost[]>([])

    useEffect(() => {
        const saved = localStorage.getItem('rg_saved_posts')
        if (saved) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage sync
            try { setPosts(JSON.parse(saved)) } catch { /* ignore */ }
        }
    }, [])

    const removePost = (id: string) => {
        const updated = posts.filter((p) => p.id !== id)
        setPosts(updated)
        localStorage.setItem('rg_saved_posts', JSON.stringify(updated))
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16 text-center">
                <Bookmark className="mb-3 size-10 text-foreground-subtle" />
                <p className="text-foreground-muted">No saved posts yet.</p>
                <p className="mt-1 text-sm text-foreground-subtle">
                    Browse jobs and click the bookmark icon to save them here.
                </p>
            </div>
        )
    }

    return (
        <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {posts.map((post) => {
                const prefix = ROUTE_PREFIXES[post.type as PostTypeKey] ?? `/${post.type}`
                const href = `${prefix}/${post.slug}`
                return (
                    <div key={post.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-background-subtle">
                        <div className="min-w-0 flex-1">
                            <Link href={href} className="text-sm font-medium hover:text-brand-600 transition-colors">
                                {post.title}
                            </Link>
                            <div className="mt-1 flex items-center gap-2">
                                <Badge variant="gray" className="text-xs">{post.type}</Badge>
                                <span className="text-xs text-foreground-subtle">
                                    Saved {new Date(post.savedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={href} className="text-foreground-muted hover:text-brand-600 transition-colors">
                                <ExternalLink className="size-4" />
                            </Link>
                            <button onClick={() => removePost(post.id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                                Remove
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

'use client'

import { WebStory } from '@/types/stories.types'
import { STORY_STATUS_CONFIG } from '@/config/constants'
import { FileText, Map, Eye, Edit3, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { deleteWebStory } from '@/lib/actions/stories'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
    stories: WebStory[]
    baseUrl: string
    isAdmin?: boolean
    onDelete?: (id: string) => void
}

export function WebStoryList({ stories, baseUrl, isAdmin = false, onDelete }: Props) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this story?')) return
        
        setIsDeleting(id)
        const { error } = await deleteWebStory(id, baseUrl)
        setIsDeleting(null)

        if (error) {
            alert(error)
        } else {
            router.refresh()
            onDelete?.(id)
        }
    }
    if (stories.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
                <FileText className="size-10 text-foreground-subtle" />
                <p className="font-medium text-foreground">No stories found</p>
                <p className="text-sm text-foreground-muted">
                    {isAdmin ? 'No stories have been created yet.' : 'Create your first story to get started.'}
                </p>

            </div>
        )
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
                <table className="w-full text-sm">
                    <thead className="border-b border-border bg-background-subtle">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Story Title</th>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Updated</th>
                            <th className="px-4 py-3 text-right font-medium text-foreground-muted">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {stories.map((story) => {
                            const statusConf = STORY_STATUS_CONFIG[story.status]
                            const editUrl = `${baseUrl}/${story.id}`
                            const viewUrl = `/stories/${story.slug}`

                            return (
                                <tr key={story.id} className="transition-colors hover:bg-background-subtle">
                                    <td className="max-w-xs px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 shrink-0 overflow-hidden rounded bg-slate-100">
                                                {story.cover_image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element -- dynamic story cover preview
                                                    <img src={story.cover_image} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                        <Map className="size-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <Link
                                                href={isAdmin ? viewUrl : editUrl}
                                                target={isAdmin ? "_blank" : "_self"}
                                                className="truncate font-medium text-foreground hover:text-brand-600"
                                                title={story.title}
                                            >
                                                {story.title}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusConf.color} ${statusConf.textColor}`}>
                                            {statusConf.label}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-subtle">
                                        {format(new Date(story.updated_at), 'dd MMM yyyy')}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={viewUrl}
                                                target="_blank"
                                                className="rounded-md p-1.5 text-foreground-muted hover:bg-slate-100 hover:text-foreground"
                                                title="View Story"
                                            >
                                                <Eye className="size-4" />
                                            </Link>
                                            <Link
                                                href={editUrl}
                                                className="rounded-md p-1.5 text-foreground-muted hover:bg-slate-100 hover:text-foreground"
                                                title="Edit Story"
                                            >
                                                <Edit3 className="size-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(story.id)}
                                                disabled={isDeleting === story.id}
                                                className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                title="Delete Story"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 lg:hidden">
                {stories.map((story) => {
                    const statusConf = STORY_STATUS_CONFIG[story.status]
                    const editUrl = `${baseUrl}/${story.id}`
                    const viewUrl = `/stories/${story.slug}`

                    return (
                        <div key={story.id} className="rounded-xl border border-border bg-surface p-4">
                            <div className="flex gap-4">
                                <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                    {story.cover_image ? (
                                        // eslint-disable-next-line @next/next/no-img-element -- dynamic story cover preview
                                        <img src={story.cover_image} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                                            <Map className="size-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <Link
                                        href={isAdmin ? viewUrl : editUrl}
                                        target={isAdmin ? "_blank" : "_self"}
                                        className="line-clamp-2 font-medium text-foreground hover:text-brand-600"
                                    >
                                        {story.title}
                                    </Link>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConf.color} ${statusConf.textColor}`}>
                                            {statusConf.label}
                                        </span>
                                        <span className="text-[10px] text-foreground-subtle">
                                            Updated {format(new Date(story.updated_at), 'dd MMM')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                <Link
                                    href={viewUrl}
                                    target="_blank"
                                    className="text-xs font-medium text-brand-600 hover:underline"
                                >
                                    View Live
                                </Link>
                                <div className="flex gap-3">
                                    <Link href={editUrl} className="text-xs font-medium text-foreground hover:text-brand-600">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(story.id)} disabled={isDeleting === story.id} className="text-xs font-medium text-red-600 disabled:opacity-50">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

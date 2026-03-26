import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { ApplicationStatusBadge } from './ApplicationStatusBadge'
import { ROUTE_PREFIXES } from '@/config/site'
import type { PostCard as PostCardType } from '@/types/post.types'

interface Props {
    post: PostCardType
    priority?: boolean
}

export function PostCard({ post, priority = false }: Props) {
    const prefix = ROUTE_PREFIXES[post.type as keyof typeof ROUTE_PREFIXES] ?? `/${post.type}`
    const href = `${prefix}/${post.slug}`

    const imageSrc = post.featured_image || '/images/placeholder-post.png'

    return (
        <article className="group relative flex flex-col h-full overflow-hidden rounded-xl border border-border bg-surface transition-shadow duration-200 hover:shadow-lg">
            <div className="relative flex flex-col overflow-hidden bg-background-muted aspect-video w-full items-center justify-center text-center">
                <Image
                    src={imageSrc}
                    alt={post.featured_image_alt ?? post.title}
                    width={600}
                    height={338}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    priority={priority}
                    quality={60}
                />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <ApplicationStatusBadge status={post.application_status} />
                    {post.state_name && (
                        <span className="text-xs text-foreground-subtle">{post.state_name}</span>
                    )}
                </div>
                <h2 className="line-clamp-2 text-base font-semibold leading-snug text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    <Link href={href} className="after:absolute after:inset-0">{post.title}</Link>
                </h2>
                {(post.application_start_date || post.application_end_date) && (
                    <div className="flex items-center gap-1 text-[11px] font-medium transition-colors">
                        {post.application_status === 'upcoming' && post.application_start_date ? (
                            <span className="text-blue-600 dark:text-blue-400">Starts {formatDate(post.application_start_date)}</span>
                        ) : post.application_end_date ? (
                            <span className={post.application_status === 'closing_soon' ? 'text-orange-600 dark:text-orange-400 animate-pulse-subtle' : 'text-foreground-subtle'}>
                                {post.application_status === 'closed' ? 'Closed on ' : 'Apply by '}
                                {formatDate(post.application_end_date)}
                            </span>
                        ) : null}
                    </div>
                )}
                {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-foreground-muted">{post.excerpt}</p>
                )}
                <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-foreground-subtle">
                    <span>{post.org_short_name || post.org_name}</span>
                    <time dateTime={post.published_at ?? ''}>
                        {post.published_at ? formatDate(post.published_at) : ''}
                    </time>
                </div>
            </div>
        </article>
    )
}

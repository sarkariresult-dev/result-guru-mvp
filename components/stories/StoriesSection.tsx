import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, ArrowRight, Play } from 'lucide-react'
import { getPublicStories } from '@/lib/queries/stories'

export async function StoriesSection() {
    const { data: stories } = await getPublicStories(6)

    if (!stories || stories.length === 0) {
        return null
    }

    return (
        <section className="container mx-auto max-w-7xl px-4 py-8 overflow-hidden">
            <div className="mb-6 flex items-center justify-between">
                <div className=''>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        Web Stories
                        <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">New</span>
                    </h2>
                    <p className="text-xs text-foreground-muted mt-0.5 font-medium">Quick visual updates</p>
                </div>
                <Link
                    href="/stories"
                    className="group flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                >
                    View All
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex gap-4 overflow-x-auto pb-6 pt-2 -mx-4 px-4 custom-scrollbar snap-x snap-mandatory">
                {stories.map((story) => (
                    <Link
                        key={story.id}
                        href={`/stories/${story.slug}`}
                        className="group relative shrink-0 w-[140px] sm:w-[160px] aspect-9/16 rounded-2xl overflow-hidden bg-surface shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 snap-start border border-border"
                    >
                        <Image
                            src={story.cover_image}
                            alt={story.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 640px) 140px, 160px"
                        />

                        {/* Gradient Overlay for text readability */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                        {/* Play Icon Badge */}
                        <div className="absolute top-3 right-3 size-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 z-10">
                            <Play className="size-3 text-white fill-white translate-x-px" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-x-0 bottom-0 p-3 z-10 flex flex-col justify-end">
                            <h3 className="text-white text-xs sm:text-sm font-bold leading-snug line-clamp-3 text-balance drop-shadow-md">
                                {story.title}
                            </h3>

                            {/* Author/Date minimal footer */}
                            {(story as any).author && (
                                <div className="mt-2 flex items-center gap-1.5 opacity-80">
                                    {(story as any).author.avatar_url ? (
                                        <Image
                                            src={(story as any).author.avatar_url}
                                            alt={(story as any).author.name || 'Author'}
                                            width={14}
                                            height={14}
                                            className="rounded-full ring-1 ring-white/50"
                                        />
                                    ) : (
                                        <div className="flex size-3.5 items-center justify-center rounded-full bg-brand-500 text-[6px] font-bold text-white ring-1 ring-white/50">
                                            {((story as any).author.name || 'A').substring(0, 1).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-[9px] text-white font-medium truncate">
                                        {(story as any).author.name || 'Admin'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}

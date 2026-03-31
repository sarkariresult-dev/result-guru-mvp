import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Play, Search } from 'lucide-react'
import { getPublicStories } from '@/lib/queries/stories'
import { buildPageMetadata } from '@/lib/metadata'
import { AdZone } from '@/components/ads/AdZone'

export const metadata = buildPageMetadata({
    title: 'Visual Web Stories - Sarkari Jobs & Results',
    description: 'Browse our collection of visual Web Stories covering the latest government job updates, exam results, and quick guides for Indian aspirants.',
    path: '/stories',
})

// Increase limit for archive page
const ITEMS_PER_PAGE = 24

export default async function StoriesArchivePage() {
    // In a real app we'd grab page from searchParams, but for MVP we fetch a solid chunk
    const { data: stories, count } = await getPublicStories(ITEMS_PER_PAGE, 1)

    return (
        <div className="flex flex-col gap-8 pb-16">
            {/* Header Section */}
            <section className="bg-brand-50/50 py-12 border-b border-border dark:bg-brand-950/20">
                <div className="container mx-auto max-w-7xl px-4 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-100/50 border border-brand-200 shadow-sm dark:bg-brand-900/40 dark:border-brand-700/50 mb-5">
                        <Sparkles className="size-6 text-brand-600 dark:text-brand-400" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl text-balance">
                        Visual <span className="text-brand-600 dark:text-brand-400">Web Stories</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-foreground-muted sm:text-lg text-balance">
                        Quick, engaging, and mobile-first updates on the latest government jobs, results, and exam guides.
                    </p>
                    
                    <div className="mt-8 flex justify-center gap-2">
                         <span className="rounded-full bg-brand-100 text-brand-700 px-3 py-1 text-xs font-bold uppercase tracking-wider dark:bg-brand-900/50 dark:text-brand-300">
                             {count} Stories Available
                         </span>
                    </div>
                </div>
            </section>

            <AdZone zoneSlug="below_header" className="container mx-auto max-w-7xl px-4" />

            {/* Stories Grid */}
            <section className="container mx-auto max-w-7xl px-4">
                {stories.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-border py-24 text-center bg-surface">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-background-muted mb-4">
                            <Search className="size-8 text-foreground-subtle" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No Stories Yet</h3>
                        <p className="mt-2 text-foreground-muted text-sm max-w-sm mx-auto">
                            Our editors are working on creating visual stories. Check back soon for exciting updates!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-6">
                        {stories.map((story) => (
                            <Link
                                key={story.id}
                                href={`/stories/${story.slug}`}
                                className="group relative flex flex-col aspect-9/16 rounded-2xl overflow-hidden bg-surface shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-border"
                            >
                                <Image
                                    src={story.cover_image}
                                    alt={story.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                />
                                
                                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />
                                
                                <div className="absolute top-2 right-2 size-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 z-10 transition-transform duration-300 group-hover:scale-110">
                                    <Play className="size-3.5 text-white fill-white translate-x-px" />
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-10 flex flex-col justify-end">
                                    <h3 className="text-white text-sm sm:text-base font-bold leading-tight line-clamp-3 text-balance drop-shadow-lg group-hover:text-brand-100 transition-colors">
                                        {story.title}
                                    </h3>
                                    
                                    {(story as any).author && (
                                        <div className="mt-3 flex items-center gap-2 opacity-90">
                                            {(story as any).author.avatar_url ? (
                                                <Image
                                                    src={(story as any).author.avatar_url}
                                                    alt={(story as any).author.name || 'Author'}
                                                    width={20}
                                                    height={20}
                                                    className="rounded-full ring-2 ring-white/30"
                                                />
                                            ) : (
                                                <div className="flex size-5 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white ring-2 ring-white/30">
                                                    {((story as any).author.name || 'A').substring(0, 1).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-white font-medium truncate w-24">
                                                    {(story as any).author.name || 'Admin'}
                                                </span>
                                                <span className="text-[8px] text-white/60 uppercase tracking-widest font-black">
                                                    {new Date(story.published_at || story.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric'})}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

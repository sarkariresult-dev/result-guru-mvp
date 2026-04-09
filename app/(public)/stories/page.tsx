import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Play, Search, ShieldCheck, Zap, PlayCircle } from 'lucide-react'
import { getPublicStories } from '@/lib/queries/stories'
import { buildPageMetadata } from '@/lib/metadata'
import { AdZone } from '@/components/ads/AdZone'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

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
        <div className="flex flex-col pb-16">
            {/* Immersive Hub Header */}
            <div className="relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-b border-border">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
                    <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-brand-400/5 blur-[100px]" />
                </div>

                <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-20 relative">
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles className="size-3.5" />
                            Visual Awareness Hub
                        </div>

                        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl max-w-4xl mb-6">
                            Visual <span className="bg-linear-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">Web Stories</span>
                        </h1>

                        <p className="max-w-2xl text-lg sm:text-xl text-foreground-muted leading-relaxed mb-10 text-balance">
                            Quick, engaging, and mobile-first updates on the latest government jobs, results, and exam guides.
                        </p>

                        <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-950 border border-border shadow-sm text-sm font-bold text-foreground">
                                 <PlayCircle className="size-4 text-brand-600" />
                                 {count} Verified Stories
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <AdZone zoneSlug="below_header" className="container mx-auto max-w-7xl px-4 my-8" />

            {/* Stories Grid */}
            <section className="container mx-auto max-w-7xl px-4 mt-8">
                {stories.length === 0 ? (
                    <div className="rounded-4xl border border-dashed border-border py-24 text-center bg-surface">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-background-muted mb-4">
                            <Search className="size-8 text-foreground-subtle" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No Stories Yet</h3>
                        <p className="mt-2 text-foreground-muted text-sm max-w-sm mx-auto">
                            Our editors are working on creating visual stories. Check back soon for exciting updates!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:gap-6">
                        {stories.map((story) => (
                            <Link
                                key={story.id}
                                href={`/stories/${story.slug}`}
                                className="group relative flex flex-col aspect-9/16 rounded-2xl overflow-hidden bg-surface shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-border"
                            >
                                <Image
                                    src={story.cover_image}
                                    alt={story.title}
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                />
                                
                                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/30 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />
                                
                                <div className="absolute top-3 right-3 size-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 z-10 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-600 group-hover:border-brand-500 shadow-xl">
                                    <Play className="size-3.5 text-white fill-current translate-x-px" />
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 flex flex-col justify-end">
                                    <h3 className="text-white text-sm sm:text-[15px] font-bold leading-tight line-clamp-3 text-balance group-hover:text-brand-100 transition-colors drop-shadow-md">
                                        {story.title}
                                    </h3>
                                    
                                    {(story as any).author && (
                                        <div className="mt-4 flex items-center gap-2.5 opacity-90 border-t border-white/10 pt-4">
                                            {(story as any).author.avatar_url ? (
                                                <Image
                                                    src={(story as any).author.avatar_url}
                                                    alt={(story as any).author.name || 'Author'}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full ring-2 ring-white/20"
                                                />
                                            ) : (
                                                <div className="flex size-6 items-center justify-center rounded-full bg-brand-500 text-[10px] font-black text-white ring-2 ring-white/20 uppercase">
                                                    {((story as any).author.name || 'A').substring(0, 1)}
                                                </div>
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] text-white font-black truncate tracking-tight">
                                                    {(story as any).author.name || 'Admin'}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <Zap className="size-2 text-brand-400 fill-current" />
                                                    <span className="text-[9px] text-white/60 uppercase tracking-widest font-black">
                                                        {new Date(story.published_at || story.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric'})}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Standardized Institutional CTA */}
            <div className="mt-20">
                <InstitutionalCTA 
                    title="Get Visual Updates on your favorite platforms"
                    description="Never miss a verified result or job alert again. Join our visual awareness hub and get real-time stories delivered directly to your device."
                    primaryCTA={{ label: "Join Telegram Hub", href: "https://t.me/resultguru247" }}
                    secondaryCTA={{ text: "Prefer WhatsApp?", actionLabel: "Join Channel", href: "https://whatsapp.com/channel/0029Vb7XUqn1SWt7c9kqCV3I" }}
                />
            </div>
        </div>
    )
}

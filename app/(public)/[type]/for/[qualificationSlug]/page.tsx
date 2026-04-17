import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getQualifications, getQualificationBySlug } from '@/lib/queries/taxonomy'
import { getPosts, getPostsCount } from '@/features/posts/queries'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { PAGINATION } from '@/config/constants'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import { POST_TYPE_CONFIG } from '@/config/constants'
import { PostType } from '@/types/enums'
import type { PostTypeKey } from '@/config/site'
import { Icons } from '@/lib/icons'
import { buildListingTitle, buildListingMeta } from '@/lib/metadata'
import { slugToKey, humanise } from '@/lib/utils'
import type { PostCard } from '@/types/post.types'
import { TaxonomyRibbon } from '@/features/taxonomy/components/TaxonomyRibbon'
import { Suspense } from 'react'
import { GraduationCap, Verified, ShieldCheck, Zap, Info, ArrowLeft, Building2 } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────

interface Props {
    params: Promise<{ type: string; qualificationSlug: string }>
    searchParams: Promise<{ page?: string }>
}

// ── Static Params ─────────────────────────────────────────────────

export async function generateStaticParams() {
    try {
        const quals = await getQualifications().catch(() => [])
        const topTypes = ['job', 'result', 'admit-card', 'syllabus']
        
        if (process.env.NODE_ENV === 'development') {
            return topTypes.map(type => ({ type, qualificationSlug: '10th-pass' }))
        }

        const params: { type: string; qualificationSlug: string }[] = []
        quals.forEach(q => {
            topTypes.forEach(type => {
                params.push({ type, qualificationSlug: q.slug })
            })
        })

        if (params.length === 0) {
            return [{ type: 'job', qualificationSlug: '10th-pass' }]
        }

        return params
    } catch {
        return [{ type: 'job', qualificationSlug: '10th-pass' }]
    }
}

// ── Metadata ──────────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { type, qualificationSlug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey]) return {}

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    
    let qualRecord = null
    try {
        qualRecord = await getQualificationBySlug(qualificationSlug)
    } catch {
        return {}
    }

    if (!qualRecord) return {}
  
    const title = buildListingTitle(typeKey as PostTypeKey, {
        page,
        qualificationName: qualRecord.short_name || qualRecord.name
    })
    const description = buildListingMeta(typeKey as PostTypeKey, {
        page,
        qualificationName: qualRecord.short_name || qualRecord.name
    })
    const url = `${SITE.url}${ROUTE_PREFIXES[typeKey]}/for/${qualificationSlug}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    const totalCount = await getPostsCount({ 
        type: typeKey as PostType, 
        qualification: qualificationSlug
    }).catch(() => 0)
    
    const totalPages = Math.ceil(totalCount / PAGINATION.DEFAULT_LIMIT)

    const baseMetadata: Metadata = {
        title,
        description,
        alternates: {
            canonical,
        },
    }

    if (page > 1 || page < totalPages) {
        baseMetadata.alternates = {
            ...baseMetadata.alternates,
            ...(page > 1 && { prev: page === 2 ? url : `${url}?page=${page - 1}` }),
            ...(page < totalPages && { next: `${url}?page=${page + 1}` }),
        }
    }

    return baseMetadata
}

// ── Pagination helpers ────────────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    if (total > 1) pages.push(total)
    return pages
}

// ── Page ───────────────────────────────────────────────────────────

export default async function TypeForQualificationPage({ params, searchParams }: Props) {
    const { type, qualificationSlug } = await params
    const typeKey = slugToKey(type)
    if (!typeKey || !POST_TYPE_CONFIG[typeKey]) notFound()

    let qualRecord = null
    try {
        qualRecord = await getQualificationBySlug(qualificationSlug)
    } catch {
        notFound()
    }

    if (!qualRecord) notFound()

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT
    const year = 2026

    let posts: PostCard[] = []
    let totalCount = 0
    let fetchError = false

    try {
    const pType = typeKey as PostType
        const [p, c] = await Promise.all([
            getPosts({ type: pType, qualification: qualRecord.slug }, page, limit),
            getPostsCount({ type: pType, qualification: qualRecord.slug }),
        ])
        posts = p
        totalCount = c
    } catch {
        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)
    const basePath = `${ROUTE_PREFIXES[typeKey]}/for/${qualificationSlug}`
    const config = POST_TYPE_CONFIG[typeKey]
    const qualName = qualRecord.short_name || qualRecord.name

    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Qualifications', url: `${SITE.url}/qualifications` },
        { name: qualName, url: `${SITE.url}/qualification/${qualificationSlug}` },
        { name: config.heading, url: `${SITE.url}${basePath}` },
    ])

    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${qualName} ${config.heading} ${year}`,
        description: `Latest ${config.heading.toLowerCase()} requiring ${qualRecord.name}.`,
        url: `${SITE.url}${basePath}`,
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
        ...(totalCount > 0 && {
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: totalCount,
                itemListElement: posts.slice(0, 10).map((post, i) => ({
                    '@type': 'ListItem',
                    position: (page - 1) * limit + i + 1,
                    url: `${SITE.url}${ROUTE_PREFIXES[post.type as PostTypeKey] || `/${post.type}`}/${post.slug}`,
                    name: post.title,
                })),
            },
        }),
    }

    return (
        <div className="flex flex-col min-h-screen">
            <JsonLd data={[breadcrumbJsonLd, collectionJsonLd]} />

            {/* Premium Hub Hero */}
            <header className="relative overflow-hidden bg-slate-950 px-4 py-20 text-white">
                <div className="absolute inset-0 z-0 opacity-20" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} 
                />
                <div className="absolute inset-0 z-0 bg-linear-to-b from-brand-600/20 to-transparent" />
                
                <div className="container relative z-10 mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-wrap items-center gap-3">
                        <Link 
                            href="/qualifications"
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md transition-colors hover:bg-white/20 border border-white/10"
                        >
                            <ArrowLeft className="size-3" />
                            Qualifications Hub
                        </Link>
                        <div className="h-4 w-px bg-white/20" />
                        <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-accent-400 border border-accent-500/20">
                            <Verified className="size-3" />
                            Verified Career Stream
                        </span>
                    </div>

                    <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:items-end">
                        <div className="space-y-6">
                            <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                                {config.heading} for <br />
                                <span className="text-gradient-brand">
                                    {qualName} Candidates
                                </span>
                            </h1>
                            <p className="max-w-2xl text-lg font-medium text-slate-300 leading-relaxed italic">
                                &quot;Every {qualName} qualification represents a key to a specific vertical of the Indian government. We unlock that potential through verified, real-time tracking.&quot;
                            </p>
                        </div>

                        {/* Glass Stats Card */}
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                            <div className="space-y-6">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Live Availability</div>
                                    <div className="flex items-baseline gap-2">
                                        <div className="text-4xl font-black text-white">{totalCount.toLocaleString()}</div>
                                        <div className="text-xs font-bold text-accent-400 flex items-center gap-1">
                                            <Zap className="size-3 fill-accent-400" />
                                            UPDATED NOW
                                        </div>
                                    </div>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Status</div>
                                        <div className="text-sm font-bold text-white">Active Hub</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Verified</div>
                                        <div className="text-sm font-bold text-white">100% Daily</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="container mx-auto max-w-7xl px-4 py-16">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
                    
                    {/* Content Column */}
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-foreground sm:text-3xl">
                                Latest {qualName} {config.heading}
                            </h2>
                            <div className="hidden sm:block h-px flex-1 bg-border mx-8" />
                        </div>

                        <AdZone zoneSlug="below_header" postType={typeKey} className="mb-4" />

                        {fetchError ? (
                            <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-red-200 bg-red-50/50 p-12 text-center">
                                <Icons.AlertCircle className="size-12 text-red-600 mb-4" />
                                <h3 className="text-xl font-bold text-foreground">Connection Error</h3>
                                <p className="text-foreground-muted">We could not sync with the recruitment database.</p>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-12">
                                <PostGrid posts={posts} priority={2} />
                                
                                {/* Professional Pagination */}
                                {totalPages > 1 && (
                                    <nav className="flex items-center justify-center gap-2 pt-8 border-t border-border" aria-label="Pagination">
                                        {getPageNumbers(page, totalPages).map((p, i) =>
                                            p === '...' ? (
                                                <span key={i} className="px-3 text-slate-400">&bull;&bull;&bull;</span>
                                            ) : (
                                                <Link
                                                    key={p}
                                                    href={p === 1 ? basePath : `${basePath}?page=${p}`}
                                                    className={`hidden sm:flex size-11 items-center justify-center rounded-xl text-sm font-black transition-all ${p === page ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-slate-50 dark:bg-slate-900 border border-border hover:border-brand-500'}`}
                                                >
                                                    {p}
                                                </Link>
                                            )
                                        )}
                                        <div className="flex items-center gap-1 sm:hidden">
                                            {page > 1 && <Link href={page === 2 ? basePath : `${basePath}?page=${page - 1}`} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black">PREV</Link>}
                                            <span className="px-4 py-2 text-xs font-black">{page} / {totalPages}</span>
                                            {page < totalPages && <Link href={`${basePath}?page=${page + 1}`} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-black">NEXT</Link>}
                                        </div>
                                    </nav>
                                )}
                            </div>
                        ) : (
                            <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center">
                                <Info className="size-12 text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-foreground">No active updates</h3>
                                <p className="text-foreground-muted">There are no {config.heading.toLowerCase()} available for {qualName} at this moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Premium Sidebar */}
                    <aside className="space-y-10">
                        {/* Hub Intelligence Section */}
                        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-xl shadow-slate-200/50 dark:bg-slate-900 dark:shadow-none">
                            <div className="bg-slate-950 p-6 text-white text-center">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-2">Hub Intelligence</div>
                                <h3 className="text-xl font-black">{qualName} Analysis</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                                    <div className="text-sm font-bold text-foreground-muted">Total Posts</div>
                                    <div className="text-sm font-black text-foreground">{totalCount.toLocaleString()}</div>
                                </div>
                                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                                    <div className="text-sm font-bold text-foreground-muted">Hub Status</div>
                                    <div className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-sm font-black text-emerald-600 uppercase tracking-tighter">Live Updates</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm font-bold text-foreground-muted">Last Verified</div>
                                    <div className="text-sm font-black text-foreground">Today</div>
                                </div>
                            </div>
                        </div>

                        {/* Institutional Verification Shield */}
                        <div className="rounded-3xl bg-linear-to-br from-brand-600 to-brand-400 p-8 text-white shadow-2xl shadow-brand-600/20">
                            <ShieldCheck className="size-12 mb-6" />
                            <h3 className="text-2xl font-black mb-4 leading-tight">Institutional <br />Verification</h3>
                            <p className="text-sm font-medium text-white/90 leading-relaxed mb-6">
                                This carrier stream is monitored by Result Guru institutional analysts. Every update for {qualName} candidates is cross-verified for authenticity.
                            </p>
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                Shield Integrity: 100%
                            </div>
                        </div>

                        <AdZone zoneSlug="sidebar" />
                    </aside>
                </div>
            </main>

            {/* Institutional Integrity Section */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border-t border-border py-24">
                <div className="container mx-auto max-w-7xl px-4 text-center">
                    <div className="mx-auto max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-[0.2em] border border-brand-500/20">
                            Professional Standards
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                            Institutional <span className="text-brand-600">Integrity</span>
                        </h2>
                        <p className="text-lg text-foreground-muted leading-relaxed">
                            Result Guru maintains a strict verification protocol for educational qualifications, ensuring every {config.heading.toLowerCase()} notification is accurately mapped to official criteria.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: Building2, title: 'Official Data', desc: 'Direct from recruitment board servers' },
                            { icon: Verified, title: 'Triple Checked', desc: 'Verified by three independent analysts' },
                            { icon: ShieldCheck, title: 'Trust Vault', desc: 'Archived official gazettes for audit' },
                            { icon: GraduationCap, title: 'Career First', desc: 'Tailored for academic background' }
                        ].map((item, i) => (
                            <div key={i} className="rounded-3xl border border-border bg-white dark:bg-slate-900 p-8 hover:-translate-y-2 transition-transform shadow-sm group">
                                <div className="mx-auto size-12 rounded-2xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <item.icon className="size-6" />
                                </div>
                                <h3 className="text-lg font-black text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-foreground-muted font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getStateBySlug } from '@/lib/queries/states'
import { getPosts, getPostsCount } from '@/features/posts/queries'
import { sanitizeHtml } from '@/lib/sanitize'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { formatTitle } from '@/lib/metadata'
import { PAGINATION } from '@/config/constants'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'
import { MapPin, FileText, ChevronLeft, ChevronRight, ServerCrash, History, Globe, ShieldCheck, ArrowRight, Bell, ExternalLink } from 'lucide-react'
import type { PostCard } from '@/types/post.types'

/* ── Types ───────────────────────────────────────────────────────── */

interface Props {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string }>
}

/* ── Metadata ────────────────────────────────────────────────────── */

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { slug } = await params
    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    let stateRecord: Awaited<ReturnType<typeof getStateBySlug>> = null

    try {
        stateRecord = await getStateBySlug(slug)
    } catch {
        return {}
    }

    if (!stateRecord) return {}

    const baseTitle = page > 1
        ? `${stateRecord.name} - Page ${page} - Sarkari Updates 2026`
        : (stateRecord.meta_title ?? `${stateRecord.name} | Govt Jobs, Results & Admit Card 2026`)
    const title = formatTitle(baseTitle)
    const description = stateRecord.meta_description ?? `Find all the latest government jobs, exam results, admit cards, and recruitment notifications in ${stateRecord.name}. Updated daily with official information.`
    const url = `${SITE.url}/states/${slug}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    // Fetch total count for prev/next calculation
    const totalCount = await getPostsCount({ state_slug: slug }).catch(() => 0)
    const totalPages = Math.ceil(totalCount / PAGINATION.DEFAULT_LIMIT)

    const baseMetadata: Metadata = {
        title,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: SITE.name,
            locale: SITE.locale,
            type: 'website',
            images: [{ url: SITE.defaultOgImage, width: SITE.defaultOgWidth, height: SITE.defaultOgHeight }],
        },
        twitter: {
            card: SITE.twitter.cardType,
            title,
            description,
            site: SITE.twitter.handle,
        },
    }

    // Add prev/next alternates
    if (page > 1 || page < totalPages) {
        baseMetadata.alternates = {
            ...baseMetadata.alternates,
            ...(page > 1 && { prev: page === 2 ? url : `${url}?page=${page - 1}` }),
            ...(page < totalPages && { next: `${url}?page=${page + 1}` }),
        }
    }

    return baseMetadata
}

/* ── Pagination helpers ──────────────────────────────────────────── */

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

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function StateProfilePage({ params, searchParams }: Props) {
    const { slug } = await params

    let stateRecord: Awaited<ReturnType<typeof getStateBySlug>> = null
    try {
        stateRecord = await getStateBySlug(slug)
    } catch {
        notFound()
    }

    if (!stateRecord || !stateRecord.is_active) notFound()

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT

    let posts: PostCard[] = []
    let totalCount = 0
    let fetchError = false

    try {
        ;[posts, totalCount] = await Promise.all([
            getPosts({ state_slug: slug }, page, limit),
            getPostsCount({ state_slug: slug }),
        ])
    } catch {
        fetchError = true
    }

    const totalPages = Math.ceil(totalCount / limit)

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'States', url: `${SITE.url}/states` },
        { name: stateRecord.name, url: `${SITE.url}/states/${slug}` },
    ])

    /* CollectionPage JSON-LD */
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${stateRecord.name} Government Jobs, Results & Updates`,
        description: `Latest government jobs, exam results, and notifications from the state of ${stateRecord.name}.`,
        url: `${SITE.url}/states/${slug}`,
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

    /* ── Build rel="prev" / rel="next" for paginated pages ──────── */
    const basePath = `/states/${slug}`
    const prevUrl = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
    const nextUrl = page < totalPages ? `${basePath}?page=${page + 1}` : null

    return (
        <>
            {/* Pagination link relations for crawlers */}
            {prevUrl && <link rel="prev" href={`${SITE.url}${prevUrl}`} />}
            {nextUrl && <link rel="next" href={`${SITE.url}${nextUrl}`} />}

            <JsonLd data={[breadcrumbJsonLd, collectionJsonLd]} />

            {/* Premium Hero Section */}
            <div className="relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20 border-b border-border">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-full h-full rounded-full bg-brand-500/10 blur-[100px]" />
                </div>

                <div className="container mx-auto max-w-7xl px-4 py-12 relative">
                    <Breadcrumb
                        items={[
                            { label: 'States', href: '/states' },
                            { label: stateRecord.name },
                        ]}
                        className="mb-8"
                    />
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-6">
                                {/* State Abbreviation Icon */}
                                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-brand-600 text-white font-black tracking-tighter text-2xl shadow-xl shadow-brand-500/20">
                                    {stateRecord.abbr || stateRecord.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="size-2 rounded-full bg-accent-500 animate-pulse" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">Live Recruitment Hub</span>
                                    </div>
                                    <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">
                                        <span className="text-gradient-brand">{stateRecord.h1_override ?? `${stateRecord.name} Sarkari Updates`}</span>
                                    </h1>
                                </div>
                            </div>

                            <p className="max-w-3xl text-lg text-foreground-muted leading-relaxed mb-8">
                                Get instant notifications for {stateRecord.name} Government Jobs, BPSC/UPPSC Exam Results, Admit Cards, and official notifications. Verified and updated daily.
                            </p>

                            {/* Quick Category Pills */}
                            <div className="flex flex-wrap gap-2.5">
                                {[
                                    { label: 'Latest Jobs', href: `/job/in/${slug}`, active: true },
                                    { label: 'Results', href: `/result/in/${slug}` },
                                    { label: 'Admit Card', href: `/admit-card/in/${slug}` },
                                    { label: 'Syllabus', href: `/syllabus/in/${slug}` },
                                    { label: 'Answer Key', href: `/answer-key/in/${slug}` }
                                ].map((tab) => (
                                    <Link
                                        key={tab.label}
                                        href={tab.href}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border shadow-sm ${tab.active
                                            ? 'bg-brand-600 border-brand-500 text-white hover:bg-brand-700 shadow-brand-600/20'
                                            : 'bg-white dark:bg-slate-900 border-border text-foreground-muted hover:border-brand-500/50 hover:text-brand-600'
                                            }`}
                                    >
                                        {tab.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Stats Box Table-style for Authority */}
                        <div className="lg:w-72 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground-muted mb-4 pb-4 border-b border-border">Hub Statistics</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold uppercase text-foreground-subtle">Active Posts</span>
                                    <span className="text-xl font-black text-foreground">{(totalCount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold uppercase text-foreground-subtle">Region</span>
                                    <span className="text-sm font-bold text-foreground">India ({stateRecord.abbr || 'IN'})</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase text-foreground-subtle">Verification</span>
                                    <span className="text-[10px] font-black py-0.5 px-2 bg-accent-500/10 text-accent-600 dark:text-accent-400 rounded-full border border-accent-500/20">100% Official</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO Intro Text if exists */}
                    {stateRecord.intro_html && (
                        <div className="mt-12 p-6 rounded-2xl bg-brand-500/3 border border-brand-500/10">
                            <div
                                className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(stateRecord.intro_html) }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content & Sidebar Grid */}
            <div className="container mx-auto max-w-7xl px-4 py-12">
                <div className="grid lg:grid-cols-[1fr_300px] gap-12">
                    {/* Main Content Area */}
                    <div>
                        <AdZone zoneSlug="below_header" className="mb-10" />

                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                                    <FileText className="size-4" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-foreground">
                                    Latest Hub Updates
                                </h2>
                            </div>
                            <div className="h-px flex-1 bg-linear-to-r from-border to-transparent mx-6 hidden sm:block" />
                        </div>

                        {/* Posts section */}
                        {fetchError ? (
                            <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                                <div className="mb-4 rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                                    <ServerCrash className="size-8 text-red-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h3>
                                <p className="max-w-md text-sm text-foreground-muted">
                                    Could not load the latest posts for {stateRecord.name}. Please try again in a moment.
                                </p>
                            </div>
                        ) : posts.length > 0 ? (
                            <PostGrid posts={posts} priority={3} />
                        ) : (
                            <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center px-4">
                                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-background-subtle mx-auto">
                                    <MapPin className="size-7 text-foreground-muted" />
                                </div>
                                <h3 className="mb-1 text-lg font-semibold text-foreground">No updates yet</h3>
                                <p className="max-w-md mx-auto text-sm text-foreground-muted">
                                    We haven&apos;t published any posts for {stateRecord.name} recently. Check back soon!
                                </p>
                                <Link
                                    href="/states"
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                                >
                                    Browse All States
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <aside className="space-y-8">
                        {/* Popular State Hubs */}
                        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Globe className="size-4 text-brand-600" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Other State Hubs</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { name: 'Uttar Pradesh', slug: 'uttar-pradesh' },
                                    { name: 'Bihar', slug: 'bihar' },
                                    { name: 'Rajasthan', slug: 'rajasthan' },
                                    { name: 'Madhya Pradesh', slug: 'madhya-pradesh' },
                                    { name: 'Haryana', slug: 'haryana' },
                                    { name: 'Delhi', slug: 'delhi' }
                                ].filter(s => s.slug !== slug).slice(0, 4).map((state) => (
                                    <Link
                                        key={state.slug}
                                        href={`/states/${state.slug}`}
                                        className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-border text-[11px] font-bold text-foreground-muted hover:border-brand-500 hover:text-brand-600 transition-all text-center"
                                    >
                                        {state.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Verification Card */}
                        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                            <div className="flex items-center gap-2 mb-3">
                                <ShieldCheck className="size-5 text-emerald-600" />
                                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Verified Resource</h3>
                            </div>
                            <p className="text-xs text-emerald-800/70 dark:text-emerald-400/70 leading-relaxed mb-4">
                                All notifications in the {stateRecord.name} Hub are cross-verified with official government gazettes and recruitment portals.
                            </p>
                            <Link
                                href="/verify"
                                className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:underline"
                            >
                                Learn More
                            </Link>
                        </div>

                        <AdZone zoneSlug="sidebar" />
                    </aside>
                </div>

                {/* Pagination - numbered pages */}
                {totalPages > 1 && !fetchError && (
                    <nav className="mt-16 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                        {page > 1 ? (
                            <Link
                                href={`/states/${slug}?page=${page - 1}`}
                                className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-white dark:bg-slate-900 text-foreground transition-all hover:border-brand-500 hover:text-brand-600 hover:-translate-x-1"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="size-5" />
                            </Link>
                        ) : (
                            <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-slate-50 dark:bg-slate-900 text-foreground-subtle opacity-50 cursor-not-allowed" aria-disabled="true">
                                <ChevronLeft className="size-5" />
                            </span>
                        )}

                        <div className="flex items-center gap-2">
                            {getPageNumbers(page, totalPages).map((p, i) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${i}`} className="px-2 text-sm text-foreground-subtle font-bold tracking-widest">...</span>
                                ) : (
                                    <Link
                                        key={p}
                                        href={`/states/${slug}?page=${p}`}
                                        className={`inline-flex size-10 items-center justify-center rounded-xl border text-sm font-bold transition-all ${p === page
                                            ? 'border-brand-600 bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-2 ring-brand-500/20'
                                            : 'border-border bg-white dark:bg-slate-900 text-foreground hover:border-brand-500/50 hover:text-brand-600'
                                            }`}
                                        aria-current={p === page ? 'page' : undefined}
                                        aria-label={`Page ${p}`}
                                    >
                                        {p}
                                    </Link>
                                )
                            )}
                        </div>

                        {page < totalPages ? (
                            <Link
                                href={`/states/${slug}?page=${page + 1}`}
                                className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-white dark:bg-slate-900 text-foreground transition-all hover:border-brand-500 hover:text-brand-600 hover:translate-x-1"
                                aria-label="Next page"
                            >
                                <ChevronRight className="size-5" />
                            </Link>
                        ) : (
                            <span className="inline-flex size-10 items-center justify-center rounded-xl border border-border bg-slate-50 dark:bg-slate-900 text-foreground-subtle opacity-50 cursor-not-allowed" aria-disabled="true">
                                <ChevronRight className="size-5" />
                            </span>
                        )}
                    </nav>
                )}
            </div>

            {/* Mission & Verification Authority Section */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border-t border-border py-20">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        <div className="grid sm:grid-cols-2 gap-4 lg:w-3/5">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: 'Local Verification',
                                    desc: `Direct validation with ${stateRecord.name} recruitment portals to eliminate misinformation.`,
                                    color: 'text-emerald-500',
                                    bg: 'bg-emerald-500/10'
                                },
                                {
                                    icon: History,
                                    title: 'Resource Archives',
                                    desc: 'Access to historical exam papers and result cycles for years of data.',
                                    color: 'text-amber-500',
                                    bg: 'bg-amber-500/10'
                                },
                                {
                                    icon: Bell,
                                    title: 'Instant Alerts',
                                    desc: 'Be the first to know about local job openings with our real-time notification engine.',
                                    color: 'text-blue-500',
                                    bg: 'bg-blue-500/10'
                                },
                                {
                                    icon: ExternalLink,
                                    title: 'Direct Linkage',
                                    desc: 'One-click access to official apply pages, minimizing navigation friction for students.',
                                    color: 'text-purple-500',
                                    bg: 'bg-purple-500/10'
                                }
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-border shadow-sm hover:border-brand-500/50 transition-colors group"
                                >
                                    <div className={`size-10 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="size-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                                    <p className="text-sm text-foreground-muted leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="lg:w-1/2 space-y-8">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-4">
                                    The {stateRecord.name} Hub
                                </h2>
                                <h3 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl leading-tight">
                                    Your shortcut to <br />
                                    <span className="text-gradient-brand underline decoration-accent-500/30 underline-offset-8">State Career Success.</span>
                                </h3>
                            </div>

                            <p className="text-lg text-foreground-muted leading-relaxed">
                                Result Guru provides the fastest updates for {stateRecord.name} notifications. Whether you are looking for local school board results or high-level commission openings, our team ensures you never miss a deadline.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                                <Link
                                    href="/states"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20"
                                >
                                    View All States
                                    <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-950 border border-border text-foreground font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                    Report Job Missing
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AdZone zoneSlug="below_content" className="mt-8" />
        </>
    )
}

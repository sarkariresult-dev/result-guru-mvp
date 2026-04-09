import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { getPosts, getPostsCount } from '@/features/posts/queries'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { formatTitle } from '@/lib/metadata'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'
import { PAGINATION } from '@/config/constants'
import { Building2, FileText, Globe, MapPin, ExternalLink, ChevronLeft, ChevronRight, Bell, ShieldCheck, History } from 'lucide-react'
import type { PostCard } from '@/types/post.types'

/* ── Types ───────────────────────────────────────────────────────── */

interface Props {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string }>
}

/* ── Helpers ─────────────────────────────────────────────────────── */

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

/* ── Metadata ────────────────────────────────────────────────────── */

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { slug } = await params
    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    let org: Awaited<ReturnType<typeof getOrganizationBySlug>> = null

    try {
        org = await getOrganizationBySlug(slug)
    } catch {
        return {}
    }

    if (!org) return {}

    const baseTitle = page > 1 
      ? `${org.name} - Page ${page} - Sarkari Update` 
      : (org.meta_title ?? `${org.name}${org.short_name ? ` (${org.short_name})` : ''} | Jobs & Results 2026`)
    const title = formatTitle(baseTitle)
    const description = org.meta_description ?? `Find all the latest government jobs, exam results, admit cards, and notifications from ${org.name} (${org.short_name ?? slug}). Updated daily.`
    const url = `${SITE.url}/organizations/${slug}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    // Fetch total count for prev/next calculation
    const totalCount = await getPostsCount({ organization_id: org.id }).catch(() => 0)
    const totalPages = Math.ceil(totalCount / PAGINATION.DEFAULT_LIMIT)

    const baseMetadata: Metadata = {
        title,
        description,
        alternates: {
            canonical,
        },
        ...(org.meta_robots && { robots: org.meta_robots }),
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: SITE.name,
            locale: SITE.locale,
            type: 'website',
            images: [{ url: org.logo_url ?? SITE.defaultOgImage, width: SITE.defaultOgWidth, height: SITE.defaultOgHeight }],
        },
        twitter: {
            card: SITE.twitter.cardType,
            site: SITE.twitter.handle,
            title,
            description,
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

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function OrganizationProfilePage({ params, searchParams }: Props) {
    const { slug } = await params

    let org: Awaited<ReturnType<typeof getOrganizationBySlug>> = null
    try {
        org = await getOrganizationBySlug(slug)
    } catch {
        notFound()
    }

    if (!org || !org.is_active) notFound()

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT
    const filters = { organization_id: org.id }

    const [posts, totalCount] = await Promise.all([
        getPosts(filters, page).catch((): PostCard[] => []),
        getPostsCount(filters).catch(() => 0),
    ])

    const totalPages = Math.max(1, Math.ceil(totalCount / limit))

    /* ── JSON-LD ─────────────────────────────────────────────── */

    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Organizations', url: `${SITE.url}/organizations` },
        { name: org.short_name ?? org.name, url: `${SITE.url}/organizations/${slug}` },
    ])

    const orgJsonLd = org.schema_json ?? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: org.name,
        url: org.official_url ?? `${SITE.url}/organizations/${slug}`,
        ...(org.logo_url && { logo: org.logo_url }),
        ...(org.description && { description: org.description }),
    }

    /* CollectionPage JSON-LD */
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${org.short_name ?? org.name} Jobs, Results & Updates`,
        description: `Latest government jobs, exam results, and notifications from ${org.name}.`,
        url: `${SITE.url}/organizations/${slug}`,
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
    const basePath = `/organizations/${slug}`
    const prevUrl = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
    const nextUrl = page < totalPages ? `${basePath}?page=${page + 1}` : null

    return (
        <div className="flex flex-col min-h-screen">
            {/* Pagination link relations for crawlers */}
            {prevUrl && <link rel="prev" href={`${SITE.url}${prevUrl}`} />}
            {nextUrl && <link rel="next" href={`${SITE.url}${nextUrl}`} />}

            <JsonLd data={[breadcrumbJsonLd, orgJsonLd, collectionJsonLd]} />

            {/* Institutional Hub Hero */}
            <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950/20 border-b border-border">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} 
                />
                
                <div className="container mx-auto max-w-7xl px-4 py-16 relative z-10">
                    <Breadcrumb
                        items={[
                            { label: 'Organizations', href: '/organizations' },
                            { label: org.short_name ?? org.name },
                        ]}
                        className="mb-8"
                    />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                                {/* Branded Logo Container */}
                                {org.logo_url ? (
                                    <div className="size-24 shrink-0 rounded-3xl bg-white p-3 shadow-2xl shadow-slate-200 dark:shadow-none border border-border flex items-center justify-center group hover:scale-105 transition-transform duration-500">
                                        <img
                                            src={org.logo_url}
                                            alt={`${org.name} logo`}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="size-24 shrink-0 rounded-3xl bg-linear-to-br from-brand-600 to-brand-400 p-3 shadow-2xl shadow-brand-500/20 flex items-center justify-center text-3xl font-black text-white">
                                        {(org.short_name || org.name).substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-accent-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-600 dark:text-accent-400">Official Recruitment Hub</span>
                                    </div>
                                    <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-5xl leading-tight">
                                        <span className="text-gradient-brand">{org.name}</span>
                                    </h1>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                                {org.official_url && (
                                    <a
                                        href={org.official_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-border text-sm font-bold text-foreground-muted hover:text-brand-600 hover:border-brand-500/50 shadow-sm transition-all"
                                    >
                                        <Globe className="size-4" />
                                        Portal
                                        <ExternalLink className="size-3" />
                                    </a>
                                )}
                                {org.state_slug && (
                                    <Link
                                        href={`/states/${org.state_slug}`}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-border text-sm font-bold text-foreground-muted hover:text-brand-600 transition-all"
                                    >
                                        <MapPin className="size-4" />
                                        {org.state_slug.replace(/-/g, ' ').toUpperCase()}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Hub Authority Sidebar Block */}
                        <div className="lg:w-80 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-border shadow-xl shadow-slate-200/50 dark:shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground-subtle mb-6 pb-4 border-b border-border">Hub Intelligence</h3>
                            <div className="space-y-5">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase text-foreground-subtle">Active Updates</span>
                                    <span className="text-2xl font-black text-foreground">{(totalCount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase text-foreground-subtle">Jurisdiction</span>
                                    <span className="text-xs font-bold text-foreground">{org.state_slug ? 'Regional' : 'National'} Govt</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase text-foreground-subtle">Status</span>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-500/10 border border-accent-500/20">
                                        <div className="size-1.5 rounded-full bg-accent-500" />
                                        <span className="text-[10px] font-black text-accent-600 dark:text-accent-400">VERIFIED</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {org.description && (
                        <div className="mt-12 p-6 rounded-2xl bg-brand-500/3 border border-brand-500/10">
                            <p className="text-base text-foreground-muted leading-relaxed font-medium">
                                {org.description}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content & Sidebar Grid */}
            <div className="container mx-auto max-w-7xl px-4 py-16">
                <div className="grid lg:grid-cols-[1fr_320px] gap-12">
                    {/* Updates Area */}
                    <div>
                        <AdZone zoneSlug="below_header" className="mb-10" />

                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-600/30">
                                    <FileText className="size-5" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-foreground">
                                    Latest Institutional Updates
                                </h2>
                            </div>
                            <div className="h-px flex-1 bg-linear-to-r from-border to-transparent mx-8 hidden sm:block" />
                        </div>

                        {posts.length > 0 ? (
                            <>
                                <PostGrid posts={posts} priority={3} />

                                {/* Modern Pagination */}
                                {totalPages > 1 && (
                                    <nav className="mt-16 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
                                        {page > 1 ? (
                                            <Link
                                                href={`/organizations/${slug}?page=${page - 1}`}
                                                className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-white dark:bg-slate-900 text-foreground transition-all hover:border-brand-500 hover:text-brand-600 hover:-translate-x-1"
                                                aria-label="Previous page"
                                            >
                                                <ChevronLeft className="size-5" />
                                            </Link>
                                        ) : (
                                            <span className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-slate-50 dark:bg-slate-900 text-foreground-subtle opacity-50 cursor-not-allowed">
                                                <ChevronLeft className="size-5" />
                                            </span>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {getPageNumbers(page, totalPages).map((p, i) =>
                                                p === '...' ? (
                                                    <span key={`ellipsis-${i}`} className="px-3 text-sm text-foreground-subtle font-black tracking-widest">...</span>
                                                ) : (
                                                    <Link
                                                        key={p}
                                                        href={`/organizations/${slug}?page=${p}`}
                                                        className={`inline-flex size-11 items-center justify-center rounded-xl border text-sm font-black transition-all ${
                                                            p === page 
                                                            ? 'border-brand-600 bg-brand-600 text-white shadow-xl shadow-brand-600/30 ring-4 ring-brand-500/10' 
                                                            : 'border-border bg-white dark:bg-slate-900 text-foreground hover:border-brand-500/50 hover:text-brand-600 hover:shadow-lg'
                                                        }`}
                                                    >
                                                        {p}
                                                    </Link>
                                                )
                                            )}
                                        </div>

                                        {page < totalPages ? (
                                            <Link
                                                href={`/organizations/${slug}?page=${page + 1}`}
                                                className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-white dark:bg-slate-900 text-foreground transition-all hover:border-brand-500 hover:text-brand-600 hover:translate-x-1"
                                                aria-label="Next page"
                                            >
                                                <ChevronRight className="size-5" />
                                            </Link>
                                        ) : (
                                            <span className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-slate-50 dark:bg-slate-900 text-foreground-subtle opacity-50 cursor-not-allowed">
                                                <ChevronRight className="size-5" />
                                            </span>
                                        )}
                                    </nav>
                                )}
                            </>
                        ) : (
                            <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50/50 p-12 text-center dark:bg-slate-900/10">
                                <div className="mb-6 rounded-full bg-white dark:bg-slate-900 p-6 shadow-xl">
                                    <Building2 className="size-10 text-brand-600" />
                                </div>
                                <h3 className="text-xl font-black text-foreground mb-2">Hub Under Assembly</h3>
                                <p className="max-w-md mx-auto text-base text-foreground-muted">
                                    The recruitment engine for {org.short_name || org.name} is being prepared. Check back shortly for verified updates.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Lateral Sidebar */}
                    <aside className="space-y-10">
                        {/* Hub Verified Shield */}
                        <div className="p-8 rounded-3xl bg-linear-to-br from-brand-600 to-brand-400 text-white shadow-2xl shadow-brand-500/30">
                            <ShieldCheck className="size-10 mb-6" />
                            <h3 className="text-2xl font-black tracking-tight mb-4">Institutional Verification</h3>
                            <p className="text-sm text-brand-50 leading-relaxed mb-6 font-medium">
                                Every data point in this hub is cross-referenced with official board gazettes for 100% precision.
                            </p>
                            <Link 
                                href="/verify" 
                                className="inline-flex items-center justify-center w-full py-4 rounded-2xl bg-white text-brand-600 font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform"
                            >
                                Security Policy
                            </Link>
                        </div>

                        <AdZone zoneSlug="sidebar" />
                    </aside>
                </div>
            </div>

            {/* Bottom Institutional Authority Section */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border-t border-border py-24 mt-12">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-[0.2em] border border-brand-500/20">
                                Institutional Integrity
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter text-foreground sm:text-6xl leading-[0.9]">
                                Verified <br />
                                <span className="text-gradient-brand">Source Only.</span>
                            </h2>
                            <p className="text-xl text-foreground-muted leading-relaxed font-medium">
                                We bypass independent aggregators, sourcing data directly from {org.short_name || 'authorized'} recruitment servers to protect your career from misinformation.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 lg:w-1/2">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: 'Sourcing Shield',
                                    desc: 'Encrypted verification of every digital signature on official PDF notifications.',
                                    color: 'text-emerald-500',
                                    bg: 'bg-emerald-500/10'
                                },
                                {
                                    icon: History,
                                    title: 'Legacy Archives',
                                    desc: 'Access past recruitment cycles and official answer keys from previous years.',
                                    color: 'text-brand-500',
                                    bg: 'bg-brand-500/10'
                                },
                                {
                                    icon: Bell,
                                    title: 'Real-time Sync',
                                    desc: 'Our servers sync with official board portals every 15 minutes for zero-latency updates.',
                                    color: 'text-blue-500',
                                    bg: 'bg-blue-500/10'
                                },
                                {
                                    icon: ExternalLink,
                                    title: 'Institutional Link',
                                    desc: 'Verified, malware-free links direct to official application and result portals.',
                                    color: 'text-purple-500',
                                    bg: 'bg-purple-500/10'
                                }
                            ].map((feature, i) => (
                                <div 
                                    key={i} 
                                    className="p-8 rounded-3xl bg-white dark:bg-slate-950 border border-border shadow-sm group hover:border-brand-500/50 transition-all hover:shadow-2xl hover:shadow-brand-500/5"
                                >
                                    <div className={`size-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 pt-0.5 shadow-sm group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="size-6" />
                                    </div>
                                    <h3 className="text-xl font-black text-foreground mb-3">{feature.title}</h3>
                                    <p className="text-sm text-foreground-muted leading-relaxed font-semibold">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

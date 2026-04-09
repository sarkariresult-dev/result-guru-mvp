import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { HomeSection } from '@/features/posts/components/HomeSection'
import { HomeSectionSkeleton } from '@/features/posts/components/HomeSectionSkeleton'
import { HeroSearchBar } from '@/features/shared/components/HeroSearchBar'
import { AdZone } from '@/components/ads/AdZone'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'
const StoriesSection = dynamic(() => import('@/components/stories/StoriesSection').then(mod => mod.StoriesSection), {
    ssr: true,
})
import { ROUTE_PREFIXES, SOCIAL_MEDIA_LINKS } from '@/config/site'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebSiteSchema, buildOrganizationSchema, buildSiteNavigationSchema, buildItemListSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { getStates } from '@/lib/queries/states'
import { getPopularOrganizations } from '@/lib/queries/organizations'
import { getPostCountsByType } from '@/features/stats/queries'
import { getHomepageSections } from '@/features/stats/queries'
import type { PostTypeCounts } from '@/features/stats/queries'
import { Briefcase, CreditCard, ArrowRight, Trophy, Users, MapPin, BookOpen, Bell, GraduationCap, Star, ShieldCheck, Clock, Send, MessageCircle, Facebook, Instagram, Linkedin, Youtube, Twitter, TrainFront, ScrollText, Landmark, Stethoscope, Cpu, Scale, TicketPercent, Target, Zap, Search, BellRing, FileText, ArrowUpRight, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'


/* SEO Metadata */

export const metadata = buildPageMetadata({
    title: 'Result Guru - Latest Sarkari Result 2026 | Govt Job Notifications',
    description: 'India\'s leading Sarkari Result portal. Get official notifications for Govt Jobs, Admit Cards & Results. Verified daily updates for candidates.',
    path: '/',
})

/* ── Stat card configuration ─────────────────────────────────────── */

interface StatCardConfig {
    type: string
    label: string
    icon: LucideIcon
    color: string
    bg: string
}

const STAT_CARDS: StatCardConfig[] = [
    { type: 'job', label: 'Active Job', icon: Briefcase, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { type: 'result', label: 'Result', icon: Trophy, color: 'text-amber-800 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { type: 'admit', label: 'Admit Card', icon: CreditCard, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { type: 'admission', label: 'Admission', icon: GraduationCap, color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40' },
]

/** Build a human-friendly subtitle from open count */
function formatChange(counts: PostTypeCounts | undefined): string {
    if (!counts) return '--'
    const open = counts.open_count ?? 0
    if (open > 0) return `${open.toLocaleString('en-IN')} Open`
    return `${counts.total_count.toLocaleString('en-IN')} Total`
}

/* ── Custom SVG Icons for Mission Section ─────────────────────────────── */

function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

function ThreadsIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 192 192" className={className} fill="currentColor" aria-hidden="true">
            <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
        </svg>
    )
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
    Facebook,
    Twitter: XIcon,
    Instagram,
    Threads: ThreadsIcon,
    LinkedIn: Linkedin,
    Youtube: Youtube,
}

export default async function HomePage() {
    /* JSON-LD: WebSite + SearchAction (for Google sitelinks search box) + Organization (for Knowledge Panel) */
    const websiteJsonLd = buildWebSiteSchema()
    const organizationJsonLd = buildOrganizationSchema()
    const navigationJsonLd = buildSiteNavigationSchema()

    /* Fetch all homepage data in parallel for fastest TTFB */
    const [statesResult, orgsResult, countsResult, sectionsResult] = await Promise.allSettled([
        getStates(),
        getPopularOrganizations(8),
        getPostCountsByType(),
        getHomepageSections(6),
    ])

    const states = statesResult.status === 'fulfilled' ? statesResult.value.map((s) => ({ slug: s.slug, name: s.name, abbr: s.abbr })) : []
    const organizations = orgsResult.status === 'fulfilled' ? orgsResult.value : []
    const postCounts = countsResult.status === 'fulfilled' ? countsResult.value : []
    const countsMap = new Map(postCounts.map((c) => [c.type, c]))

    /* Pre-fetched homepage sections from fn_homepage_sections() - 1 DB call for all 6 sections */
    const sections = sectionsResult.status === 'fulfilled' ? sectionsResult.value : {}
    const statesItemList = buildItemListSchema('Indian States Government Directory', states.map(s => ({ name: s.name, url: `/states/${s.slug}` })))
    const orgsItemList = buildItemListSchema('Government Organizations', organizations.map(o => ({ name: o.short_name || o.name, url: `/organizations/${o.slug}` })))

    return (
        <>
            <JsonLd data={[websiteJsonLd, organizationJsonLd, navigationJsonLd, statesItemList, orgsItemList]} />

            {/*  Hero */}
            <section className="relative bg-hero">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.12),transparent)] pointer-events-none" />

                <div className="container relative mx-auto max-w-7xl px-4 pt-16 pb-12 text-center lg:pt-20 lg:pb-16">
                    <h1 className="text-fluid-3xl sm:text-fluid-4xl lg:text-fluid-5xl font-extrabold tracking-tight text-white">
                        Find Your Dream{' '}
                        <span className="text-amber-400">
                            Sarkari Job
                        </span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base text-blue-100/90 sm:text-lg">
                        Direct access to latest government notifications, results, and welfare schemes across India.
                    </p>

                    {/* Search Bar */}
                    <div className="relative z-20 mx-auto mt-8 max-w-3xl">
                        <HeroSearchBar states={states} />
                    </div>

                    <div className="mx-auto mt-6 flex max-w-xl flex-wrap items-center justify-center gap-4 text-sm">
                        <span className="text-blue-200/80 font-medium">Trending:</span>
                        {['SSC CGL', 'UPSC CSE', 'Railway NTPC'].map((topic) => (
                            <Link
                                key={topic}
                                href={`/search?q=${encodeURIComponent(topic)}`}
                                className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-xs transition-colors hover:bg-white/20"
                            >
                                {topic}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Cards */}
            <section className="container mx-auto max-w-6xl px-4 -mt-10 relative z-10 mb-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {STAT_CARDS.map((card) => {
                        const counts = countsMap.get(card.type)
                        const href = ROUTE_PREFIXES[card.type as keyof typeof ROUTE_PREFIXES] || '#'

                        const value = counts ? counts.total_count.toLocaleString('en-IN') : '0'
                        const changeLabel = formatChange(counts)

                        return (
                            <Link
                                key={card.type}
                                href={href}
                                className="group flex flex-col rounded-2xl border border-border bg-surface p-4 shadow-lg sm:p-5 transition-all hover:border-brand-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
                                        {card.label}
                                    </span>
                                    <div className={`flex size-8 items-center justify-center rounded-lg ${card.bg} sm:size-9 transition-colors group-hover:bg-brand-500 group-hover:text-white`}>
                                        <card.icon className={`size-4 ${card.color} sm:size-4.5 group-hover:text-white transition-colors`} />
                                    </div>
                                </div>
                                <span className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl group-hover:text-brand-600 transition-colors">
                                    {value}
                                </span>
                                <div className="mt-0.5 flex items-center justify-between">
                                    <span className="text-[11px] font-medium text-accent-700 dark:text-accent-400 sm:text-xs">
                                        {changeLabel}
                                    </span>
                                    <ArrowRight className="size-3 text-brand-500 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* Popular Organizations */}
            {organizations.length > 0 && (
                <section className="container mx-auto max-w-7xl px-4 py-10">
                    <h2 className="sr-only">Browse by Organization</h2>
                    <div className="relative group/scroll">
                        <div className="flex overflow-x-auto flex-nowrap gap-3 pb-6 pt-2 scrollbar-hide snap-x snap-proximity scroll-smooth px-1">
                            {organizations.map((org) => (
                                <Link
                                    key={org.id}
                                    href={`/organizations/${org.slug}`}
                                    className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-center transition-all hover:border-brand-300 hover:shadow-lg dark:hover:border-brand-700 hover:-translate-y-1 snap-start shrink-0 w-[140px] sm:w-[160px]"
                                >
                                    {org.logo_url ? (
                                        <div className="relative flex size-14 sm:size-16 items-center justify-center rounded-xl bg-white p-2 shadow-xs group-hover:shadow-md transition-shadow">
                                            <Image
                                                src={org.logo_url}
                                                alt={org.name}
                                                width={64}
                                                height={64}
                                                sizes="64px"
                                                className="size-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-xl bg-brand-600 dark:bg-brand-700 text-lg font-bold text-white shadow-sm transition-transform group-hover:scale-105">
                                            {(org.short_name || org.name).substring(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0 w-full space-y-0.5">
                                        <h3 className="text-[12px] font-bold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1 leading-snug">
                                            {org.short_name || org.name}
                                        </h3>
                                        {org.short_name && (
                                            <p className="text-xs text-foreground-muted line-clamp-1 leading-tight font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                                {org.name}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {/* Gradient Fades for Scroll Indication */}
                        <div className="absolute inset-y-0 left-0 w-8 bg-linear-to-r from-background to-transparent pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity hidden sm:block" />
                        <div className="absolute inset-y-0 right-0 w-8 bg-linear-to-l from-background to-transparent pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity hidden sm:block" />
                    </div>
                </section>
            )}

            <AdZone zoneSlug="below_header" className="container mx-auto max-w-7xl px-4" />

            {/* Content Sections - Left/Right Split Layout */}
            <section className="container mx-auto max-w-7xl px-4 py-10">
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 xl:gap-12">

                    {/* LEFT COLUMN: 10 Post Types (2x5 Grid using the List layout) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="job" heading="Latest Sarkari Job" route={ROUTE_PREFIXES.job} cta="View All" limit={5} layout="list" themeColorClass="bg-amber-500" posts={sections.job} priority={2} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="result" heading="Latest Result" route={ROUTE_PREFIXES.result} cta="View All" limit={5} layout="list" themeColorClass="bg-orange-500" posts={sections.result} priority={2} />
                            </Suspense>

                            <Suspense fallback={<HomeSectionSkeleton count={3} />}>
                                <HomeSection typeKey="admit" heading="Admit Card" route={ROUTE_PREFIXES.admit} cta="View All" limit={3} layout="list" themeColorClass="bg-green-600" posts={sections.admit} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={3} />}>
                                <HomeSection typeKey="answer_key" heading="Answer Key" route={ROUTE_PREFIXES.answer_key} cta="View All" limit={3} layout="list" themeColorClass="bg-blue-500" posts={sections.answer_key} />
                            </Suspense>

                            <Suspense fallback={<HomeSectionSkeleton count={3} />}>
                                <HomeSection typeKey="syllabus" heading="Syllabus" route={ROUTE_PREFIXES.syllabus} cta="View All" limit={3} layout="list" themeColorClass="bg-emerald-500" posts={sections.syllabus} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={3} />}>
                                <HomeSection typeKey="exam_pattern" heading="Exam Pattern" route={ROUTE_PREFIXES.exam_pattern} cta="View All" limit={3} layout="list" themeColorClass="bg-cyan-500" posts={sections.exam_pattern} />
                            </Suspense>

                            <Suspense fallback={<HomeSectionSkeleton count={3} />}>
                                <HomeSection typeKey="previous_paper" heading="Previous Paper" route={ROUTE_PREFIXES.previous_paper} cta="View All" limit={3} layout="list" themeColorClass="bg-indigo-500" posts={sections.previous_paper} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={3} />}>
                                <HomeSection typeKey="cut_off" heading="Cut Off Marks" route={ROUTE_PREFIXES.cut_off} cta="View All" limit={3} layout="list" themeColorClass="bg-rose-500" posts={sections.cut_off} />
                            </Suspense>

                            <Suspense fallback={<HomeSectionSkeleton count={3} />}>
                                <HomeSection typeKey="exam" heading="Upcoming Exam" route={ROUTE_PREFIXES.exam} cta="View All" limit={3} layout="list" themeColorClass="bg-violet-500" posts={sections.exam} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={3} />}>
                                <HomeSection typeKey="admission" heading="Admission" route={ROUTE_PREFIXES.admission} cta="View All" limit={3} layout="list" themeColorClass="bg-fuchsia-500" posts={sections.admission} />
                            </Suspense>

                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar for Trending & Schemes */}
                    <div className="lg:col-span-1">
                        <aside className="sticky top-24 flex flex-col gap-8">
                            {/* Notifications List (formerly Trending Now) */}
                            <Suspense fallback={<HomeSectionSkeleton count={8} />}>
                                <HomeSection
                                    typeKey="notification"
                                    heading="Notification"
                                    route={ROUTE_PREFIXES.notification}
                                    cta="All Updates"
                                    limit={6}
                                    layout="numbered"
                                    themeColorClass="bg-brand-500"
                                    posts={sections.notification}
                                />
                            </Suspense>

                            {/* Social Community Hub */}
                            <div className="group relative rounded-[2.5rem] border border-border bg-surface p-8 shadow-sm overflow-hidden">
                                {/* Background Decorative Icon */}
                                <div className="absolute top-0 right-0 p-6 transform translate-x-4 -translate-y-4 opacity-5 pointer-events-none transition-all duration-700 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:rotate-0 -rotate-12">
                                    <BellRing className="size-32 text-brand-600" />
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-xl font-black text-foreground">Join Community</h3>
                                    <p className="mt-2 text-sm font-medium text-foreground-muted leading-relaxed">Get lightning-fast alerts on your favorite platforms.</p>
                                    <div className="mt-8 space-y-3">
                                        <Link
                                            href="https://t.me/resultguru247"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link flex items-center justify-between w-full p-4 rounded-2xl bg-[#0088cc] text-white transition-all hover:bg-[#0077b5] shadow-lg shadow-[#0088cc]/10 active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Send className="size-5" />
                                                <span className="font-bold text-sm">Telegram Channel</span>
                                            </div>
                                            <ArrowUpRight className="size-4 opacity-50 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
                                        </Link>
                                        <Link
                                            href="https://whatsapp.com/channel/0029Vb7XUqn1SWt7c9kqCV3I"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link flex items-center justify-between w-full p-4 rounded-2xl bg-[#25D366] text-white transition-all hover:bg-[#20bd5a] shadow-lg shadow-[#25D366]/10 active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <MessageCircle className="size-5" />
                                                <span className="font-bold text-sm">WhatsApp Channel</span>
                                            </div>
                                            <ArrowUpRight className="size-4 opacity-50 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Govt Schemes List */}
                            <Suspense fallback={<HomeSectionSkeleton count={8} />}>
                                <HomeSection
                                    typeKey="scheme"
                                    heading="Govt Scheme"
                                    route={ROUTE_PREFIXES.scheme}
                                    cta="View All"
                                    limit={5}
                                    layout="list"
                                    themeColorClass="bg-pink-500"
                                    posts={sections.scheme}
                                />
                            </Suspense>

                            {/* App Coming Soon Spotlight */}
                            <div className="group relative rounded-4xl bg-linear-to-br from-brand-600 to-indigo-700 p-8 text-white shadow-xl overflow-hidden active:scale-[0.98] transition-all">
                                {/* Decorative Background */}
                                <div className="absolute top-0 right-0 p-4 transform translate-x-4 -translate-y-4 opacity-10 pointer-events-none transition-transform group-hover:translate-x-0 group-hover:translate-y-0">
                                    <Smartphone className="size-40 rotate-15" />
                                </div>
                                <div className="absolute -bottom-10 -left-10 size-40 bg-white/10 blur-3xl rounded-full" />

                                <div className="relative z-10 space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/20 text-[10px] font-black uppercase tracking-widest">
                                        <Zap className="size-3 fill-current" />
                                        Next-Gen Experience
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black leading-tight tracking-tight">Result Guru</h3>
                                        <p className="text-xl font-bold opacity-90 leading-tight">Mobile Experience</p>
                                    </div>
                                    <p className="text-sm font-medium text-white/80 leading-relaxed max-w-[200px]">
                                        Verified job alerts and direct results delivered to your lockscreen. No noise, just speed.
                                    </p>
                                    <div className="pt-2">
                                        <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white text-brand-600 font-black text-xs uppercase tracking-wider shadow-lg shadow-black/10 transition-transform group-hover:scale-105">
                                            Coming Soon
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scholarship List */}
                            <Suspense fallback={<HomeSectionSkeleton count={8} />}>
                                <HomeSection
                                    typeKey="scholarship"
                                    heading="Scholarship"
                                    route={ROUTE_PREFIXES.scholarship}
                                    cta="View All"
                                    limit={5}
                                    layout="list"
                                    themeColorClass="bg-amber-500"
                                    posts={sections.scholarship}
                                />
                            </Suspense>

                        </aside>
                    </div>

                </div>
            </section>

            {/* Unified Mission & Verified Information Section (High EEAT + SEO) */}
            <section className="border-t border-b border-border bg-linear-to-b from-surface to-surface-subtle" aria-label="About Result Guru">
                <div className="container mx-auto max-w-7xl px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Left: Mission Statement & SEO Context */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800/30 text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                                <ShieldCheck className="size-3" />
                                India&apos;s Trusted Resource
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.1]">
                                Empowering Candidates with <span className="text-brand-600 dark:text-brand-400">Verified Jobs.</span>
                            </h2>
                            <div className="space-y-4 text-sm sm:text-base text-foreground-muted leading-relaxed font-medium">
                                <p>
                                    Welcome to Result Guru, India's most trusted and reliable digital platform dedicated to bringing you the fastest, most verified updates regarding government employment opportunities. Whether you are actively preparing for your first competitive examination or you are a seasoned aspirant tracking multiple recruitment phases, our platform simplifies the often-complex ecosystem of state and central commission portals into one easily navigable dashboard.
                                </p>
                                <p>
                                    We manually verify and aggregate data from official gazettes and top commissions such as the Union Public Service Commission, Staff Selection Commission (SSC), Railway Recruitment Boards (RRB), and various State Public Service Commissions. By eliminating clutter and providing high-fidelity information, candidates save valuable time which they can instead channel directly into their preparation strategies.
                                </p>
                                <p>
                                    Our core mission is structured entirely around candidate success. From Syllabus breakdowns to Exam Patterns and Previous Papers, we provide all the tools for your preparation. We also actively categorize government welfare schemes, digital scholarship opportunities, and key university admissions to ensure comprehensive coverage of pathways that elevate an individual's career.
                                </p>
                            </div>
                        </div>

                        {/* Right: Key Value Props (Grid) + Social Links */}
                        <div className="lg:col-span-5 flex flex-col justify-between gap-8 lg:mt-12">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { icon: Clock, title: 'Fastest Notification', desc: 'Real-time alerts for Latest Sarkari Results and upcoming Govt Jobs in India.' },
                                    { icon: ShieldCheck, title: '100% Verified Info', desc: 'Every update is cross-verified from official gazettes and govt portals.' },
                                    { icon: BookOpen, title: 'Complete Resources', desc: 'Syllabus, Exam Patterns, and Previous Papers all in one place.' },
                                    { icon: Star, title: 'Welfare Schemes', desc: 'Stay updated with state and central government schemes and scholarships.' }
                                ].map((prop) => (
                                    <div key={prop.title} className="flex gap-4 p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-brand-300 transition-all hover:shadow-md">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                                            <prop.icon className="size-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-foreground">{prop.title}</h3>
                                            <p className="text-xs text-foreground-muted leading-relaxed">{prop.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Social Sharing centered at bottom of right panel */}
                            <div className="flex flex-col items-center gap-5 pt-8">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground-muted opacity-60">Share Platform With Friends</span>
                                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-7">
                                    {[
                                        {
                                            name: 'WhatsApp',
                                            icon: MessageCircle,
                                            href: `https://api.whatsapp.com/send?text=${encodeURIComponent("Check out Result Guru 🚀 - India's Most Trusted Sarkari Result & Govt Job Platform! Get instant, verified updates: https://resultguru.org")}`,
                                            color: 'hover:text-emerald-500'
                                        },
                                        {
                                            name: 'Telegram',
                                            icon: Send,
                                            href: `https://t.me/share/url?url=${encodeURIComponent("https://resultguru.org")}&text=${encodeURIComponent("Result Guru 🚀 India's #1 Trusted Sarkari Result & Job Alert Platform. Get verified updates from all commissions.")}`,
                                            color: 'hover:text-sky-500'
                                        },
                                        {
                                            name: 'X',
                                            icon: XIcon,
                                            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent("https://resultguru.org")}&text=${encodeURIComponent("Finding verified Govt Jobs is now easier with Result Guru! 🚀 #SarkariResult #JobAlerts #ResultGuru")}`,
                                            color: 'hover:text-foreground'
                                        },
                                        {
                                            name: 'Facebook',
                                            icon: Facebook,
                                            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://resultguru.org")}`,
                                            color: 'hover:text-[#1877F2]'
                                        },
                                        {
                                            name: 'Instagram',
                                            icon: Instagram,
                                            href: `https://www.instagram.com/resultguru247`,
                                            color: 'hover:text-[#E4405F]'
                                        },
                                        {
                                            name: 'Threads',
                                            icon: ThreadsIcon,
                                            href: `https://www.threads.net/intent/post?text=${encodeURIComponent("Check out Result Guru 🚀 India's Most Trusted Sarkari Result & Job Platform! https://resultguru.org")}`,
                                            color: 'hover:text-foreground'
                                        },
                                        {
                                            name: 'LinkedIn',
                                            icon: Linkedin,
                                            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://resultguru.org")}`,
                                            color: 'hover:text-[#0A66C2]'
                                        }
                                    ].map((platform) => (
                                        <Link
                                            key={platform.name}
                                            href={platform.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`text-foreground-muted ${platform.color} transition-all hover:scale-125`}
                                            aria-label={`Share on ${platform.name}`}
                                        >
                                            <platform.icon className="size-6" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Premium Categories Section - Compact 3x3 Grid */}
            <section className="container mx-auto max-w-7xl px-4 py-12 relative" aria-label="Expert-curated career pathways">
                <div className="mb-10 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800/30 text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
                        <Users className="size-3" />
                        Career Pathway Directory
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Sarkari <span className="text-brand-600 dark:text-brand-400">Resource</span> Center</h2>
                    <p className="mt-3 text-sm text-foreground-muted font-medium max-w-2xl">
                        Your central hub for navigating India&apos;s complex recruitment landscape. We categorize updates from official portals into verified career pathways to help you stay ahead.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { title: 'SSC & Railway', icon: TrainFront, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', desc: "Dominant cycle covering SSC CGL, CHSL, MTS, and all major Railway recruitment phases." },
                        { title: 'UPSC & Civil Services', icon: ScrollText, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', desc: "Premier updates for UPSC CSE, IES, and localized State PSC exams like BPSC and UPPSC." },
                        { title: 'Banking & Insurance', icon: Landmark, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', desc: "Verified result cycles for SBI PO, IBPS Clerk, NABARD, and national insurance carriers." },
                        { title: 'Defence & Police', icon: ShieldCheck, color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20', desc: "Verified schedules for NDA, CDS, CAPF, and state-level police constable recruitments." },
                        { title: 'Teaching & Research', icon: GraduationCap, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20', desc: "Comprehensive coverage of CTET, KVS, NVS, and state-specific educational eligibility tests." },
                        { title: 'Medical & Healthcare', icon: Stethoscope, color: 'text-red-500 bg-red-50 dark:bg-red-900/20', desc: "Latest on NEET career pathways, AIIMS recruitment, and nursing/pharmacist vacancies." },
                        { title: 'Engineering & Tech', icon: Cpu, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20', desc: "For technical aspirants. GATE scores, IES notifications, and specific PSU job alerts." },
                        { title: 'Law & Judicial', icon: Scale, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20', desc: "Reliable updates for CLAT, State Judicial Services (PCS-J), and legal officer vacancies." },
                        { title: 'Schemes & Scholarship', icon: TicketPercent, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', desc: "Access to government aid including PM-Kisan, NSP, and merit-based state schemes." },
                    ].map((item) => (
                        <div key={item.title} className="group relative rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:shadow-md hover:border-brand-300">
                            <div className="flex items-center gap-4 mb-3">
                                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.color} transition-transform group-hover:scale-105`}>
                                    <item.icon className="size-5" />
                                </div>
                                <h3 className="text-[15px] font-bold text-foreground leading-tight">{item.title}</h3>
                            </div>
                            <p className="text-[13px] text-foreground-muted leading-relaxed font-medium">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Web Stories Horizontal Feed */}
            <StoriesSection />


            {/* Browse by State */}
            <section
                className="container mx-auto max-w-7xl px-4 py-10 lg:py-14"
                aria-label="Browse government by Indian state"
            >

                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* Left - Text + State pills */}
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                            Browse by{' '}
                            <span className="text-brand-600 dark:text-brand-400">State</span>
                        </h2>
                        <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground-muted sm:text-lg">
                            Find specific government opportunities within your home state
                            or preferred region across India.
                        </p>

                        {states.length > 0 && (
                            <nav
                                className="mt-8 flex flex-wrap gap-2.5"
                                aria-label="States directory"
                            >
                                {states.slice(0, 15).map((state) => (
                                    <Link
                                        key={state.slug}
                                        href={`/states/${state.slug}`}
                                        className="group inline-flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground shadow-sm transition-all hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
                                        title={`Government jobs & results in ${state.name}`}
                                    >
                                        <span
                                            className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-[10px] font-black leading-none"
                                            aria-hidden="true"
                                        >
                                            {state.abbr || state.name.substring(0, 2).toUpperCase()}
                                        </span>
                                        <span
                                            className="transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400"
                                        >
                                            {state.name}
                                        </span>
                                    </Link>
                                ))}
                            </nav>
                        )}
                    </div>

                    {/* Right - India map illustration */}
                    <div className="relative hidden lg:flex lg:items-center lg:justify-center">
                        {/* Soft glow behind map */}
                        <div
                            className="absolute inset-0 m-auto size-[85%] rounded-full bg-brand-100/50 blur-3xl dark:bg-brand-900/20"
                            aria-hidden="true"
                        />
                        <Image
                            src="/images/india-map.svg"
                            alt="Map of India highlighting states with government job opportunities"
                            width={480}
                            height={560}
                            sizes="(max-width: 768px) 100vw, 480px"
                            className="relative z-10 h-auto w-full max-w-md drop-shadow-lg dark:opacity-90 dark:brightness-90 dark:invert"
                            aria-hidden="true"
                            priority
                            fetchPriority="high"
                        />

                        {/* Floating stat card */}
                        <div className="absolute bottom-6 right-4 z-20 flex items-center gap-4 rounded-4xl border border-border/60 bg-surface/90 px-6 py-4 shadow-2xl backdrop-blur-md sm:bottom-10 sm:right-8">
                            <div className="relative flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl">
                                <MapPin className="size-6" />
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-accent-500 border-2 border-white dark:border-indigo-950"></span>
                                </span>
                            </div>
                            <div className="pr-4">
                                <p className="text-[11px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">Live Status</p>
                                <p className="text-base font-black text-foreground">{states.length > 0 ? `${states.length} Active Regions` : 'Pan India'}</p>
                            </div>
                            <Link
                                href="/states"
                                className="flex size-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-110 active:scale-95"
                                aria-label="View all states"
                            >
                                <ArrowRight className="size-5" />
                                <span className="sr-only">View all states</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration CTA Section */}
            <InstitutionalCTA
                title="Your Personal Exam Assistant starts here."
                description="Create a free account to unlock your personalized dashboard, track saved jobs, and get instant verified notifications directly on your profile."
            />

            <AdZone zoneSlug="below_content" className="container mx-auto max-w-7xl px-4 my-8" />

        </>
    )
}

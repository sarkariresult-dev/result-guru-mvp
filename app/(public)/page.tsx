import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { HomeSection } from '@/features/posts/components/HomeSection'
import { HomeSectionSkeleton } from '@/features/posts/components/HomeSectionSkeleton'
import { HeroSearchBar } from '@/features/shared/components/HeroSearchBar'
import { AdZone } from '@/components/ads/AdZone'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'
import { LazyHomeSections } from '@/components/sections/LazyHomeSections'
import { StoriesSection } from '@/components/stories/StoriesSection'
import { ROUTE_PREFIXES } from '@/config/site'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebSiteSchema, buildOrganizationSchema, buildSiteNavigationSchema, buildItemListSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { getStates } from '@/lib/queries/states'
import { getPopularOrganizations } from '@/lib/queries/organizations'
import { getPostCountsByType } from '@/features/stats/queries'
import { getHomepageSections } from '@/features/stats/queries'
import type { PostTypeCounts } from '@/features/stats/queries'
import { Briefcase, CreditCard, ArrowRight, Trophy, GraduationCap, ShieldCheck, Clock, BookOpen, Star, MapPin, Users, Send, MessageCircle, Zap, ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'


/* SEO Metadata */

export const metadata = buildPageMetadata({
    title: 'Result Guru - Latest Sarkari Result | Govt Job Notifications',
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

/* ── Below-fold section configs (lazy-loaded) ─────────────────────── */

const BELOW_FOLD_SECTIONS = [
    { typeKey: 'syllabus', heading: 'Syllabus', route: ROUTE_PREFIXES.syllabus, cta: 'View All', limit: 3, themeColorClass: 'bg-emerald-500' },
    { typeKey: 'exam_pattern', heading: 'Exam Pattern', route: ROUTE_PREFIXES.exam_pattern, cta: 'View All', limit: 3, themeColorClass: 'bg-cyan-500' },
    { typeKey: 'previous_paper', heading: 'Previous Paper', route: ROUTE_PREFIXES.previous_paper, cta: 'View All', limit: 3, themeColorClass: 'bg-indigo-500' },
    { typeKey: 'cut_off', heading: 'Cut Off Marks', route: ROUTE_PREFIXES.cut_off, cta: 'View All', limit: 3, themeColorClass: 'bg-rose-500' },
    { typeKey: 'exam', heading: 'Upcoming Exam', route: ROUTE_PREFIXES.exam, cta: 'View All', limit: 3, themeColorClass: 'bg-violet-500' },
    { typeKey: 'admission', heading: 'Admission', route: ROUTE_PREFIXES.admission, cta: 'View All', limit: 3, themeColorClass: 'bg-fuchsia-500' },
] as const

/* ── Resource Center items (compact) ──────────────────────────────── */

const RESOURCE_LINKS = [
    { title: 'SSC & Railway', href: '/search?q=SSC+Railway', desc: 'CGL, CHSL, MTS, NTPC recruitment updates' },
    { title: 'UPSC & Civil Services', href: '/search?q=UPSC', desc: 'CSE, IES, State PSC notifications' },
    { title: 'Banking & Insurance', href: '/search?q=Banking+Insurance', desc: 'SBI PO, IBPS Clerk, NABARD' },
    { title: 'Defence & Police', href: '/search?q=Defence+Police', desc: 'NDA, CDS, CAPF, State Police' },
    { title: 'Teaching & Research', href: '/search?q=Teaching', desc: 'CTET, KVS, NVS, UGC NET' },
    { title: 'Medical & Healthcare', href: '/search?q=Medical', desc: 'NEET, AIIMS, Nursing' },
]

/* ── FAQ data for SEO text-to-HTML ratio ──────────────────────────── */

const FAQ_ITEMS = [
    {
        q: 'What is Result Guru and how does it help candidates?',
        a: 'Result Guru is a centralized platform that aggregates and verifies government job notifications, exam results, admit cards, and answer keys from official sources across India. Instead of checking multiple commission websites, candidates get all updates in one place with direct links to apply.',
    },
    {
        q: 'How frequently are job notifications updated on Result Guru?',
        a: 'Our editorial team verifies and publishes new notifications daily. Critical updates like result declarations and admit card releases are published within hours of the official announcement from commissions such as SSC, UPSC, Railway Boards, and state PSCs.',
    },
    {
        q: 'Which government exams and commissions does Result Guru cover?',
        a: 'We cover all major central and state-level recruitment bodies including Staff Selection Commission (SSC), Union Public Service Commission (UPSC), Railway Recruitment Boards (RRB), Institute of Banking Personnel Selection (IBPS), and all State Public Service Commissions. We also cover teaching, medical, defence, and technical recruitment notifications.',
    },
    {
        q: 'Is Result Guru free to use for candidates?',
        a: 'Yes, Result Guru is completely free. All notifications, result links, admit card downloads, and previous year papers are accessible without any registration or payment. You can optionally create a free account to save bookmarks and get personalized alerts.',
    },
    {
        q: 'How can I get instant alerts for new government job vacancies?',
        a: 'Join our Telegram channel or WhatsApp community for real-time push notifications. You can also create a free account on Result Guru to set up personalized email alerts for specific exam categories, states, or organizations.',
    },
]

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

    /* Pre-fetched homepage sections from fn_homepage_sections() - 1 DB call for all sections */
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
                    </div>
                </section>
            )}

            <AdZone zoneSlug="below_header" className="container mx-auto max-w-7xl px-4" />

            {/* Content Sections - Left/Right Split Layout */}
            <section className="container mx-auto max-w-7xl px-4 py-10">
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 xl:gap-12">

                    {/* LEFT COLUMN: 6 Primary Post Types above-fold + lazy-loaded rest */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            {/* Above-fold: 4 primary sections */}
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

                            {/* Below-fold: 6 more sections, lazy-loaded on scroll */}
                            <LazyHomeSections>
                                <>
                                    {BELOW_FOLD_SECTIONS.map((s) => (
                                        <Suspense key={s.typeKey} fallback={<HomeSectionSkeleton count={s.limit} />}>
                                            <HomeSection
                                                typeKey={s.typeKey}
                                                heading={s.heading}
                                                route={s.route}
                                                cta={s.cta}
                                                limit={s.limit}
                                                layout="list"
                                                themeColorClass={s.themeColorClass}
                                                posts={sections[s.typeKey]}
                                            />
                                        </Suspense>
                                    ))}
                                </>
                            </LazyHomeSections>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar for Trending & Schemes */}
                    <div className="lg:col-span-1">
                        <aside className="sticky top-24 flex flex-col gap-8">
                            {/* Notifications List */}
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
                                            <ArrowUpRight className="size-4 opacity-50 group-hover/link:opacity-100 transition-opacity" />
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
                                            <ArrowUpRight className="size-4 opacity-50 group-hover/link:opacity-100 transition-opacity" />
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
                                Empowering Candidates with <span className="text-brand-600 dark:text-brand-400">Verified Information.</span>
                            </h2>
                            <div className="space-y-4 text-sm sm:text-base text-foreground-muted leading-relaxed font-medium">
                                <p>
                                    Welcome to Result Guru, India&apos;s most trusted digital platform dedicated to bringing you the fastest, most verified updates regarding government employment opportunities. Whether you are actively preparing for a competitive examination or tracking multiple recruitment phases, our platform simplifies the complex ecosystem of central and state commission portals into one easily navigable dashboard.
                                </p>
                                <p>
                                    We manually verify and aggregate data from official gazettes and top commissions such as the Union Public Service Commission, Staff Selection Commission (SSC), Railway Recruitment Boards (RRB), and various State Public Service Commissions. By eliminating clutter and providing high-fidelity information, candidates save valuable time which they can instead channel into their preparation strategies.
                                </p>
                                <p>
                                    Our core mission revolves around candidate success. From syllabus breakdowns to detailed pattern analysis and previous papers, we provide all the tools necessary for thorough preparation. We also actively categorize government welfare schemes, digital scholarship opportunities, and key university admissions to ensure comprehensive coverage of pathways that elevate careers.
                                </p>
                            </div>

                            {/* FIX 8: Author Expertise (E-E-A-T) */}
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-surface border border-border shadow-xs">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-sm">
                                    RG
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-foreground">Result Guru Editorial Team</h3>
                                    <p className="text-xs text-foreground-muted leading-relaxed">
                                        Our content is reviewed by government recruitment specialists with 5+ years of experience in notification verification. The editorial team cross-references every update with official gazette publications.
                                    </p>
                                    <Link href="/about" rel="author" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline mt-1">
                                        About Our Team <ArrowRight className="size-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Right: Key Value Props */}
                        <div className="lg:col-span-5 flex flex-col justify-between gap-8 lg:mt-12">
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { icon: Clock, title: 'Fastest Notification', desc: 'Real-time alerts for official results and upcoming recruitment drives across India.' },
                                    { icon: ShieldCheck, title: '100% Verified Info', desc: 'Every update is cross-verified from official gazettes and government portals.' },
                                    { icon: BookOpen, title: 'Complete Resources', desc: 'Syllabus guides, detailed patterns, and previous papers all in one place.' },
                                    { icon: Star, title: 'Welfare Schemes', desc: 'Stay updated with central and state welfare programs and scholarship opportunities.' }
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

                            {/* FIX 9: Trust Signals - visible on ALL screen sizes */}
                            <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-surface border border-border shadow-xs">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800/30">
                                    <ShieldCheck className="size-4 text-accent-600 dark:text-accent-400" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-accent-700 dark:text-accent-400">Verified & Accurate</span>
                                </div>
                                <p className="text-xs text-foreground-muted font-medium text-center">
                                    {postCounts.reduce((sum, c) => sum + c.total_count, 0).toLocaleString('en-IN')}+ notifications verified · Trusted since 2024
                                </p>
                                <Link href="/about" className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-bold uppercase tracking-widest">
                                    Content by Expert Editors
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Compact Resource Center — replaces 9-card grid */}
            <section className="container mx-auto max-w-7xl px-4 py-12" aria-label="Career pathways">
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800/30 text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-3">
                        <Users className="size-3" />
                        Career Pathway Directory
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Sarkari <span className="text-brand-600 dark:text-brand-400">Resource</span> Center</h2>
                    <p className="mt-3 text-sm text-foreground-muted font-medium max-w-2xl">
                        Your central hub for navigating India&apos;s recruitment landscape. We categorize updates from official portals into verified career pathways.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {RESOURCE_LINKS.map((item) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className="group rounded-xl border border-border bg-surface p-4 transition-all hover:shadow-md hover:border-brand-300"
                        >
                            <h3 className="text-sm font-bold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{item.title}</h3>
                            <p className="mt-1 text-[11px] text-foreground-muted leading-snug">{item.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Web Stories Horizontal Feed */}
            <StoriesSection />

            {/* FAQ Section (FIX 4: text-to-HTML ratio boost) */}
            <section className="container mx-auto max-w-4xl px-4 py-12" aria-label="Frequently asked questions">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground text-center mb-8">
                    Frequently Asked <span className="text-brand-600 dark:text-brand-400">Questions</span>
                </h2>
                <div className="space-y-4">
                    {FAQ_ITEMS.map((faq) => (
                        <details key={faq.q} className="group rounded-xl border border-border bg-surface shadow-xs">
                            <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-bold text-foreground hover:text-brand-600 dark:hover:text-brand-400 transition-colors [&::-webkit-details-marker]:hidden list-none">
                                {faq.q}
                                <ArrowRight className="size-4 shrink-0 text-foreground-muted transition-transform group-open:rotate-90 ml-4" />
                            </summary>
                            <div className="px-5 pb-5 text-sm text-foreground-muted leading-relaxed">
                                {faq.a}
                            </div>
                        </details>
                    ))}
                </div>
            </section>

            {/* Browse by State (reduced from 15 → 8 pills) */}
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
                                {states.slice(0, 8).map((state) => (
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
                                        <span className="transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
                                            {state.name}
                                        </span>
                                    </Link>
                                ))}
                                <Link
                                    href="/states"
                                    className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30 px-4 py-2 text-sm font-bold text-brand-600 dark:text-brand-400 transition-all hover:bg-brand-100 dark:hover:bg-brand-900/50 active:scale-[0.98]"
                                >
                                    View All States
                                    <ArrowRight className="size-4" />
                                </Link>
                            </nav>
                        )}
                    </div>

                    {/* Right - India map illustration */}
                    <div className="relative hidden lg:flex lg:items-center lg:justify-center">
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

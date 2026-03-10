import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { HomeSection } from '@/components/posts/HomeSection'
import { HomeSectionSkeleton } from '@/components/posts/HomeSectionSkeleton'
import { HeroSearchBar } from '@/components/shared/HeroSearchBar'
import { NewsletterForm } from '@/components/shared/NewsletterForm'
import { AdZone } from '@/components/ads/AdZone'
import { ROUTE_PREFIXES } from '@/config/site'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebSiteSchema, buildOrganizationSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { getStates } from '@/lib/queries/states'
import { getPopularOrganizations } from '@/lib/queries/organizations'
import { getPostCountsByType } from '@/lib/queries/stats'
import { getHomepageSections } from '@/lib/queries/stats'
import type { PostTypeCounts } from '@/lib/queries/stats'
import { Briefcase, CreditCard, ArrowRight, Trophy, Users, Building2, MapPin, BookOpen, Bell, GraduationCap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* SEO Metadata */

export const metadata = buildPageMetadata({
    title: 'Sarkari Jobs, Results & Admit Cards — Latest Govt Updates 2026',
    description: 'Your one-stop destination for latest government jobs, exam results, admit cards, answer keys, syllabus, and government schemes across India. Updated daily with verified information from official sources.',
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

export default async function HomePage() {
    /* JSON-LD: WebSite + SearchAction (for Google sitelinks search box) + Organization (for Knowledge Panel) */
    const websiteJsonLd = buildWebSiteSchema()
    const organizationJsonLd = buildOrganizationSchema()

    /* Fetch all homepage data in parallel for fastest TTFB */
    const [statesResult, orgsResult, countsResult, sectionsResult] = await Promise.allSettled([
        getStates(),
        getPopularOrganizations(12),
        getPostCountsByType(),
        getHomepageSections(6),
    ])

    const states = statesResult.status === 'fulfilled'
        ? statesResult.value.map((s) => ({ slug: s.slug, name: s.name, abbr: s.abbr }))
        : []

    const organizations = orgsResult.status === 'fulfilled' ? orgsResult.value : []

    const postCounts = countsResult.status === 'fulfilled' ? countsResult.value : []
    const countsMap = new Map(postCounts.map((c) => [c.type, c]))

    /* Pre-fetched homepage sections from fn_homepage_sections() — 1 DB call for all 6 sections */
    const sections = sectionsResult.status === 'fulfilled' ? sectionsResult.value : {}

    return (
        <>
            <JsonLd data={[websiteJsonLd, organizationJsonLd]} />

            {/*  Hero */}
            <section className="relative bg-hero">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.12),transparent)] pointer-events-none" />

                <div className="container relative mx-auto max-w-7xl px-4 pt-16 pb-12 text-center lg:pt-20 lg:pb-16">
                    <h1 className="text-fluid-3xl sm:text-fluid-4xl lg:text-fluid-5xl font-extrabold tracking-tight text-white animate-fade-up">
                        Find Your Dream{' '}
                        <span className="text-amber-400">
                            Sarkari Job
                        </span>
                    </h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base text-blue-100/90 sm:text-lg animate-fade-up delay-75">
                        Direct access to latest government notifications, results, and welfare schemes across India.
                    </p>

                    {/* Search Bar */}
                    <div className="relative z-10 mx-auto mt-8 max-w-3xl animate-fade-up delay-150">
                        <HeroSearchBar states={states} />
                    </div>

                    {/* Trending Topics */}
                    <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-3 text-sm animate-fade-up delay-225">
                        <span className="text-blue-200/80 font-medium">Trending:</span>
                        {['SSC CGL 2026', 'UPSC CSE Prelims', 'Railway NTPC'].map((topic) => (
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

            {/* Stats Cards — real data from mv_post_type_counts */}
            <section className="container mx-auto max-w-5xl px-4 -mt-10 relative z-10 mb-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 animate-scale-in delay-300">
                    {STAT_CARDS.map((card) => {
                        const counts = countsMap.get(card.type)
                        // DEMO FALLBACK DATA
                        const fallbackValues: Record<string, { total: string, change: string }> = {
                            'job': { total: '1,245', change: '85 Open' },
                            'result': { total: '8,430', change: '12 Today' },
                            'admit': { total: '3,102', change: '45 Active' },
                            'admission': { total: '5,020', change: '120 Open' }
                        }

                        const isDemo = !counts
                        const fallback = fallbackValues[card.type]

                        const value = isDemo ? fallback?.total : counts.total_count.toLocaleString('en-IN')
                        const change = isDemo ? fallback?.change : formatChange(counts)

                        return (
                            <div
                                key={card.type}
                                className="flex flex-col rounded-2xl border border-border bg-surface p-4 shadow-lg sm:p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground-muted sm:text-xs">
                                        {card.label}
                                    </span>
                                    <div className={`flex size-8 items-center justify-center rounded-lg ${card.bg} sm:size-9`}>
                                        <card.icon className={`size-4 ${card.color} sm:size-4.5`} />
                                    </div>
                                </div>
                                <span className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                                    {value}
                                </span>
                                <span className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 sm:text-xs">
                                    {change}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* Popular Organizations */}
            {organizations.length > 0 && (
                <section className="container mx-auto max-w-7xl px-4 py-12" aria-label="Browse by organization">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
                                <Building2 className="size-5 text-brand-600 dark:text-brand-400" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                Popular Organizations
                            </h2>
                        </div>
                        <Link
                            href="/organizations"
                            className="group flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                        >
                            View All
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
                        {organizations.map((org) => (
                            <Link
                                key={org.id}
                                href={`/organizations/${org.slug}`}
                                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center transition-all hover:border-brand-300 hover:shadow-lg dark:hover:border-brand-700 hover:-translate-y-1"
                            >
                                {org.logo_url ? (
                                    <Image
                                        src={org.logo_url}
                                        alt={org.name}
                                        width={64}
                                        height={64}
                                        className="size-full object-contain"
                                    />
                                ) : (
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-800/30 border border-brand-200/60 dark:border-brand-700/40 text-lg font-bold text-brand-600 dark:text-brand-400 shadow-sm">
                                        {(org.short_name || org.name).substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 w-full">
                                    <h3 className="text-xs font-bold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                                        {org.short_name || org.name}
                                    </h3>
                                    {org.short_name && (
                                        <p className="mt-1 text-[10px] text-foreground-subtle line-clamp-1 leading-tight">
                                            {org.name}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <AdZone zoneSlug="below_header" className="container mx-auto max-w-7xl px-4" />

            {/* Content Sections — Left/Right Split Layout */}
            <section className="container mx-auto max-w-360 px-4 py-12">
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3 xl:gap-12">

                    {/* LEFT COLUMN: 10 Post Types (2x5 Grid using the List layout) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <Suspense fallback={<HomeSectionSkeleton count={6} />}>
                                <HomeSection typeKey="job" heading="Latest Sarkari Job" route={ROUTE_PREFIXES.job} cta="View All" limit={6} layout="list" themeColorClass="bg-amber-500" posts={sections.job} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={6} />}>
                                <HomeSection typeKey="result" heading="Latest Result" route={ROUTE_PREFIXES.result} cta="View All" limit={6} layout="list" themeColorClass="bg-orange-500" posts={sections.result} />
                            </Suspense>

                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="answer_key" heading="Answer Key" route={ROUTE_PREFIXES.answer_key} cta="View All" limit={5} layout="list" themeColorClass="bg-blue-500" posts={sections.answer_key} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="syllabus" heading="Syllabus" route={ROUTE_PREFIXES.syllabus} cta="View All" limit={5} layout="list" themeColorClass="bg-emerald-500" posts={sections.syllabus} />
                            </Suspense>

                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="admit" heading="Admit Card" route={ROUTE_PREFIXES.admit} cta="View All" limit={5} layout="list" themeColorClass="bg-green-600" posts={sections.admit} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="exam_pattern" heading="Exam Pattern" route={ROUTE_PREFIXES.exam_pattern} cta="View All" limit={5} layout="list" themeColorClass="bg-cyan-500" posts={sections.exam_pattern} />
                            </Suspense>

                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="previous_paper" heading="Previous Paper" route={ROUTE_PREFIXES.previous_paper} cta="View All" limit={5} layout="list" themeColorClass="bg-indigo-500" posts={sections.previous_paper} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="cut_off" heading="Cut Off Marks" route={ROUTE_PREFIXES.cut_off} cta="View All" limit={5} layout="list" themeColorClass="bg-rose-500" posts={sections.cut_off} />
                            </Suspense>

                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="exam" heading="Upcoming Exam" route={ROUTE_PREFIXES.exam} cta="View All" limit={5} layout="list" themeColorClass="bg-violet-500" posts={sections.exam} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection typeKey="admission" heading="Admission" route={ROUTE_PREFIXES.admission} cta="View All" limit={5} layout="list" themeColorClass="bg-fuchsia-500" posts={sections.admission} />
                            </Suspense>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar for Trending & Schemes */}
                    <div className="lg:col-span-1">
                        <aside className="sticky top-24 flex flex-col gap-8">
                            {/* Notifications List (formerly Trending Now) */}
                            <Suspense fallback={<HomeSectionSkeleton count={5} />}>
                                <HomeSection
                                    typeKey="notification"
                                    heading="Notification"
                                    route={ROUTE_PREFIXES.notification}
                                    cta="All Updates"
                                    limit={7}
                                    layout="numbered"
                                    themeColorClass="bg-brand-500"
                                    posts={sections.notification}
                                />
                            </Suspense>

                            {/* Sidebar Ad Drop */}
                            <AdZone zoneSlug="mid_content" className="w-full bg-surface-subtle border border-border rounded-2xl overflow-hidden" />

                            {/* Govt Schemes List */}
                            <Suspense fallback={<HomeSectionSkeleton count={4} />}>
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

                            {/* Sidebar Ad Drop */}
                            <AdZone zoneSlug="mid_content" className="w-full bg-surface-subtle border border-border rounded-2xl overflow-hidden" />

                            {/* Sidebar CTA completely mirrored from screenshot reference */}
                            <div className="relative overflow-hidden rounded-3xl bg-[#1e3a8a] p-8 shadow-xl">
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 blur-3xl opacity-30 pointer-events-none">
                                    <div className="w-64 h-64 bg-accent-500 rounded-full"></div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-white mb-2">Never Miss a Job!</h3>
                                    <p className="text-sm text-blue-200/90 mb-6 leading-relaxed">
                                        Join 2M+ aspirants getting instant alerts on email directly from Result Guru.
                                    </p>
                                    <NewsletterForm />
                                </div>
                            </div>
                        </aside>
                    </div>

                </div>
            </section>

            {/* Browse by State */}
            <section
                className="container mx-auto max-w-7xl px-4 py-12 lg:py-16"
                aria-label="Browse government by Indian state"
                itemScope
                itemType="https://schema.org/ItemList"
            >
                <meta itemProp="name" content="Indian States Government Directory" />
                <meta itemProp="numberOfItems" content={String(states.length)} />

                <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* Left — Text + State pills */}
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
                                {states.slice(0, 12).map((state, idx) => (
                                    <Link
                                        key={state.slug}
                                        href={`/states/${state.slug}`}
                                        className="group inline-flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 dark:hover:border-brand-700"
                                        title={`Government jobs & results in ${state.name}`}
                                        itemProp="itemListElement"
                                        itemScope
                                        itemType="https://schema.org/ListItem"
                                    >
                                        <meta itemProp="position" content={String(idx + 1)} />
                                        <meta itemProp="url" content={`/states/${state.slug}`} />
                                        <span
                                            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-[10px] font-bold leading-none text-white shadow-sm"
                                            aria-hidden="true"
                                        >
                                            {state.abbr || state.name.substring(0, 2).toUpperCase()}
                                        </span>
                                        <span
                                            className="transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300"
                                            itemProp="name"
                                        >
                                            {state.name}
                                        </span>
                                    </Link>
                                ))}
                            </nav>
                        )}

                        <Link
                            href="/states"
                            className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                        >
                            Explore all {states.length > 0 ? `${states.length} States & UTs` : 'States & UTs'}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {/* Right — India map illustration */}
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
                            className="relative z-10 h-auto w-full max-w-md drop-shadow-lg dark:opacity-90 dark:brightness-90 dark:invert"
                            priority
                            aria-hidden="true"
                        />

                        {/* Floating stat card */}
                        <div className="absolute bottom-6 right-4 z-20 flex items-center gap-3 rounded-2xl border border-border bg-surface/95 px-5 py-3.5 shadow-xl backdrop-blur-sm sm:bottom-10 sm:right-8">
                            <div className="flex size-10 items-center justify-center rounded-full bg-brand-600 shadow-md">
                                <MapPin className="size-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">Pan India Coverage</p>
                                <p className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
                                    {states.length > 0 ? `${states.length} States & UTs` : 'All States & UTs'}
                                </p>
                            </div>
                            <Link
                                href="/states"
                                className="ml-1 flex size-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition-transform hover:scale-110"
                                aria-label="View all states"
                            >
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <AdZone zoneSlug="below_content" className="container mx-auto max-w-7xl px-4 my-8" />

            {/* SEO Content Block (500-800 words) */}
            <section className="container mx-auto max-w-7xl px-4 py-16 bg-surface-subtle border-t border-border" aria-label="About Result Guru">
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-4xl mx-auto">
                    <h2 className="text-3xl font-extrabold tracking-tight mb-6">Latest Sarkari Result 2026 & Government Jobs in India</h2>
                    <p>
                        Welcome to <strong>Result Guru</strong>, India's most trusted and fastest-growing portal for the <strong>Latest Sarkari Result 2026</strong>, upcoming <strong>Government Jobs in India</strong>, and real-time <strong>Latest Govt Job Notifications</strong>. Whether you are aiming for SSC, UPSC, Railway, Banking, Police, or State-level examinations, we provide instant updates on admit cards, answer keys, syllabus, and cut-off marks to ensure you stay ahead in your preparation journey.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4">Why Follow Result Guru for the Latest Govt Job Notifications?</h3>
                    <p>
                        In today's highly competitive era, missing a single employment notification can cost aspirants a golden opportunity. Our dedicated editorial team actively tracks official government websites, employment news (Rozgar Samachar), and state-level public service commission portals (UPPSC, BPSC, MPSC, RPSC, etc.) to bring you verified and accurate <strong>Sarkari Naukri</strong> updates. We consolidate intricate notification PDFs into easy-to-read, structured formats detailing crucial dates, application fees, age limits, syllabus breakdowns, and direct application links.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4">Comprehensive Coverage of Govt Jobs in India</h3>
                    <p>
                        The landscape of <strong>Government Jobs in India</strong> is vast, ranging from Group A gazetted officer posts to Group D recruitment drives. Here is what we actively cover:
                    </p>
                    <ul>
                        <li><strong>SSC & Railway Recruitment:</strong> Real-time alerts for SSC CGL, CHSL, MTS, Railway NTPC, and Group D vacancies. Follow our portal to download admit cards and check the <em>Latest Sarkari Result 2026</em> as soon as they are announced.</li>
                        <li><strong>UPSC & State PSCs:</strong> Deep-dive overviews of UPSC Civil Services, NDA, CDS, and State Public Service Commission exams including syllabus updates and previous year question papers.</li>
                        <li><strong>Banking & Insurance:</strong> From IBPS PO and SBI Clerk to LIC Assistant, we cover all major banking jobs, ensuring you never miss an application deadline.</li>
                        <li><strong>Police & Defence:</strong> Updates on state police constable and SI recruitments, alongside Agniveer and paramilitary forces (CRPF, BSF, CISF).</li>
                        <li><strong>Teaching & Eligibility Exams:</strong> Instant notifications for CTET, State TETs, TGT, PGT, and Assistant Professor vacancies across state and central universities.</li>
                    </ul>

                    <h3 className="text-xl font-bold mt-8 mb-4">Check Your Latest Sarkari Result 2026 & Admit Cards</h3>
                    <p>
                        We understand the anxiety students face after taking an exam. Result Guru prides itself on delivering high-speed servers and direct links to check your <strong>Latest Sarkari Result 2026</strong> without server timeouts. Furthermore, we provide immediate alerts for admit card releases, ensuring you download your hall tickets well in advance of your exam date. Our dedicated sections for Answer Keys and Cut-Off marks help you accurately estimate your performance right after the exam concludes.
                    </p>

                    <h3 className="text-xl font-bold mt-8 mb-4">Government Schemes & Admissions</h3>
                    <p>
                        Beyond jobs, Result Guru is dedicated to empowering students through information on <strong>Central and State Government Schemes</strong> and Scholarships. We also track top university <strong>Admissions</strong> (CUET, JEE, NEET, state counseling) to guide students transitioning from schools to higher education. By combining job alerts with educational empowerment, we serve as an all-inclusive career mentor for Indian youth.
                    </p>

                    <p className="mt-8 text-foreground-muted text-sm font-medium">
                        Bookmark <a href="/" className="text-brand-600 hover:underline">Result Guru</a> today and take your first definitive step towards a secure government career. Join millions of students who trust our platform for authentic, timely, and organized updates on the entire spectrum of Indian public sector employment.
                    </p>
                </div>
            </section>

        </>
    )
}

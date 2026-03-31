import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { HomeSection } from '@/features/posts/components/HomeSection'
import { HomeSectionSkeleton } from '@/features/posts/components/HomeSectionSkeleton'
import { HeroSearchBar } from '@/features/shared/components/HeroSearchBar'
import { NewsletterForm } from '@/features/shared/components/NewsletterForm'
import { AdZone } from '@/components/ads/AdZone'
import { StoriesSection } from '@/components/stories/StoriesSection'
import { ROUTE_PREFIXES } from '@/config/site'
import { buildPageMetadata } from '@/lib/metadata'
import { buildWebSiteSchema, buildOrganizationSchema, buildSiteNavigationSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { getStates } from '@/lib/queries/states'
import { getPopularOrganizations } from '@/lib/queries/organizations'
import { getPostCountsByType } from '@/features/stats/queries'
import { getHomepageSections } from '@/features/stats/queries'
import type { PostTypeCounts } from '@/features/stats/queries'
import { Briefcase, CreditCard, ArrowRight, Trophy, Users, MapPin, BookOpen, Bell, GraduationCap, Star, ShieldCheck, Clock, Send, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'


/* SEO Metadata */

export const metadata = buildPageMetadata({
    title: 'Result Guru - Sarkari Result 2026 | Govt Jobs, Admit Card & Answer Key',
    description: 'India\'s #1 Sarkari Result portal. Get real-time alerts for SSC, UPSC, Railway & Govt Jobs 2026. Access 100% verified exams, results, and scholarship updates daily.',
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
    const navigationJsonLd = buildSiteNavigationSchema()

    /* Fetch all homepage data in parallel for fastest TTFB */
    const [statesResult, orgsResult, countsResult, sectionsResult] = await Promise.allSettled([
        getStates(),
        getPopularOrganizations(30),
        getPostCountsByType(),
        getHomepageSections(8),
    ])

    const states = statesResult.status === 'fulfilled' ? statesResult.value.map((s) => ({ slug: s.slug, name: s.name, abbr: s.abbr })) : []
    const organizations = orgsResult.status === 'fulfilled' ? orgsResult.value : []
    const postCounts = countsResult.status === 'fulfilled' ? countsResult.value : []
    const countsMap = new Map(postCounts.map((c) => [c.type, c]))

    /* Pre-fetched homepage sections from fn_homepage_sections() - 1 DB call for all 6 sections */
    const sections = sectionsResult.status === 'fulfilled' ? sectionsResult.value : {}
    return (
        <>
            <JsonLd data={[websiteJsonLd, organizationJsonLd, navigationJsonLd]} />

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

                    {/* Trending Topics */}
                    <div className="mx-auto mt-5 flex max-w-xl flex-wrap items-center justify-center gap-3 text-sm">
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
                                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 sm:text-xs">
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
                <section className="container mx-auto max-w-7xl px-4 py-10" aria-label="Browse by organization">
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
                            <Suspense fallback={<HomeSectionSkeleton count={8} />}>
                                <HomeSection typeKey="job" heading="Latest Sarkari Job" route={ROUTE_PREFIXES.job} cta="View All" limit={8} layout="list" themeColorClass="bg-amber-500" posts={sections.job} />
                            </Suspense>
                            <Suspense fallback={<HomeSectionSkeleton count={8} />}>
                                <HomeSection typeKey="result" heading="Latest Result" route={ROUTE_PREFIXES.result} cta="View All" limit={8} layout="list" themeColorClass="bg-orange-500" posts={sections.result} />
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
                            <Suspense fallback={<HomeSectionSkeleton count={8} />}>
                                <HomeSection
                                    typeKey="notification"
                                    heading="Notification"
                                    route={ROUTE_PREFIXES.notification}
                                    cta="All Updates"
                                    limit={8}
                                    layout="numbered"
                                    themeColorClass="bg-brand-500"
                                    posts={sections.notification}
                                />
                            </Suspense>

                            {/* Telegram Community CTA */}
                            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0088CC] to-[#0077B5] p-6 shadow-xl border border-white/10">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 blur-2xl opacity-20 pointer-events-none">
                                    <div className="w-40 h-40 bg-white rounded-full"></div>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
                                            <Send className="size-6 text-white fill-white -rotate-12 translate-x-px -translate-y-px" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-widest">Live Updates</span>
                                            </div>
                                            <h2 className="text-lg font-black text-white leading-tight">Join Community</h2>
                                        </div>
                                    </div>

                                    <p className="text-sm text-blue-50/90 mb-6 leading-relaxed font-medium">
                                        Get instant alerts for <span className="text-white font-bold underline decoration-white/30 underline-offset-4">Sarkari Result 2026</span> directly on your phone.
                                    </p>

                                    <Link
                                        href="https://t.me/resultguru247"
                                        target="_blank"
                                        className="group flex items-center justify-center gap-2.5 w-full bg-white text-[#0088CC] hover:bg-blue-50 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                                    >
                                        Join Telegram
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </Link>

                                    <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold text-white/80">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="size-3" />
                                            50K+ Joined
                                        </div>
                                        <div className="h-2.5 w-px bg-white/20" />
                                        <span>Free Forever</span>
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
                                    limit={8}
                                    layout="list"
                                    themeColorClass="bg-pink-500"
                                    posts={sections.scheme}
                                />
                            </Suspense>

                            {/* WhatsApp Channel CTA */}
                            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#25D366] to-[#128C7E] p-6 shadow-xl border border-white/10">
                                {/* Decor */}
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 blur-2xl opacity-20 pointer-events-none">
                                    <div className="w-40 h-40 bg-white rounded-full"></div>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner">
                                            <MessageCircle className="size-6 text-white fill-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="flex size-2 rounded-full bg-white animate-pulse" />
                                                <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">Official Channel</span>
                                            </div>
                                            <h2 className="text-lg font-black text-white leading-tight">Follow Channel</h2>
                                        </div>
                                    </div>

                                    <p className="text-sm text-white/90 mb-6 leading-relaxed font-medium">
                                        Get instant <span className="text-white font-bold underline decoration-white/30 underline-offset-4">Job Notifications</span> and exam updates directly on WhatsApp.
                                    </p>

                                    <Link
                                        href="https://whatsapp.com/channel/0029Vb7XUqn1SWt7c9kqCV3I"
                                        target="_blank"
                                        className="group flex items-center justify-center gap-2.5 w-full bg-white text-[#128C7E] hover:bg-emerald-50 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                                    >
                                        Follow on WhatsApp
                                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                    </Link>

                                    <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold text-white/80">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="size-3" />
                                            Fastest Alerts
                                        </div>
                                        <div className="h-2.5 w-px bg-white/20" />
                                        <span>Verified Channel</span>
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
                                    limit={8}
                                    layout="list"
                                    themeColorClass="bg-amber-500"
                                    posts={sections.scholarship}
                                />
                            </Suspense>

                        </aside>
                    </div>

                </div>
            </section>

            {/* Professional About Section */}
            <section className="border-t border-border bg-linear-to-b from-surface to-surface-subtle" aria-label="About Result Guru">
                <div className="container mx-auto max-w-7xl px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Left: Branding & Core Mission */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800/30 text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                                <ShieldCheck className="size-3" />
                                India&apos;s Trusted Resource
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-[1.1]">
                                Empowering Aspirants with <span className="text-brand-600 dark:text-brand-400">Verified Updates.</span>
                            </h2>
                            <p className="text-base text-foreground-muted leading-relaxed">
                                Result Guru is a dedicated platform designed to simplify the complex journey of government exam preparation. We consolidate hundreds of notifications into a single, intuitive dashboard for millions of students across India.
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                                <Link href="/about" className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-brand-600 transition-colors">
                                    Our Story <ArrowRight className="size-4" />
                                </Link>
                                <div className="h-4 w-px bg-border mx-2" />
                                <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-brand-600 transition-colors">
                                    Contact Us
                                </Link>
                            </div>
                        </div>

                        {/* Right: Key Value Props */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { icon: Clock, title: 'Fastest Notification', desc: 'Real-time alerts for Latest Sarkari Result 2026 and upcoming Govt Jobs in India as soon as they are announced.' },
                                { icon: ShieldCheck, title: '100% Verified Info', desc: 'Our team cross-verifies every news from official gazettes and commission portals like SSC, UPSC, and Railways.' },
                                { icon: BookOpen, title: 'Complete Resources', desc: 'From Syllabus breakdowns to Exam Patterns and Previous Papers, we provide all the tools for your preparation.' },
                                { icon: Star, title: 'Welfare Schemes', desc: 'Beyond jobs, stay updated with state and central government schemes, scholarships, and admission alerts.' }
                            ].map((prop) => (
                                <div key={prop.title} className="flex gap-4 p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-brand-300 transition-colors">
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
                    </div>


                </div>
            </section>

            {/* Browse Categories */}
            <section className="container mx-auto max-w-7xl px-4 py-10" aria-label="Browse by category">
                <div className="mb-8 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Explore Categories</h2>
                    <p className="text-xs text-foreground-muted mt-0.5 font-medium">Find the perfect job, exam, notifications and admission for you</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                    {[
                        { title: 'SSC & Railway', desc: 'Real-time alerts for SSC CGL, CHSL, MTS, Railway NTPC, and Group D vacancies. Follow for all technical and non-technical updates.' },
                        { title: 'UPSC & State PSCs', desc: 'Deep-dive overviews of UPSC Civil Services, NDA, CDS, and State Public Service Commission exams including syllabus and exam dates.' },
                        { title: 'Banking & Insurance', desc: 'From IBPS PO and SBI Clerk to LIC Assistant, we cover all major banking jobs ensuring you never miss an application deadline.' },
                        { title: 'Police & Defence', desc: 'Updates on state police constable and SI recruitments, alongside Agniveer, Army, and paramilitary forces (CRPF, BSF, CISF).' },
                        { title: 'Teaching & Eligibility', desc: 'Instant notifications for CTET, State TETs, TGT, PGT, and Assistant Professor vacancies across state and central universities.' },
                        { title: 'Schemes & Admissions', desc: 'Stay updated with Central and State Government Schemes, Scholarships, and top university Admissions (CUET, JEE, NEET).' },
                    ].map((item) => (
                        <div key={item.title} className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:border-brand-300 transition-colors">
                            <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5">{item.title}</h3>
                            <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed font-medium">
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
                itemScope
                itemType="https://schema.org/ItemList"
            >
                <meta itemProp="name" content="Indian States Government Directory" />
                <meta itemProp="numberOfItems" content={String(states.length)} />

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
                                            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-[11px] font-bold leading-none text-white shadow-sm"
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

            {/* Newsletter CTA Section */}
            <section className="container mx-auto max-w-7xl px-4 py-8 mb-12">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-[#1e3a8a] to-[#1e40af] p-8 md:p-12 shadow-2xl border border-white/10">
                    {/* Abstract Decor */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 blur-3xl opacity-20 pointer-events-none">
                        <div className="w-96 h-96 bg-brand-400 rounded-full"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 blur-3xl opacity-10 pointer-events-none">
                        <div className="w-64 h-64 bg-white rounded-full"></div>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold text-white uppercase tracking-widest">
                                <Bell className="size-3" />
                                Instant Job Alerts
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1]">
                                Never Miss a <span className="text-brand-300">Govt Job</span> Update Again.
                            </h2>
                            <p className="text-lg text-blue-100/90 leading-relaxed font-medium">
                                Join 2M+ aspirants getting instant alerts for Latest Results, Admit Cards, and Jobs directly in their inbox.
                            </p>
                        </div>
                        <div className="p-6 md:p-8">
                            <NewsletterForm />
                            <p className="text-xs text-white/60 mt-4 text-center font-bold uppercase tracking-wide">
                                No Spam. Only Verified Official Notifications.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <AdZone zoneSlug="below_content" className="container mx-auto max-w-7xl px-4 my-8" />

        </>
    )
}

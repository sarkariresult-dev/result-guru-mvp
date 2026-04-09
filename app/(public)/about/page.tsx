import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import { ShieldCheck, Target, Zap, Users, Search, BellRing, FileText } from 'lucide-react'
import * as Icons from 'lucide-react'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

export const metadata = buildPageMetadata({
    title: 'About Us - Our Mission & Values',
    description: `Learn about ${SITE.name}, India's trusted platform for Sarkari Jobs, Exam Results, Admit Cards, and Government Schemes. Our mission, values, and what makes us different.`,
    path: '/about',
})

export default function AboutPage() {
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'About Us', url: `${SITE.url}/about` },
    ])

    const aboutJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: `About ${SITE.name}`,
        description: `${SITE.name} is India's trusted platform for government job notifications, exam results, and recruitment updates.`,
        url: `${SITE.url}/about`,
        mainEntity: {
            '@type': 'Organization',
            name: SITE.name,
            url: SITE.url,
            description: 'India\'s trusted platform for Sarkari Jobs, Exam Results, Admit Cards, and Government Schemes.',
            foundingDate: '2025',
            areaServed: { '@type': 'Country', name: 'India' },
        },
    }

    const ECOSYSTEM_ITEMS = [
        { label: 'Job Update', href: ROUTE_PREFIXES.job, icon: 'Briefcase' },
        { label: 'Exam Result', href: ROUTE_PREFIXES.result, icon: 'Trophy' },
        { label: 'Admit Card', href: ROUTE_PREFIXES.admit, icon: 'CreditCard' },
        { label: 'Answer Key', href: ROUTE_PREFIXES.answer_key, icon: 'Key' },
        { label: 'Syllabus', href: ROUTE_PREFIXES.syllabus, icon: 'BookOpen' },
        { label: 'Exam Pattern', href: ROUTE_PREFIXES.exam_pattern, icon: 'ClipboardList' },
        { label: 'Previous Paper', href: ROUTE_PREFIXES.previous_paper, icon: 'History' },
        { label: 'Cut Off', href: ROUTE_PREFIXES.cut_off, icon: 'Hash' },
        { label: 'Exam Updates', href: ROUTE_PREFIXES.exam, icon: 'ClipboardCheck' },
        { label: 'Admission', href: ROUTE_PREFIXES.admission, icon: 'GraduationCap' },
        { label: 'Scholarship', href: ROUTE_PREFIXES.scholarship, icon: 'Award' },
        { label: 'Govt Scheme', href: ROUTE_PREFIXES.scheme, icon: 'Star' },
    ]

    return (
        <>
            <JsonLd data={[breadcrumbJsonLd, aboutJsonLd]} />

            <article className="pb-20">
                {/* 1. Hero Section */}
                <header className="relative bg-slate-50 border-b border-border/50 pt-6 pb-12 sm:pt-10 sm:pb-24 dark:bg-slate-950/20">
                    {/* Background Decorative Element */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
                        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent-500/5 blur-[100px]" />
                    </div>

                    <div className="container relative mx-auto max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="mx-auto max-w-4xl text-center mt-8 sm:mt-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 dark:bg-brand-900/30 dark:border-brand-800/50 mb-6 group transition-colors">
                                <div className="size-2 rounded-full bg-accent-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">Founded 2025</span>
                            </div>

                            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-fluid-4xl lg:text-7xl mb-6 leading-[1.1]">
                                We make government updates <br className="hidden lg:block" />
                                <span className="text-gradient-brand">simple & verified.</span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-foreground-muted leading-relaxed font-medium">
                                We started {SITE.name} because finding reliable government job notifications, admit cards, and exam results shouldn&apos;t be harder than passing the exam itself.
                            </p>

                            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-sm font-bold text-foreground-muted">
                                <span className="flex items-center gap-2.5 group">
                                    <div className="p-1.5 rounded-lg bg-white shadow-sm border border-border group-hover:border-accent-500/50 dark:bg-slate-900 transition-colors">
                                        <ShieldCheck className="size-4 text-accent-500" />
                                    </div>
                                    100% Verified Sources
                                </span>
                                <span className="flex items-center gap-2.5 group">
                                    <div className="p-1.5 rounded-lg bg-white shadow-sm border border-border group-hover:border-accent-500/50 dark:bg-slate-900 transition-colors">
                                        <Zap className="size-4 text-accent-500" />
                                    </div>
                                    Real-time Updates
                                </span>
                                <span className="flex items-center gap-2.5 group">
                                    <div className="p-1.5 rounded-lg bg-white shadow-sm border border-border group-hover:border-accent-500/50 dark:bg-slate-900 transition-colors">
                                        <Target className="size-4 text-accent-500" />
                                    </div>
                                    No Clickbait
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2. Platform Impact (Stats) */}
                <section className="container mx-auto max-w-7xl px-4 -mt-10 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { label: 'Organizations Tracked', value: '500+', color: 'text-brand-600', shadow: 'shadow-brand-500/10' },
                            { label: 'States & UTs Covered', value: '36', color: 'text-brand-600', shadow: 'shadow-brand-500/10' },
                            { label: 'Dedicated Categories', value: '13', color: 'text-brand-600', shadow: 'shadow-brand-500/10' },
                            { label: 'For All Students, Always', value: 'Free', color: 'text-accent-600', shadow: 'shadow-accent-500/10' },
                        ].map((stat, i) => (
                            <div key={i} className={`bg-surface border border-border p-6 sm:p-10 rounded-2xl shadow-xl ${stat.shadow} flex flex-col items-center text-center group hover:border-brand-300 transition-all dark:hover:border-brand-700`}>
                                <div className={`text-3xl sm:text-5xl font-black ${stat.color} mb-3 group-hover:scale-105 transition-transform`}>{stat.value}</div>
                                <div className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-black text-foreground-muted leading-tight max-w-[150px]">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. The Problem vs Solution (Why We Exist) */}
                <section className="container mx-auto max-w-7xl px-4 py-20 sm:py-32">
                    <div className="text-center mb-16 sm:mb-24">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-4 px-4 py-1.5 bg-brand-50 inline-block rounded-full dark:bg-brand-900/30">Our Purpose</h2>
                        <h3 className="text-3xl font-black text-foreground sm:text-5xl mt-2 leading-[1.1]">
                            The internet is full of noise. <br className="hidden md:block" />
                            <span className="text-gradient-brand">We filter it for you.</span>
                        </h3>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                        {/* The Problem Card */}
                        <div className="group relative bg-white border border-border rounded-3xl p-8 sm:p-12 overflow-hidden dark:bg-slate-900/50">
                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 opacity-10">
                                <Search className="size-32 text-foreground" />
                            </div>

                            <div className="relative z-10">
                                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-8 dark:bg-slate-800">
                                    <Icons.Ban className="size-6" />
                                </div>
                                <h4 className="text-2xl font-bold text-foreground mb-6">The Current Chaos</h4>
                                <ul className="space-y-5">
                                    {[
                                        'Endless loops of unverified links',
                                        'Misleading thumbnails and clickbait',
                                        'Cluttered portals filled with ads',
                                        'Critical updates buried in official gazettes',
                                        'Anxiety due to outdated information'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-foreground-muted font-medium">
                                            <Icons.XCircle className="size-5 text-slate-300 mt-0.5 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* The Solution Card */}
                        <div className="group relative bg-brand-600 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl shadow-brand-500/20">
                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 opacity-10">
                                <Icons.CheckCircle2 className="size-32 text-white" />
                            </div>

                            {/* Decorative background accent */}
                            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />

                            <div className="relative z-10">
                                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-brand-100 mb-8 backdrop-blur-sm border border-white/20">
                                    <Icons.Rocket className="size-6" />
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-6">The Guru Standard</h4>
                                <ul className="space-y-5">
                                    {[
                                        '100% verified official PDF links',
                                        'Ad-free, lightning-fast experience',
                                        'Centralized hubs for every state & org',
                                        'Instant alerts on Telegram & WhatsApp',
                                        'Structured data for easy discovery'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-brand-50 font-medium">
                                            <Icons.CheckCircle2 className="size-5 text-accent-400 mt-0.5 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. How We Work (Process) */}
                <section className="relative overflow-hidden bg-slate-50 py-24 border-y border-border/50 dark:bg-slate-950/20">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
                            <div className="lg:w-1/3 text-center lg:text-left">
                                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 mb-4">Precision Pipeline</h2>
                                <h3 className="text-3xl font-black text-foreground sm:text-4xl leading-tight">
                                    How we process <br className="hidden lg:block" />
                                    <span className="text-gradient-brand">the stream of data.</span>
                                </h3>
                                <p className="mt-6 text-foreground-muted leading-relaxed">
                                    Our methodology ensures that every notification published on Result Guru is 100% verified, structured, and instantly actionable.
                                </p>
                            </div>

                            <div className="lg:w-2/3 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                                {[
                                    {
                                        step: '01',
                                        title: 'Continuous Monitoring',
                                        desc: 'Our team and automated systems monitor hundreds of official portals, employment news, and regional notification boards 24/7.',
                                        icon: Search,
                                    },
                                    {
                                        step: '02',
                                        title: 'Strict Verification',
                                        desc: 'Before publishing, we extract exact dates, vacancy counts, and syllabus details directly from official PDFs to ensure zero misinformation.',
                                        icon: ShieldCheck,
                                    },
                                    {
                                        step: '03',
                                        title: 'Instant Formatting',
                                        desc: 'We format the data into clean, readable pages and instantly dispatch alerts to our active student communities.',
                                        icon: BellRing,
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="group flex flex-col sm:flex-row gap-6 p-8 bg-surface border border-border rounded-3xl transition-all hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5">
                                        <div className="flex shrink-0 items-center justify-center size-16 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 font-black text-xl border border-brand-100 dark:border-brand-800">
                                            {item.step}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <item.icon className="size-5 text-accent-500" />
                                                <h4 className="text-xl font-black text-foreground">{item.title}</h4>
                                            </div>
                                            <p className="text-foreground-muted leading-relaxed text-sm lg:text-base max-w-xl">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Core Values */}
                <section className="container mx-auto max-w-7xl px-4 py-24 sm:py-32">
                    <div className="text-center mb-16 sm:mb-20">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 mb-4">Our Integrity</h2>
                        <h3 className="text-3xl font-black text-foreground sm:text-4xl">What drives us forward</h3>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Zap, title: 'Lightning Fast', desc: 'Optimized to load instantly, ensuring critical updates reach you without delay, even on limited networks.' },
                            { icon: ShieldCheck, title: 'Strictly Verified', desc: 'Trust is our currency. We never publish rumors; every update is cross-referenced with official gazettes.' },
                            { icon: Target, title: 'Highly Organized', desc: 'Siloed data by state, qualification, and agency makes finding specific notifications effortless.' },
                            { icon: Users, title: 'Student First', desc: 'No intrusive pop-ups or forced redirects. We respect your attention and focus by Keeping it 100% clean.' },
                        ].map((item, i) => {
                            const Icon = item.icon
                            return (
                                <div key={i} className="group relative bg-surface border border-border rounded-3xl p-8 transition-all hover:border-brand-500/30 hover:shadow-xl dark:hover:bg-brand-900/10">
                                    <div className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-foreground border border-border group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors dark:bg-slate-900 dark:group-hover:bg-brand-900/40 dark:group-hover:border-brand-700 dark:group-hover:text-brand-400">
                                        <Icon className="size-6 stroke-[1.5]" />
                                    </div>
                                    <h4 className="mb-3 text-xl font-black text-foreground">{item.title}</h4>
                                    <p className="text-sm text-foreground-muted leading-relaxed">{item.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* 6. A Complete Ecosystem */}
                <section className="bg-slate-50 py-24 border-y border-border/50 dark:bg-slate-950/20">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="text-center mb-16 sm:mb-20">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 mb-4">Comprehensive Coverage</h2>
                            <h3 className="text-3xl font-black text-foreground sm:text-4xl">A complete student ecosystem.</h3>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {ECOSYSTEM_ITEMS.map((nav, i) => {
                                const IconComponent = nav.icon ? (Icons as any)[nav.icon] : FileText
                                return (
                                    <Link
                                        key={i}
                                        href={nav.href}
                                        className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-brand-500/50 hover:bg-brand-50 transition-all text-center shadow-sm dark:hover:bg-brand-950/30 dark:hover:border-brand-700 active:scale-95 group"
                                    >
                                        <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-brand-600 dark:bg-slate-900 dark:text-brand-400 group-hover:bg-white dark:group-hover:bg-brand-900 transition-colors">
                                            <IconComponent className="size-6 stroke-[1.5]" />
                                        </div>
                                        <span className="text-xs font-bold text-foreground-muted group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors tracking-tight">{nav.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Standardized Institutional CTA */}
                <InstitutionalCTA 
                    badge="Zero-Noise Guarantee"
                    title="India's Most Trusted Notification Pipeline."
                    description="No misleading thumbnails. No 'Download' loops. No hidden fees. Just direct, verified access to official government links and honest information on every device."
                    primaryCTA={{ label: "Join Telegram Community", href: "https://t.me/resultguru247" }}
                    secondaryCTA={{ text: "Prefer WhatsApp?", actionLabel: "Join Channel", href: "https://whatsapp.com/channel/0029Vb7XUqn1SWt7c9kqCV3I" }}
                    className="mb-24"
                />
            </article>
        </>
    )
}

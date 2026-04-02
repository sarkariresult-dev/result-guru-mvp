import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import { ShieldCheck, Target, Zap, Users, Search, BellRing, FileText } from 'lucide-react'
import * as Icons from 'lucide-react'

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
                <header className="bg-surface-subtle border-b border-border pt-4 pb-12 sm:pt-6 sm:pb-20">
                    <div className="container mx-auto max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Breadcrumb items={[{ label: 'About Us' }]} />

                        <div className="mx-auto max-w-4xl text-center mt-6 sm:mt-10">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-fluid-4xl lg:text-7xl mb-4 sm:mb-6">
                                We make government updates <br className="hidden sm:block" />
                                <span className="text-brand-600 inline-block">simple & verified.</span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-foreground-muted leading-relaxed">
                                We started {SITE.name} because finding reliable government job notifications, admit cards, and exam results shouldn&apos;t be harder than passing the exam itself.
                            </p>

                            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-foreground-subtle">
                                <span className="flex items-center gap-2">
                                    <ShieldCheck className="size-5 text-emerald-500" />
                                    100% Verified Sources
                                </span>
                                <span className="flex items-center gap-2">
                                    <Zap className="size-5 text-amber-500" />
                                    Real-time Updates
                                </span>
                                <span className="flex items-center gap-2">
                                    <Target className="size-5 text-brand-500" />
                                    No Clickbait
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* 2. Platform Impact (Stats) */}
                <section className="container mx-auto max-w-7xl px-4 -mt-8 relative z-10">
                    <div className="rounded-xl border border-border bg-surface shadow-xl grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x divide-border">
                        <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 flex flex-col justify-center">
                            <div className="text-3xl sm:text-4xl font-black text-brand-600 mb-2">500+</div>
                            <div className="text-[11px] sm:text-xs tracking-widest uppercase font-bold text-foreground-muted max-w-[140px] mx-auto">Organizations Tracked</div>
                        </div>
                        <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 flex flex-col justify-center">
                            <div className="text-3xl sm:text-4xl font-black text-brand-600 mb-2">36</div>
                            <div className="text-[11px] sm:text-xs tracking-widest uppercase font-bold text-foreground-muted max-w-[140px] mx-auto">States & UTs Covered</div>
                        </div>
                        <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 flex flex-col justify-center">
                            <div className="text-3xl sm:text-4xl font-black text-brand-600 mb-2">13</div>
                            <div className="text-[11px] sm:text-xs tracking-widest uppercase font-bold text-foreground-muted max-w-[140px] mx-auto">Dedicated Categories</div>
                        </div>
                        <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 flex flex-col justify-center">
                            <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-2">Free</div>
                            <div className="text-[11px] sm:text-xs tracking-widest uppercase font-bold text-foreground-muted max-w-[140px] mx-auto">For All Students, Always</div>
                        </div>
                    </div>
                </section>

                {/* 3. The Problem vs Solution (Why We Exist) */}
                <section className="container mx-auto px-4 py-20 sm:py-28">
                    <div className="space-y-16">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-6">
                                The internet is full of noise.<br />We filter it for you.
                            </h2>
                            <p className="text-lg text-foreground-muted leading-relaxed max-w-2xl mx-auto">
                                Millions of students across India prepare for government examinations every year. It requires immense dedication, focus, and time. Yet, aspirants spend hours jumping between cluttered websites, dealing with fake links, outdated portals, and misleading headlines just to find out if an admit card is released.
                            </p>
                            <p className="text-lg text-foreground-muted leading-relaxed max-w-2xl mx-auto mt-4">
                                <strong>That&apos;s why we built {SITE.name}.</strong> We believe information should be centralized, categorized, and beautiful. We do the heavy lifting of constantly monitoring official gazettes so you can focus strictly on your preparation.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 4. How We Work (Process) */}
                <section className="bg-surface-subtle py-20 border-y border-border">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-2">Transparency</h2>
                            <h3 className="text-3xl font-extrabold text-foreground">How we process information</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10 md:gap-8 relative max-w-5xl mx-auto">
                            {/* Connecting Line (Desktop only) */}
                            <div className="hidden md:block absolute top-6 left-[15%] right-[15%] h-0 border-t-2 border-dashed border-border-strong z-0" />

                            <div className="relative bg-surface rounded-xl p-8 border border-border shadow-sm z-10 text-center flex flex-col items-center">
                                <div className="size-12 rounded-full bg-brand-50 dark:bg-brand-900/30 border-4 border-surface text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 shadow-sm">
                                    <Search className="size-5" />
                                </div>
                                <h4 className="text-xl font-bold mb-3">1. Continuous Monitoring</h4>
                                <p className="text-foreground-muted text-sm leading-relaxed max-w-xs">
                                    Our team and automated systems monitor hundreds of official government portals, employment news, and regional notification boards 24/7.
                                </p>
                            </div>

                            <div className="relative bg-surface rounded-xl p-8 border border-border shadow-sm z-10 text-center flex flex-col items-center">
                                <div className="size-12 rounded-full bg-brand-50 dark:bg-brand-900/30 border-4 border-surface text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 shadow-sm">
                                    <ShieldCheck className="size-5" />
                                </div>
                                <h4 className="text-xl font-bold mb-3">2. Strict Verification</h4>
                                <p className="text-foreground-muted text-sm leading-relaxed max-w-xs">
                                    Before anything is published, we verify the source. We extract exact dates, vacancy counts, and syllabus details directly from official PDFs.
                                </p>
                            </div>

                            <div className="relative bg-surface rounded-xl p-8 border border-border shadow-sm z-10 text-center flex flex-col items-center">
                                <div className="size-12 rounded-full bg-brand-50 dark:bg-brand-900/30 border-4 border-surface text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6 shadow-sm">
                                    <BellRing className="size-5" />
                                </div>
                                <h4 className="text-xl font-bold mb-3">3. Instant Formatting</h4>
                                <p className="text-foreground-muted text-sm leading-relaxed max-w-xs">
                                    We format the data into clean, readable pages and instantly dispatch alerts to our Telegram and WhatsApp communities.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Core Values */}
                <section className="container mx-auto max-w-7xl px-4 py-20 sm:py-28">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-foreground mb-4">What drives us forward</h2>
                        <p className="text-foreground-muted max-w-2xl mx-auto">The principles that guide every feature we build and every update we publish.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Zap, title: 'Lightning Fast', desc: 'We optimize our platform to load instantly, even on slower 3G networks in rural areas.' },
                            { icon: ShieldCheck, title: 'Uncompromising Truth', desc: 'Trust is our currency. We never publish clickbait or unverified rumors.' },
                            { icon: Target, title: 'Highly Organized', desc: 'Information is categorized cleanly by state, qualification, and organization for easy discovery.' },
                            { icon: Users, title: 'Student First', desc: 'No intrusive pop-up ads or forced redirects. We respect your screen and your time.' },
                        ].map((item) => {
                            const Icon = item.icon
                            return (
                                <div key={item.title} className="group rounded-xl border border-border bg-surface p-6 sm:p-8 transition-colors hover:border-brand-300 hover:shadow-md">
                                    <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-background-subtle text-foreground border border-border group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200 transition-colors dark:group-hover:bg-brand-900/40 dark:group-hover:border-brand-700 dark:group-hover:text-brand-400">
                                        <Icon className="size-5" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-foreground">{item.title}</h3>
                                    <p className="text-sm text-foreground-muted leading-relaxed">{item.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* 6. What We Cover Grid */}
                <section className="bg-surface-subtle py-20 border-y border-border">
                    <div className="container mx-auto max-w-4xl px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-extrabold text-foreground mb-4">A complete ecosystem</h2>
                            <p className="text-foreground-muted">From the moment a notification drops to the day you download your joining letter, we organize the entire lifecycle.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {ECOSYSTEM_ITEMS.map((nav) => {
                                const IconComponent = nav.icon ? (Icons as any)[nav.icon] : FileText
                                return (
                                    <Link
                                        key={nav.href}
                                        href={nav.href}
                                        className="bg-surface border border-border rounded-xl p-5 flex flex-col items-center justify-center gap-4 hover:border-brand-400 hover:bg-brand-50 transition-colors text-center shadow-sm dark:hover:bg-brand-950/30 dark:hover:border-brand-700"
                                    >
                                        <IconComponent className="size-8 stroke-[1.5] text-brand-600 dark:text-brand-400 opacity-80" />
                                        <span className="text-sm font-bold text-foreground">{nav.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* 7. The Guarantee */}
                <section className="container mx-auto max-w-4xl px-4 py-20">
                    <div className="rounded-2xl bg-brand-600 p-8 md:p-12 text-center text-white relative overflow-hidden shadow-xl">
                        <div className="relative z-10">
                            <ShieldCheck className="size-12 mx-auto mb-6 text-brand-100" />
                            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Our Guarantee to You</h2>
                            <p className="text-brand-50 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto opacity-90">
                                No misleading thumbnails. No "Click Here to Download" loops. No hidden fees. Just direct, verified access to official government links and honest information.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 8. CTA */}
                <section className="pt-8 pb-2">
                    <div className="container mx-auto max-w-5xl px-4">
                        <div className="border border-border bg-surface rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-extrabold text-foreground mb-3">Join millions of prepared aspirants</h2>
                                <p className="text-foreground-muted max-w-md mx-auto md:mx-0">
                                    Get instant alerts on your phone the minute a major notification or result is declared. Be the first to know.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
                                <a
                                    href="https://t.me/resultguru247"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-6 py-3.5 text-sm font-bold text-white transition-all shadow-md shadow-brand-500/10 w-full sm:w-auto whitespace-nowrap"
                                >
                                    Join Telegram Channel
                                </a>
                                <a
                                    href="https://whatsapp.com/channel/0029Vb7XUqn1SWt7c9kqCV3I"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-6 py-3.5 text-sm font-bold text-white transition-all shadow-md shadow-brand-500/10 w-full sm:w-auto whitespace-nowrap"
                                >
                                    Join WhatsApp Group
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

            </article>
        </>
    )
}

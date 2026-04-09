import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import {
    FileText, Building2, MapPin, Search, Scale,
    ArrowRight, History, LayoutGrid, GraduationCap,
    Compass, ShieldCheck, Zap, Newspaper, HelpCircle,
    LogIn, UserPlus, KeyRound, Rss, Code2, Tags, Hash,
    Info, ChevronRight,
    Database, Lock
} from 'lucide-react'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

export const metadata = buildPageMetadata({
    title: 'Sitemap - Complete Page Directory',
    description: `Navigate through ${SITE.name} quickly using our complete HTML sitemap. Find all pages including jobs, results, admit cards, states, organizations, and legal pages.`,
    path: '/site-map',
})

export default function SitemapPage() {
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Sitemap', url: `${SITE.url}/site-map` },
    ])

    const SITEMAP_SECTIONS: {
        title: string;
        subtitle: string;
        icon: any;
        accent: string;
        items: { label: string; href: string; icon?: any; badge?: string }[]
    }[] = [
            {
                title: 'Primary Updates',
                subtitle: 'Real-time notifications for the latest recruitment cycle.',
                icon: LayoutGrid,
                accent: 'bg-brand-500',
                items: [
                    { label: 'Sarkari Job Updates', href: ROUTE_PREFIXES.job, badge: 'Daily' },
                    { label: 'Exam Results', href: ROUTE_PREFIXES.result, badge: 'Live' },
                    { label: 'Admit Card Download', href: ROUTE_PREFIXES.admit },
                    { label: 'Official Answer Keys', href: ROUTE_PREFIXES.answer_key },
                    { label: 'Official Notifications', href: ROUTE_PREFIXES.notification },
                    { label: 'Syllabus & Guides', href: ROUTE_PREFIXES.syllabus },
                    { label: 'Exam Patterns', href: ROUTE_PREFIXES.exam_pattern },
                ]
            },
            {
                title: 'Legacy Archives',
                subtitle: 'Essential resources for preparation and historical analysis.',
                icon: History,
                accent: 'bg-amber-500',
                items: [
                    { label: 'Previous Year Papers', href: ROUTE_PREFIXES.previous_paper },
                    { label: 'Cut Off Analytics', href: ROUTE_PREFIXES.cut_off },
                    { label: 'Exam Date Tracker', href: ROUTE_PREFIXES.exam },
                    { label: 'Govt. Schemes (Yojana)', href: ROUTE_PREFIXES.scheme },
                    { label: 'University Admissions', href: ROUTE_PREFIXES.admission },
                    { label: 'Scholarships Hub', href: ROUTE_PREFIXES.scholarship },
                ]
            },
            {
                title: 'Global Exploration',
                subtitle: 'Specialized directories to help you find local and specific updates.',
                icon: Compass,
                accent: 'bg-indigo-500',
                items: [
                    { label: 'State-wise Jobs', href: '/states', icon: MapPin },
                    { label: 'Organization Directory', href: '/organizations', icon: Building2 },
                    { label: 'Qualification Finder', href: '/qualifications', icon: GraduationCap },
                    { label: 'Tags Explorer', href: '/tag', icon: Tags },
                    { label: 'Category Archive', href: '/category', icon: Hash },
                    { label: 'Global Search Hub', href: '/search', icon: Search },
                    { label: 'Web Stories (Visual)', href: '/stories', icon: Zap },
                ]
            },
            {
                title: 'User Access',
                subtitle: 'Secure portals for managing your alerts and account settings.',
                icon: UserPlus,
                accent: 'bg-brand-600',
                items: [
                    { label: 'Member Login', href: '/login', icon: LogIn },
                    { label: 'Create Account', href: '/register', icon: UserPlus },
                    { label: 'Recover Password', href: '/forgot-password', icon: KeyRound },
                    { label: 'Institutional Support', href: '/contact', icon: HelpCircle },
                ]
            },
            {
                title: 'Legal & Trust',
                subtitle: 'The institutional framework and standards of Result Guru.',
                icon: ShieldCheck,
                accent: 'bg-slate-700',
                items: [
                    { label: 'Institutional About', href: '/about', icon: Info },
                    { label: 'Editorial & Ethics', href: '/editorial-policy', icon: Newspaper },
                    { label: 'Privacy Standards', href: '/privacy-policy', icon: Scale },
                    { label: 'Terms of Use', href: '/terms-of-service', icon: Scale },
                    { label: 'Platform Disclaimer', href: '/disclaimer', icon: Scale },
                ]
            },
            {
                title: 'Technical Feeds',
                subtitle: 'Machine-readable exports and development resources.',
                icon: Code2,
                accent: 'bg-orange-500',
                items: [
                    { label: 'RSS News Feed', href: '/feed.xml', icon: Rss },
                    { label: 'XML Standard Sitemap', href: '/sitemap.xml', icon: Code2 },
                    { label: 'HTML Sitemap (Self)', href: '/site-map', icon: Compass },
                ]
            }
        ]

    return (
        <>
            <JsonLd data={breadcrumbJsonLd} />

            {/* 1. Immersive Hero - Reduced for Gazette feel */}
            <header className="relative bg-white border-b border-slate-100 pt-16 pb-12 sm:pt-24 sm:pb-20 dark:bg-slate-950/20 dark:border-white/5 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-500/3 blur-[100px]" />
                    <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent-500/3 blur-[80px]" />
                </div>

                <div className="container relative mx-auto max-w-7xl px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 dark:bg-brand-900/30 dark:border-brand-800/50 mb-6">
                        <Compass className="size-3.5 text-brand-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">The Guru Gazette</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white sm:text-6xl mb-4 tracking-tight">
                        Platform <span className="text-gradient-brand">Directory.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-500 font-medium leading-relaxed dark:text-slate-400">
                        Institutional Navigation for India&apos;s most comprehensive sarkari update ecosystem.
                    </p>
                </div>
            </header>

            <main className="container mx-auto max-w-7xl px-4 py-16 sm:py-24 group/main">
                {/* 2. Gazette Rows */}
                <div className="space-y-0">
                    {SITEMAP_SECTIONS.map((section, idx) => (
                        <section
                            key={section.title}
                            className="group relative border-b border-slate-100 dark:border-white/5 py-12 sm:py-16 transition-all duration-500 hover:z-10 hover:bg-slate-50/50 dark:hover:bg-white/2 group-hover/main:opacity-40 hover:opacity-100!"
                        >
                            <div className="grid gap-12 lg:grid-cols-12 items-start">
                                {/* Left Side: Category Identity */}
                                <div className="lg:col-span-4 space-y-4">
                                    <div className={`inline-flex p-3 rounded-2xl ${section.accent} text-white shadow-lg shadow-${section.accent.split('-')[1]}-500/20`}>
                                        <section.icon className="size-5 stroke-[2.5]" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {section.title}
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                                        {section.subtitle}
                                    </p>
                                </div>

                                {/* Right Side: Dense Multi-column Grid */}
                                <div className="lg:col-span-8 grid sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6">
                                    {section.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="group/link flex items-center justify-between py-2 border-b border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon ? (
                                                    <item.icon className="size-3.5 text-slate-400 group-hover/link:text-brand-600 transition-colors" />
                                                ) : (
                                                    <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-700 group-hover/link:bg-brand-600 transition-all" />
                                                )}
                                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover/link:text-slate-900 dark:group-hover/link:text-white transition-colors">
                                                    {item.label}
                                                </span>
                                            </div>

                                            {item.badge ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md dark:bg-brand-900/30 dark:text-brand-400">
                                                    {item.badge}
                                                </span>
                                            ) : (
                                                <ChevronRight className="size-3 text-slate-300 dark:text-slate-700 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>
            </main>
            {/* Standardized Institutional CTA */}
            <InstitutionalCTA
                badge="Strategic Data Governance"
                title="Exercise Your Privacy Rights."
                description="You have the right to request a copy of your data or its permanent deletion from our alert systems. Our security team responds to all verified requests within 24-48 hours."
                primaryCTA={{ label: "Contact Privacy Officer", href: "mailto:legal@resultguru.co.in" }}
                features={[
                    { icon: Database, label: "Data Portability" },
                    { icon: Lock, label: "Encrypted Storage" }
                ]}
            />
        </>
    )
}

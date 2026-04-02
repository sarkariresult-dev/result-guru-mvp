import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { MAIN_NAV, SITE, ROUTE_PREFIXES } from '@/config/site'
import { 
    FileText, Building2, MapPin, Search, Scale, 
    Bookmark, ArrowRight, History, Hash, ClipboardCheck,
    Users, Shield, Globe, LayoutGrid
} from 'lucide-react'

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

    const SITEMAP_SECTIONS = [
        {
            title: 'Primary Content',
            icon: LayoutGrid,
            items: [
                { label: 'Sarkari Jobs', href: ROUTE_PREFIXES.job, icon: ArrowRight },
                { label: 'Exam Results', href: ROUTE_PREFIXES.result, icon: ArrowRight },
                { label: 'Admit Cards', href: ROUTE_PREFIXES.admit, icon: ArrowRight },
                { label: 'Answer Keys', href: ROUTE_PREFIXES.answer_key, icon: ArrowRight },
                { label: 'Syllabus', href: ROUTE_PREFIXES.syllabus, icon: ArrowRight },
                { label: 'Exam Pattern', href: ROUTE_PREFIXES.exam_pattern, icon: ArrowRight },
            ]
        },
        {
            title: 'Exam Resources',
            icon: History,
            items: [
                { label: 'Previous Papers', href: ROUTE_PREFIXES.previous_paper, icon: ArrowRight },
                { label: 'Cut Off Marks', href: ROUTE_PREFIXES.cut_off, icon: ArrowRight },
                { label: 'Exam Updates', href: ROUTE_PREFIXES.exam, icon: ArrowRight },
                { label: 'Government Schemes', href: ROUTE_PREFIXES.scheme, icon: ArrowRight },
                { label: 'Admissions', href: ROUTE_PREFIXES.admission, icon: ArrowRight },
                { label: 'Scholarships', href: ROUTE_PREFIXES.scholarship, icon: ArrowRight },
            ]
        },
        {
            title: 'Exploration Hubs',
            icon: Search,
            items: [
                { label: 'Explore by State', href: '/states', icon: MapPin },
                { label: 'By Organization', href: '/organizations', icon: Building2 },
                { label: 'Search All Posts', href: '/search', icon: Search },
                { label: 'Web Stories', href: '/stories', icon: FileText },
            ]
        },
        {
            title: 'User & Community',
            icon: Users,
            items: [
                { label: 'About Our Mission', href: '/about', icon: Bookmark },
                { label: 'Support & Social Hub', href: '/contact', icon: Users },
                { label: 'Login / Register', href: '/login', icon: ArrowRight },
                { label: 'Forgot Password', href: '/forgot-password', icon: ArrowRight },
            ]
        },
        {
            title: 'Legal & Trust',
            icon: Shield,
            items: [
                { label: 'Privacy Policy', href: '/privacy-policy', icon: Scale },
                { label: 'Terms of Service', href: '/terms-of-service', icon: Scale },
                { label: 'Disclaimer', href: '/disclaimer', icon: Scale },
            ]
        }
    ]

    return (
        <>
            <JsonLd data={breadcrumbJsonLd} />

            <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-3xl mb-8 sm:mb-10">
                    <Breadcrumb items={[{ label: 'Sitemap' }]} />
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4 sm:mb-6 mt-4 sm:mt-6">
                        Platform <span className="text-brand-600">Directory.</span>
                    </h1>
                    <p className="text-xl text-foreground-muted leading-relaxed">
                        Navigate through {SITE.name}&apos;s entire ecosystem. This comprehensive sitemap helps you find every critical update across 12+ categories.
                    </p>
                </div>

                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {SITEMAP_SECTIONS.map((section) => (
                        <section key={section.title} className="group p-8 rounded-3xl bg-surface border border-border shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400">
                                    <section.icon className="size-6 stroke-[1.5]" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                            </div>
                            <ul className="space-y-4">
                                {section.items.map((item) => (
                                    <li key={item.href}>
                                        <Link 
                                            href={item.href} 
                                            className="group/link flex items-center gap-3 text-foreground-muted hover:text-brand-600 font-medium transition-colors"
                                        >
                                            <item.icon className="size-4 opacity-50 group-hover/link:opacity-100 group-hover/link:translate-x-1 transition-all" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

            </div>
        </>
    )
}

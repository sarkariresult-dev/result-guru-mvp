import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { MAIN_NAV, SITE, ROUTE_PREFIXES } from '@/config/site'
import { FileText, Building2, MapPin, Search, Scale, Bookmark, ArrowRight } from 'lucide-react'

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

    return (
        <>
            <JsonLd data={breadcrumbJsonLd} />

            <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-20 animate-in fade-in duration-500">
                <Breadcrumb items={[{ label: 'Sitemap' }]} />

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6 mt-4">
                    Sitemap
                </h1>
                <p className="text-lg text-foreground-muted mb-12">
                    A quick overview of all the critical pages on {SITE.name}. Use this page to navigate directly to any section.
                </p>

                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    {/* Main Pages */}
                    <section className="space-y-4" aria-labelledby="sitemap-main">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="size-5 text-brand-600" />
                            <h2 id="sitemap-main" className="text-xl font-bold text-foreground">Main Pages</h2>
                        </div>
                        <ul className="space-y-3">
                            {MAIN_NAV.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="group inline-flex items-center gap-2 text-foreground-muted hover:text-brand-600 font-medium transition-colors">
                                        <ArrowRight className="size-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* All Categories */}
                    <section className="space-y-4" aria-labelledby="sitemap-categories">
                        <div className="flex items-center gap-2 mb-2">
                            <Search className="size-5 text-brand-600" />
                            <h2 id="sitemap-categories" className="text-xl font-bold text-foreground">All Categories</h2>
                        </div>
                        <ul className="space-y-3">
                            <li><Link href={ROUTE_PREFIXES.job} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Sarkari Jobs</Link></li>
                            <li><Link href={ROUTE_PREFIXES.result} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Exam Results</Link></li>
                            <li><Link href={ROUTE_PREFIXES.admit} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Admit Cards</Link></li>
                            <li><Link href={ROUTE_PREFIXES.answer_key} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Answer Keys</Link></li>
                            <li><Link href={ROUTE_PREFIXES.syllabus} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Syllabus</Link></li>
                            <li><Link href={ROUTE_PREFIXES.exam_pattern} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Exam Pattern</Link></li>
                            <li><Link href={ROUTE_PREFIXES.cut_off} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Cut Off Marks</Link></li>
                            <li><Link href={ROUTE_PREFIXES.previous_paper} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Previous Papers</Link></li>
                            <li><Link href={ROUTE_PREFIXES.scheme} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Government Schemes</Link></li>
                            <li><Link href={ROUTE_PREFIXES.admission} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Admissions</Link></li>
                            <li><Link href={ROUTE_PREFIXES.notification} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Notifications</Link></li>
                            <li><Link href={ROUTE_PREFIXES.exam} className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Exams</Link></li>
                        </ul>
                    </section>

                    {/* Directories */}
                    <section className="space-y-4" aria-labelledby="sitemap-directories">
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="size-5 text-brand-600" />
                            <h2 id="sitemap-directories" className="text-xl font-bold text-foreground">Directories</h2>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <MapPin className="size-4 text-foreground-subtle" />
                                <Link href="/states" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">State-wise Jobs &amp; Results</Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <Building2 className="size-4 text-foreground-subtle" />
                                <Link href="/organizations" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Recruiting Organizations</Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <Search className="size-4 text-foreground-subtle" />
                                <Link href="/search" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Search Posts</Link>
                            </li>
                        </ul>
                    </section>

                    {/* Tools & Features */}
                    <section className="space-y-4" aria-labelledby="sitemap-tools">
                        <div className="flex items-center gap-2 mb-2">
                            <Bookmark className="size-5 text-brand-600" />
                            <h2 id="sitemap-tools" className="text-xl font-bold text-foreground">Tools &amp; Features</h2>
                        </div>
                        <ul className="space-y-3">
                            <li><Link href="/login" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Login / Register</Link></li>
                            <li><Link href="/search" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Advanced Search</Link></li>
                        </ul>
                    </section>

                    {/* Legal & Support */}
                    <section className="space-y-4" aria-labelledby="sitemap-legal">
                        <div className="flex items-center gap-2 mb-2">
                            <Scale className="size-5 text-brand-600" />
                            <h2 id="sitemap-legal" className="text-xl font-bold text-foreground">Legal &amp; Support</h2>
                        </div>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Contact Us</Link></li>
                            <li><Link href="/privacy-policy" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms-of-service" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Terms of Service</Link></li>
                            <li><Link href="/disclaimer" className="text-foreground-muted hover:text-brand-600 font-medium transition-colors">Disclaimer</Link></li>
                        </ul>
                    </section>
                </div>
            </div>
        </>
    )
}

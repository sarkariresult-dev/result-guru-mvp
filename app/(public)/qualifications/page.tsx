import Link from 'next/link'
import { getQualifications } from '@/lib/queries/taxonomy'
import { buildPageMetadata } from '@/lib/metadata'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { SITE } from '@/config/site'
import { QualsGrid } from '@/components/qualifications/QualsGrid'
import { Building2, Search, MapPin, ArrowRight, GraduationCap } from 'lucide-react'

export const metadata = buildPageMetadata({
    title: 'Qualification-wise Government Jobs & Results',
    description: 'Browse all government jobs, exam results, scholarships, and recruitment updates organized by educational qualification. Find 10th pass, 12th pass, and graduation specific opportunities.',
    path: '/qualifications',
})

export default async function QualificationsDirectoryPage() {
    let quals: Awaited<ReturnType<typeof getQualifications>> = []
    let fetchError = false

    try {
        quals = await getQualifications()
    } catch {
        fetchError = true
    }

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Qualifications', url: `${SITE.url}/qualifications` },
    ])

    /* ItemList JSON-LD */
    const itemListJsonLd = quals.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Educational Qualifications',
        numberOfItems: quals.length,
        itemListElement: quals.map((qual, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE.url}/qualification/${qual.slug}`,
            name: qual.name,
        })),
    } : null

    return (
        <div className="flex flex-col min-h-screen">
            <JsonLd data={itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd} />

            {/* Main Content Area - Delegated to QualsGrid Client Component */}
            <div className="">
                {quals.length > 0 ? (
                    <QualsGrid qualifications={quals} />
                ) : fetchError ? (
                    <div className="container mx-auto max-w-7xl px-4 py-20">
                        <div className="flex min-h-100 flex-col items-center justify-center rounded-3xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-12 text-center">
                            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 shadow-xl shadow-red-500/10">
                                <Search className="size-10 text-red-600" />
                            </div>
                            <h3 className="mb-2 text-2xl font-black text-foreground">Service Interruption</h3>
                            <p className="max-w-sm text-base text-foreground-muted">
                                We are temporarily unable to load the qualification directory. Please check back in a few minutes.
                            </p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-8 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                            >
                                Retry Connection
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="container mx-auto max-w-7xl px-4 py-20">
                        <div className="flex min-h-100 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50/50 p-12 text-center">
                            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xl">
                                <Search className="size-10 text-foreground-subtle" />
                            </div>
                            <h3 className="mb-2 text-2xl font-black text-foreground">No records found</h3>
                            <p className="max-w-sm text-base text-foreground-muted">
                                Our database of career qualifications is currently being updated.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Institutional Mission & Authority Section */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border-t border-border py-24">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 text-accent-600 dark:text-accent-400 text-[10px] font-black uppercase tracking-[0.2em] border border-accent-500/20">
                                Official Verification Mission
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl leading-tight">
                                Our Institutional <br />
                                <span className="text-gradient-brand">Verification Protocol</span>
                            </h2>
                            <p className="text-lg text-foreground-muted leading-relaxed">
                                We map educational criteria to specific notifications from 200+ government organizations. Every job link, result update, and exam notice is cross-referenced with educational gazettes to ensure you never miss an opportunity because of eligibility confusion.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link 
                                    href="/verify"
                                    className="px-8 py-4 rounded-2xl bg-slate-950 dark:bg-white dark:text-slate-950 text-white font-black text-sm hover:scale-105 transition-transform"
                                >
                                    Verification Policy
                                </Link>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 lg:w-1/2">
                            {[
                                {
                                    icon: GraduationCap,
                                    title: 'Academic Mapping',
                                    desc: 'Precise matching of eligibility criteria from official board notifications.',
                                    color: 'text-brand-500',
                                    bg: 'bg-brand-500/10'
                                },
                                {
                                    icon: Search,
                                    title: 'Niche Sourcing',
                                    desc: 'Tracking specialized diplomas, vocations, and trade certificates across India.',
                                    color: 'text-accent-500',
                                    bg: 'bg-accent-500/10'
                                },
                                {
                                    icon: MapPin,
                                    title: 'State Standards',
                                    desc: 'Alignment with diverse state-specific educational boards and equivalencies.',
                                    color: 'text-blue-500',
                                    bg: 'bg-blue-500/10'
                                },
                                {
                                    icon: ArrowRight,
                                    title: 'Instant Sifting',
                                    desc: 'Real-time filtering technology to help you find your exact career match.',
                                    color: 'text-purple-500',
                                    bg: 'bg-purple-500/10'
                                }
                            ].map((feature, i) => (
                                <div 
                                    key={i} 
                                    className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-border shadow-sm hover:border-brand-500/50 transition-all hover:shadow-xl hover:shadow-brand-500/5 group"
                                >
                                    <div className={`size-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                                        <feature.icon className="size-6" />
                                    </div>
                                    <h3 className="text-lg font-black text-foreground mb-3">{feature.title}</h3>
                                    <p className="text-sm text-foreground-muted leading-relaxed font-medium">
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

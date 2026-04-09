import Link from 'next/link'
import { getOrganizations } from '@/lib/queries/organizations'
import { buildPageMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { SITE } from '@/config/site'
import { Building2, MapPin, Search, ServerCrash, ArrowRight } from 'lucide-react'
import { OrgsGrid } from '@/components/organizations/OrgsGrid'

export const metadata = buildPageMetadata({
    title: 'Government Organizations & Recruitment Bodies',
    description: 'Browse all government organizations, recruitment boards, commissions, and examination bodies across India. SSC, UPSC, Railway, Banking, State PSC, and more.',
    path: '/organizations',
})

export default async function OrganizationsDirectoryPage() {
    let organizations: Awaited<ReturnType<typeof getOrganizations>> = []
    let fetchError = false

    try {
        organizations = await getOrganizations()
    } catch {
        fetchError = true
    }

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Organizations', url: `${SITE.url}/organizations` },
    ])

    /* ItemList JSON-LD for orgs directory */
    const itemListJsonLd = organizations.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Government Organizations & Recruitment Bodies',
        numberOfItems: organizations.length,
        itemListElement: organizations.map((org, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE.url}/organizations/${org.slug}`,
            name: org.name,
        })),
    } : null

    return (
        <div className="flex flex-col min-h-screen">
            <JsonLd data={itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd} />


            {/* Main Content Area */}
            <div className="container mx-auto max-w-7xl px-4 py-16">
                {organizations.length > 0 ? (
                    <OrgsGrid organizations={organizations} />
                ) : fetchError ? (
                    <div className="flex min-h-100 flex-col items-center justify-center rounded-3xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-12 text-center">
                        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 shadow-xl shadow-red-500/10">
                            <ServerCrash className="size-10 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-2xl font-black text-foreground">Service Interruption</h3>
                        <p className="max-w-sm text-base text-foreground-muted">
                            We are temporarily unable to load the organization directory. Please check back in a few minutes.
                        </p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-8 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <div className="flex min-h-100 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-slate-50/50 p-12 text-center">
                        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-xl">
                            <Search className="size-10 text-foreground-subtle" />
                        </div>
                        <h3 className="mb-2 text-2xl font-black text-foreground">No records found</h3>
                        <p className="max-w-sm text-base text-foreground-muted">
                            Our database of recruitment bodies is currently being updated.
                        </p>
                    </div>
                )}
            </div>

            {/* Institutional Mission & Authority Section */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border-t border-border py-24">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                                Verified by Result Guru
                            </div>
                            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl leading-tight">
                                Our Institutional <br />
                                <span className="text-emerald-600">Verification Mission</span>
                            </h2>
                            <p className="text-lg text-foreground-muted leading-relaxed">
                                We track over 200+ government organizations daily. Every notification, result, and admit card is cross-verified with official gazettes and digital signatures to ensure absolute accuracy for our candidates.
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
                                    icon: Building2,
                                    title: 'Direct Sourcing',
                                    desc: 'Data harvested directly from official board portals and recruitment servers.',
                                    color: 'text-emerald-500',
                                    bg: 'bg-emerald-500/10'
                                },
                                {
                                    icon: Search,
                                    title: 'Proactive Scouting',
                                    desc: 'Manual verification of every notification cycle by our institutional analysts.',
                                    color: 'text-brand-500',
                                    bg: 'bg-brand-500/10'
                                },
                                {
                                    icon: MapPin,
                                    title: 'Regional Accuracy',
                                    desc: 'Detailed mapping of state-level commissions and their regional jurisdictions.',
                                    color: 'text-blue-500',
                                    bg: 'bg-blue-500/10'
                                },
                                {
                                    icon: ArrowRight,
                                    title: 'Instant Redirect',
                                    desc: 'One-click access to the official board pages for seamless applications.',
                                    color: 'text-purple-500',
                                    bg: 'bg-purple-500/10'
                                }
                            ].map((feature, i) => (
                                <div 
                                    key={i} 
                                    className="p-6 rounded-3xl bg-white dark:bg-slate-950 border border-border shadow-sm hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group"
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

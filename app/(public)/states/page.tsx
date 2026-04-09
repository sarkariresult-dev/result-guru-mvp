import Link from 'next/link'
import { getStates } from '@/lib/queries/states'
import { buildPageMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { SITE } from '@/config/site'
import { MapPin, Search, ServerCrash, ArrowRight, ShieldCheck, Zap, Globe, FileCheck } from 'lucide-react'
import { StatesGrid } from '@/components/states/StatesGrid'

export const metadata = buildPageMetadata({
    title: 'State-wise Government Jobs & Results',
    description: 'Browse all government jobs, exam results, admit cards, and recruitment updates by Indian state and union territory. Find state-specific opportunities across India.',
    path: '/states',
})

export default async function StatesDirectoryPage() {
    let states: Awaited<ReturnType<typeof getStates>> = []
    let fetchError = false

    try {
        states = await getStates()
    } catch {
        fetchError = true
    }

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'States', url: `${SITE.url}/states` },
    ])

    /* ItemList JSON-LD for states directory */
    const itemListJsonLd = states.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Indian States & Union Territories',
        numberOfItems: states.length,
        itemListElement: states.filter(state => state.name).map((state, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE.url}/states/${state.slug}`,
            name: state.name,
        })),
    } : null

    return (
        <>
            <JsonLd data={itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd} />

            <div className="relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
                    <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-brand-400/5 blur-[100px]" />
                </div>

                <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16 relative">
                    <div className="flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <MapPin className="size-3.5" />
                            Official Directories
                        </div>

                        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl max-w-4xl mb-6">
                            Browse Government Jobs <br />
                            <span className="bg-linear-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">State-wise across India</span>
                        </h1>

                        <p className="max-w-2xl text-lg sm:text-xl text-foreground-muted leading-relaxed mb-12">
                            Access real-time exam results, admit cards, and job notifications from all 28 states and 8 union territories on a single platform.
                        </p>
                    </div>

                    {/* Integrated Client-side Grid with Search */}
                    <StatesGrid states={states} />
                </div>
            </div>

            {/* Mission & Verification Authority Section */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border-t border-border py-20">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Right: Feature Cards */}
                        <div className="order-2 lg:order-1 grid sm:grid-cols-2 gap-4">
                            {[
                                {
                                    icon: ShieldCheck,
                                    title: 'Institutional Accuracy',
                                    desc: 'Direct cross-referencing with official state PDF notifications for 100% verified data.',
                                    color: 'text-emerald-500',
                                    bg: 'bg-emerald-500/10'
                                },
                                {
                                    icon: Zap,
                                    title: 'Real-time Feeds',
                                    desc: 'Near-zero latency between official portal announcements and platform updates.',
                                    color: 'text-amber-500',
                                    bg: 'bg-amber-500/10'
                                },
                                {
                                    icon: Globe,
                                    title: 'Pan-India Coverage',
                                    desc: 'Comprehensive directory covering all 28 states and 8 union territories without exception.',
                                    color: 'text-blue-500',
                                    bg: 'bg-blue-500/10'
                                },
                                {
                                    icon: FileCheck,
                                    title: 'Expert Curation',
                                    desc: 'Data verified by a dedicated editorial team specialized in Indian recruitment cycles.',
                                    color: 'text-brand-500',
                                    bg: 'bg-brand-500/10'
                                }
                            ].map((feature, i) => (
                                <div 
                                    key={i} 
                                    className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-border shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className={`size-10 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4`}>
                                        <feature.icon className="size-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                                    <p className="text-sm text-foreground-muted leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Left: Mission Statement */}
                        <div className="order-1 lg:order-2 space-y-8">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400 mb-4">
                                    Why Result Guru?
                                </h2>
                                <h3 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl leading-tight">
                                    The definitive source for <br />
                                    <span className="text-brand-600 dark:text-brand-400 underline decoration-brand-500/30 underline-offset-8">State Government updates.</span>
                                </h3>
                            </div>

                            <p className="text-lg text-foreground-muted leading-relaxed">
                                Our mission is to democratize access to official information. We ensure that a job aspirant in a remote village has the same speed of access to any state notification as someone in a major city.
                            </p>

                            <div className="pt-4 border-t border-border">
                                <p className="text-sm font-medium text-foreground-muted mb-6 flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-emerald-500" />
                                    Verified daily by our expert editorial team.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <Link 
                                        href="/about" 
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20"
                                    >
                                        Learn About Our Policy
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    <Link 
                                        href="/contact" 
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-950 border border-border text-foreground font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                    >
                                        Correction/Report Error
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

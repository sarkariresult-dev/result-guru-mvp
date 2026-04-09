import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE } from '@/config/site'
import { ShieldAlert, Lock, Eye, Server, MessageSquare, ChevronRight, CheckCircle2, Database, Search, Mail } from 'lucide-react'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

export const metadata = buildPageMetadata({
    title: 'Privacy Policy - Your Data & Privacy',
    description: `Privacy Policy for ${SITE.name}. Learn how we collect, use, store, and protect your personal data. We respect your privacy and comply with data protection regulations.`,
    path: '/privacy-policy',
})

export default function PrivacyPolicyPage() {
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Privacy Policy', url: `${SITE.url}/privacy-policy` },
    ])

    return (
        <>
            <JsonLd data={breadcrumbJsonLd} />

            {/* 1. Immersive Brand Hero */}
            <header className="relative bg-slate-50 border-b border-border/50 pt-20 pb-20 sm:pt-32 sm:pb-32 dark:bg-slate-950/20 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
                    <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent-500/5 blur-[100px]" />
                </div>

                <div className="container relative mx-auto max-w-7xl px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 dark:bg-brand-900/30 dark:border-brand-800/50 mb-8">
                        <Lock className="size-3.5 text-brand-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">Data Protection Standard</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground sm:text-6xl mb-6">
                        Privacy <span className="text-gradient-brand">Policy.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-foreground-muted font-medium leading-relaxed">
                        Transparency in how we safeguard your information while you access India&apos;s most trusted job notification ecosystem.
                    </p>
                    <div className="mt-8 text-xs font-bold text-foreground-muted uppercase tracking-widest">
                        Last Updated: March 2026
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl px-4 py-20 sm:py-32">
                {/* 2. Privacy Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-24">
                    {[
                        { icon: Eye, title: 'No Sale', desc: 'We never sell your personal data to third-party advertisers.' },
                        { icon: Server, title: 'Secure Storage', desc: 'Infrastructure hosted on enterprise-grade secure servers.' },
                        { icon: ShieldAlert, title: 'User Rights', desc: 'Full control over your data and subscription preferences.' }
                    ].map((pillar, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-surface border border-border text-center group transition-all hover:border-brand-500/30">
                            <div className="mx-auto size-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 dark:bg-brand-900/30 mb-4 border border-brand-100 dark:border-brand-800">
                                <pillar.icon className="size-6 stroke-2" />
                            </div>
                            <h4 className="font-black text-foreground mb-2">{pillar.title}</h4>
                            <p className="text-xs font-semibold text-foreground-muted leading-relaxed">{pillar.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="prose prose-brand dark:prose-invert max-w-none space-y-20 text-foreground leading-relaxed">
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <h2 className="text-3xl font-black text-foreground mb-8 flex items-center gap-4">
                            <span className="size-1.5 rounded-full bg-brand-600" />
                            1. Information We Collect
                        </h2>
                        <p className="text-lg font-medium text-foreground-muted mb-8 italic">
                            We only collect minimal data required to provide you with verified alerts:
                        </p>
                        <div className="grid gap-4">
                            {[
                                { title: 'Identity & Contact', desc: 'Email address (for job alerts), user-provided names, and preference tags.' },
                                { title: 'Technical Identifiers', desc: 'IP addresses, browser environment, and interaction meta-data for security.' },
                                { title: 'Notification Data', desc: 'Engagement history with government notification links and search queries.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/50 transition-colors hover:bg-white dark:hover:bg-white/10">
                                    <CheckCircle2 className="size-5 text-brand-600 shrink-0 mt-0.5" />
                                    <div>
                                        <b className="text-foreground block mb-1">{item.title}</b>
                                        <span className="text-sm font-medium text-foreground-muted">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <h2 className="text-3xl font-black text-foreground mb-8 flex items-center gap-4">
                            <span className="size-1.5 rounded-full bg-brand-600" />
                            2. Data Utilization Standards
                        </h2>
                        <p className="font-medium text-foreground-muted leading-relaxed">
                            Your personal data is used exclusively to facilitate your search for government jobs and results. This includes:
                        </p>
                        <ul className="list-none pl-0 mt-6 grid gap-4">
                            {[
                                'Delivering requested notification alerts via email or push.',
                                'Optimizing platform performance and server response times.',
                                'Detecting and preventing automated scraping or unauthorized access.',
                                'Internal analytics to improve the &quot;Zero-Noise&quot; delivery system.'
                            ].map((li, i) => (
                                <li key={i} className="flex gap-3 text-sm font-bold text-foreground">
                                    <span className="text-brand-600">•</span>
                                    {li}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <h2 className="text-3xl font-black text-foreground mb-8 flex items-center gap-4">
                            <span className="size-1.5 rounded-full bg-brand-600" />
                            3. Strategic Transparency
                        </h2>
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-4xl p-8 sm:p-12">
                            <h4 className="text-xl font-black text-amber-900 dark:text-amber-400 mb-4 flex items-center gap-3">
                                <ShieldAlert className="size-6" />
                                Third-Party Links Notice
                            </h4>
                            <p className="text-amber-900/80 dark:text-amber-400/80 font-semibold leading-relaxed">
                                {SITE.name} provides direct links to official सरकारी (.gov.in) portals. Once you leave our ecosystem, their respective privacy policies apply. We do not control and are not responsible for the data practices of external government domains.
                            </p>
                        </div>
                    </section>
                </div>
            </main>

            <InstitutionalCTA
                badge="Legal Accountability"
                title="Questions about our Results?"
                description="All information is cross-referenced with official gazettes. If you notice a discrepancy with an official portal, please report it immediately to our verification desk."
                primaryCTA={{ label: "Report Discrepancy", href: "mailto:support@resultguru.co.in" }}
                features={[
                    { icon: Search, label: "Source Verification" },
                    { icon: Mail, label: "Official Support" }
                ]}
                className="mb-24"
            />
        </>
    )
}

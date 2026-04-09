import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE } from '@/config/site'
import { Scale, FileText, Globe, Zap, Ban, ShieldCheck, ChevronRight, MessageSquare, CheckCircle2, Gavel } from 'lucide-react'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

export const metadata = buildPageMetadata({
    title: 'Terms of Service - Usage Agreement',
    description: `Terms of Service for ${SITE.name}. By accessing the website, you agree to these terms and conditions governing the use of our services and content.`,
    path: '/terms-of-service',
})

export default function TermsOfServicePage() {
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Terms of Service', url: `${SITE.url}/terms-of-service` },
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
                        <FileText className="size-3.5 text-brand-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">Institutional Usage Agreement</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground sm:text-6xl mb-6">
                        Terms of <span className="text-gradient-brand">Service.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-foreground-muted font-medium leading-relaxed">
                        The legal framework governing your access and interaction with {SITE.name}&apos;s notification ecosystem.
                    </p>
                    <div className="mt-8 text-xs font-bold text-foreground-muted uppercase tracking-widest">
                        Last Updated: March 2026
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl px-4 py-20 sm:py-32">
                {/* 2. Acceptance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    <div className="p-8 rounded-[2.5rem] bg-surface border border-border group transition-all hover:border-brand-500/30">
                        <div className="size-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 dark:bg-brand-900/30 mb-6 border border-brand-100 dark:border-brand-800 transition-transform group-hover:scale-110">
                            <Scale className="size-6 stroke-[2.5]" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-3">Binding Agreement</h3>
                        <p className="text-foreground-muted leading-relaxed font-medium">
                            By accessing {SITE.name}, you explicitly agree to comply with our institutional protocols and usage terms.
                        </p>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-surface border border-border group transition-all hover:border-brand-500/30">
                        <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 dark:bg-amber-900/30 mb-6 border border-amber-100 dark:border-amber-800 transition-transform group-hover:scale-110">
                            <Globe className="size-6 stroke-[2.5]" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-3">Service Availability</h3>
                        <p className="text-foreground-muted leading-relaxed font-medium">
                            Our &quot;Zero-Noise&quot; services are provided &quot;AS-IS&quot; based on real-time government publication cycles.
                        </p>
                    </div>
                </div>

                <div className="prose prose-brand dark:prose-invert max-w-none space-y-24 text-foreground leading-relaxed">
                    {/* 3. Intellectual Property */}
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-brand-500/30 shrink-0">
                                01
                            </div>
                            <h2 className="text-2xl font-black text-foreground m-0">Intellectual Property Rights</h2>
                        </div>
                        <p className="text-lg font-medium text-foreground-muted mb-6">
                            The design, structure, curation, and logo of {SITE.name} are the property of its respective owners and are protected by applicable copyright and trademark laws.
                        </p>
                        <div className="grid gap-4">
                            {[
                                { title: 'Personal Use Only', desc: 'You are granted a non-exclusive license to access the portal for personal, non-commercial investigation.' },
                                { title: 'No Scraping', desc: 'Automated extraction of data, scraping, or mirroring of our verified lists is strictly prohibited.' },
                                { title: 'Third-Party IP', desc: 'Logo and marks of government departments (SSC, UPSC, etc.) belong to their respective authorities.' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-border/50">
                                    <CheckCircle2 className="size-5 text-brand-600 shrink-0 mt-0.5" />
                                    <div>
                                        <b className="text-foreground block mb-1">{item.title}</b>
                                        <span className="text-sm font-medium text-foreground-muted">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 4. Prohibited Conduct */}
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-brand-500/30 shrink-0">
                                02
                            </div>
                            <h2 className="text-2xl font-black text-foreground m-0">Institutional Conduct Standards</h2>
                        </div>
                        <p className="font-medium text-foreground-muted leading-relaxed mb-8">
                            To maintain the integrity of our platform for millions of students, users are strictly prohibited from:
                        </p>
                        <ul className="list-none pl-0 grid gap-4">
                            {[
                                { icon: Zap, text: 'Engaging in any action that disrupts the technical infrastructure of the platform.' },
                                { icon: ShieldCheck, text: 'Attempting to bypass security protocols or verify users without authorization.' },
                                { icon: Ban, text: 'Disseminating false recruitment rumors using the Result Guru brand identity.' }
                            ].map((li, i) => (
                                <li key={i} className="flex gap-3 text-sm font-bold text-foreground p-4 rounded-xl border border-border/40">
                                    <li.icon className="size-5 text-brand-600 shrink-0" />
                                    {li.text}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 5. Limitation Hub */}
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-brand-500/30 shrink-0">
                                03
                            </div>
                            <h2 className="text-2xl font-black text-foreground m-0">Limitation of Warranties</h2>
                        </div>
                        <p className="font-medium text-foreground-muted leading-relaxed">
                            In no event shall {SITE.name} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {SITE.name}&apos;s website, even if we have been notified orally or in writing of the possibility of such damage.
                        </p>
                    </section>
                </div>
            </main>

            <InstitutionalCTA
                badge="Governance Standard"
                title="Institutional Terms of Use."
                description="By using Result Guru, you agree to our strict verification and conduct guidelines. Ensure you've read our latest data ethics update for aspirants."
                primaryCTA={{ label: "Contact Compliance", href: "mailto:legal@resultguru.co.in" }}
                features={[
                    { icon: Gavel, label: "Fair Use Policy" },
                    { icon: ShieldCheck, label: "Verified Conduct" }
                ]}
                className="mb-24"
            />
        </>
    )
}

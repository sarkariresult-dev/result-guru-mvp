import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE } from '@/config/site'
import { Landmark, ShieldCheck, Search, HelpCircle, CheckCircle2, Info, ChevronRight, Mail, AlertTriangle, Lock } from 'lucide-react'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

export const metadata = buildPageMetadata({
    title: 'Editorial Policy - Accuracy & Trust',
    description: `Editorial and Ethics Policy for ${SITE.name}. Learn about our multi-step verification process, sourcing standards, and commitment to accurate government notification reporting.`,
    path: '/editorial-policy',
})

export default function EditorialPolicyPage() {
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Editorial Policy', url: `${SITE.url}/editorial-policy` },
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
                        <ShieldCheck className="size-3.5 text-brand-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">Institutional Protocol</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground sm:text-6xl mb-6">
                        Editorial & <span className="text-gradient-brand">Ethics Policy.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-foreground-muted font-medium leading-relaxed">
                        The definitive standard for government notification verification and public news integrity in India.
                    </p>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl px-4 py-20 sm:py-32">
                {/* 2. Key Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
                    <div className="group p-8 rounded-[2.5rem] bg-surface border border-border transition-all hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/5">
                        <div className="size-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 dark:bg-brand-900/30 mb-6 border border-brand-100 dark:border-brand-800">
                            <Search className="size-6 stroke-[2.5]" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-3">Sarkari Verification</h3>
                        <p className="text-foreground-muted leading-relaxed font-medium">
                            Every notification, result link, and PDF published on {SITE.name} undergoes a strict human-in-the-loop verification protocol.
                        </p>
                    </div>
                    <div className="group p-8 rounded-[2.5rem] bg-surface border border-border transition-all hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/5">
                        <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 dark:bg-amber-900/30 mb-6 border border-amber-100 dark:border-amber-800">
                            <Landmark className="size-6 stroke-[2.5]" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-3">Official Sourcing</h3>
                        <p className="text-foreground-muted leading-relaxed font-medium">
                            We cross-reference data ONLY with verified .gov.in, .nic.in, or official gazette domains to ensure 100% legal authenticity.
                        </p>
                    </div>
                </div>

                <div className="space-y-24">
                    {/* 3. The Precision Pipeline */}
                    <section id="verification" className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="size-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-brand-500/30">
                                01
                            </div>
                            <h2 className="text-3xl font-black text-foreground tracking-tight">The Precision Pipeline</h2>
                        </div>

                        <div className="prose prose-brand dark:prose-invert max-w-none">
                            <p className="text-lg font-medium leading-relaxed text-foreground-muted mb-8">
                                To eliminate misinterpretation and spread of unverified rumors, {SITE.name} follows a standardized three-tier validation workflow:
                            </p>
                            <div className="grid gap-6">
                                {[
                                    { title: 'Primary Discovery', desc: 'Our automated tracking systems monitor 500+ official Indian government domains for new PDF uploads every 15 minutes.' },
                                    { title: 'Specialist Audit', desc: 'A content expert manually verifies the digital signature, source link, and official authority seal of the notification.' },
                                    { title: 'Editor Cross-Check', desc: 'A senior editor validates key dates (Apply/End), vacancy numbers, and direct application links before the post goes live.' }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-border/50">
                                        <CheckCircle2 className="size-6 text-brand-600 shrink-0 mt-1" />
                                        <div>
                                            <h4 className="font-black text-foreground mb-1">{step.title}</h4>
                                            <p className="text-sm font-medium text-foreground-muted leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 4. Ethics & Transparency */}
                    <section id="ethics" className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="size-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-brand-500/30">
                                02
                            </div>
                            <h2 className="text-3xl font-black text-foreground tracking-tight">Ethics & Transparency</h2>
                        </div>

                        <div className="grid gap-12 sm:grid-cols-2">
                            <div>
                                <h4 className="text-lg font-black text-foreground mb-4">Zero-Noise Guarantee</h4>
                                <p className="text-foreground-muted font-medium leading-relaxed">
                                    We explicitly prohibit clickbait titles or misleading &quot;Breaking news&quot; alerts. If the source government website is down or a link is broken, we clearly label it as &quot;Official link pending&quot; to avoid student confusion.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-foreground mb-4">Anti-Corruption Standard</h4>
                                <p className="text-foreground-muted font-medium leading-relaxed">
                                    {SITE.name} is an independent platform. We do not accept payments to bias any recruitment notice or prioritize private entities over public interests.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            {/* Standardized Institutional CTA */}
            <InstitutionalCTA
                badge="Public Integrity Standard"
                title="Corrections & Complaint Hub."
                description="Despite our rigorous pipeline, official source changes can occur. We are committed to correcting material errors within 4 hours of notification."
                primaryCTA={{ label: "Contact Editorial Team", href: "mailto:support@resultguru.co.in" }}
                features={[
                    { icon: AlertTriangle, label: "Report Data Error" },
                    { icon: Mail, label: "Email Verification" }
                ]}
            />
        </>
    )
}

import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE } from '@/config/site'
import { AlertTriangle, ShieldCheck, Scale, ExternalLink, HelpCircle, ChevronRight, Info, Search, Mail } from 'lucide-react'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

export const metadata = buildPageMetadata({
    title: 'Disclaimer - Important Notice',
    description: `Disclaimer and limitation of liability for ${SITE.name}. We are NOT an official government portal. Read our complete disclaimer before using the website.`,
    path: '/disclaimer',
})

export default function DisclaimerPage() {
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Disclaimer', url: `${SITE.url}/disclaimer` },
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 dark:bg-amber-900/30 dark:border-amber-800/50 mb-8">
                        <AlertTriangle className="size-3.5 text-amber-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Legal Limitation Notice</span>
                    </div>
                    <h1 className="text-4xl font-black text-foreground sm:text-6xl mb-6">
                        Official <span className="text-gradient-brand">Disclaimer.</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-foreground-muted font-medium leading-relaxed">
                        Essential information regarding our private status and the limitations of our notification services.
                    </p>
                    <div className="mt-8 text-xs font-bold text-foreground-muted uppercase tracking-widest">
                        Last Updated: March 2026
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl px-4 py-20 sm:py-32">
                {/* 2. Primary Warning Hub */}
                <div className="p-8 sm:p-12 rounded-[2.5rem] bg-amber-50 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20 mb-20">
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                        <div className="size-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 dark:bg-amber-900/30">
                            <Scale className="size-8 stroke-[2.5]" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-amber-900 dark:text-amber-400 mb-4">Non-Governmental Status</h3>
                            <p className="text-amber-900/80 dark:text-amber-500 font-bold leading-relaxed text-lg">
                                {SITE.name} is a privately owned platform. We are NOT an official government website, agency, or department.
                                We are not affiliated with the Staff Selection Commission (SSC), UPSC, or any State PSC.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="prose prose-brand dark:prose-invert max-w-none space-y-24 text-foreground leading-relaxed">
                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <h2 className="text-3xl font-black text-foreground mb-10 flex items-center gap-4">
                            <Info className="size-8 text-brand-600" />
                            1. Accuracy & Verification
                        </h2>
                        <div className="grid gap-6">
                            <p className="text-lg font-medium text-foreground-muted">
                                While our editorial team follows a 3-step verification pipeline to ensure the accuracy of notifications, {SITE.name} makes no warranties about the completeness or reliability of the information provided.
                            </p>
                            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-border/50">
                                <b className="text-foreground block mb-2 underline decoration-brand-500/30 underline-offset-4">Mandatory Verification Required:</b>
                                <p className="text-sm font-semibold text-foreground-muted">
                                    All candidates and aspirants are strictly advised to cross-verify every notification, vacancy detail, and admit card link with the official notification published in the Employment News or the official department website before applying.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <h2 className="text-3xl font-black text-foreground mb-10 flex items-center gap-4">
                            <ExternalLink className="size-8 text-brand-600" />
                            2. External Content Links
                        </h2>
                        <p className="font-medium text-foreground-muted leading-relaxed">
                            Our platform contains links to official government portals (.gov.in, .nic.in). We maintain zero control over the nature, content, and availability of these third-party sites. The inclusion of these links is for accessibility purposes only and does not imply an endorsement of the views expressed within them.
                        </p>
                    </section>

                    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <h2 className="text-3xl font-black text-foreground mb-10 flex items-center gap-4">
                            <ShieldCheck className="size-8 text-brand-600" />
                            3. Limitation of Liability
                        </h2>
                        <p className="font-medium text-foreground-muted leading-relaxed">
                            In no event will {SITE.name} be liable for any loss or damage (including without limitation, indirect or consequential loss) arising from the use of data on this platform. This includes, but is not limited to, missed application deadlines, incorrect vacancy interpretations, or technical errors in external redirect links.
                        </p>
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

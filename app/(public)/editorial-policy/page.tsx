import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE } from '@/config/site'
import { Landmark, ShieldCheck, Search, HelpCircle } from 'lucide-react'

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

            <article className="container mx-auto max-w-4xl px-4 py-12 sm:py-20 animate-in fade-in duration-500">
                <Breadcrumb items={[{ label: 'Editorial Policy' }]} />

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6 mt-4">
                    Editorial & Ethics Policy
                </h1>
                <p className="text-foreground-muted mb-12 text-lg">
                    At {SITE.name}, we understand that for millions of students and job seekers in India, accuracy is everything. 
                    Our mission is to provideverified, real-time government job updates and examination results. This policy outlines 
                    how we maintain the highest standards of reliability.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    <div className="p-6 rounded-2xl bg-brand-50/50 border border-brand-100 dark:bg-brand-900/10 dark:border-brand-900/20">
                        <Search className="size-8 text-brand-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Rigorous Verification</h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                            Every single notification, admit card link, and result published on our platform goes through a 3-step human verification process.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20">
                        <ShieldCheck className="size-8 text-emerald-600 mb-4" />
                        <h3 className="font-bold text-lg mb-2">Original Sourcing</h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                            We ONLY source data from official government (.gov.in, .nic.in, .ac.in) portals and gazette notifications.
                        </p>
                    </div>
                </div>

                <div className="prose prose-brand dark:prose-invert max-w-none space-y-12 text-foreground leading-relaxed">
                    <section id="verification">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <Landmark className="size-8 text-brand-600" />
                            1. Our Verification Process
                        </h2>
                        <p>
                            To ensure the information you receive is 100% accurate, {SITE.name} follows a strict protocol:
                        </p>
                        <ul className="list-disc pl-6 space-y-3">
                            <li><strong>Step 1: Primary Source Discovery</strong> - Our specialized tracking systems monitor over 500+ official Indian government domains for new PDF uploads.</li>
                            <li><strong>Step 2: Authenticity Check</strong> - Content specialists verify the digital signature or official seal on the notification PDF.</li>
                            <li><strong>Step 3: Data Extraction</strong> - Accurate key dates, vacancy numbers, and application links are extracted and cross-checked by a second editor.</li>
                        </ul>
                    </section>

                    <section id="ethics">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
                             Ethics & Transparency
                        </h2>
                        <p>
                            We hold ourselves to the highest ethical standards in digital publishing:
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-bold text-lg">Independency & Fairness</h4>
                                <p className="text-foreground-muted">
                                    {SITE.name} is an independent platform. We are not affiliated with any government department. Our content is objective and focused strictly on presenting official facts.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">No "Clickbait" Policy</h4>
                                <p className="text-foreground-muted">
                                    We prohibit the use of sensationalist or misleading headlines. We prioritize the "Sarkari Result" format which is factual and direct.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Corruption Prevention</h4>
                                <p className="text-foreground-muted">
                                    We do not accept payments to promote specific private coaching centers or institutions within our primary news feed. Any sponsored content is explicitly labeled.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section id="corrections">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <HelpCircle className="size-8 text-brand-600" />
                            Corrections & Complaints
                        </h2>
                        <p>
                            Despite our best efforts, errors may occur due to changes at the official source level. We are committed to correcting material errors promptly.
                        </p>
                        <p>
                            If you find a discrepancy in a last date, vacancy number, or link, please contact our Editorial Team immediately at:
                            <br />
                            <a href="mailto:editorial@resultguru.co.in" className="text-brand-600 font-bold hover:underline">editorial@resultguru.co.in</a>
                        </p>
                    </section>
                </div>
            </article>
        </>
    )
}

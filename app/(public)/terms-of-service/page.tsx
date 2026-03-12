import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE } from '@/config/site'

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

            <article className="container mx-auto max-w-4xl px-4 py-12 sm:py-20 animate-in fade-in duration-500">
                <Breadcrumb items={[{ label: 'Terms of Service' }]} />

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6 mt-4">
                    Terms of Service
                </h1>
                <p className="text-foreground-muted mb-8">Last updated: March 2026</p>

                <div className="prose prose-brand dark:prose-invert max-w-none space-y-8 text-foreground leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using {SITE.name} (the &quot;Website&quot;), you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                        <p>
                            {SITE.name} provides users with access to a rich collection of resources, including various job notifications, examination results, educational information, and related content (the &quot;Service&quot;). You understand and agree that the Service is provided &quot;AS-IS&quot; and that {SITE.name} assumes no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Informational Purposes Only</h2>
                        <p>
                            The information provided on this Website is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the Website or the information contained on it.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
                        <p>You agree to not use the Service to:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Upload or transmit any content that is unlawful, harmful, threatening, abusive, or invasive of another&apos;s privacy.</li>
                            <li>Impersonate any person or entity or misrepresent your affiliation with a person or entity.</li>
                            <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Modifications to Service</h2>
                        <p>
                            {SITE.name} reserves the right at any time to modify or discontinue, temporarily or permanently, the Service with or without notice. You agree that {SITE.name} shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. External Links</h2>
                        <p>
                            The Service may provide links to other websites or resources. Because {SITE.name} has no control over such sites and resources, you acknowledge and agree that {SITE.name} is not responsible for the availability of such external sites or resources, and does not endorse and is not responsible for any content or materials available from such sites.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">7. Contact Information</h2>
                        <p>
                            For any legal inquiries or questions regarding these Terms of Service, please contact us at:{' '}
                            <a href="mailto:legal@resultguru.co.in" className="text-brand-600 hover:underline">legal@resultguru.co.in</a>
                        </p>
                    </section>
                </div>
            </article>
        </>
    )
}

import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE } from '@/config/site'

export const metadata = buildPageMetadata({
    title: 'Disclaimer — Important Notice',
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

            <article className="container mx-auto max-w-4xl px-4 py-12 sm:py-20 animate-in fade-in duration-500">
                <Breadcrumb items={[{ label: 'Disclaimer' }]} />

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6 mt-4">
                    Disclaimer
                </h1>
                <p className="text-foreground-muted mb-8">Last updated: March 2026</p>

                <div className="prose prose-brand dark:prose-invert max-w-none space-y-8 text-foreground leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold mb-4">1. Not an Official Government Portal</h2>
                    <p>
                        <strong>{SITE.name} is a privately owned and operated platform. We are NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with any Government organization, agency, or department.</strong>
                    </p>
                    <p>
                        The official information, notifications, results, and other details are sourced from public domains, employment newspapers, and official government recruitment websites. We aggregate this information solely to make it more accessible to students and job seekers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">2. Accuracy of Information</h2>
                    <p>
                        While we strive to provide accurate and up-to-date information, the contents on this website are for general information purposes only. {SITE.name} makes no representations or warranties of any kind about the completeness, accuracy, reliability, or availability of the information provided.
                    </p>
                    <p>
                        Any reliance you place on such information is strictly at your own risk. We strongly advise users to verify all details directly with the official websites of the respective organizations before making any decisions.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">3. External Links</h2>
                    <p>
                        Through this website, you are able to link to other websites which are not under the control of {SITE.name}. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">4. Limitation of Liability</h2>
                    <p>
                        In no event will {SITE.name} be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
                    </p>
                </section>
            </div>
        </article>
        </>
    )
}

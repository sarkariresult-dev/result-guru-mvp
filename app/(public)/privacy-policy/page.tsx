import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE } from '@/config/site'

export const metadata = buildPageMetadata({
    title: 'Privacy Policy — Your Data & Privacy',
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

            <article className="container mx-auto max-w-4xl px-4 py-12 sm:py-20 animate-in fade-in duration-500">
                <Breadcrumb items={[{ label: 'Privacy Policy' }]} />

                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6 mt-4">
                    Privacy Policy
                </h1>
                <p className="text-foreground-muted mb-8">Last updated: March 2026</p>

                <div className="prose prose-brand dark:prose-invert max-w-none space-y-8 text-foreground leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                        <p>
                            Welcome to {SITE.name}. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website
                            and tell you about your privacy rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. The Data We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                            <li><strong>Technical Data:</strong> includes IP address, browser type and version, time zone setting and location.</li>
                            <li><strong>Usage Data:</strong> includes information about how you use our website and services.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>To present our Website and its contents to you.</li>
                            <li>To provide you with information, products, or services that you request from us (like job alerts).</li>
                            <li>To notify you about changes to our Website or any products or services we offer.</li>
                            <li>To improve our website, products/services, marketing, customer relationships and experiences.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Cookies</h2>
                        <p>
                            Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site. You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Third-Party Links</h2>
                        <p>
                            This website may include links to third-party websites, plug-ins and applications (such as official government portals). Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us at:{' '}
                            <a href="mailto:legal@resultguru.co.in" className="text-brand-600 hover:underline">legal@resultguru.co.in</a>
                        </p>
                    </section>
                </div>
            </article>
        </>
    )
}

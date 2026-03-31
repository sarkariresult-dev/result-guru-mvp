import Link from 'next/link'
import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE } from '@/config/site'
import { Mail, MapPin, HelpCircle, Clock } from 'lucide-react'

export const metadata = buildPageMetadata({
    title: 'Contact Us - Support & Inquiries',
    description: `Get in touch with the ${SITE.name} team for support, partnerships, advertising, feedback, or corrections. We typically reply within 24-48 hours.`,
    path: '/contact',
})

export default function ContactPage() {
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Contact Us', url: `${SITE.url}/contact` },
    ])

    const contactJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: `Contact ${SITE.name}`,
        url: `${SITE.url}/contact`,
        mainEntity: {
            '@type': 'Organization',
            name: SITE.name,
            url: SITE.url,
            email: 'support@resultguru.co.in',
            contactPoint: [
                {
                    '@type': 'ContactPoint',
                    email: 'support@resultguru.co.in',
                    contactType: 'customer support',
                    areaServed: 'IN',
                    availableLanguage: ['English', 'Hindi'],
                },
                {
                    '@type': 'ContactPoint',
                    email: 'ads@resultguru.co.in',
                    contactType: 'sales',
                    areaServed: 'IN',
                },
            ],
        },
    }

    return (
        <>
            <JsonLd data={[breadcrumbJsonLd, contactJsonLd]} />

            <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-20 animate-in fade-in duration-500">
                <Breadcrumb items={[{ label: 'Contact Us' }]} />

                <div className="mx-auto max-w-3xl text-center mb-16 mt-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-4">
                        Get in <span className="text-brand-600">Touch</span>
                    </h1>
                    <p className="text-lg text-foreground-muted">
                        Have a question, suggestion, or partnership inquiry? We&apos;d love to hear from you.
                    </p>
                </div>

                <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-5 bg-surface border border-border rounded-3xl shadow-sm overflow-hidden">
                    {/* Contact Info Sidebar */}
                    <div className="lg:col-span-2 bg-brand-50 dark:bg-brand-950/20 p-8 sm:p-12 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 rounded-lg bg-brand-100 dark:bg-brand-900/50 p-2 text-brand-600 dark:text-brand-400">
                                        <Mail className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Email Us</h3>
                                        <p className="mt-1 text-sm text-foreground-muted mb-1">For general queries &amp; support:</p>
                                        <a href="mailto:support@resultguru.co.in" className="text-brand-600 font-medium hover:underline">
                                            support@resultguru.co.in
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 rounded-lg bg-brand-100 dark:bg-brand-900/50 p-2 text-brand-600 dark:text-brand-400">
                                        <HelpCircle className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Advertising</h3>
                                        <p className="mt-1 text-sm text-foreground-muted mb-1">For promotion &amp; collaborations:</p>
                                        <a href="mailto:ads@resultguru.co.in" className="text-brand-600 font-medium hover:underline">
                                            ads@resultguru.co.in
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 rounded-lg bg-brand-100 dark:bg-brand-900/50 p-2 text-brand-600 dark:text-brand-400">
                                        <MapPin className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">HQ</h3>
                                        <p className="mt-1 text-sm text-foreground-muted leading-relaxed">
                                            {SITE.name} Digital Team<br />
                                            New Delhi, India
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="mt-1 rounded-lg bg-brand-100 dark:bg-brand-900/50 p-2 text-brand-600 dark:text-brand-400">
                                        <Clock className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Response Time</h3>
                                        <p className="mt-1 text-sm text-foreground-muted leading-relaxed">
                                            We typically reply within 24-48 hours on business days.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-brand-200 dark:border-brand-800">
                            <p className="text-sm text-foreground-muted">
                                Follow us on our social networks for real-time updates!
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3 p-8 sm:p-12">
                        <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
                        <form className="space-y-6" action={`mailto:support@resultguru.co.in`} method="POST" encType="text/plain">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="contact-first-name" className="text-sm font-medium text-foreground">First Name</label>
                                    <input
                                        type="text"
                                        id="contact-first-name"
                                        name="first-name"
                                        autoComplete="given-name"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                        placeholder="Rahul"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="contact-last-name" className="text-sm font-medium text-foreground">Last Name</label>
                                    <input
                                        type="text"
                                        id="contact-last-name"
                                        name="last-name"
                                        autoComplete="family-name"
                                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                        placeholder="Sharma"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="contact-email"
                                    name="email"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                    placeholder="rahul@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact-subject" className="text-sm font-medium text-foreground">Subject</label>
                                <select
                                    id="contact-subject"
                                    name="subject"
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="advertising">Advertising</option>
                                    <option value="feedback">Feedback / Suggestion</option>
                                    <option value="correction">Report a Correction</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                                    Message <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    rows={5}
                                    required
                                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                                    placeholder="How can we help you today?"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                            >
                                Send Message
                            </button>
                            <p className="text-xs text-center text-foreground-muted">
                                We typically reply within 24-48 hours. By submitting this form, you agree to our{' '}
                                <Link href="/privacy-policy" className="text-brand-600 hover:underline">privacy policy</Link>.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

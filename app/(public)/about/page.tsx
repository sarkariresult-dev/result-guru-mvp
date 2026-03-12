import { buildPageMetadata } from '@/lib/metadata'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE } from '@/config/site'
import { ShieldCheck, Target, Zap, Users, BarChart2, Clock, Globe } from 'lucide-react'

export const metadata = buildPageMetadata({
    title: 'About Us - Our Mission & Values',
    description: `Learn about ${SITE.name}, India's trusted platform for Sarkari Jobs, Exam Results, Admit Cards, and Government Schemes. Our mission, values, and what makes us different.`,
    path: '/about',
})

export default function AboutPage() {
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'About Us', url: `${SITE.url}/about` },
    ])

    const aboutJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: `About ${SITE.name}`,
        description: `${SITE.name} is India's trusted platform for government job notifications, exam results, and recruitment updates.`,
        url: `${SITE.url}/about`,
        mainEntity: {
            '@type': 'Organization',
            name: SITE.name,
            url: SITE.url,
            description: 'India\'s trusted platform for Sarkari Jobs, Exam Results, Admit Cards, and Government Schemes.',
            foundingDate: '2025',
            areaServed: { '@type': 'Country', name: 'India' },
        },
    }

    return (
        <>
            <JsonLd data={[breadcrumbJsonLd, aboutJsonLd]} />

            <article className="container mx-auto max-w-7xl px-4 py-12 sm:py-20 animate-in fade-in duration-500">
                <Breadcrumb items={[{ label: 'About Us' }]} />

                {/* Hero */}
                <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-24 mt-4">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
                        About <span className="text-brand-600">{SITE.name}</span>
                    </h1>
                    <p className="text-lg leading-relaxed text-foreground-muted sm:text-xl">
                        We are dedicated to providing the fastest, most accurate, and reliable updates on Sarkari Jobs, Exam Results, Admit Cards, and Government Schemes across India.
                    </p>

                    {/* Quick stats */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-foreground-subtle">
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="size-4 text-brand-600" /> Updated Daily
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <Globe className="size-4 text-brand-600" /> All India Coverage
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <BarChart2 className="size-4 text-brand-600" /> 100% Free
                        </span>
                    </div>
                </div>

                {/* Core Values */}
                <section aria-labelledby="values-heading" className="mb-20">
                    <h2 id="values-heading" className="sr-only">Our Core Values</h2>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            { icon: Zap, title: 'Lightning Fast', desc: 'We push notifications and updates the second official organizations release them. Never miss a deadline again.' },
                            { icon: ShieldCheck, title: '100% Authentic', desc: 'Every piece of information is strictly verified against official government portals before publication.' },
                            { icon: Target, title: 'Highly Organized', desc: 'Say goodbye to cluttered job boards. We categorize updates neatly by State, Qualification, and Organization.' },
                            { icon: Users, title: 'Community First', desc: 'We build tools to empower students, making it incredibly easy to track applications and syllabus materials.' },
                        ].map((item) => {
                            const Icon = item.icon
                            return (
                                <div key={item.title} className="rounded-2xl border border-border bg-surface p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                    <div className="mb-5 inline-flex size-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                                        <Icon className="size-7" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-foreground">{item.title}</h3>
                                    <p className="text-foreground-muted leading-relaxed">{item.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Mission */}
                <section aria-labelledby="mission-heading">
                    <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">
                        <div className="grid md:grid-cols-2">
                            <div className="bg-brand-50 dark:bg-brand-950/20 p-8 sm:p-12 flex flex-col justify-center">
                                <h2 id="mission-heading" className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                                <p className="text-foreground-muted leading-relaxed mb-6">
                                    Millions of students across India prepare for government examinations every year. The process is tough, but finding the right information at the right time shouldn&apos;t be.
                                </p>
                                <p className="text-foreground-muted leading-relaxed">
                                    <strong>{SITE.name}</strong> was built to solve the fragmentation of information. We centralize everything into one beautiful, easy-to-use platform so you can focus on what actually matters - your preparation.
                                </p>
                            </div>
                            <div className="bg-background-subtle p-8 sm:p-12 flex items-center justify-center min-h-75">
                                <div className="text-center">
                                    <div className="inline-block rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900 border border-border rotate-3">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <ShieldCheck className="size-5 text-green-600" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-sm font-bold">New Notification</div>
                                                <div className="text-xs text-foreground-muted">SSC CGL 2026 Out Now</div>
                                            </div>
                                        </div>
                                        <div className="h-2 w-32 bg-background-muted rounded-full mb-2 mx-auto" />
                                        <div className="h-2 w-24 bg-background-muted rounded-full mx-auto" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </article>
        </>
    )
}

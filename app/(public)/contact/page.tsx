
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE } from '@/config/site'
import { Clock, MessageSquare, Shield, LifeBuoy, Megaphone, ArrowUpRight, Mail, CheckCircle2, Share2, Globe, Calendar, Users, ChevronRight } from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata = buildPageMetadata({
    title: 'Support & Social Hub - Contact Us',
    description: `Get 24/7 verified support and join India's most trusted student community for government job updates.`,
    path: '/contact',
})

export default function ContactPage() {
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Support & Social Hub', url: `${SITE.url}/contact` },
    ])

    const contactJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: `Support & Social Hub - Contact ${SITE.name}`,
        description: `Get 24/7 verified support and join India's most trusted student community for government job updates.`,
        url: `${SITE.url}/contact`,
    }

    const SOCIAL_CHANNELS = [
        {
            name: 'Telegram Community',
            handle: '@resultguru247',
            href: 'https://t.me/resultguru247',
            icon: MessageSquare,
            description: 'Join 50K+ students for lightning-fast result alerts & job notifications.',
            color: 'text-[#0088cc]',
            bg: 'bg-[#0088cc]/10',
            borderColor: 'hover:border-[#0088cc]/50',
            btnLabel: 'Join Telegram',
        },
        {
            name: 'WhatsApp Channel',
            handle: 'Result Guru Official',
            href: 'https://whatsapp.com/channel/0029Vb7XUqn1SWt7c9kqCV3I',
            icon: Share2,
            description: 'Zero ads, pure updates. Get verified news directly on your WhatsApp Status.',
            color: 'text-[#25D366]',
            bg: 'bg-[#25D366]/10',
            borderColor: 'hover:border-[#25D366]/50',
            btnLabel: 'Follow Channel',
        },
    ]

    const SUPPORT_CHANNELS = [
        {
            title: 'Technical Support',
            email: 'support@resultguru.co.in',
            icon: LifeBuoy,
            description: 'Login issues, account settings, or bug reports.',
        },
        {
            title: 'Advertising & Partners',
            email: 'ads@resultguru.co.in',
            icon: Megaphone,
            description: 'Promotions, collaborations, and media inquiries.',
        },
        {
            title: 'Legal & Privacy',
            email: 'legal@resultguru.co.in',
            icon: Shield,
            description: 'DMCA, data requests, or reporting misinformation.',
        },
    ]

    const FAQS = [
        {
            q: "When will the specific result/admit card come?",
            a: "Result dates are set by official commissions (SSC, UPSC, etc.). We scan official sources every 15 minutes and will notify you the exact second information is live."
        },
        {
            q: "Is Result Guru an official government website?",
            a: "No. We are an independent news platform. We aggregate data from official gazettes and portals to provide a better experience for students."
        },
        {
            q: "Found a broken link or an error?",
            a: "We strive for 100% accuracy. If you spot a mistake, please email our support team with the URL. We usually fix errors within 4 hours."
        },
        {
            q: "How can I stop receiving notifications?",
            a: "You can manage your Telegram/WhatsApp alert settings directly in the apps, or visit your account dashboard to control web-push settings."
        }
    ]

    return (
        <>
            <JsonLd data={[breadcrumbJsonLd, contactJsonLd]} />

            {/* Professional Header */}
            <header className="border-b border-border bg-surface-subtle pt-4 pb-12 sm:pt-6 sm:pb-20">
                <div className="container mx-auto max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Breadcrumb items={[{ label: 'Support & Social Hub' }]} />

                    <div className="mx-auto max-w-4xl text-center mt-6 sm:mt-10">
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-fluid-4xl lg:text-7xl mb-4 sm:mb-6">
                            We&apos;re here to <br /> help you <br className="hidden sm:block" />
                            <span className="text-brand-600 inline-block">succeed in your mission.</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-foreground-muted leading-relaxed">
                            Join our 24/7 student support ecosystem or reach out to our dedicated teams. We maintain the zero-error standard for India&apos;s most trusted job portal.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-foreground-subtle">
                            <span className="flex items-center gap-2">
                                <Clock className="size-5 text-brand-500" />
                                24/7 Monitoring
                            </span>
                            <span className="flex items-center gap-2">
                                <LifeBuoy className="size-5 text-emerald-500" />
                                Dedicated Helpdesk
                            </span>
                            <span className="flex items-center gap-2">
                                <Users className="size-5 text-amber-500" />
                                100K+ Student Community
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Business Support Grid */}
            <div className="bg-surface-subtle py-20">
                <div className="container mx-auto max-w-7xl px-4 text-center">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Business & Partnerships</h2>
                    <p className="text-foreground-muted max-w-2xl mx-auto mb-16 px-4">
                        For official communication, please use our professional email channels.
                    </p>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {SUPPORT_CHANNELS.map((item) => (
                            <div key={item.title} className="bg-surface border border-border p-8 rounded-2xl flex flex-col items-center group transition-all hover:bg-surface-subtle">
                                <div className="p-4 rounded-full bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                                    <item.icon className="size-7 stroke-[1.5]" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                                <p className="text-sm text-foreground-subtle mb-6">{item.description}</p>
                                <a
                                    href={`mailto:${item.email}`}
                                    className="flex items-center gap-3 px-6 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-background transition-all hover:border-brand-500/50"
                                >
                                    <Mail className="size-4 opacity-50" />
                                    <span>{item.email}</span>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Community Growth Section */}
            <div className="container mx-auto max-w-7xl px-4 py-16 sm:py-24">
                <div className="grid gap-6 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
                    {SOCIAL_CHANNELS.map((channel) => (
                        <div
                            key={channel.name}
                            className={`group bg-surface border border-border p-8 rounded-3xl shadow-lg transition-all duration-300 ${channel.borderColor} hover:shadow-2xl`}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-2xl ${channel.bg} ${channel.color}`}>
                                    <channel.icon className="size-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-foreground">{channel.name}</h3>
                                    <span className="text-sm font-medium text-foreground-subtle opacity-70">{channel.handle}</span>
                                </div>
                            </div>
                            <p className="text-foreground-muted mb-8 text-lg min-h-14">
                                {channel.description}
                            </p>
                            <a
                                href={channel.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold transition-all bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/10"
                            >
                                {channel.btnLabel}
                                <ArrowUpRight className="size-4 opacity-70" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>


            {/* Trust & Availability Banner */}
            <div className="container mx-auto max-w-7xl px-4 py-16 sm:py-24">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex flex-col items-center p-6 text-center">
                        <Clock className="size-8 text-brand-600 mb-4 opacity-80" />
                        <h4 className="font-bold text-foreground">Response SLA</h4>
                        <p className="text-sm text-foreground-muted mt-1">&lt; 12 Hours Avg. Response</p>
                    </div>
                    <div className="flex flex-col items-center p-6 text-center">
                        <Globe className="size-8 text-brand-600 mb-4 opacity-80" />
                        <h4 className="font-bold text-foreground">Headquarters</h4>
                        <p className="text-sm text-foreground-muted mt-1">New Delhi, India</p>
                    </div>
                    <div className="flex flex-col items-center p-6 text-center">
                        <Calendar className="size-8 text-brand-600 mb-4 opacity-80" />
                        <h4 className="font-bold text-foreground">Operating Hours</h4>
                        <p className="text-sm text-foreground-muted mt-1">Mon - Sat (9 AM - 7 PM)</p>
                    </div>
                    <div className="flex flex-col items-center p-6 text-center">
                        <CheckCircle2 className="size-8 text-brand-600 mb-4 opacity-80" />
                        <h4 className="font-bold text-foreground">Languages</h4>
                        <p className="text-sm text-foreground-muted mt-1">English & Hindi Support</p>
                    </div>
                </div>
            </div>

            {/* Smart FAQ Section */}
            <div className="container mx-auto max-w-4xl px-4 py-20 sm:py-32">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-foreground mb-4">Quick Solutions</h2>
                    <p className="text-foreground-muted">Save time by checking these frequent inquiries first.</p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2">
                    {FAQS.map((faq, i) => (
                        <div key={i} className="flex gap-4 p-6 rounded-2xl bg-surface border border-transparent hover:border-border transition-colors">
                            <div className="shrink-0 size-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                                {i + 1}
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground mb-2 leading-snug">{faq.q}</h4>
                                <p className="text-sm text-foreground-muted leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Report Section */}
                <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-surface border border-border text-center overflow-hidden relative">
                    <div className="relative z-10">
                        <div className="inline-flex py-1 px-3 rounded-full bg-brand-50 dark:bg-brand-900/30 text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-widest mb-6 border border-brand-100 dark:border-brand-800/30">
                            Accuracy Matters
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 max-w-xl mx-auto">
                            Spotted a broken link or false information? We Fix It <span className="text-brand-600">Fast.</span>
                        </h3>
                        <p className="text-foreground-muted mb-8 max-w-xl mx-auto">
                            Help us maintain the zero-error standard of India&apos;s most trusted job portal.
                        </p>
                        <a
                            href="mailto:support@resultguru.co.in"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-700 transition-all hover:gap-4 shadow-lg shadow-brand-500/20"
                        >
                            Report a Correction
                            <ChevronRight className="size-5" />
                        </a>
                    </div>
                </div>
            </div>
        </>
    )
}

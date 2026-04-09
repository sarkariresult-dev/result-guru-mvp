
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { SITE } from '@/config/site'
import { Clock, MessageSquare, Shield, LifeBuoy, Megaphone, ArrowUpRight, Mail, CheckCircle2, Share2, Globe, Calendar, Users, ChevronRight, Inbox } from 'lucide-react'
import { buildPageMetadata } from '@/lib/metadata'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'

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
            title: 'General Inquiries',
            email: 'hello@resultguru.co.in',
            icon: Inbox,
            description: 'General feedback, partner outreach, or platform questions.',
        },
        {
            title: 'Candidate Support',
            email: 'support@resultguru.co.in',
            icon: LifeBuoy,
            description: 'Login issues, notification settings, or data correction reports.',
        },
        {
            title: 'Advertising & Media',
            email: 'ads@resultguru.co.in',
            icon: Megaphone,
            description: 'Promotions, brand collaborations, and media inquiries.',
        },
        {
            title: 'Legal & Governance',
            email: 'legal@resultguru.co.in',
            icon: Shield,
            description: 'DMCA, data requests, or privacy related inquiries.',
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
            <header className="relative bg-slate-50 border-b border-border/50 pt-6 pb-12 sm:pt-10 sm:pb-24 dark:bg-slate-950/20">
                {/* Background Decorative Element */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px]" />
                    <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-accent-500/5 blur-[100px]" />
                </div>

                <div className="container relative mx-auto max-w-7xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mx-auto max-w-4xl text-center mt-8 sm:mt-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 dark:bg-brand-900/30 dark:border-brand-800/50 mb-6 group transition-colors">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-700 dark:text-brand-400">Live Support Desk</span>
                        </div>

                        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-fluid-4xl lg:text-7xl mb-6 leading-[1.1]">
                            We&apos;re here to help you <br className="hidden lg:block" />
                            <span className="text-gradient-brand">succeed in your mission.</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-foreground-muted leading-relaxed font-medium">
                            Join our 24/7 student support ecosystem or reach out to our dedicated teams. We maintain the zero-error standard for India&apos;s most trusted job portal.
                        </p>

                        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-sm font-bold text-foreground-muted">
                            <span className="flex items-center gap-2.5 group">
                                <div className="p-1.5 rounded-lg bg-white shadow-sm border border-border group-hover:border-accent-500/50 dark:bg-slate-900 transition-colors">
                                    <Clock className="size-4 text-accent-500" />
                                </div>
                                24/7 Monitoring
                            </span>
                            <span className="flex items-center gap-2.5 group">
                                <div className="p-1.5 rounded-lg bg-white shadow-sm border border-border group-hover:border-accent-500/50 dark:bg-slate-900 transition-colors">
                                    <LifeBuoy className="size-4 text-accent-500" />
                                </div>
                                Dedicated Helpdesk
                            </span>
                            <span className="flex items-center gap-2.5 group">
                                <div className="p-1.5 rounded-lg bg-white shadow-sm border border-border group-hover:border-accent-500/50 dark:bg-slate-900 transition-colors">
                                    <Users className="size-4 text-accent-500" />
                                </div>
                                100K+ Student Community
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. Institutional Support Hub */}
            <section className="container mx-auto max-w-7xl px-4 py-20 sm:py-32">
                <div className="text-center mb-16 sm:mb-24">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 mb-4">Official Inquiry Channels</h2>
                    <h3 className="text-3xl font-black text-foreground sm:text-5xl leading-tight">
                        Reach our <span className="text-gradient-brand">dedicated departments.</span>
                    </h3>
                </div>

                <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
                    {SUPPORT_CHANNELS.map((item, i) => (
                        <div key={i} className="group relative bg-surface border border-border p-8 sm:p-12 rounded-[2.5rem] transition-all hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/5">
                            <div className="size-16 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-600 dark:bg-slate-900 mb-8 border border-border group-hover:bg-brand-50 transition-colors">
                                <item.icon className="size-7 stroke-[1.5]" />
                            </div>
                            <h4 className="text-2xl font-black text-foreground mb-4">{item.title}</h4>
                            <p className="text-foreground-muted leading-relaxed text-sm mb-10 min-h-16">
                                {item.description}
                            </p>
                            <a
                                href={`mailto:${item.email}`}
                                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-50 border border-border text-sm font-bold text-foreground transition-all group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 dark:bg-slate-900 group-hover:shadow-lg group-hover:shadow-brand-500/20"
                            >
                                <Mail className="size-4 opacity-70" />
                                <span>{item.email}</span>
                            </a>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Live Alert Ecosystem (Social Hub) */}
            <section className="bg-slate-50 py-24 border-y border-border/50 dark:bg-slate-950/20">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="text-center mb-16 sm:mb-24">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 mb-4">Student Hubs</h2>
                        <h3 className="text-3xl font-black text-foreground sm:text-4xl">Join the live alert ecosystem.</h3>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Telegram Hub */}
                        <div className="group relative bg-white border border-border rounded-[2.5rem] p-8 sm:p-12 overflow-hidden shadow-xl dark:bg-slate-900/50">
                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 opacity-5">
                                <MessageSquare className="size-32 text-[#0088cc]" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="size-16 rounded-2xl bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center border border-[#0088cc]/20">
                                        <MessageSquare className="size-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-foreground">Telegram Community</h4>
                                        <p className="text-sm font-bold text-foreground-muted">@resultguru247</p>
                                    </div>
                                </div>
                                <p className="text-foreground-muted mb-10 leading-relaxed text-lg">
                                    Join 50K+ students for lightning-fast result alerts & job notifications across India.
                                </p>
                                <a
                                    href="https://t.me/resultguru247"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-[#0088cc] text-white font-black text-lg hover:bg-[#0077b5] transition-all shadow-xl shadow-[#0088cc]/20 active:scale-95 group"
                                >
                                    <span>Join Telegram Channel</span>
                                    <ArrowUpRight className="size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                            </div>
                        </div>

                        {/* WhatsApp Hub */}
                        <div className="group relative bg-white border border-border rounded-[2.5rem] p-8 sm:p-12 overflow-hidden shadow-xl dark:bg-slate-900/50">
                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 transition-transform group-hover:translate-x-0 group-hover:translate-y-0 opacity-5">
                                <Share2 className="size-32 text-[#25D366]" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="size-16 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center border border-[#25D366]/20">
                                        <Share2 className="size-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-foreground">WhatsApp Channel</h4>
                                        <p className="text-sm font-bold text-foreground-muted">Official Result Guru</p>
                                    </div>
                                </div>
                                <p className="text-foreground-muted mb-10 leading-relaxed text-lg">
                                    Zero ads, pure updates. Get verified news directly on your WhatsApp Status every day.
                                </p>
                                <a
                                    href="https://whatsapp.com/channel/0029Vb7XUqn1SWt7c9kqCV3I"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-brand-600 text-white font-black text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 active:scale-95 group"
                                >
                                    <span>Follow Channel</span>
                                    <ArrowUpRight className="size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* 4. Trust & System Metrics */}
            <section className="container mx-auto max-w-7xl px-4 py-20">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { icon: Clock, label: 'Response SLA', value: '< 12 Hours Avg', color: 'text-brand-600' },
                        { icon: Globe, label: 'Headquarters', value: 'New Delhi, India', color: 'text-brand-600' },
                        { icon: Calendar, label: 'Operating Hours', value: 'Mon - Sat (9AM-7PM)', color: 'text-brand-600' },
                        { icon: CheckCircle2, label: 'Languages', value: 'English & Hindi', color: 'text-accent-600' },
                    ].map((metric, i) => (
                        <div key={i} className="bg-surface border border-border p-6 rounded-3xl flex flex-col items-center text-center group hover:border-brand-300 transition-all">
                            <metric.icon className={`size-8 ${metric.color} mb-4 opacity-80 group-hover:scale-110 transition-transform`} />
                            <h4 className="text-xs font-black uppercase tracking-widest text-foreground-muted mb-1">{metric.label}</h4>
                            <p className="text-sm font-bold text-foreground">{metric.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Smart FAQ & Resolution Hub */}
            <section className="container mx-auto max-w-7xl px-4 py-24 sm:py-32">
                <div className="flex flex-col lg:flex-row gap-16">
                    <div className="lg:w-1/3 text-center lg:text-left">
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 mb-4">Support Intelligence</h2>
                        <h3 className="text-3xl font-black text-foreground sm:text-4xl leading-tight">
                            Quick solutions for <br className="hidden lg:block" />
                            <span className="text-gradient-brand">aspirant inquiries.</span>
                        </h3>
                        <p className="mt-6 text-foreground-muted leading-relaxed">
                            Save time by checking these frequent inquiries first. We maintain a database of common support resolutions for 100K+ students.
                        </p>
                    </div>

                    <div className="lg:w-2/3 grid gap-6 sm:grid-cols-2">
                        {FAQS.map((faq, i) => (
                            <div key={i} className="group p-8 bg-surface border border-border rounded-3xl transition-all hover:border-brand-500/30 hover:shadow-xl hover:shadow-brand-500/5">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 size-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm border border-brand-100 dark:border-brand-800">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-foreground mb-3 leading-snug group-hover:text-brand-600 transition-colors">{faq.q}</h4>
                                        <p className="text-sm text-foreground-muted leading-relaxed font-medium">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Standardized Institutional Integrity Hub */}
                <div className="mt-24">
                    <InstitutionalCTA
                        badge="Public Integrity Standard"
                        title="Spotted an error? We fix it instantly."
                        description="Help us maintain the zero-error standard of India's most trusted job portal. Our integrity and verification team reviews all discrepancy reports within 4 hours."
                        primaryCTA={{ label: "Report a Correction", href: "mailto:support@resultguru.co.in" }}
                        features={[
                            { icon: Shield, label: "Zero-Error Standard" },
                            { icon: CheckCircle2, label: "4-Hour Resolution" }
                        ]}
                        className="px-0!"
                    />
                </div>
            </section>
        </>
    )
}

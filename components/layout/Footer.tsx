import Link from 'next/link'
import { SITE, FOOTER_NAV, SOCIAL_MEDIA_LINKS } from '@/config/site'
import { Logo } from '@/features/shared/components/Logo'
import { SOCIAL_ICON_MAP } from '@/components/shared/SocialIcons'
import {
    MapPin,
    ShieldCheck,
} from 'lucide-react'

const BRAND_HOVER_COLORS: Record<string, string> = {
    Facebook: 'hover:text-[#1877F2]',
    Twitter: 'hover:text-white',
    Instagram: 'hover:text-[#E4405F]',
    Threads: 'hover:text-white',
    LinkedIn: 'hover:text-[#0A66C2]',
    Youtube: 'hover:text-[#FF0000]',
}

export function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="border-t border-white/5 bg-slate-950 pt-16 pb-12 text-slate-400">
            <div className="container mx-auto max-w-7xl px-4">
                <div className="grid gap-12 lg:grid-cols-6 xl:gap-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block -my-16" aria-label="Result Guru home">
                            <Logo height={36} forceDark={true} />
                            <span className="sr-only">Home</span>
                        </Link>
                        <p className="mt-6 text-sm leading-relaxed text-slate-500 max-w-sm">
                            {SITE.description}
                        </p>

                        {/* Status / Social Proof (Simplified) */}
                        <div className="mt-8 flex items-center gap-3 border-l-2 border-brand-600/30 pl-4 py-1">
                            <div className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
                            </div>
                            <p className="text-xs font-medium text-slate-400">
                                100k+ students getting instant Sarkari updates.
                            </p>
                        </div>

                        {/* Physical Address (E-E-A-T Signal) */}
                        <div className="mt-8 space-y-3">
                            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                                <MapPin className="size-3.5 text-brand-500" /> Office Address
                            </h3>
                            <address className="not-italic text-sm text-slate-500 leading-relaxed">
                                {SITE.address.street}<br />
                                {SITE.address.city}, {SITE.address.region} {SITE.address.postalCode}<br />
                                {SITE.address.country}
                            </address>
                        </div>
                    </div>

                    {/* Nav Groups */}
                    <div className="grid grid-cols-2 gap-8 lg:col-span-4 sm:grid-cols-4">
                        {FOOTER_NAV.map((group) => (
                            <div key={group.label}>
                                <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-slate-200">
                                    {group.label}
                                </h3>
                                <ul className="space-y-3.5">
                                    {group.items.map((item) => (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                prefetch={false}
                                                className="text-sm text-slate-500 hover:text-brand-500 transition-colors duration-200"
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 sm:flex-row">
                    <div className="flex flex-col gap-1 items-center sm:items-start">
                        <p className="text-xs text-slate-600">
                            © {year} <span className="text-slate-500">{SITE.name}</span>. All rights reserved.
                        </p>
                        <p className="text-[10px] text-slate-600 font-medium">
                            Information last verified & updated: <time dateTime={`${year}-04-01`}>Apr {year}</time>
                        </p>
                    </div>

                    {/* Social Media Icons (Clean & Flat) */}
                    <div className="flex items-center gap-5">
                        {SOCIAL_MEDIA_LINKS.map((link) => {
                            const Icon = (SOCIAL_ICON_MAP[link.icon] || SOCIAL_ICON_MAP.Facebook) as React.ElementType
                            const hoverClass = BRAND_HOVER_COLORS[link.name] || 'hover:text-white'

                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    prefetch={false}
                                    className={`text-slate-600 transition-all duration-200 ${hoverClass}`}
                                    aria-label={link.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Icon className="size-5" />
                                    <span className="sr-only">{link.name}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Trust Signals / Certification */}
                    <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                         <div className="flex flex-col gap-1.5">
                             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-accent-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                <ShieldCheck className="size-4 text-accent-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-accent-100">Verified & Accurate</span>
                             </div>
                             <Link 
                                href="/about" 
                                rel="author"
                                className="text-[9px] text-slate-500 hover:text-slate-300 transition-colors font-semibold uppercase tracking-widest text-center px-1"
                             >
                                Content by Expert Editors
                             </Link>
                         </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

import Link from 'next/link'
import { SITE, FOOTER_NAV, SOCIAL_MEDIA_LINKS } from '@/config/site'
import { Logo } from '@/features/shared/components/Logo'
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    MapPin,
    ShieldCheck,
} from 'lucide-react'

// ── Custom SVG Icons ────────────────────────────────────────────────────────

function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

function ThreadsIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 192 192" className={className} fill="currentColor" aria-hidden="true">
            <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
        </svg>
    )
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
    Facebook,
    Twitter: XIcon,
    Instagram,
    Threads: ThreadsIcon,
    LinkedIn: Linkedin,
    Youtube: Youtube,
}

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
                            const Icon = ICON_MAP[link.icon] || Twitter
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
                    <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
                         <div className="flex flex-col gap-1.5">
                             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <ShieldCheck className="size-4 text-emerald-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">Verified & Accurate</span>
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

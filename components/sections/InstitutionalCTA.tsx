import Link from 'next/link'
import { ShieldCheck, ArrowRight, Bell, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CTAFeature {
    icon: LucideIcon
    label: string
}

interface InstitutionalCTAProps {
    badge?: string
    title: string
    description: string
    primaryCTA?: {
        label: string
        href: string
    }
    secondaryCTA?: {
        text: string
        actionLabel: string
        href: string
    }
    features?: CTAFeature[]
    footerText?: string
    className?: string
}

export function InstitutionalCTA({
    badge = "Secure & Verified",
    title,
    description,
    primaryCTA = { label: "Create Free Account", href: "/register" },
    secondaryCTA = { text: "Already have an account?", actionLabel: "Sign In", href: "/login" },
    features = [
        { icon: Bell, label: "Priority Notifications" },
        { icon: Star, label: "Save for Later" }
    ],
    footerText = "Trusted by 2M+ Aspirants Across India",
    className = ""
}: InstitutionalCTAProps) {
    return (
        <section className={`container mx-auto max-w-7xl px-4 py-8 ${className}`}>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-900 p-6 md:p-10 xl:p-16 shadow-2xl border border-white/10">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/5 blur-[80px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-brand-500/10 blur-[100px] pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-10 xl:gap-16 items-center">
                    <div className="space-y-6 md:space-y-8">
                        {badge && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] md:text-[11px] font-bold text-white uppercase tracking-widest whitespace-nowrap">
                                <ShieldCheck className="size-3" />
                                {badge}
                            </div>
                        )}
                        
                        <h2 className="text-2xl md:text-3xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight break-words" 
                            dangerouslySetInnerHTML={{ __html: title.replace(/(Assistant|Directory|Pathways|Future|Results|Updates|Guarantee|Search|Rights|Use)/g, '<span class="text-brand-300">$1</span>') }}
                        />
                        
                        <p className="text-base md:text-lg text-blue-100/90 leading-relaxed font-medium">
                            {description}
                        </p>

                        {features.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-white/90">
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 border border-white/10 shrink-0">
                                            <feature.icon className="size-4 text-brand-300" />
                                        </div>
                                        <span className="text-sm font-semibold truncate sm:whitespace-normal">{feature.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-6 xl:border-l xl:border-white/10 xl:pl-12">
                        {primaryCTA && (
                            <Link
                                href={primaryCTA.href}
                                className="group flex items-center justify-center gap-3 w-full max-w-sm bg-white text-indigo-900 hover:bg-slate-100 py-3.5 md:py-4 px-6 md:px-8 rounded-2xl text-base md:text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/20"
                            >
                                {primaryCTA.label}
                                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                        
                        {secondaryCTA && (
                            <p className="text-sm text-blue-100/60 font-medium text-center">
                                {secondaryCTA.text}{' '}
                                <Link href={secondaryCTA.href} className="text-white hover:underline decoration-white/30 transition-all font-bold">
                                    {secondaryCTA.actionLabel}
                                </Link>
                            </p>
                        )}
                        
                        <div className="h-px w-full max-w-[200px] bg-white/10" />
                        
                        {footerText && (
                            <p className="text-[10px] md:text-xs text-white/40 text-center font-bold uppercase tracking-wider">
                                {footerText}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

import { ShoppingBag, TrendingUp, Star, CheckCircle, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

interface Props {
    productCount: number
    featuredCount: number
}

export function ShopHero({ productCount, featuredCount }: Props) {
    return (
        <section className="relative min-h-[500px] overflow-hidden bg-zinc-950 border-b border-white/5">
            {/* Lifestyle Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/student_workspace_hero.png"
                    alt="Student Workspace"
                    fill
                    className="object-cover opacity-50 transition-transform duration-[20s] hover:scale-110"
                    priority
                />
                <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 grid gap-16 px-4 py-16 md:py-24 lg:py-32 lg:grid-cols-2 lg:items-center max-w-7xl mx-auto">

                {/* Left Side: Content */}
                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl shadow-2xl">
                            <ShieldCheck className="size-4 text-brand-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                Verified Student Marketplace
                            </span>
                        </div>

                        <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[1.05]">
                            Gear up for <br />
                            <span className="bg-linear-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent italic">
                                Greatness.
                            </span>
                        </h1>
                        
                        <p className="max-w-md text-xl text-zinc-400 leading-relaxed font-medium">
                            Premium study essentials, verified tech, and expert-recommended materials curated to help you crack any competitive exam.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white">{productCount}+</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Verified Products</span>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white">{featuredCount}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Expert Picks</span>
                        </div>
                        <div className="w-px h-10 bg-white/10 hidden sm:block" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-white">100%</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Quality Assured</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Editorial Card */}
                <div className="relative hidden lg:block">
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-1 backdrop-blur-2xl shadow-2xl">
                        <div className="rounded-[2.2rem] bg-zinc-900/80 p-8 space-y-6 border border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400">
                                    <Star className="size-6 fill-current" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-400">Recommendation of the Week</span>
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white leading-tight">Cracking the UPSC: <br />Essential Kit 2026</h3>
                                <p className="text-sm text-zinc-500 font-medium">Everything you need to stay organized and focused during your preparation journey.</p>
                            </div>

                            <button className="w-full h-14 rounded-2xl bg-brand-600 text-white font-black uppercase tracking-widest hover:bg-brand-500 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-500/20">
                                Explore The Guide
                            </button>
                        </div>
                    </div>

                    {/* Subtle floating glow */}
                    <div className="absolute -bottom-10 -right-10 size-64 bg-brand-500/20 blur-[100px] rounded-full pointer-events-none" />
                </div>
            </div>
        </section>
    )
}

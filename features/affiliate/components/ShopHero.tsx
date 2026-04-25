'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, TrendingUp, Star, CheckCircle, ShieldCheck, ChevronRight, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { AffiliateProduct } from '@/types/post.types'

interface Props {
    productCount: number
    featuredCount: number
    featuredProducts?: AffiliateProduct[]
}

export function ShopHero({ productCount, featuredCount, featuredProducts = [] }: Props) {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (!featuredProducts || featuredProducts.length <= 1) return
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % featuredProducts.length)
        }, 5000)
        
        return () => clearInterval(interval)
    }, [featuredProducts])

    const currentProduct = featuredProducts[currentIndex]
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
                    <div className="relative overflow-hidden rounded-4xl bg-white/5 backdrop-blur-xl border border-white/10 p-10 min-h-[380px] flex flex-col justify-between shadow-2xl transition-all duration-500 hover:bg-white/[0.07]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-brand-400">
                                <Star className="size-5 fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {currentProduct ? 'Featured Pick' : 'Recommendation'}
                                </span>
                            </div>
                        </div>
                        
                        {currentProduct ? (
                            <div key={currentProduct.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-6">
                                    <div className="relative size-24 rounded-3xl bg-white/10 p-3 shrink-0 border border-white/5 shadow-inner backdrop-blur-md">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={currentProduct.image_url}
                                                alt={currentProduct.name}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                                className="object-contain drop-shadow-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-white leading-tight line-clamp-2 drop-shadow-sm">
                                            {currentProduct.name}
                                        </h3>
                                        {currentProduct.selling_price && (
                                            <p className="text-lg text-brand-400 font-black tracking-tight">
                                                ₹{currentProduct.selling_price.toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-base text-zinc-400 font-medium line-clamp-2 leading-relaxed">
                                    {currentProduct.short_description || currentProduct.description || 'Premium curated study material for your preparation.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-white leading-tight drop-shadow-sm">Cracking the UPSC: <br />Essential Kit 2026</h3>
                                <p className="text-base text-zinc-400 font-medium leading-relaxed">Everything you need to stay organized and focused during your preparation journey.</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                            {currentProduct ? (
                                <Link 
                                    href={`/shop/${currentProduct.category}/${currentProduct.slug}`}
                                    className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:text-brand-400 transition-colors"
                                >
                                    Check Best Deal 
                                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : (
                                <button className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white hover:text-brand-400 transition-colors">
                                    Explore The Guide
                                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            )}
                            
                            {/* Dots for carousel */}
                            {featuredProducts.length > 1 && (
                                <div className="flex items-center gap-2">
                                    {featuredProducts.map((_, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                                idx === currentIndex ? 'w-6 bg-brand-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
                                            }`}
                                            aria-label={`Go to slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subtle floating glow */}
                    <div className="absolute -bottom-10 -right-10 size-64 bg-brand-500/20 blur-[100px] rounded-full pointer-events-none" />
                </div>
            </div>
        </section>
    )
}

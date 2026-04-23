'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, Star } from 'lucide-react'
import type { AffiliateProduct } from '@/types/post.types'

interface Props {
    product: AffiliateProduct
}

export function AffiliateCard({ product }: Props) {
    const hasDiscount = product.mrp && product.selling_price && product.mrp > product.selling_price
    const discountPercent = hasDiscount
        ? Math.round(((product.mrp! - product.selling_price!) / product.mrp!) * 100)
        : 0
    const detailUrl = `/shop/${product.category}/${product.slug}`

    return (
        <div className="group relative rounded-2xl border border-border bg-surface flex flex-col h-full hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-500 hover:-translate-y-1.5 overflow-hidden">
            {/* Badge */}
            <div className="absolute left-3 top-3 z-20 flex flex-col gap-1.5 pointer-events-none">
                {product.badge_text && (
                    <span
                        className="inline-block rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white border shadow-sm"
                        style={{
                            backgroundColor: product.badge_color || '#1d4ed8',
                            borderColor: 'rgba(255,255,255,0.2)'
                        }}
                    >
                        {product.badge_text}
                    </span>
                )}
                {hasDiscount && (
                    <span className="inline-block rounded-lg bg-emerald-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white border border-white/20 shadow-sm">
                        {discountPercent}% OFF
                    </span>
                )}
            </div>

            {/* Product Image area */}
            <Link
                href={detailUrl}
                className="relative mx-auto mt-6 aspect-square w-full max-w-[190px] block px-4"
            >
                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-background-subtle/50 p-4 transition-all duration-500 group-hover:bg-background-muted/70 group-hover:shadow-inner">
                    <Image
                        src={product.image_url}
                        alt={product.image_alt || product.name}
                        fill
                        className="object-contain transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                        sizes="(max-width: 768px) 160px, 190px"
                        quality={75}
                    />
                </div>
            </Link>

            <div className="flex flex-1 flex-col p-5 pt-4">
                {/* Category + Rating Row */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-600/80 dark:text-brand-400/80">
                        {product.category}
                    </span>
                    {product.rating != null && (
                        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 dark:bg-amber-900/20">
                            <Star className="size-3 fill-amber-500 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                {Number(product.rating).toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Name */}
                <Link href={detailUrl} className="block mb-1.5">
                    <h4 className="line-clamp-2 text-[15px] font-bold leading-tight text-foreground group-hover:text-brand-600 transition-colors duration-300">
                        {product.name}
                    </h4>
                </Link>

                {/* Tagline */}
                {product.short_description && (
                    <p className="line-clamp-1 text-[11px] text-foreground-subtle leading-snug mb-3">
                        {product.short_description}
                    </p>
                )}

                {/* Price & CTA Section */}
                <div className="mt-auto space-y-3">
                    <div className="flex items-baseline gap-2">
                        {product.selling_price != null && (
                            <span className="text-xl font-black tracking-tight text-foreground">₹{product.selling_price.toLocaleString()}</span>
                        )}
                        {hasDiscount && (
                            <span className="text-xs text-foreground-subtle line-through opacity-50 font-medium">₹{product.mrp?.toLocaleString()}</span>
                        )}
                    </div>

                    <a
                        href={product.product_url}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        className="group/btn relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-600 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.97]"
                    >
                        <span>Check Price</span>
                        <ExternalLink className="size-3.5 opacity-70 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5" />
                    </a>
                </div>
            </div>
        </div>
    )
}

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
        <div className="group relative flex flex-col h-full transition-all duration-500 hover:-translate-y-1">
            {/* Product Image area */}
            <Link
                href={detailUrl}
                className="relative block w-full aspect-[4/3] rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 transition-colors duration-300 overflow-hidden mb-4"
            >
                {/* Badge */}
                <div className="absolute left-4 top-4 z-20 flex flex-col gap-1.5 pointer-events-none">
                    {product.badge_text && (
                        <span
                            className="inline-block rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-sm"
                            style={{
                                backgroundColor: product.badge_color || '#1d4ed8',
                            }}
                        >
                            {product.badge_text}
                        </span>
                    )}
                    {hasDiscount && (
                        <span className="inline-block rounded-lg bg-emerald-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                            {discountPercent}% OFF
                        </span>
                    )}
                </div>

                <div className="absolute inset-0 p-8 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <Image
                            src={product.image_url}
                            alt={product.image_alt || product.name}
                            fill
                            className="object-contain transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2 mix-blend-darken dark:mix-blend-normal"
                            style={{ objectFit: 'contain' }}
                            sizes="(max-width: 768px) 100vw, 300px"
                            quality={75}
                        />
                    </div>
                </div>
            </Link>

            <div className="flex flex-1 flex-col px-1">

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
                <div className="mt-auto pt-4 flex items-end justify-between">
                    <div className="flex flex-col gap-0.5">
                        {hasDiscount && (
                            <span className="text-xs text-foreground-subtle line-through opacity-70 font-bold">₹{product.mrp?.toLocaleString()}</span>
                        )}
                        {product.selling_price != null && (
                            <span className="text-lg font-black tracking-tight text-foreground leading-none">₹{product.selling_price.toLocaleString()}</span>
                        )}
                    </div>

                    <a
                        href={product.product_url}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        className="group/btn inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors"
                    >
                        <span>Check Best Price</span>
                        <ExternalLink className="size-3 opacity-70 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                    </a>
                </div>
            </div>
        </div>
    )
}

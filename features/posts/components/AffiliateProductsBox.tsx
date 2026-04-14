'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ExternalLink, ShoppingCart, Star } from 'lucide-react'
import type { PostAffiliateProductEntry } from '@/types/post.types'
import { LocalErrorBoundary } from '@/components/shared/LocalErrorBoundary'

interface Props {
    affiliates: PostAffiliateProductEntry[]
}

export function AffiliateProductsBox({ affiliates }: Props) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <LocalErrorBoundary name="AffiliateProducts">
            <AffiliateProductsBoxContent affiliates={affiliates} />
        </LocalErrorBoundary>
    )
}

function AffiliateProductsBoxContent({ affiliates }: Props) {
    if (!affiliates || affiliates.length === 0) return null

    const sorted = [...affiliates].sort((a, b) => a.sort_order - b.sort_order)

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <ShoppingCart className="size-5" />
                </div>
                <div>
                    <h2 className="font-display text-lg font-bold text-foreground">Recommended Books & Resources</h2>
                    <p className="text-xs text-foreground-subtle">Top-rated preparation material for this exam</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sorted.map((entry) => {
                    const p = entry.product
                    const hasDiscount = p.mrp && p.selling_price && p.mrp > p.selling_price
                    const href = p.affiliate_url || p.product_url

                    return (
                        <a
                            key={entry.product_id}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer nofollow sponsored"
                            className="group relative flex flex-col rounded-xl border border-border bg-surface overflow-hidden transition-all hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700"
                        >
                            {/* Badge */}
                            {p.badge_text && (
                                <span
                                    className="absolute top-2 left-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                                    style={{ backgroundColor: p.badge_color || '#f59e0b' }}
                                >
                                    {p.badge_text}
                                </span>
                            )}

                            {/* Product image */}
                            <div className="relative aspect-4/3 bg-background-muted overflow-hidden">
                                <Image
                                    src={p.image_url}
                                    alt={p.image_alt || p.name}
                                    fill
                                    className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            </div>

                            {/* Product info */}
                            <div className="flex flex-1 flex-col p-4">
                                <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                                    {p.name}
                                </h3>

                                <div className="mt-auto pt-3">
                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        {p.selling_price != null && (
                                            <span className="text-lg font-bold text-foreground">
                                                ₹{p.selling_price.toLocaleString()}
                                            </span>
                                        )}
                                        {hasDiscount && (
                                            <>
                                                <span className="text-xs text-foreground-subtle line-through">
                                                    ₹{p.mrp!.toLocaleString()}
                                                </span>
                                                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                                                    {p.discount_percent}% off
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${p.stock_status === 'in_stock' ? 'text-green-600' : 'text-red-500'}`}>
                                            {p.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                            Buy Now <ExternalLink className="size-3" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    )
                })}
            </div>
            <p className="text-[10px] text-foreground-subtle text-center italic">
                * We may earn a small commission from qualifying purchases at no extra cost to you.
            </p>
        </section>
    )
}

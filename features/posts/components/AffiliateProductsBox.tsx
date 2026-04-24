'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { ExternalLink, ShoppingCart } from 'lucide-react'
import type { PostAffiliateProductEntry } from '@/types/post.types'
import { LocalErrorBoundary } from '@/components/shared/LocalErrorBoundary'

interface Props {
    affiliates: PostAffiliateProductEntry[]
    layout?: 'grid' | 'sidebar'
    title?: string
    description?: string
}

export function AffiliateProductsBox({ affiliates, layout = 'grid', title, description }: Props) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <LocalErrorBoundary name="AffiliateProducts">
            <AffiliateProductsBoxContent 
                affiliates={affiliates} 
                layout={layout} 
                title={title}
                description={description}
            />
        </LocalErrorBoundary>
    )
}

function AffiliateProductsBoxContent({ affiliates, layout, title, description }: Props) {
    const filtered = useMemo(() => {
        if (!affiliates) return []
        return [...affiliates].sort((a, b) => a.sort_order - b.sort_order)
    }, [affiliates])

    if (filtered.length === 0) return null

    const isSidebar = layout === 'sidebar'
    const Icon = ShoppingCart
    const defaultTitle = 'Recommended Resources'
    const defaultDesc = 'Top-rated preparation material'

    return (
        <section className={`space-y-4 ${isSidebar ? 'py-2' : ''}`}>
            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <Icon className="size-5" />
                </div>
                <div>
                    <h2 className={`font-display font-bold text-foreground ${isSidebar ? 'text-base' : 'text-lg'}`}>
                        {title || defaultTitle}
                    </h2>
                    <p className="text-[10px] text-foreground-subtle tracking-tight leading-none mt-0.5">
                        {description || defaultDesc}
                    </p>
                </div>
            </div>

            <div className={isSidebar 
                ? "flex flex-col gap-3" 
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            }>
                {filtered.map((entry) => {
                    const p = entry.product
                    const hasDiscount = p.mrp && p.selling_price && p.mrp > p.selling_price
                    const href = p.product_url

                    return (
                        <a
                            key={entry.product_id}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer nofollow sponsored"
                            className={`group relative flex rounded-xl border border-border bg-surface overflow-hidden transition-all hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 ${
                                isSidebar ? 'flex-row items-center h-24' : 'flex-col'
                            }`}
                        >
                            {/* Badge */}
                            {p.badge_text && !isSidebar && (
                                <span
                                    className="absolute top-2 left-2 z-10 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                                    style={{ backgroundColor: p.badge_color || '#f59e0b' }}
                                >
                                    {p.badge_text}
                                </span>
                            )}

                            {/* Product image */}
                            <div className={`relative bg-background-muted overflow-hidden shrink-0 p-2 ${
                                isSidebar ? 'size-24 border-r border-border' : 'aspect-4/3'
                            }`}>
                                <div className="relative w-full h-full">
                                    <Image
                                        src={p.image_url}
                                        alt={p.image_alt || p.name}
                                        fill
                                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                                        sizes={isSidebar ? '96px' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
                                    />
                                </div>
                            </div>

                            {/* Product info */}
                            <div className={`flex flex-1 flex-col p-3 ${isSidebar ? 'justify-center min-w-0' : ''}`}>
                                <h3 className={`font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors ${
                                    isSidebar ? 'text-xs' : 'text-sm'
                                }`}>
                                    {p.name}
                                </h3>

                                <div className={`${isSidebar ? 'mt-1' : 'mt-auto pt-3'}`}>
                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        {p.selling_price != null && (
                                            <span className={`${isSidebar ? 'text-sm' : 'text-lg'} font-bold text-foreground`}>
                                                ₹{p.selling_price.toLocaleString()}
                                            </span>
                                        )}
                                        {hasDiscount && !isSidebar && (
                                            <span className="text-xs text-foreground-subtle line-through">
                                                ₹{p.mrp!.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    {!isSidebar && (
                                        <div className="mt-3 flex items-center justify-end">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                Buy Now <ExternalLink className="size-3" />
                                            </span>
                                        </div>
                                    )}
                                    {isSidebar && (
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[9px] font-bold uppercase tracking-tighter text-brand-600 dark:text-brand-400">
                                                View Product
                                            </span>
                                            {p.badge_text && (
                                                <span className="text-[10px] font-medium text-foreground-subtle">
                                                    {p.badge_text}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </a>
                    )
                })}
            </div>
            {!isSidebar && (
                <p className="text-[10px] text-foreground-subtle text-center italic">
                    * We may earn a small commission from qualifying purchases at no extra cost to you.
                </p>
            )}
        </section>
    )
}

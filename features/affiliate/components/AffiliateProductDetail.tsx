'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, ShoppingCart, Star, ChevronRight, Home } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TrustBadges } from './TrustBadges'
import { ProductFAQ } from './ProductFAQ'
import { StickyMobileCTA } from './StickyMobileCTA'
import { JsonLd } from '@/components/seo/JsonLd'
import { cn } from '@/lib/utils'
import { SITE } from '@/config/site'
import type { AffiliateProduct } from '@/types/post.types'

interface Props {
    product: AffiliateProduct
}

function StarRating({ rating, count }: { rating: number; count: number }) {
    const numRating = Number(rating) || 0
    const fullStars = Math.floor(numRating)
    const hasHalf = numRating - fullStars >= 0.5

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            'size-4',
                            i < fullStars
                                ? 'fill-amber-400 text-amber-400'
                                : i === fullStars && hasHalf
                                    ? 'fill-amber-400/50 text-amber-400'
                                    : 'fill-transparent text-border-strong'
                        )}
                    />
                ))}
            </div>
            <span className="text-sm font-bold text-foreground">{numRating.toFixed(1)}</span>
        </div>
    )
}

export function AffiliateProductDetail({ product }: Props) {
    const hasDiscount = product.mrp && product.selling_price && product.mrp > product.selling_price
    const discountPercent = hasDiscount
        ? Math.round(((product.mrp! - product.selling_price!) / product.mrp!) * 100)
        : 0

    const categoryLabel = product.category.charAt(0).toUpperCase() + product.category.slice(1)

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.short_description || `Check out ${product.name} on Result Guru`,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Link copied to clipboard!')
        }
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.short_description || product.description,
        image: product.image_url,
        brand: {
            '@type': 'Brand',
            name: 'Result Guru'
        },
        ...(product.rating != null && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                ratingCount: product.rating_count || 1,
                bestRating: 5,
            }
        }),
        offers: {
            '@type': 'Offer',
            url: `${SITE.url}/shop/${product.category}/${product.slug}`,
            priceCurrency: 'INR',
            price: product.selling_price || product.mrp,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition'
        }
    }

    return (
        <>
            <div className="space-y-10">
                <JsonLd data={jsonLd} />

                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground-subtle">
                    <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
                    <span className="opacity-30">/</span>
                    <Link href="/shop" className="hover:text-brand-600 transition-colors">Shop</Link>
                    <span className="opacity-30">/</span>
                    <Link href={`/shop/${product.category}`} className="hover:text-brand-600 transition-colors capitalize">
                        {categoryLabel}
                    </Link>
                    <span className="opacity-30">/</span>
                    <span className="text-foreground font-black truncate max-w-[200px]">{product.name}</span>
                </nav>

                {/* Product Hero — 2 Column */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Left: Image */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="group relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-white p-12 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-brand-500/5 dark:bg-zinc-900/50">
                                {/* Decorative background */}
                                <div className="absolute inset-0 bg-linear-to-br from-brand-50/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-brand-900/10" />
                                
                                <Image
                                    src={product.image_url}
                                    alt={product.image_alt || product.name}
                                    fill
                                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                                    priority
                                />
                                {product.badge_text && (
                                    <div
                                        className="absolute left-6 top-6 rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                                        style={{ backgroundColor: product.badge_color || '#1d4ed8' }}
                                    >
                                        {product.badge_text}
                                    </div>
                                )}

                                <button 
                                    onClick={handleShare}
                                    className="absolute right-6 top-6 size-10 flex items-center justify-center rounded-xl bg-surface/80 backdrop-blur-md border border-border text-foreground-muted hover:text-brand-600 hover:scale-110 transition-all"
                                >
                                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="lg:col-span-7">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-100 dark:border-brand-800/50">
                                        <span className="size-1 rounded-full bg-brand-500" />
                                        {categoryLabel}
                                    </span>
                                    {product.is_featured && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
                                            ⭐ Featured Choice
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="font-display text-4xl font-black leading-[1.1] tracking-tight text-foreground md:text-5xl">
                                    {product.name}
                                </h1>

                                {/* Rating */}
                                {product.rating != null && (
                                    <div className="flex items-center gap-4">
                                        <StarRating rating={product.rating} count={product.rating_count || 0} />
                                        <span className="h-4 w-px bg-border/60" />
                                        <span className="text-xs font-bold text-foreground-subtle underline underline-offset-4 decoration-border">Verified Purchase Recommendations</span>
                                    </div>
                                )}
                            </div>

                            {/* Short Description */}
                            {product.short_description && (
                                <p className="text-lg text-foreground-muted leading-relaxed font-medium">
                                    {product.short_description}
                                </p>
                            )}

                            {/* Price Block */}
                            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-raised p-6 md:p-8">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <ShoppingCart className="size-24 -rotate-12" />
                                </div>
                                
                                <div className="relative z-10 space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-subtle">Limited Time Offer</span>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <span className="text-5xl font-black tracking-tight text-foreground">
                                            ₹{(product.selling_price || product.mrp || 0).toLocaleString()}
                                        </span>
                                        {hasDiscount && (
                                            <div className="flex flex-col">
                                                <span className="text-lg text-foreground-subtle line-through decoration-red-500/50 opacity-60">
                                                    ₹{product.mrp!.toLocaleString()}
                                                </span>
                                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                                    Save {discountPercent}% Today
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Primary CTA */}
                            <div className="space-y-4">
                                <a
                                    href={product.product_url}
                                    target="_blank"
                                    rel="noopener noreferrer nofollow sponsored"
                                    className={cn(
                                        buttonVariants({ size: 'lg' }),
                                        "h-16 w-full gap-3 rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.98]"
                                    )}
                                >
                                    <ShoppingCart className="size-6" />
                                    Check Latest Price
                                    <ExternalLink className="ml-1 size-5 opacity-50" />
                                </a>
                                <p className="text-center text-[10px] font-bold text-foreground-subtle uppercase tracking-widest">
                                    Secure redirect to official marketplace
                                </p>
                            </div>

                            {/* Trust Badges */}
                            <TrustBadges />
                        </div>
                    </div>
                </div>

                {/* Description & Features */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Description Card */}
                        {(product.description || product.short_description) && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="font-display text-2xl font-black tracking-tight text-foreground">Product Deep Dive</h2>
                                    <div className="h-px flex-1 bg-border/60"></div>
                                </div>
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <div className="rounded-[2rem] border border-border bg-surface p-8 md:p-10">
                                        <p className="whitespace-pre-wrap text-foreground-muted leading-relaxed text-base font-medium">
                                            {product.description || product.short_description || 'No detailed description available for this product.'}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* FAQ Section */}
                        {product.faq && product.faq.length > 0 && (
                            <ProductFAQ faq={product.faq} productName={product.name} />
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        {/* Why choose this? */}
                        <section className="rounded-3xl border border-border bg-surface p-8 space-y-6 shadow-sm">
                            <h3 className="text-lg font-black tracking-tight text-foreground">Why Result Guru?</h3>
                            <ul className="space-y-4">
                                {[
                                    { title: 'Expert Verified', desc: 'Hand-picked by competitive exam toppers.' },
                                    { title: 'Best Value', desc: 'Price-matched across all top retailers.' },
                                    { title: 'Updated Content', desc: 'Latest editions and syllabus-aligned.' }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30">
                                            <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-bold text-foreground">{item.title}</h4>
                                            <p className="text-[11px] text-foreground-subtle leading-tight">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Affiliate Disclosure */}
                        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                            <p className="text-[10px] font-bold leading-relaxed text-foreground-subtle uppercase tracking-wider">
                                * Affiliate Disclosure: We may earn a commission from qualifying purchases at no extra cost to you. This supports our mission to provide free educational resources.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Mobile CTA */}
            <StickyMobileCTA
                name={product.name}
                price={product.selling_price || product.mrp || null}
                productUrl={product.product_url}
            />
        </>
    )
}

import Link from 'next/link'
import Image from 'next/image'
import type { AffiliateProduct } from '@/types/post.types'
import { Star } from 'lucide-react'

interface Props {
    title: string
    products: AffiliateProduct[]
    excludeId?: string
}

export function AffiliateSidebarProducts({ title, products, excludeId }: Props) {
    const filteredProducts = excludeId
        ? products.filter(p => p.id !== excludeId).slice(0, 4)
        : products.slice(0, 4)

    if (filteredProducts.length === 0) return null

    return (
        <section className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground-muted border-b border-border/50 pb-3">
                {title}
            </h3>
            <div className="space-y-6">
                {filteredProducts.map((product) => (
                    <Link
                        key={product.id}
                        href={`/shop/${product.category}/${product.slug}`}
                        className="group flex gap-4 items-center"
                    >
                        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-zinc-50 p-2 transition-all duration-300 group-hover:scale-105 dark:bg-zinc-900/50 mix-blend-darken dark:mix-blend-normal">
                            <div className="relative w-full h-full">
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-contain"
                                    style={{ objectFit: 'contain' }}
                                    sizes="56px"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <h4 className="text-[13px] font-bold text-foreground leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                                {product.name}
                            </h4>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-foreground">
                                    ₹{(product.selling_price || product.mrp || 0).toLocaleString()}
                                </span>
                                {product.rating != null && (
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <Star className="size-2.5 fill-current" />
                                        <span className="text-[10px] font-black">{product.rating}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            <Link
                href="/shop"
                className="block text-center text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 transition-colors pt-4 border-t border-border/50"
            >
                View Marketplace →
            </Link>
        </section>
    )
}

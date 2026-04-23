import Image from 'next/image'
import { ExternalLink, Sparkles } from 'lucide-react'
import { getProductsByCategory } from '@/features/affiliate/queries'
import type { AffiliateCategory } from '@/features/affiliate/queries'

interface Props {
    category: AffiliateCategory
    label?: string
    description?: string
}

export async function ProductInjection({ 
    category, 
    label = "Expert's Prep Pick", 
    description = "We recommend these resources for high-scoring results" 
}: Props) {
    const products = await getProductsByCategory(category, 1)
    
    if (products.length === 0) return null
    const product = products[0]

    // Final safety check for production build
    if (!product) return null

    return (
        <div className="not-prose my-12 overflow-hidden rounded-4xl border-2 border-brand-100 bg-brand-50/30 dark:border-brand-900/20 dark:bg-brand-950/20 shadow-xl shadow-brand-500/5">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 sm:p-8">
                {/* Product Image */}
                <div className="relative size-32 sm:size-40 shrink-0 overflow-hidden rounded-3xl border border-white/50 bg-white shadow-inner dark:border-zinc-800 dark:bg-zinc-900">
                    <Image
                        src={product.image_url}
                        alt={product.image_alt || product.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 128px, 160px"
                    />
                </div>

                {/* Product Details */}
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-brand-600 dark:text-brand-400">
                        <Sparkles className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                    </div>
                    
                    <div className="space-y-1">
                        <h4 className="text-lg sm:text-xl font-black text-foreground leading-tight line-clamp-2">
                            {product.name}
                        </h4>
                        <p className="text-xs text-foreground-subtle font-medium">{description}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                        {product.selling_price != null && (
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-foreground-subtle uppercase tracking-wider leading-none mb-1">Our Price</span>
                                <span className="text-2xl font-black text-foreground">₹{product.selling_price.toLocaleString()}</span>
                            </div>
                        )}
                        
                        <a
                            href={product.product_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow sponsored"
                            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:-translate-y-0.5 active:scale-95"
                        >
                            View on Store
                            <ExternalLink className="size-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

import Image from 'next/image'
import { ExternalLink, BookOpen, Pen, Laptop } from 'lucide-react'
import { getProductsByCategory } from '@/features/affiliate/queries'
import type { AffiliateCategory } from '@/features/affiliate/queries'
import type { AffiliateProduct } from '@/types/post.types'

const SECTION_CONFIG: Record<string, { icon: React.ElementType; title: string; desc: string }> = {
    books: { icon: BookOpen, title: 'Recommended Books', desc: 'Top-rated exam preparation guides' },
    stationery: { icon: Pen, title: 'Stationery Picks', desc: 'Premium exam day essentials' },
    electronics: { icon: Laptop, title: 'Study Gadgets', desc: 'Boost your productivity' },
}

interface SidebarSectionProps {
    category: AffiliateCategory
    limit?: number
}

export async function SidebarProducts({ category, limit = 3 }: SidebarSectionProps) {
    const products = await getProductsByCategory(category, limit)
    
    if (products.length === 0) return null

    const config = SECTION_CONFIG[category] || { 
        icon: BookOpen, 
        title: category.charAt(0).toUpperCase() + category.slice(1), 
        desc: 'Curated picks' 
    }
    const Icon = config.icon

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-brand-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-subtle">
                    {config.title}
                </h3>
            </div>

            <div className="space-y-6">
                {products.map((p) => (
                    <SidebarProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
    )
}

function SidebarProductCard({ product }: { product: AffiliateProduct }) {
    const hasDiscount = product.mrp && product.selling_price && product.mrp > product.selling_price

    return (
        <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="group flex gap-4 transition-all"
        >
            {/* Thumbnail */}
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-border/40 shadow-xs ring-4 ring-brand-50/30 dark:ring-brand-900/10">
                <Image
                    src={product.image_url}
                    alt={product.image_alt || product.name}
                    fill
                    className="object-contain p-1.5 transition-transform duration-slow group-hover:scale-110"
                    sizes="80px"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="text-[11px] font-black text-foreground leading-tight line-clamp-2 group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                    {product.name}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                    {product.selling_price != null && (
                        <span className="text-sm font-black text-foreground">
                            ₹{product.selling_price.toLocaleString()}
                        </span>
                    )}
                    {hasDiscount && (
                        <span className="text-[10px] text-foreground-subtle line-through font-bold">
                            ₹{product.mrp!.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </a>
    )
}

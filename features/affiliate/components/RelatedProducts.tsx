import { getRelatedProducts } from '@/features/affiliate/queries'
import { AffiliateCard } from '@/components/ads/AffiliateCard'
import { Package } from 'lucide-react'

interface Props {
    category: string
    excludeId: string
}

export async function RelatedProducts({ category, excludeId }: Props) {
    const products = await getRelatedProducts(category, excludeId, 4)

    if (products.length === 0) return null

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
                    <Package className="size-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">You May Also Like</h2>
                    <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest">Similar products</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map(product => (
                    <AffiliateCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    )
}

import { getAffiliateProducts, getAffiliateTypes } from '../queries'
import { AffiliateCard } from '@/components/ads/AffiliateCard'
import { Icons } from '@/lib/icons'
import Link from 'next/link'

interface Props {
    typeSlug?: string
}

export async function AffiliateListing({ typeSlug }: Props) {
    const [categories, products] = await Promise.all([
        getAffiliateTypes(),
        getAffiliateProducts(typeSlug)
    ])

    return (
        <div className="space-y-8">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-foreground-subtle">Browse Categories:</span>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/shop"
                        className={`rounded-xl px-4 py-1.5 text-sm font-bold transition-all ${!typeSlug
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                : 'bg-surface border border-border text-foreground-muted hover:border-brand-300 hover:text-brand-600'
                            }`}
                    >
                        All Products
                    </Link>
                    {categories.map((cat) => {
                        const isActive = typeSlug === cat.slug
                        return (
                            <Link
                                key={cat.slug}
                                href={`/shop?category=${cat.slug}`}
                                className={`rounded-xl px-4 py-1.5 text-sm font-bold transition-all ${isActive
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                        : 'bg-surface border border-border text-foreground-muted hover:border-brand-300 hover:text-brand-600'
                                    }`}
                            >
                                {cat.label}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Product Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">
                        {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
                    </h2>
                </div>

                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <AffiliateCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
                        <div className="mb-6 rounded-2xl bg-background-subtle p-6">
                            <Icons.Info className="size-12 text-foreground-muted opacity-50" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-foreground">No products found</h3>
                        <p className="max-w-xs text-foreground-subtle">
                            We couldn't find any products matching this category. Please check back later or try a different filter.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

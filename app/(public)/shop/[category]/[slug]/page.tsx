import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
    getAffiliateProductBySlug,
    getStaticAffiliateProducts,
    getRecentlyAddedProducts,
} from '@/features/affiliate/queries'
import { AffiliateProductDetail } from '@/features/affiliate/components/AffiliateProductDetail'
import { RelatedProducts } from '@/features/affiliate/components/RelatedProducts'
import { AffiliateSidebarProducts } from '@/features/affiliate/components/AffiliateSidebarProducts'
import { AdZone } from '@/components/ads/AdZone'


interface Props {
    params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
    try {
        const products = await getStaticAffiliateProducts()
        const paths = products.map(p => ({
            category: p.category,
            slug: p.slug
        }))
        return paths.length > 0 ? paths : [{ category: 'books', slug: 'placeholder' }]
    } catch (err) {
        void 0;
        return [{ category: 'books', slug: 'placeholder' }]
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category, slug } = await params

    const product = await getAffiliateProductBySlug(slug)
    
    // Ensure product exists AND matches the category in the URL
    if (product && product.category === category) {
        const title = `${product.name} - Student Shop (2026)`
        const description = product.short_description || `Buy ${product.name}. Top-quality ${product.category} for competitive exam aspirants.`

        return {
            title,
            description,
            alternates: { canonical: `/shop/${category}/${slug}` },
            openGraph: {
                title,
                description,
                images: [product.image_url],
                type: 'article',
            },
        }
    }

    return { title: 'Not Found' }
}

export default async function ShopProductPage({ params }: Props) {
    const { category, slug } = await params

    const [product, recentProducts] = await Promise.all([
        getAffiliateProductBySlug(slug),
        getRecentlyAddedProducts(4)
    ])
    
    // Ensure product exists AND matches the category in the URL to prevent duplicate content
    if (!product || product.category !== category) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-background">
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="mt-4 grid grid-cols-1 gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-9">
                        <AffiliateProductDetail product={product} />

                        {/* Related Products */}
                        <div className="mt-20">
                            <RelatedProducts category={product.category} excludeId={product.id} />
                        </div>
                    </div>

                    <aside className="lg:col-span-3">
                        <div className="sticky top-24 space-y-8">
                            <AffiliateSidebarProducts title="Recently Added" products={recentProducts} excludeId={product.id} />
                            <AdZone zoneSlug="sidebar_top" />
                            <AdZone zoneSlug="sidebar_sticky" />
                        </div>
                    </aside>
                </div>
            </div>

            {/* Extra bottom padding for sticky mobile CTA */}
            <div className="h-20 lg:hidden" />
        </main>
    )
}

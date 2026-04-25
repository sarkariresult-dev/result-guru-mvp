import type { Metadata } from 'next'
import { getAffiliateProducts, getAffiliateCategories, getCategoryCounts, getFeaturedProducts, searchAffiliateProducts } from '@/features/affiliate/queries'
import { ShopHero } from '@/features/affiliate/components/ShopHero'
import { CategoryGrid } from '@/features/affiliate/components/CategoryGrid'
import { AffiliateCard } from '@/components/ads/AffiliateCard'
import { AdZone } from '@/components/ads/AdZone'
import { InstitutionalCTA } from '@/components/sections/InstitutionalCTA'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE } from '@/config/site'
import { Star, ShoppingBag } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Student Shop - Books & Gear for Govt Exams (2026)',
    description: 'Essential books, stationery, and electronics for your competitive exam journey. Shop top-rated study materials and student gear.',
    alternates: { canonical: '/shop' },
    openGraph: {
        title: 'Student Shop - Books & Gear for Govt Exams (2026)',
        description: 'Essential books, stationery, and electronics for your competitive exam journey.',
        type: 'website',
        images: [`${SITE.url}/og-shop.png`]
    }
}

interface Props {
    searchParams: Promise<{ q?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
    const { q: searchQuery } = await searchParams

    const [categories, counts, featured, allProducts] = await Promise.all([
        getAffiliateCategories(),
        getCategoryCounts(),
        getFeaturedProducts(6),
        searchQuery ? searchAffiliateProducts(searchQuery) : getAffiliateProducts(),
    ])

    const totalProducts = Object.values(counts).reduce((a, b) => a + b, 0)
    const featuredCount = featured.length
    // const isSearching = !!searchQuery

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Student Shop',
        description: 'One-stop shop for government exam books, stationery, and electronics.',
        url: `${SITE.url}/shop`,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
                { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE.url}/shop` }
            ]
        }
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <JsonLd data={jsonLd} />

            {/* Hero Section */}
            <ShopHero productCount={totalProducts} featuredCount={featuredCount} featuredProducts={featured} />

            <div className="container mx-auto max-w-7xl px-4 mt-12 space-y-20">

                <CategoryGrid categories={categories} counts={counts} />

                {/* Featured Products */}
                {featured.length > 0 && (
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex size-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-100 dark:border-amber-800/50">
                                    <Star className="size-5 fill-current" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-foreground">Featured Choice</h2>
                                    <p className="text-[10px] font-black text-foreground-subtle uppercase tracking-widest">Hand-picked by our experts</p>
                                </div>
                            </div>
                            <div className="h-px flex-1 bg-border/60 mx-8 hidden lg:block"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featured.map((product) => (
                                <AffiliateCard key={product.id} product={product} />
                            ))}
                        </div>
                    </section>
                )}

                <AdZone zoneSlug="inline_3" className="my-10" />

                {/* All Products */}
                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-100 dark:border-brand-800/50">
                                <ShoppingBag className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight text-foreground">Our Catalog</h2>
                                <p className="text-[10px] font-black text-foreground-subtle uppercase tracking-widest">
                                    Browse through {totalProducts} verified products
                                </p>
                            </div>
                        </div>
                        <div className="h-px flex-1 bg-border/60 mx-8 hidden lg:block"></div>
                    </div>

                    {allProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {allProducts.map((product) => (
                                <AffiliateCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border bg-surface/50 p-12 text-center">
                            <div className="size-20 rounded-full bg-background-subtle flex items-center justify-center mb-6">
                                <ShoppingBag className="size-10 text-foreground-subtle opacity-20" />
                            </div>
                            <h3 className="mb-2 text-2xl font-black text-foreground">Collection is Growing</h3>
                            <p className="max-w-xs text-sm text-foreground-muted font-medium">
                                We&apos;re currently vetting new products. Subscribe to our newsletter to get notified.
                            </p>
                        </div>
                    )}
                </section>

                {/* SEO Content Section */}
                <section className="border-l-2 border-brand-500/50 pl-6 py-2">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground-muted mb-4">
                        About Result Guru Student Shop
                    </h2>
                    <div className="prose prose-zinc dark:prose-invert max-w-3xl text-sm">
                        <p className="text-foreground-subtle leading-relaxed font-medium">
                            Result Guru Student Shop is your one-stop destination for hand-picked study materials, exam preparation books, premium stationery, and productivity-boosting electronics. Every product in our store is carefully verified and recommended by our team of exam preparation experts. Whether you&apos;re preparing for SSC, UPSC, Railway, Banking, or State-level exams, we help you find the best resources at the best prices - so you can focus on what matters most: your preparation.
                        </p>
                    </div>
                </section>

                <AdZone zoneSlug="below_content" className="mt-8" />
                
                {/* Standardized Institutional CTA */}
                <InstitutionalCTA
                    badge="Expert Vetted"
                    title="Stop Overpaying for Standard Preparation Material."
                    description="Every book, test series, and gadget in our shop is hand-picked by exam experts. We only recommend high-yield resources that directly impact your rank. Get instant alerts when essential study materials drop in price."
                    primaryCTA={{ label: "Get Deal Alerts on Telegram", href: "https://t.me/resultguru247" }}
                    secondaryCTA={{ text: "Prefer WhatsApp?", actionLabel: "Join Channel", href: "https://whatsapp.com/channel/0029Vb7XUqn1SWt7c9kqCV3I" }}
                    className="mt-16 mb-8"
                />
            </div>
        </div>
    )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
    getAffiliateCategoryBySlug,
    getAffiliateCategories,
    getAffiliateProducts,
} from '@/features/affiliate/queries'
import { AffiliateCard } from '@/components/ads/AffiliateCard'
import { AdZone } from '@/components/ads/AdZone'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE } from '@/config/site'

interface Props {
    params: Promise<{ category: string }>
}

export async function generateStaticParams() {
    try {
        const categories = await getAffiliateCategories()
        const paths = categories.map(c => ({ category: c.slug }))
        return paths.length > 0 ? paths : [{ category: 'books' }]
    } catch (err) {
        console.error('[shop] generateStaticParams failed:', err)
        return [{ category: 'books' }]
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category } = await params

    const cat = await getAffiliateCategoryBySlug(category)
    if (cat) {
        const title = `Best ${cat.label} for Competitive Exams (2026) - Student Shop`
        const description = `Shop for the best ${cat.label.toLowerCase()} for SSC, UPSC, and state exams. Quality study materials and student gear at best prices.`

        return {
            title,
            description,
            alternates: { canonical: `/shop/${category}` },
            openGraph: {
                title,
                description,
                type: 'website',
                images: [`${SITE.url}/og-shop.png`]
            }
        }
    }

    return { title: 'Not Found' }
}

export default async function ShopCategoryPage({ params }: Props) {
    const { category } = await params

    const cat = await getAffiliateCategoryBySlug(category)
    if (!cat) notFound()

    const [products] = await Promise.all([
        getAffiliateProducts(category),
    ])

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${cat.label} for Students`,
        description: `Curated ${cat.label.toLowerCase()} for competitive exam aspirants.`,
        url: `${SITE.url}/shop/${category}`,
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
                { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE.url}/shop` },
                { '@type': 'ListItem', position: 3, name: cat.label, item: `${SITE.url}/shop/${category}` },
            ]
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <JsonLd data={jsonLd} />

            {/* Visual Breadcrumb Header */}
            <div className="bg-surface border-b border-border">
                <div className="container mx-auto max-w-7xl px-4 py-4">
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground-subtle">
                        <Link href="/shop" className="hover:text-brand-600 transition-colors">Shop</Link>
                        <span className="opacity-30">/</span>
                        <span className="text-foreground">{cat.label}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8 space-y-12">
                {/* Category Header */}
                <section className="relative py-8 md:py-12 lg:py-16">
                    <div className="relative z-10 max-w-3xl">
                        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 mb-6">
                            <span className="size-1.5 rounded-full bg-brand-500 animate-pulse" />
                            Official Category
                        </span>

                        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
                            {cat.label} <span className="text-brand-600">Resources</span>
                        </h1>

                        <p className="text-lg text-foreground-muted leading-relaxed mb-8 font-medium">
                            {cat.description}. Hand-picked study materials and essential gear verified by exam experts to accelerate your success.
                        </p>

                        <div className="flex items-center gap-8 pt-6">
                            <div className="flex flex-col">
                                <span className="text-3xl font-black tracking-tight text-foreground">{products.length}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-subtle">Available items</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black tracking-tight text-foreground">100%</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground-subtle">Verified Quality</span>
                            </div>
                        </div>
                    </div>
                </section>


                <AdZone zoneSlug="above_content" className="my-4" />

                <section className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-brand-500" />
                            <h2 className="text-xl font-black tracking-tight text-foreground">
                                All {cat.label}
                            </h2>
                        </div>
                        <div className="h-px flex-1 bg-border/60 mx-6 hidden sm:block"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground-subtle bg-surface px-3 py-1 rounded-full border border-border">
                            {products.length} Results
                        </span>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <AffiliateCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-[300px] flex-col items-center justify-center p-12 text-center">
                            <h3 className="mb-2 text-xl font-bold text-foreground">No {cat.label.toLowerCase()} yet</h3>
                            <p className="max-w-xs text-sm text-foreground-subtle">
                                Products will appear here once added. Check back soon!
                            </p>
                        </div>
                    )}
                </section>

                <AdZone zoneSlug="below_content" className="mt-8" />
            </div>
        </div>
    )
}

import Image from 'next/image'
import { getProductsByCategory } from '@/features/affiliate/queries'
import { ShoppingCart, Sparkles } from 'lucide-react'
import type { AffiliateProduct } from '@/types/post.types'

export async function MobileResourceHub() {
    const [books, stationery, electronics] = await Promise.all([
        getProductsByCategory('books', 4),
        getProductsByCategory('stationery', 3),
        getProductsByCategory('electronics', 3)
    ]);

    // Interleave products for variety, prioritizing books
    const products: AffiliateProduct[] = [];
    for (let i = 0; i < Math.max(books.length, stationery.length, electronics.length); i++) {
        if (books[i]) products.push(books[i] as AffiliateProduct);
        if (stationery[i]) products.push(stationery[i] as AffiliateProduct);
        if (electronics[i]) products.push(electronics[i] as AffiliateProduct);
    }

    if (products.length === 0) return null;

    return (
        <section className="my-16 block lg:hidden w-full overflow-hidden">
            <div className="mb-6 px-1">
                <div className="flex items-center gap-2 mb-2 text-brand-600 dark:text-brand-400">
                    <Sparkles className="size-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Picks</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    Essential Resources
                </h3>
            </div>

            <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 -mx-4 px-4 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {products.map((product) => {
                    const hasDiscount = product.mrp && product.selling_price && product.mrp > product.selling_price;
                    return (
                        <a
                            key={product.id}
                            href={product.product_url}
                            target="_blank"
                            rel="noopener noreferrer nofollow sponsored"
                            className="group relative flex flex-col snap-start shrink-0 w-[220px] rounded-4xl bg-white dark:bg-zinc-900 shadow-xl shadow-brand-500/5 transition-all duration-300 active:scale-95 border border-transparent dark:border-white/5"
                        >
                            {/* Top Image Area */}
                            <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-t-4xl bg-linear-to-br from-slate-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-900 p-6 flex items-center justify-center">
                                {/* Badge Overlay */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 text-[9px] font-black uppercase tracking-widest text-foreground shadow-sm">
                                        {product.category}
                                    </span>
                                </div>

                                <div className="relative w-full h-full">
                                    <Image
                                        src={product.image_url}
                                        alt={product.image_alt || product.name}
                                        fill
                                        className="object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-xl"
                                        sizes="220px"
                                    />
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex flex-col flex-1 p-5 pt-4">
                                <h4 className="text-[14px] font-bold text-foreground leading-snug line-clamp-2 mb-4 group-hover:text-brand-600 transition-colors">
                                    {product.name}
                                </h4>

                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex flex-col">
                                        {hasDiscount && (
                                            <span className="text-[10px] text-foreground-subtle line-through font-bold">
                                                ₹{product.mrp!.toLocaleString()}
                                            </span>
                                        )}
                                        {product.selling_price != null && (
                                            <span className="text-xl font-black text-brand-600 dark:text-brand-400 leading-none tracking-tight">
                                                ₹{product.selling_price.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                        <ShoppingCart className="size-4" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </section>
    );
}

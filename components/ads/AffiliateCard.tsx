import Image from 'next/image'

interface Props {
    product: {
        name: string
        image_url: string
        selling_price?: number | null
        mrp?: number | null
        affiliate_url?: string | null
        badge_text?: string | null
    }
}

export function AffiliateCard({ product }: Props) {
    return (
        <div className="rounded-xl border border-border bg-surface p-4">
            {product.badge_text && (
                <span className="mb-2 inline-block rounded-full bg-accent-500 px-2 py-0.5 text-xs font-medium text-white">
                    {product.badge_text}
                </span>
            )}
            <div className="relative mx-auto mb-3 aspect-square w-32">
                <Image src={product.image_url} alt={product.name} fill className="object-contain" sizes="128px" quality={75} />
            </div>
            <h4 className="line-clamp-2 text-sm font-medium">{product.name}</h4>
            <div className="mt-2 flex items-center gap-2">
                {product.selling_price && (
                    <span className="text-lg font-bold text-brand-600">₹{product.selling_price}</span>
                )}
                {product.mrp && product.selling_price && product.mrp > product.selling_price && (
                    <span className="text-sm text-foreground-subtle line-through">₹{product.mrp}</span>
                )}
            </div>
            {product.affiliate_url && (
                <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="mt-3 flex w-full items-center justify-center rounded-lg bg-accent-500 py-2 text-sm font-medium text-white hover:bg-accent-600 transition-colors"
                >
                    Buy Now
                </a>
            )}
        </div>
    )
}

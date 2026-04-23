'use client'

import { ExternalLink } from 'lucide-react'

interface Props {
    name: string
    price: number | null
    productUrl: string
}

export function StickyMobileCTA({ name, price, productUrl }: Props) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur-lg px-4 py-3 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{name}</p>
                    {price != null && (
                        <p className="text-lg font-black text-foreground">₹{price.toLocaleString()}</p>
                    )}
                </div>
                <a
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 active:scale-95 whitespace-nowrap"
                >
                    Buy Now
                    <ExternalLink className="size-3.5 opacity-70" />
                </a>
            </div>
        </div>
    )
}

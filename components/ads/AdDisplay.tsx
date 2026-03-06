'use client'

import Image from 'next/image'
import type { ActiveAd } from '@/types/advertising.types'

interface Props {
    ad: ActiveAd
    onClick?: () => void
}

export function AdDisplay({ ad, onClick }: Props) {
    const handleClick = () => onClick?.()

    return (
        <div className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
            {ad.is_marked_ad !== false && (
                <span className="absolute right-2 top-2 z-10 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
                    Ad
                </span>
            )}
            {ad.image_url ? (
                <a
                    href={ad.destination_url ?? '#'}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    onClick={handleClick}
                    className="block"
                >
                    <div className="relative aspect-4/1 overflow-hidden">
                        <Image
                            src={ad.image_url}
                            alt={ad.text_headline ?? 'Advertisement'}
                            fill
                            sizes="(max-width: 768px) 100vw, 300px"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    </div>
                    {ad.text_headline && (
                        <p className="px-4 py-2.5 text-sm font-medium text-foreground group-hover:text-brand-600 transition-colors">
                            {ad.text_headline}
                        </p>
                    )}
                </a>
            ) : (
                <a
                    href={ad.destination_url ?? '#'}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    onClick={handleClick}
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                    {ad.text_headline}
                </a>
            )}
        </div>
    )
}

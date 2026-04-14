'use client'

import { 
    MessageCircle, 
    Send, 
    Link2, 
    Check,
    Share2
} from 'lucide-react'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { SITE } from '@/config/site'
import { useState, useEffect } from 'react'

interface Props {
    title: string
    url: string
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    )
}

export function ShareBar({ title, url }: Props) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return <ShareBarContent title={title} url={url} />
}

function ShareBarContent({ title, url }: Props) {
    const { copy, copied } = useCopyToClipboard()
    
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(`${title} - ${SITE.name}`)
    const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`

    const shareLinks = [
        { 
            name: 'WhatsApp', 
            href: whatsappUrl, 
            icon: MessageCircle, 
            color: 'bg-[#25D366] hover:bg-[#20bd5a]', 
            textColor: 'text-white' 
        },
        { 
            name: 'Telegram', 
            href: telegramUrl, 
            icon: Send, 
            color: 'bg-[#0088cc] hover:bg-[#0077b3]', 
            textColor: 'text-white' 
        },
        { 
            name: 'Twitter', 
            href: twitterUrl, 
            icon: XIcon, 
            color: 'bg-black hover:bg-zinc-800', 
            textColor: 'text-white' 
        },
    ]

    const utilityBtnClass = "flex items-center gap-2 rounded-full bg-background-subtle border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-background transition-all shadow-sm active:scale-95"

    return (
        <div className="flex flex-wrap items-center gap-4 py-6 my-4 border-y border-border/50">
            <div className="flex items-center gap-2 mr-2">
                <Share2 className="size-4 text-brand-600" />
                <span className="text-sm font-bold uppercase tracking-wider text-foreground">Spread the Word</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
                {/* Social Share Buttons */}
                {shareLinks.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${link.color} ${link.textColor}`}
                    >
                        <link.icon className="size-3.5" />
                        {link.name}
                    </a>
                ))}

                {/* Copy Link Button */}
                <button
                    onClick={() => copy(url)}
                    className={utilityBtnClass}
                >
                    {copied ? (
                        <>
                            <Check className="size-3.5 text-green-600" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Link2 className="size-3.5" />
                            Copy Link
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

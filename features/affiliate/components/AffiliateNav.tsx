'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

const TABS = [
    { name: 'Products', href: '/admin/affiliate/manage', icon: ShoppingBag },
]

export function AffiliateNav() {
    const pathname = usePathname()

    return (
        <nav className="-mb-px flex space-x-6 overflow-x-auto px-2" aria-label="Tabs">
            {TABS.map((tab) => {
                const active = pathname.startsWith(tab.href)
                const Icon = tab.icon
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`group relative flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all ${active
                            ? 'border-brand-600 text-brand-600'
                            : 'border-transparent text-foreground-muted hover:border-brand-200 hover:text-foreground'
                            }`}
                        aria-current={active ? 'page' : undefined}
                    >
                        <Icon className={`size-3.5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                        {tab.name}
                        {active && (
                            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-brand-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}


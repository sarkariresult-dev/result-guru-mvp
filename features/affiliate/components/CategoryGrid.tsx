import Link from 'next/link'
import { BookOpen, Pen, Laptop, AppWindow, Wrench, Package } from 'lucide-react'
import type { AffiliateCategory, AffiliateCategoryMeta } from '@/features/affiliate/queries'

const ICONS: Record<AffiliateCategory, React.ElementType> = {
    books: BookOpen,
    stationery: Pen,
    electronics: Laptop,
    software: AppWindow,
    tools: Wrench,
    other: Package,
}

const HOVER_RINGS: Record<AffiliateCategory, string> = {
    books: 'group-hover:ring-blue-500/30',
    stationery: 'group-hover:ring-amber-500/30',
    electronics: 'group-hover:ring-violet-500/30',
    software: 'group-hover:ring-emerald-500/30',
    tools: 'group-hover:ring-rose-500/30',
    other: 'group-hover:ring-slate-500/30',
}

const ICON_COLORS: Record<AffiliateCategory, string> = {
    books: 'text-blue-600 dark:text-blue-400',
    stationery: 'text-amber-600 dark:text-amber-400',
    electronics: 'text-violet-600 dark:text-violet-400',
    software: 'text-emerald-600 dark:text-emerald-400',
    tools: 'text-rose-600 dark:text-rose-400',
    other: 'text-slate-600 dark:text-slate-400',
}

interface Props {
    categories: AffiliateCategoryMeta[]
    counts: Record<AffiliateCategory, number>
    activeCategory?: string
}

export function CategoryGrid({ categories, counts, activeCategory }: Props) {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground-muted">
                    Explore Categories
                </h2>
                <div className="h-px flex-1 bg-border/60 ml-4 hidden sm:block"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.filter(cat => (counts[cat.slug] || 0) > 0).map((cat) => {
                    const Icon = ICONS[cat.slug]
                    const count = counts[cat.slug] || 0
                    const isActive = activeCategory === cat.slug

                    return (
                        <Link
                            key={cat.slug}
                            href={`/shop/${cat.slug}`}
                            className={`group relative flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-1`}
                        >
                            <div className={`flex size-16 items-center justify-center rounded-full bg-surface shadow-sm ring-1 ring-border/50 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${ICON_COLORS[cat.slug]} ${HOVER_RINGS[cat.slug]} ${isActive ? 'ring-brand-500 ring-2 shadow-md bg-white dark:bg-zinc-900' : ''}`}>
                                <Icon className="size-6" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-brand-600 transition-colors">
                                    {cat.label}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground-subtle">
                                    {count} items
                                </p>
                            </div>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute -top-1.5 -right-0.5 size-3 rounded-full bg-brand-500 border-2 border-background shadow-sm animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

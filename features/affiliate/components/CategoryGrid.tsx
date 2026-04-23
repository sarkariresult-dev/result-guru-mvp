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

const GRADIENTS: Record<AffiliateCategory, string> = {
    books: 'from-blue-500/10 to-indigo-500/5 hover:from-blue-500/20 hover:to-indigo-500/10 border-blue-200 dark:border-blue-800',
    stationery: 'from-amber-500/10 to-orange-500/5 hover:from-amber-500/20 hover:to-orange-500/10 border-amber-200 dark:border-amber-800',
    electronics: 'from-violet-500/10 to-purple-500/5 hover:from-violet-500/20 hover:to-purple-500/10 border-violet-200 dark:border-violet-800',
    software: 'from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/20 hover:to-teal-500/10 border-emerald-200 dark:border-emerald-800',
    tools: 'from-rose-500/10 to-pink-500/5 hover:from-rose-500/20 hover:to-pink-500/10 border-rose-200 dark:border-rose-800',
    other: 'from-slate-500/10 to-gray-500/5 hover:from-slate-500/20 hover:to-gray-500/10 border-slate-200 dark:border-slate-800',
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
                            className={`group relative flex flex-col items-center gap-4 rounded-2xl border bg-linear-to-br p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${GRADIENTS[cat.slug]} ${isActive ? 'ring-2 ring-brand-500/50 shadow-xl scale-[1.02] bg-white dark:bg-zinc-900' : 'bg-surface'
                                }`}
                        >
                            <div className={`flex size-14 items-center justify-center rounded-2xl bg-white/90 dark:bg-zinc-800/90 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ${ICON_COLORS[cat.slug]}`}>
                                <Icon className="size-7" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-[13px] font-bold tracking-tight text-foreground group-hover:text-brand-600 transition-colors">
                                    {cat.label}
                                </h3>
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="size-1 rounded-full bg-foreground-subtle/30" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground-subtle">
                                        {count} items
                                    </p>
                                </div>
                            </div>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-brand-500 border-2 border-white dark:border-zinc-900 shadow-sm animate-pulse" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}

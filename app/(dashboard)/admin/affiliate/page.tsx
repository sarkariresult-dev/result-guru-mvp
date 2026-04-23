import Link from 'next/link'
import { getAdminAffiliateProducts, getAffiliateCategories } from '@/features/affiliate/queries'
import { Search, ShoppingBag } from 'lucide-react'
import { AffiliateTable } from '@/features/affiliate/components/AffiliateTable'

export default async function AdminAffiliatePage({ searchParams }: {
    searchParams: Promise<{ page?: string; q?: string; type?: string }>
}) {
    const params = await searchParams
    const page = Math.max(1, parseInt(params.page ?? '1', 10))
    const search = params.q?.trim() ?? ''
    const typeSlug = params.type ?? ''

    const [{ data: products, count }, categories] = await Promise.all([
        getAdminAffiliateProducts({ page, search, typeSlug }),
        getAffiliateCategories()
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Affiliate Products</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count} {count === 1 ? 'product' : 'products'} total
                    </p>
                </div>
                <Link
                    href="/admin/affiliate/new"
                    className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                >
                    Add Product
                </Link>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                {/* Search */}
                <form action="/admin/affiliate" method="GET" className="relative max-w-md flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
                    <input
                        type="search"
                        name="q"
                        defaultValue={search}
                        placeholder="Search products by name…"
                        className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-foreground-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    {typeSlug && <input type="hidden" name="type" value={typeSlug} />}
                </form>

                {/* Type Filter */}
                <form action="/admin/affiliate" method="GET" className="flex items-center gap-2">
                    {search && <input type="hidden" name="q" value={search} />}
                    <select
                        name="type"
                        defaultValue={typeSlug}
                        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.label}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
                    >
                        Filter
                    </button>
                    {(typeSlug || search) && (
                        <Link 
                            href="/admin/affiliate" 
                            className="rounded-lg px-4 py-2.5 text-sm font-medium text-brand-600 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                        >
                            Clear
                        </Link>
                    )}
                </form>
            </div>

            {/* Products Table / Empty State */}
            {products.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
                    <ShoppingBag className="size-10 text-foreground-subtle" />
                    <p className="font-medium text-foreground">
                        {search ? 'No products match your search' : 'No products found'}
                    </p>
                    <p className="text-sm text-foreground-muted">
                        {search
                            ? 'Try a different search term or clear filters.'
                            : 'Add your first affiliate product to get started.'}
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
                    <AffiliateTable products={products} />
                </div>
            )}
        </div>
    )
}

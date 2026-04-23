'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'

export function ShopSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get('q') || ''
    const [query, setQuery] = useState(initialQuery)

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = query.trim()
        if (trimmed.length >= 2) {
            router.push(`/shop?q=${encodeURIComponent(trimmed)}`)
        } else if (trimmed.length === 0) {
            router.push('/shop')
        }
    }, [query, router])

    const handleClear = useCallback(() => {
        setQuery('')
        router.push('/shop')
    }, [router])

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/50" />
                <input
                    type="search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search books, tools, electronics..."
                    className="w-full rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 pl-11 pr-10 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:bg-white/15 focus:border-white/30 transition-all"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
                    >
                        <X className="size-3.5 text-white/60" />
                    </button>
                )}
            </div>
        </form>
    )
}

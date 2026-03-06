'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchBar({ className }: { className?: string }) {
    const [query, setQuery] = useState('')
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }

    return (
        <form onSubmit={handleSubmit} className={className}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search jobs, results, admit cards..."
                    className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm placeholder:text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
            </div>
        </form>
    )
}

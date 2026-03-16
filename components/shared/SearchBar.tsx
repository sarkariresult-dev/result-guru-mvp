'use client'

import { Search, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'

interface SearchBarProps {
    className?: string
    initialValue?: string
}

export function SearchBar({ className, initialValue = '' }: SearchBarProps) {
    const [query, setQuery] = useState(initialValue)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    useEffect(() => {
        setQuery(initialValue)
    }, [initialValue])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = query.trim()
        if (trimmed) {
            startTransition(() => {
                router.push(`/search?q=${encodeURIComponent(trimmed)}`)
            })
        }
    }

    const clearQuery = () => setQuery('')

    return (
        <form onSubmit={handleSubmit} className={className} role="search">
            <div className="relative group focus-within:ring-2 focus-within:ring-brand-500/20 rounded-xl transition-shadow">
                <Search className="absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-foreground-subtle transition-colors group-focus-within:text-brand-500" />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search jobs, results, admit cards..."
                    className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-10 text-sm placeholder:text-foreground-subtle focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-0 transition-all"
                />
                
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {query && (
                        <button
                            type="button"
                            onClick={clearQuery}
                            className="p-1 rounded-full text-foreground-subtle hover:bg-background-subtle hover:text-foreground transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                    
                    {isPending && (
                        <Loader2 className="size-4 animate-spin text-brand-500 mr-2" />
                    )}
                </div>
            </div>
        </form>
    )
}

'use client'

import { Search, MapPin, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

interface StateOption {
    slug: string
    name: string
}

interface HeroSearchBarProps {
    states: StateOption[]
}

export function HeroSearchBar({ states }: HeroSearchBarProps) {
    const [query, setQuery] = useState('')
    const [state, setState] = useState('')
    const [stateOpen, setStateOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const selectedLabel = states.find((s) => s.slug === state)?.name ?? 'All States'

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setStateOpen(false)
            }
        }
        document.addEventListener('mousedown', onClick)
        return () => document.removeEventListener('mousedown', onClick)
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (query.trim()) params.set('q', query.trim())
        if (state) params.set('state', state)
        const qs = params.toString()
        router.push(qs ? `/search?${qs}` : '/search')
    }

    return (
        <form onSubmit={handleSubmit} className="w-full" role="search" aria-label="Search jobs and government results">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 rounded-2xl bg-surface p-1.5 shadow-xl ring-1 ring-border sm:rounded-full">
                {/* Search input */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
                    <label htmlFor="hero-search" className="sr-only">Search by job title or organization</label>
                    <input
                        id="hero-search"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by job title or organization..."
                        aria-label="Search by job title or organization"
                        className="h-12 w-full rounded-xl bg-transparent pl-12 pr-4 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none sm:rounded-full"
                    />
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-border shrink-0" />

                {/* State dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setStateOpen((v) => !v)}
                        aria-label={`Filter by state: ${selectedLabel}`}
                        aria-expanded={stateOpen}
                        aria-haspopup="listbox"
                        className="flex h-12 w-full items-center gap-2 rounded-xl px-4 text-sm text-foreground-muted hover:bg-background-subtle transition-colors sm:w-44 sm:rounded-full"
                    >
                        <MapPin className="size-4 text-foreground-subtle shrink-0" />
                        <span className="truncate flex-1 text-left">{selectedLabel}</span>
                        <ChevronDown className={`size-3.5 text-foreground-subtle transition-transform shrink-0 ${stateOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {stateOpen && (
                        <div role="listbox" aria-label="Select state" className="absolute left-0 right-0 sm:left-auto sm:right-0 bottom-full z-60 mb-1 max-h-64 w-full sm:w-56 overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-lg">
                            <button
                                type="button"
                                role="option"
                                aria-selected={!state}
                                onClick={() => { setState(''); setStateOpen(false) }}
                                className={`flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-background-subtle ${!state ? 'text-brand-600 font-medium' : 'text-foreground'}`}
                            >
                                All States
                            </button>
                            {states.map((s) => (
                                <button
                                    key={s.slug}
                                    type="button"
                                    role="option"
                                    aria-selected={state === s.slug}
                                    onClick={() => { setState(s.slug); setStateOpen(false) }}
                                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors hover:bg-background-subtle ${state === s.slug ? 'text-brand-600 font-medium' : 'text-foreground'}`}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search button */}
                <button
                    type="submit"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:rounded-full sm:px-8"
                >
                    <Search className="size-4 sm:hidden" />
                    Search Jobs
                </button>
            </div>
        </form>
    )
}

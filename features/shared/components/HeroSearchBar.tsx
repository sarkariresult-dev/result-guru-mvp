'use client'

import { Search, MapPin, ChevronDown, X, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Form from 'next/form'

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
    const [activeIndex, setActiveIndex] = useState(-1)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const selectedLabel = states.find((s) => s.slug === state)?.name ?? 'All States'
    const options = [{ slug: '', name: 'All States' }, ...states]

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setStateOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Reset active index when dropdown closes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- dropdown state sync
        if (!stateOpen) setActiveIndex(-1)
    }, [stateOpen])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!stateOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setStateOpen(true)
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setActiveIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev))
                break
            case 'ArrowUp':
                e.preventDefault()
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev))
                break
            case 'Enter':
                e.preventDefault()
                if (activeIndex >= 0) {
                    const opt = options[activeIndex]
                    if (opt) {
                        setState(opt.slug)
                        setStateOpen(false)
                    }
                }
                break
            case 'Escape':
                setStateOpen(false)
                break
            case 'Tab':
                setStateOpen(false)
                break
        }
    }

    const clearQuery = () => {
        setQuery('')
        inputRef.current?.focus()
    }

    return (
        <Form
            action="/search"
            className="w-full"
            role="search"
            aria-label="Search jobs and government results"
        >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-0 rounded-2xl bg-surface p-1.5 shadow-xl ring-1 ring-border sm:rounded-full transition-shadow focus-within:ring-brand-500/50 focus-within:shadow-brand-500/10">
                {/* Search input */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
                    <label htmlFor="hero-search" className="sr-only">Search by job title or organization</label>
                    <input
                        ref={inputRef}
                        id="hero-search"
                        name="q"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by job title or organization..."
                        aria-label="Search by job title or organization"
                        className="h-12 w-full rounded-xl bg-transparent pl-12 pr-10 text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none sm:rounded-full"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={clearQuery}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-foreground-subtle hover:bg-background-subtle hover:text-foreground transition-colors"
                            aria-label="Clear search query"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-border shrink-0 mx-1" />

                {/* State dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setStateOpen((v) => !v)}
                        onKeyDown={handleKeyDown}
                        aria-label={`Filter by state: ${selectedLabel}`}
                        aria-expanded={stateOpen}
                        aria-haspopup="listbox"
                        className="flex h-12 w-full items-center gap-2 rounded-xl px-4 text-sm text-foreground-muted hover:bg-background-subtle transition-colors sm:w-44 sm:rounded-full focus:outline-none focus:bg-background-subtle"
                    >
                        <MapPin className="size-4 text-foreground-subtle shrink-0" />
                        <span className="truncate flex-1 text-left">{selectedLabel}</span>
                        <ChevronDown className={`size-3.5 text-foreground-subtle transition-transform shrink-0 ${stateOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Hidden input for state selection which next/form uses for query strings */}
                    <input type="hidden" name="state" value={state} />

                    {stateOpen && (
                        <div 
                            role="listbox" 
                            aria-label="Select state" 
                            className="absolute left-0 right-0 sm:left-auto sm:right-0 bottom-full sm:top-full sm:bottom-auto z-60 mt-1 mb-1 max-h-64 w-full sm:w-56 overflow-y-auto rounded-xl border border-border bg-surface py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
                        >
                            {options.map((opt, idx) => (
                                <button
                                    key={opt.slug}
                                    type="button"
                                    role="option"
                                    aria-selected={state === opt.slug || activeIndex === idx}
                                    onClick={() => { setState(opt.slug); setStateOpen(false) }}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    className={`flex w-full items-center px-4 py-2.5 text-xs sm:text-sm transition-colors ${
                                        state === opt.slug 
                                            ? 'bg-brand-50 text-brand-700 font-semibold dark:bg-brand-900/30 dark:text-brand-400' 
                                            : activeIndex === idx
                                            ? 'bg-background-subtle text-foreground'
                                            : 'text-foreground-muted hover:bg-background-subtle hover:text-foreground'
                                    }`}
                                >
                                    <span className="truncate">{opt.name}</span>
                                    {state === opt.slug && (
                                        <div className="ml-auto size-1.5 rounded-full bg-brand-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Search button */}
                <button
                    type="submit"
                    className="relative flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white transition-all hover:bg-brand-700 hover:shadow-lg active:scale-[0.98] sm:rounded-full sm:px-8"
                >
                    <Search className="size-4" />
                    <span>Search Jobs</span>
                </button>
            </div>
            
        </Form>
    )
}

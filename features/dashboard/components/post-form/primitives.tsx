/**
 * Shared UI primitives for the PostForm.
 * Small, focused components used across sections.
 */
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, X, Search } from 'lucide-react'

// ── CSS classes (shared) ─────────────────────────────────────────────────────

export const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors'
export const selectCls = inputCls

// ── Panel (collapsible sidebar section) ──────────────────────────────────────

export function Panel({ title, defaultOpen = false, badge, children }: {
    title: string
    defaultOpen?: boolean
    badge?: string | number
    children: React.ReactNode
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    return (
        <div className="rounded-xl border border-border bg-surface shadow-sm">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-semibold text-foreground hover:bg-background-subtle/50 transition-colors ${isOpen ? 'rounded-t-xl' : 'rounded-xl'}`}
            >
                <span className="flex-1">{title}</span>
                {badge !== undefined && (
                    <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-600">{badge}</span>
                )}
                {isOpen ? <ChevronUp className="size-3.5 text-foreground-subtle" /> : <ChevronDown className="size-3.5 text-foreground-subtle" />}
            </button>
            {isOpen && <div className="border-t border-border px-4 py-3.5 space-y-3 rounded-b-xl">{children}</div>}
        </div>
    )
}

// ── Field wrapper ────────────────────────────────────────────────────────────

export function Field({ label, children, required, hint, counter }: {
    label: string
    children: React.ReactNode
    required?: boolean
    hint?: string
    counter?: string
}) {
    return (
        <label className="block">
            <span className="mb-1 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-foreground-muted">
                <span>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
                {counter && <span className="normal-case tracking-normal font-normal">{counter}</span>}
            </span>
            {children}
            {hint && <span className="mt-1 block text-xs text-foreground-subtle">{hint}</span>}
        </label>
    )
}

// ── Searchable Select ────────────────────────────────────────────────────────

interface Option { value: string; label: string }

export function SearchableSelect({ options, value, onChange, placeholder = 'Select…', emptyLabel = 'None' }: {
    options: Option[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    emptyLabel?: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const filtered = search
        ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        : options

    const selectedLabel = options.find(o => o.value === value)?.label

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen])

    // Focus search input when opened
    useEffect(() => {
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    const handleSelect = useCallback((val: string) => {
        onChange(val)
        setIsOpen(false)
        setSearch('')
    }, [onChange])

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`${inputCls} flex items-center justify-between text-left`}
            >
                <span className={selectedLabel ? '' : 'text-foreground-subtle'}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown className="size-3.5 text-foreground-subtle shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
                    {/* Search input */}
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                        <Search className="size-3.5 text-foreground-subtle shrink-0" />
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search…"
                            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} className="text-foreground-subtle hover:text-foreground">
                                <X className="size-3" />
                            </button>
                        )}
                    </div>

                    {/* Options list */}
                    <div className="max-h-48 overflow-y-auto overscroll-contain">
                        <button
                            type="button"
                            onClick={() => handleSelect('')}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-background-subtle transition-colors ${!value ? 'text-brand-600 font-medium' : 'text-foreground-subtle'}`}
                        >
                            {emptyLabel}
                        </button>
                        {filtered.map(o => (
                            <button
                                key={o.value}
                                type="button"
                                onClick={() => handleSelect(o.value)}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-background-subtle transition-colors ${o.value === value ? 'text-brand-600 bg-brand-50/50 font-medium' : 'text-foreground'}`}
                            >
                                {o.label}
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <p className="px-3 py-6 text-center text-xs text-foreground-subtle">No results</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Searchable Multi-Select ──────────────────────────────────────────────────

export function SearchableMultiSelect({ options, value, onChange, placeholder = 'Select…' }: {
    options: Option[]
    value: string[]
    onChange: (value: string[]) => void
    placeholder?: string
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const filtered = search
        ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        : options

    const selectedLabels = value.map(v => options.find(o => o.value === v)?.label).filter(Boolean)
    const displayValue = selectedLabels.length > 0 
        ? (selectedLabels.length <= 2 ? selectedLabels.join(', ') : `${selectedLabels.length} selected`)
        : placeholder

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [isOpen])

    // Focus search input when opened
    useEffect(() => {
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    const toggleSelect = useCallback((val: string) => {
        if (value.includes(val)) {
            onChange(value.filter(v => v !== val))
        } else {
            onChange([...value, val])
        }
    }, [value, onChange])

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`${inputCls} flex items-center justify-between text-left`}
            >
                <span className={value.length > 0 ? '' : 'text-foreground-subtle max-w-[85%] truncate'}>
                    <span className="truncate block">{displayValue}</span>
                </span>
                <ChevronDown className="size-3.5 text-foreground-subtle shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
                    {/* Search input */}
                    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                        <Search className="size-3.5 text-foreground-subtle shrink-0" />
                        <input
                            ref={inputRef}
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search…"
                            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
                        />
                        {search && (
                            <button type="button" onClick={() => setSearch('')} className="text-foreground-subtle hover:text-foreground">
                                <X className="size-3" />
                            </button>
                        )}
                    </div>

                    {/* Options list */}
                    <div className="max-h-48 overflow-y-auto overscroll-contain">
                        {filtered.map(o => {
                            const isSelected = value.includes(o.value)
                            return (
                                <button
                                    key={o.value}
                                    type="button"
                                    onClick={() => toggleSelect(o.value)}
                                    className={`flex items-center gap-2 w-full px-3 py-2 text-left text-sm hover:bg-background-subtle transition-colors ${isSelected ? 'text-brand-600 bg-brand-50/50 font-medium' : 'text-foreground'}`}
                                >
                                    <div className={`flex items-center justify-center size-4 shrink-0 rounded border ${isSelected ? 'bg-brand-500 border-brand-500 text-white' : 'border-border'}`}>
                                        {isSelected && <svg viewBox="0 0 14 14" fill="none" className="size-3"><path d="M3 7.5L5.5 10L11 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                    </div>
                                    <span className="truncate">{o.label}</span>
                                </button>
                            )
                        })}
                        {filtered.length === 0 && (
                            <p className="px-3 py-6 text-center text-xs text-foreground-subtle">No results</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Chip Select (multi-select with toggle chips) ─────────────────────────────


export function ChipSelect({ label, options, value, onChange }: {
    label: string
    options: Option[]
    value: string[]
    onChange: (v: string[]) => void
}) {
    return (
        <fieldset>
            <legend className="mb-1 block text-xs font-medium uppercase tracking-wider text-foreground-muted">{label}</legend>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
                {options.map(o => {
                    const sel = value.includes(o.value)
                    return (
                        <button
                            key={o.value}
                            type="button"
                            aria-pressed={sel}
                            onClick={() => onChange(sel ? value.filter(v => v !== o.value) : [...value, o.value])}
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${sel
                                ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300 shadow-sm'
                                : 'border-border text-foreground-muted hover:border-brand-300 hover:bg-brand-50/50'
                                }`}
                        >
                            {o.label}
                        </button>
                    )
                })}
                {options.length === 0 && <span className="text-xs text-foreground-subtle">No options available</span>}
            </div>
        </fieldset>
    )
}

// ── Date formatter (IST) ─────────────────────────────────────────────────────

export function toISODate(val: unknown): string {
    if (!val) return ''
    try {
        const d = new Date(String(val))
        if (isNaN(d.getTime())) return ''
        return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Kolkata' })
    } catch {
        return ''
    }
}

'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LocalErrorBoundary } from '@/components/shared/LocalErrorBoundary'

interface FAQItem {
    question: string
    answer: string
}

export function FAQAccordion({ items }: { items: FAQItem[] }) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <LocalErrorBoundary name="FAQAccordion">
            <FAQAccordionContent items={items} />
        </LocalErrorBoundary>
    )
}

function FAQAccordionContent({ items }: { items: FAQItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    if (!items || items.length === 0) return null

    return (
        <section id="faq-section" className="mt-20">
            <div className="flex items-center gap-3 mb-10">
                <div className="h-px w-6 bg-brand-500" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground-subtle">
                    Curated Insights & FAQ
                </h2>
            </div>

            <div className="space-y-0">
                {items.map((item, i) => {
                    const isOpen = openIndex === i
                    return (
                        <div
                            key={i}
                            className="border-b border-border/60 last:border-0"
                        >
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : i)}
                                className="flex w-full items-center justify-between gap-6 py-6 text-left outline-none group"
                                aria-expanded={isOpen}
                            >
                                <span className={cn(
                                    "text-lg font-black tracking-tight transition-colors duration-slow leading-snug",
                                    isOpen ? "text-brand-600 dark:text-brand-400" : "text-foreground group-hover:text-brand-600"
                                )}>
                                    {item.question}
                                </span>
                                <div className={cn(
                                    "relative size-6 shrink-0 transition-transform duration-slow",
                                    isOpen && "rotate-45"
                                )}>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-px w-4 bg-foreground-subtle group-hover:bg-brand-500 transition-colors" />
                                        <div className="h-4 w-px bg-foreground-subtle group-hover:bg-brand-500 transition-colors" />
                                    </div>
                                </div>
                            </button>
                            <div
                                className={cn(
                                    "grid transition-all duration-slow ease-in-out",
                                    isOpen ? "grid-rows-[1fr] opacity-100 pb-8" : "grid-rows-[0fr] opacity-0"
                                )}
                            >
                                <div className="overflow-hidden">
                                    <div className="text-base leading-relaxed text-foreground-muted font-medium max-w-2xl">
                                        {item.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

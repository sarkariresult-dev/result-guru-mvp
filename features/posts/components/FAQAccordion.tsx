'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
    question: string
    answer: string
}

import { LocalErrorBoundary } from '@/components/shared/LocalErrorBoundary'

export function FAQAccordion({ items }: { items: FAQItem[] }) {
    return (
        <LocalErrorBoundary name="FAQAccordion">
            <FAQAccordionInternal items={items} />
        </LocalErrorBoundary>
    )
}

function FAQAccordionInternal({ items }: { items: FAQItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    if (!items || items.length === 0) return null

    return (
        <section id="faq-section">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                    <HelpCircle className="size-4.5" />
                </div>
                <h2 className="font-display text-lg font-bold text-foreground">Frequently Asked Questions</h2>
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
                {items.map((item, i) => {
                    const isOpen = openIndex === i
                    return (
                        <div
                            key={i}
                            className={cn(
                                "rounded-xl border-0 border-l-[3px] bg-background-subtle transition-all duration-200",
                                isOpen
                                    ? "border-l-brand-600 dark:border-l-brand-400"
                                    : "border-l-transparent hover:border-l-brand-300 dark:hover:border-l-brand-700"
                            )}
                        >
                            <button
                                onClick={() => setOpenIndex(isOpen ? null : i)}
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left rounded-xl outline-none"
                                aria-expanded={isOpen}
                            >
                                <span className="text-sm font-semibold text-foreground leading-snug">
                                    {item.question}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'size-5 shrink-0 text-foreground-subtle transition-transform duration-200',
                                        isOpen && 'rotate-180'
                                    )}
                                />
                            </button>
                            <div
                                className={cn(
                                    "grid transition-all duration-200 ease-in-out",
                                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                )}
                            >
                                <div className="overflow-hidden">
                                    <div className="px-5 pb-4 text-sm leading-relaxed text-foreground-muted">
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

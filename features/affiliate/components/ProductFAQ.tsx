'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'

interface FAQItem {
    q: string
    a: string
}

interface Props {
    faq: FAQItem[]
    productName: string
}

export function ProductFAQ({ faq, productName }: Props) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    if (!faq || faq.length === 0) return null

    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(item => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
            },
        })),
    }

    return (
        <section className="space-y-4">
            <JsonLd data={faqJsonLd} />
            <h2 className="font-display text-xl font-bold text-foreground">
                Frequently Asked Questions
            </h2>
            <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
                {faq.map((item, i) => (
                    <div key={i}>
                        <button
                            type="button"
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-background-subtle"
                            aria-expanded={openIndex === i}
                        >
                            <span className="text-sm font-semibold text-foreground leading-snug">
                                {item.q}
                            </span>
                            <ChevronDown
                                className={`size-4 shrink-0 text-foreground-subtle transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-200 ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <p className="px-5 pb-4 text-sm text-foreground-muted leading-relaxed">
                                {item.a}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

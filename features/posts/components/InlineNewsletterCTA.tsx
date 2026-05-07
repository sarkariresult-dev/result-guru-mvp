'use client'

import { Mail } from 'lucide-react'
import { NewsletterForm } from '@/features/shared/components/NewsletterForm'
import { Card, CardContent } from '@/components/ui/Card'

export function InlineNewsletterCTA() {
    return (
        <Card className="my-8 border-brand-500/20 bg-brand-50/50 dark:bg-brand-950/20 shadow-none">
            <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 shrink-0">
                    <Mail className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h3 className="text-xl font-black text-foreground tracking-tight">Never miss an update</h3>
                    <p className="text-sm text-foreground-subtle max-w-lg">
                        Get the latest exam results, admit cards, and job notifications delivered straight to your inbox. No spam, ever.
                    </p>
                </div>
                <div className="w-full md:w-auto min-w-[280px]">
                    <NewsletterForm />
                </div>
            </CardContent>
        </Card>
    )
}

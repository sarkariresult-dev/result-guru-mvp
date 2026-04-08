import Link from 'next/link'
import { getQualifications } from '@/lib/queries/taxonomy'
import { buildPageMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { SITE } from '@/config/site'
import { GraduationCap, Search, ServerCrash, BookOpen, Briefcase, FileSignature, ArrowRight } from 'lucide-react'

export const metadata = buildPageMetadata({
    title: 'Qualification-wise Government Jobs & Results',
    description: 'Browse all government jobs, exam results, scholarships, and recruitment updates organized by educational qualification. Find 10th pass, 12th pass, and graduation specific opportunities.',
    path: '/qualifications',
})

export default async function QualificationsDirectoryPage() {
    let quals: Awaited<ReturnType<typeof getQualifications>> = []
    let fetchError = false

    try {
        quals = await getQualifications()
    } catch {
        fetchError = true
    }

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Qualifications', url: `${SITE.url}/qualifications` },
    ])

    /* ItemList JSON-LD */
    const itemListJsonLd = quals.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Educational Qualifications',
        numberOfItems: quals.length,
        itemListElement: quals.map((qual, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE.url}/qualification/${qual.slug}`,
            name: qual.name,
        })),
    } : null

    return (
        <>
            <JsonLd data={itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb items={[{ label: 'Qualifications' }]} />

                {/* Header */}
                <div className="mb-10 mt-4 max-w-3xl">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
                        <GraduationCap className="size-8 text-brand-600" />
                        Explore by Qualification
                    </h1>
                    <p className="mt-4 text-lg text-foreground-muted leading-relaxed">
                        Looking for a specific opportunity based on your education? We organize the latest Government Jobs, 
                        Scholarships, and Exam Results by qualification to help you find the right match faster.
                    </p>
                </div>

                {/* Count badge */}
                {quals.length > 0 && (
                    <div className="mb-6 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-sm font-medium text-brand-700 dark:text-brand-300">
                            <GraduationCap className="size-3.5" />
                            {quals.length} Qualifications
                        </span>
                    </div>
                )}

                {/* Grid */}
                {quals.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {quals.map((qual) => (
                            <div
                                key={qual.slug}
                                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
                            >
                                <div className="p-6">
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                                        <BookOpen className="size-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-foreground">
                                        {qual.name}
                                    </h2>
                                    {qual.short_name && qual.short_name !== qual.name && (
                                        <p className="mt-1 text-sm font-medium text-foreground-subtle">
                                            {qual.short_name}
                                        </p>
                                    )}

                                    {/* Programmatic SEO Quick Links inside the card */}
                                    <div className="mt-6 flex flex-col gap-2">
                                        <Link 
                                            href={`/job/for/${qual.slug}`}
                                            className="inline-flex items-center justify-between rounded-lg bg-background-muted px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background-subtle hover:text-brand-600 group/link"
                                        >
                                            <span className="flex items-center gap-2"><Briefcase className="size-4" /> Latest Jobs</span>
                                            <ArrowRight className="size-4 opacity-50 group-hover/link:translate-x-1 group-hover/link:opacity-100 transition-all" />
                                        </Link>
                                        <Link 
                                            href={`/result/for/${qual.slug}`}
                                            className="inline-flex items-center justify-between rounded-lg bg-background-muted px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background-subtle hover:text-brand-600 group/link"
                                        >
                                            <span className="flex items-center gap-2"><FileSignature className="size-4" /> Results &amp; Updates</span>
                                            <ArrowRight className="size-4 opacity-50 group-hover/link:translate-x-1 group-hover/link:opacity-100 transition-all" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : fetchError ? (
                    <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <ServerCrash className="size-8 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h3>
                        <p className="max-w-sm text-sm text-foreground-muted">
                            Could not load qualifications. Please try again in a moment.
                        </p>
                    </div>
                ) : (
                    <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-background-subtle">
                            <Search className="size-8 text-foreground-muted" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">No qualifications found</h3>
                        <p className="max-w-sm text-sm text-foreground-muted">
                            Check back soon for updates!
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

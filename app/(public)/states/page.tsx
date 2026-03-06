import Link from 'next/link'
import { getStates } from '@/lib/queries/states'
import { buildPageMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { SITE } from '@/config/site'
import { MapPin, Search, ServerCrash, ArrowRight } from 'lucide-react'

export const metadata = buildPageMetadata({
    title: 'State-wise Government Jobs & Results',
    description: 'Browse all government jobs, exam results, admit cards, and recruitment updates by Indian state and union territory. Find state-specific opportunities across India.',
    path: '/states',
})

export default async function StatesDirectoryPage() {
    let states: Awaited<ReturnType<typeof getStates>> = []
    let fetchError = false

    try {
        states = await getStates()
    } catch {
        fetchError = true
    }

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'States', url: `${SITE.url}/states` },
    ])

    /* ItemList JSON-LD for states directory */
    const itemListJsonLd = states.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Indian States & Union Territories',
        numberOfItems: states.length,
        itemListElement: states.map((state, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE.url}/states/${state.slug}`,
            name: state.name,
        })),
    } : null

    return (
        <>
            <JsonLd data={itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb items={[{ label: 'States' }]} />

                {/* Header */}
                <div className="mb-10 mt-4 max-w-3xl">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        State-wise Government Jobs &amp; Results
                    </h1>
                    <p className="mt-3 text-lg text-foreground-muted leading-relaxed">
                        Browse government job notifications, exam results, admit cards, and updates specific to your state.
                        Select a state below to find relevant opportunities.
                    </p>
                </div>

                {/* Count badge */}
                {states.length > 0 && (
                    <div className="mb-6 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-sm font-medium text-brand-700 dark:text-brand-300">
                            <MapPin className="size-3.5" />
                            {states.length} States &amp; UTs
                        </span>
                    </div>
                )}

                {/* Grid */}
                {states.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {states.map((state) => (
                            <Link
                                key={state.slug}
                                href={`/states/${state.slug}`}
                                className="group flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-all hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700 hover:-translate-y-0.5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 transition-colors group-hover:bg-brand-100 dark:group-hover:bg-brand-900/60">
                                        <MapPin className="size-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="font-semibold text-foreground group-hover:text-brand-600 transition-colors">
                                            {state.name}
                                        </h2>
                                        {state.abbr && (
                                            <p className="mt-0.5 text-xs font-medium text-foreground-subtle">
                                                {state.abbr}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <ArrowRight className="size-4 text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        ))}
                    </div>
                ) : fetchError ? (
                    <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-8 text-center">
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                            <ServerCrash className="size-8 text-red-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">Connection Error</h3>
                        <p className="max-w-sm text-sm text-foreground-muted">
                            Could not load states directory. Please try again in a moment.
                        </p>
                    </div>
                ) : (
                    <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-background-subtle">
                            <Search className="size-8 text-foreground-muted" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">No states found</h3>
                        <p className="max-w-sm text-sm text-foreground-muted">
                            We don&apos;t have any active states in our directory at the moment. Check back soon!
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

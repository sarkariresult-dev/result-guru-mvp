import Link from 'next/link'
import { getOrganizations } from '@/lib/queries/organizations'
import { buildPageMetadata } from '@/lib/metadata'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { SITE } from '@/config/site'
import { Building2, MapPin, Search, ServerCrash, ArrowRight } from 'lucide-react'

export const metadata = buildPageMetadata({
    title: 'Government Organizations & Recruitment Bodies',
    description: 'Browse all government organizations, recruitment boards, commissions, and examination bodies across India. SSC, UPSC, Railway, Banking, State PSC, and more.',
    path: '/organizations',
})

export default async function OrganizationsDirectoryPage() {
    let organizations: Awaited<ReturnType<typeof getOrganizations>> = []
    let fetchError = false

    try {
        organizations = await getOrganizations()
    } catch {
        fetchError = true
    }

    /* Breadcrumb JSON-LD */
    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Organizations', url: `${SITE.url}/organizations` },
    ])

    /* ItemList JSON-LD for orgs directory */
    const itemListJsonLd = organizations.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Government Organizations & Recruitment Bodies',
        numberOfItems: organizations.length,
        itemListElement: organizations.map((org, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE.url}/organizations/${org.slug}`,
            name: org.name,
        })),
    } : null

    return (
        <>
            <JsonLd data={itemListJsonLd ? [breadcrumbJsonLd, itemListJsonLd] : breadcrumbJsonLd} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb items={[{ label: 'Organizations' }]} />

                {/* Header */}
                <div className="mb-10 mt-4 max-w-3xl">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Government Organizations
                    </h1>
                    <p className="mt-3 text-lg text-foreground-muted leading-relaxed">
                        Browse government recruitment boards, commissions, and examination bodies.
                        Select an organization to view its latest jobs, results, and notifications.
                    </p>
                </div>

                {/* Count badge */}
                {organizations.length > 0 && (
                    <div className="mb-6 flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-sm font-medium text-brand-700 dark:text-brand-300">
                            <Building2 className="size-3.5" />
                            {organizations.length} Organizations
                        </span>
                    </div>
                )}

                {/* Grid */}
                {organizations.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {organizations.map((org) => (
                            <Link
                                key={org.id}
                                href={`/organizations/${org.slug}`}
                                className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-all hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700 hover:-translate-y-0.5"
                            >
                                {org.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element -- dynamic org logos from Supabase
                                    <img
                                        src={org.logo_url}
                                        alt={`${org.name} logo`}
                                        width={56}
                                        height={56}
                                        className="size-14 shrink-0 rounded-lg bg-white object-contain p-1.5 shadow-sm border border-border"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-lg font-bold text-brand-600 dark:text-brand-400">
                                        {(org.short_name || org.name).substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <h2 className="font-semibold text-foreground line-clamp-2 group-hover:text-brand-600 transition-colors text-sm">
                                        {org.name}
                                    </h2>
                                    <div className="mt-1 flex items-center gap-3 text-xs text-foreground-subtle">
                                        {org.short_name && (
                                            <span className="font-medium text-brand-600 dark:text-brand-400">
                                                {org.short_name}
                                            </span>
                                        )}
                                        {org.state_slug && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="size-3" />
                                                {org.state_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <ArrowRight className="size-4 shrink-0 text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity" />
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
                            Could not load organizations. Please try again in a moment.
                        </p>
                    </div>
                ) : (
                    <div className="flex min-h-100 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-background-subtle">
                            <Search className="size-8 text-foreground-muted" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground">No organizations found</h3>
                        <p className="max-w-sm text-sm text-foreground-muted">
                            We don&apos;t have any active organizations in our directory at the moment. Check back soon!
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

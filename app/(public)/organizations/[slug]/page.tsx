import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getOrganizationBySlug } from '@/lib/queries/organizations'
import { getPosts, getPostsCount } from '@/features/posts/queries'
import { PostGrid } from '@/features/posts/components/PostGrid'
import { AdZone } from '@/components/ads/AdZone'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { JsonLd } from '@/components/seo/JsonLd'
import { NewsletterForm } from '@/features/shared/components/NewsletterForm'
import { buildBreadcrumbSchema } from '@/lib/jsonld'
import { formatTitle } from '@/lib/metadata'
import { SITE, ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'
import { PAGINATION } from '@/config/constants'
import { Building2, MapPin, Globe, ExternalLink, FileText, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import type { PostCard } from '@/types/post.types'

/* ── Types ───────────────────────────────────────────────────────── */

interface Props {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ page?: string }>
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    if (total > 1) pages.push(total)
    return pages
}

/* ── Metadata ────────────────────────────────────────────────────── */

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { slug } = await params
    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    let org: Awaited<ReturnType<typeof getOrganizationBySlug>> = null

    try {
        org = await getOrganizationBySlug(slug)
    } catch {
        return {}
    }

    if (!org) return {}

    const baseTitle = page > 1 
      ? `${org.name} - Page ${page} - Sarkari Update` 
      : (org.meta_title ?? `${org.name}${org.short_name ? ` (${org.short_name})` : ''} | Jobs & Results 2026`)
    const title = formatTitle(baseTitle)
    const description = org.meta_description ?? `Find all the latest government jobs, exam results, admit cards, and notifications from ${org.name} (${org.short_name ?? slug}). Updated daily.`
    const url = `${SITE.url}/organizations/${slug}`
    const canonical = page > 1 ? `${url}?page=${page}` : url

    // Fetch total count for prev/next calculation
    const totalCount = await getPostsCount({ organization_id: org.id }).catch(() => 0)
    const totalPages = Math.ceil(totalCount / PAGINATION.DEFAULT_LIMIT)

    const baseMetadata: Metadata = {
        title,
        description,
        alternates: {
            canonical,
        },
        ...(org.meta_robots && { robots: org.meta_robots }),
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: SITE.name,
            locale: SITE.locale,
            type: 'website',
            images: [{ url: org.logo_url ?? SITE.defaultOgImage, width: SITE.defaultOgWidth, height: SITE.defaultOgHeight }],
        },
        twitter: {
            card: SITE.twitter.cardType,
            site: SITE.twitter.handle,
            title,
            description,
        },
    }

    // Add prev/next alternates
    if (page > 1 || page < totalPages) {
        baseMetadata.alternates = {
            ...baseMetadata.alternates,
            ...(page > 1 && { prev: page === 2 ? url : `${url}?page=${page - 1}` }),
            ...(page < totalPages && { next: `${url}?page=${page + 1}` }),
        }
    }

    return baseMetadata
}

/* ── Page ─────────────────────────────────────────────────────────── */

export default async function OrganizationProfilePage({ params, searchParams }: Props) {
    const { slug } = await params

    let org: Awaited<ReturnType<typeof getOrganizationBySlug>> = null
    try {
        org = await getOrganizationBySlug(slug)
    } catch {
        notFound()
    }

    if (!org || !org.is_active) notFound()

    const { page: pageParam } = await searchParams
    const page = Math.max(1, Number(pageParam ?? '1'))
    const limit = PAGINATION.DEFAULT_LIMIT
    const filters = { organization_id: org.id }

    const [posts, totalCount] = await Promise.all([
        getPosts(filters, page).catch((): PostCard[] => []),
        getPostsCount(filters).catch(() => 0),
    ])

    const totalPages = Math.max(1, Math.ceil(totalCount / limit))

    /* ── JSON-LD ─────────────────────────────────────────────── */

    const breadcrumbJsonLd = buildBreadcrumbSchema([
        { name: 'Home', url: SITE.url },
        { name: 'Organizations', url: `${SITE.url}/organizations` },
        { name: org.short_name ?? org.name, url: `${SITE.url}/organizations/${slug}` },
    ])

    const orgJsonLd = org.schema_json ?? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: org.name,
        url: org.official_url ?? `${SITE.url}/organizations/${slug}`,
        ...(org.logo_url && { logo: org.logo_url }),
        ...(org.description && { description: org.description }),
    }

    /* CollectionPage JSON-LD */
    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${org.short_name ?? org.name} Jobs, Results & Updates`,
        description: `Latest government jobs, exam results, and notifications from ${org.name}.`,
        url: `${SITE.url}/organizations/${slug}`,
        isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
        ...(totalCount > 0 && {
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: totalCount,
                itemListElement: posts.slice(0, 10).map((post, i) => ({
                    '@type': 'ListItem',
                    position: (page - 1) * limit + i + 1,
                    url: `${SITE.url}${ROUTE_PREFIXES[post.type as PostTypeKey] || `/${post.type}`}/${post.slug}`,
                    name: post.title,
                })),
            },
        }),
    }


    /* ── Build rel="prev" / rel="next" for paginated pages ──────── */
    const basePath = `/organizations/${slug}`
    const prevUrl = page > 1 ? (page === 2 ? basePath : `${basePath}?page=${page - 1}`) : null
    const nextUrl = page < totalPages ? `${basePath}?page=${page + 1}` : null

    return (
        <>
            {/* Pagination link relations for crawlers */}
            {prevUrl && <link rel="prev" href={`${SITE.url}${prevUrl}`} />}
            {nextUrl && <link rel="next" href={`${SITE.url}${nextUrl}`} />}

            <JsonLd data={[breadcrumbJsonLd, orgJsonLd, collectionJsonLd]} />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: 'Organizations', href: '/organizations' },
                        { label: org.short_name ?? org.name },
                    ]}
                />

                {/* Org profile card */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
                    <div className="bg-brand-50 dark:bg-brand-950/20 px-6 py-8 sm:px-10 sm:py-10">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                            {org.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element -- dynamic org logos from Supabase
                                <img
                                    src={org.logo_url}
                                    alt={`${org.name} logo`}
                                    width={96}
                                    height={96}
                                    className="size-24 rounded-xl bg-white object-contain p-2 shadow-sm border border-border"
                                />
                            ) : (
                                <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900 border border-brand-200 dark:border-brand-800 shadow-sm text-3xl font-bold text-brand-600 dark:text-brand-400">
                                    {(org.short_name || org.name).substring(0, 2).toUpperCase()}
                                </div>
                            )}

                            <div className="flex-1">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    {org.name}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-foreground-subtle">
                                    {org.short_name && (
                                        <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 dark:bg-brand-950/30 px-2.5 py-1 font-medium text-brand-600 dark:text-brand-400">
                                            <Building2 className="size-3.5" />
                                            {org.short_name}
                                        </span>
                                    )}
                                    {org.state_slug && (
                                        <Link
                                            href={`/states/${org.state_slug}`}
                                            className="inline-flex items-center gap-1.5 rounded-md bg-background-subtle px-2.5 py-1 hover:text-foreground transition-colors"
                                        >
                                            <MapPin className="size-3.5" />
                                            {org.state_slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </Link>
                                    )}
                                    {org.official_url && (
                                        <a
                                            href={org.official_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 dark:bg-brand-950/30 px-2.5 py-1 font-medium text-brand-600 hover:text-brand-700 transition-colors"
                                        >
                                            <Globe className="size-3.5" />
                                            Official Website
                                            <ExternalLink className="size-3" />
                                        </a>
                                    )}
                                </div>
                                {org.description && (
                                    <p className="mt-4 max-w-3xl text-foreground-muted leading-relaxed">
                                        {org.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <AdZone zoneSlug="below_header" className="my-8" />

                {/* Posts section */}
                <section aria-labelledby="org-posts-heading">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <FileText className="size-5 text-brand-600" />
                            <h2 id="org-posts-heading" className="text-xl font-bold text-foreground">
                                Latest Updates from {org.short_name ?? org.name}
                            </h2>
                        </div>
                        {totalCount > 0 && (
                            <span className="hidden text-sm text-foreground-subtle sm:inline">
                                {totalCount.toLocaleString('en-IN')} total
                            </span>
                        )}
                    </div>

                    {posts.length > 0 ? (
                        <>
                            <PostGrid posts={posts} priority={3} />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
                                    {page > 1 && (
                                        <Link
                                            href={`/organizations/${slug}?page=${page - 1}`}
                                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-background-subtle transition-colors"
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft className="size-4" /> Prev
                                        </Link>
                                    )}
                                    {getPageNumbers(page, totalPages).map((p, idx) =>
                                        p === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="px-2 text-foreground-subtle">
                                                &hellip;
                                            </span>
                                        ) : (
                                            <Link
                                                key={p}
                                                href={`/organizations/${slug}?page=${p}`}
                                                aria-current={p === page ? 'page' : undefined}
                                                className={`inline-flex size-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page
                                                    ? 'bg-brand-600 text-white shadow-sm'
                                                    : 'border border-border bg-surface text-foreground-muted hover:bg-background-subtle'
                                                    }`}
                                            >
                                                {p}
                                            </Link>
                                        ),
                                    )}
                                    {page < totalPages && (
                                        <Link
                                            href={`/organizations/${slug}?page=${page + 1}`}
                                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground-muted hover:bg-background-subtle transition-colors"
                                            aria-label="Next page"
                                        >
                                            Next <ChevronRight className="size-4" />
                                        </Link>
                                    )}
                                </nav>
                            )}
                        </>
                    ) : (
                        <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-background-subtle">
                                <Building2 className="size-7 text-foreground-muted" />
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-foreground">No updates yet</h3>
                            <p className="max-w-md text-sm text-foreground-muted">
                                We haven&apos;t published any posts for {org.short_name || org.name} yet. Check back soon!
                            </p>
                            <Link
                                href="/organizations"
                                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                            >
                                Browse Organizations
                            </Link>
                        </div>
                    )}
                </section>

                <AdZone zoneSlug="below_content" className="mt-10" />

                {/* Newsletter CTA */}
                <div className="mt-12 rounded-2xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-950/20 p-8 text-center sm:p-10">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 mb-4">
                        <Bell className="size-6 text-brand-600" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                        Get {org.short_name ?? org.name} Updates
                    </h3>
                    <p className="mx-auto mb-6 max-w-md text-sm text-foreground-muted">
                        Subscribe to receive instant notifications about new jobs, results, and admit cards from {org.short_name ?? org.name}. Free forever. No spam.
                    </p>
                    <div className="mx-auto max-w-md">
                        <NewsletterForm />
                    </div>
                </div>
            </div>
        </>
    )
}

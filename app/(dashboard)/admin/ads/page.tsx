import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
    Megaphone,
    Eye,
    MousePointerClick,
    IndianRupee,
    Search,
    TrendingUp,
    Calendar,
    Target,
} from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Badge } from '@/components/ui/Badge'
import type { AdCampaign } from '@/types/advertising.types'
import { AdStatus } from '@/types/enums'

// ── Status badge config ────────────────────────────────────
const AD_STATUS_CONFIG: Record<AdStatus, { label: string; className: string }> = {
    [AdStatus.Draft]: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
    [AdStatus.Active]: { label: 'Active', className: 'bg-green-100 text-green-700' },
    [AdStatus.Paused]: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700' },
    [AdStatus.Expired]: { label: 'Expired', className: 'bg-red-100 text-red-700' },
}

const STATUS_FILTERS = [
    { label: 'All', value: '' },
    { label: 'Active', value: AdStatus.Active },
    { label: 'Draft', value: AdStatus.Draft },
    { label: 'Paused', value: AdStatus.Paused },
    { label: 'Expired', value: AdStatus.Expired },
] as const

// ── Helpers ────────────────────────────────────────────────
function formatCurrency(amount: number | null): string {
    if (amount == null) return '—'
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}

function formatDate(iso: string | null): string {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function calcCtr(impressions: number, clicks: number): string {
    if (!impressions) return '0.00%'
    return ((clicks / impressions) * 100).toFixed(2) + '%'
}

// ── Page ───────────────────────────────────────────────────
type PageProps = {
    searchParams: Promise<{ status?: string; q?: string }>
}

export default async function AdminAdsPage({ searchParams }: PageProps) {
    const params = await searchParams
    const status = params.status ?? ''
    const search = params.q?.trim() ?? ''

    const supabase = await createServerClient()

    // Build campaign query
    let campaignQuery = supabase
        .from('ad_campaigns')
        .select(
            'id, advertiser_id, name, description, status, budget, daily_budget, start_date, end_date, target_devices, total_impressions, total_clicks, total_spend, created_at, updated_at',
        )
        .order('created_at', { ascending: false })

    if (status) {
        campaignQuery = campaignQuery.eq('status', status)
    }
    if (search) {
        campaignQuery = campaignQuery.ilike('name', `%${search}%`)
    }

    const [campaignsResult, adsResult, zonesResult] = await Promise.all([
        campaignQuery,
        supabase.from('ads').select('id', { count: 'exact', head: true }),
        supabase.from('ad_zones').select('id', { count: 'exact', head: true }),
    ])

    const campaigns = (campaignsResult.data ?? []) as AdCampaign[]
    const totalAds = adsResult.count ?? 0
    const totalZones = zonesResult.count ?? 0

    // Aggregate stats
    const totalSpend = campaigns.reduce((sum, c) => sum + (c.total_spend ?? 0), 0)
    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.total_impressions ?? 0), 0)
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.total_clicks ?? 0), 0)

    function buildUrl(key: string, value: string): string {
        const p = new URLSearchParams()
        if (key === 'status') {
            if (value) p.set('status', value)
            if (search) p.set('q', search)
        } else {
            if (status) p.set('status', status)
        }
        const qs = p.toString()
        return `/admin/ads${qs ? `?${qs}` : ''}`
    }

    return (
        <div className="space-y-6">
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Advertising</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        Manage campaigns, ads, and placements.
                    </p>
                </div>
            </div>

            {/* ── Stats ───────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Campaigns"
                    value={campaigns.length}
                    icon={Megaphone}
                    description={`${campaigns.filter(c => c.status === AdStatus.Active).length} active`}
                />
                <StatsCard title="Total Ads" value={totalAds} icon={Eye} />
                <StatsCard title="Ad Zones" value={totalZones} icon={Target} />
                <StatsCard
                    title="Total Spend"
                    value={formatCurrency(totalSpend)}
                    icon={IndianRupee}
                    description={`${totalImpressions.toLocaleString('en-IN')} impressions`}
                />
            </div>

            {/* ── Search + Filters ────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <form action="/admin/ads" className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                    <input
                        type="search"
                        name="q"
                        defaultValue={search}
                        placeholder="Search campaigns…"
                        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {status && <input type="hidden" name="status" value={status} />}
                </form>

                <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map(f => {
                        const isActive = status === f.value
                        return (
                            <Link
                                key={f.label}
                                href={buildUrl('status', f.value)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary text-white'
                                        : 'bg-background-subtle text-foreground-muted hover:bg-background-subtle/80'
                                }`}
                            >
                                {f.label}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* ── Campaigns Table (Desktop) ───────────────── */}
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
                <table className="w-full text-sm">
                    <thead className="border-b border-border bg-background-subtle">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Campaign</th>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                            <th className="px-4 py-3 text-right font-medium text-foreground-muted">Budget</th>
                            <th className="px-4 py-3 text-right font-medium text-foreground-muted">Spent</th>
                            <th className="px-4 py-3 text-right font-medium text-foreground-muted">Impressions</th>
                            <th className="px-4 py-3 text-right font-medium text-foreground-muted">Clicks</th>
                            <th className="px-4 py-3 text-right font-medium text-foreground-muted">CTR</th>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Period</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {campaigns.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center">
                                    <Megaphone className="mx-auto mb-3 size-10 text-foreground-subtle" />
                                    <p className="font-medium">No campaigns found</p>
                                    <p className="mt-1 text-sm text-foreground-muted">
                                        {search || status
                                            ? 'Try adjusting your filters.'
                                            : 'Create your first ad campaign to get started.'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            campaigns.map(c => {
                                const cfg = AD_STATUS_CONFIG[c.status] ?? AD_STATUS_CONFIG[AdStatus.Draft]
                                const spendRatio =
                                    c.budget && c.budget > 0
                                        ? Math.min((c.total_spend / c.budget) * 100, 100)
                                        : 0

                                return (
                                    <tr key={c.id} className="transition-colors hover:bg-background-subtle">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{c.name}</p>
                                            {c.description && (
                                                <p className="mt-0.5 text-xs text-foreground-muted line-clamp-1">
                                                    {c.description}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={cfg.className}>{cfg.label}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <p className="font-medium">{formatCurrency(c.budget)}</p>
                                            {c.budget && c.budget > 0 && (
                                                <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 ml-auto">
                                                    <div
                                                        className="h-full rounded-full bg-primary"
                                                        style={{ width: `${spendRatio}%` }}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-foreground-muted">
                                            {formatCurrency(c.total_spend)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-foreground-muted">
                                            {c.total_impressions.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3 text-right text-foreground-muted">
                                            {c.total_clicks.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center gap-1 text-foreground-muted">
                                                <TrendingUp className="size-3" />
                                                {calcCtr(c.total_impressions, c.total_clicks)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 text-xs text-foreground-muted">
                                                <Calendar className="size-3" />
                                                {formatDate(c.start_date)}
                                            </span>
                                            <p className="text-xs text-foreground-subtle">
                                                → {formatDate(c.end_date) || 'Ongoing'}
                                            </p>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Campaigns Cards (Mobile) ────────────────── */}
            <div className="space-y-3 lg:hidden">
                {campaigns.length === 0 ? (
                    <div className="rounded-xl border border-border bg-surface px-4 py-12 text-center">
                        <Megaphone className="mx-auto mb-3 size-10 text-foreground-subtle" />
                        <p className="font-medium">No campaigns found</p>
                        <p className="mt-1 text-sm text-foreground-muted">
                            {search || status
                                ? 'Try adjusting your filters.'
                                : 'Create your first ad campaign.'}
                        </p>
                    </div>
                ) : (
                    campaigns.map(c => {
                        const cfg = AD_STATUS_CONFIG[c.status] ?? AD_STATUS_CONFIG[AdStatus.Draft]
                        return (
                            <div
                                key={c.id}
                                className="rounded-xl border border-border bg-surface p-4 space-y-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{c.name}</p>
                                        {c.description && (
                                            <p className="mt-0.5 text-xs text-foreground-muted line-clamp-1">
                                                {c.description}
                                            </p>
                                        )}
                                    </div>
                                    <Badge className={cfg.className}>{cfg.label}</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-foreground-muted">Budget</p>
                                        <p className="font-medium">{formatCurrency(c.budget)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted">Spent</p>
                                        <p className="font-medium">{formatCurrency(c.total_spend)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted">Impressions</p>
                                        <p className="font-medium">{c.total_impressions.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground-muted">Clicks / CTR</p>
                                        <p className="font-medium">
                                            {c.total_clicks.toLocaleString('en-IN')}{' '}
                                            <span className="text-foreground-muted">
                                                ({calcCtr(c.total_impressions, c.total_clicks)})
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-foreground-muted">
                                    <Calendar className="size-3" />
                                    {formatDate(c.start_date)} → {formatDate(c.end_date) || 'Ongoing'}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

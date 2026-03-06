import Link from 'next/link'
import {
    Search,
    Mail,
    MessageSquare,
    Phone,
    Users,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { getSubscribers, getSubscriberCount } from '@/lib/queries/subscribers'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Badge } from '@/components/ui/Badge'
import { SubscriberStatus } from '@/types/enums'

// ── Status config ──────────────────────────────────────────
const STATUS_CONFIG: Record<SubscriberStatus, { label: string; className: string }> = {
    [SubscriberStatus.Active]: { label: 'Active', className: 'bg-green-100 text-green-700' },
    [SubscriberStatus.Unsubscribed]: { label: 'Unsubscribed', className: 'bg-gray-100 text-gray-700' },
    [SubscriberStatus.Bounced]: { label: 'Bounced', className: 'bg-red-100 text-red-700' },
}

const STATUS_FILTERS = [
    { label: 'All', value: '' },
    { label: 'Active', value: SubscriberStatus.Active },
    { label: 'Unsubscribed', value: SubscriberStatus.Unsubscribed },
    { label: 'Bounced', value: SubscriberStatus.Bounced },
] as const

const ITEMS_PER_PAGE = 25

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

// ── Page ───────────────────────────────────────────────────
type PageProps = {
    searchParams: Promise<{ page?: string; status?: string; q?: string }>
}

export default async function AdminSubscribersPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = parseInt(params.page ?? '1', 10)
    const status = params.status ?? ''
    const search = params.q?.trim() ?? ''

    const [{ data: subscribers, count }, activeCount, bouncedCount] = await Promise.all([
        getSubscribers({
            page,
            limit: ITEMS_PER_PAGE,
            status: (status || undefined) as SubscriberStatus | undefined,
            search: search || undefined,
        }),
        getSubscriberCount(SubscriberStatus.Active),
        getSubscriberCount(SubscriberStatus.Bounced),
    ])

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE)

    function buildUrl(overrides: Record<string, string>): string {
        const p = new URLSearchParams()
        const s = overrides.status ?? status
        const q = overrides.q ?? search
        const pg = overrides.page ?? (overrides.status !== undefined ? '1' : String(page))
        if (s) p.set('status', s)
        if (q) p.set('q', q)
        if (pg !== '1') p.set('page', pg)
        const qs = p.toString()
        return `/admin/subscribers${qs ? `?${qs}` : ''}`
    }

    return (
        <div className="space-y-6">
            {/* ── Header ──────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Subscribers</h1>
                <p className="mt-1 text-sm text-foreground-muted">
                    {count.toLocaleString('en-IN')} total subscribers
                </p>
            </div>

            {/* ── Stats ───────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-3">
                <StatsCard
                    title="Total"
                    value={count}
                    icon={Users}
                />
                <StatsCard
                    title="Active"
                    value={activeCount}
                    icon={CheckCircle2}
                    description={count > 0 ? `${((activeCount / count) * 100).toFixed(1)}% of total` : undefined}
                />
                <StatsCard
                    title="Bounced"
                    value={bouncedCount}
                    icon={AlertTriangle}
                />
            </div>

            {/* ── Search + Filters ────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <form action="/admin/subscribers" className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                    <input
                        type="search"
                        name="q"
                        defaultValue={search}
                        placeholder="Search email or name…"
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
                                href={buildUrl({ status: f.value })}
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

            {/* ── Table (Desktop) ─────────────────────────── */}
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface lg:block">
                <table className="w-full text-sm">
                    <thead className="border-b border-border bg-background-subtle">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Subscriber</th>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Phone</th>
                            <th className="px-4 py-3 text-center font-medium text-foreground-muted">WhatsApp</th>
                            <th className="px-4 py-3 text-center font-medium text-foreground-muted">Telegram</th>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Preferences</th>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                            <th className="px-4 py-3 text-left font-medium text-foreground-muted">Subscribed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center">
                                    <Mail className="mx-auto mb-3 size-10 text-foreground-subtle" />
                                    <p className="font-medium">No subscribers found</p>
                                    <p className="mt-1 text-sm text-foreground-muted">
                                        {search || status
                                            ? 'Try adjusting your filters.'
                                            : 'Subscriber list is empty.'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            subscribers.map(sub => {
                                const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG[SubscriberStatus.Active]
                                const prefKeys = Object.entries(sub.preferences ?? {})
                                    .filter(([k, v]) => v === true && k !== 'states' && k !== 'qualifications')
                                    .map(([k]) => k.replace(/_/g, ' '))

                                return (
                                    <tr key={sub.id} className="transition-colors hover:bg-background-subtle">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{sub.email}</p>
                                            {sub.name && (
                                                <p className="mt-0.5 text-xs text-foreground-muted">{sub.name}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-foreground-muted">
                                            {sub.phone ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Phone className="size-3" />
                                                    {sub.phone}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {sub.whatsapp_opt_in ? (
                                                <span className="inline-flex items-center gap-1 text-green-600">
                                                    <MessageSquare className="size-3.5" />
                                                </span>
                                            ) : (
                                                <span className="text-foreground-subtle">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {sub.telegram_user_id ? (
                                                <span className="text-blue-600 text-xs font-medium">Yes</span>
                                            ) : (
                                                <span className="text-foreground-subtle">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {prefKeys.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {prefKeys.slice(0, 3).map(k => (
                                                        <span
                                                            key={k}
                                                            className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium capitalize text-blue-700"
                                                        >
                                                            {k}
                                                        </span>
                                                    ))}
                                                    {prefKeys.length > 3 && (
                                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-foreground-muted">
                                                            +{prefKeys.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-foreground-subtle">All</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge className={cfg.className}>{cfg.label}</Badge>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-muted">
                                            {formatDate(sub.subscribed_at)}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Cards (Mobile) ──────────────────────────── */}
            <div className="space-y-3 lg:hidden">
                {subscribers.length === 0 ? (
                    <div className="rounded-xl border border-border bg-surface px-4 py-12 text-center">
                        <Mail className="mx-auto mb-3 size-10 text-foreground-subtle" />
                        <p className="font-medium">No subscribers found</p>
                    </div>
                ) : (
                    subscribers.map(sub => {
                        const cfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG[SubscriberStatus.Active]
                        return (
                            <div
                                key={sub.id}
                                className="rounded-xl border border-border bg-surface p-4 space-y-2"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">{sub.email}</p>
                                        {sub.name && (
                                            <p className="text-xs text-foreground-muted">{sub.name}</p>
                                        )}
                                    </div>
                                    <Badge className={cfg.className}>{cfg.label}</Badge>
                                </div>

                                <div className="flex flex-wrap gap-3 text-xs text-foreground-muted">
                                    {sub.phone && (
                                        <span className="inline-flex items-center gap-1">
                                            <Phone className="size-3" /> {sub.phone}
                                        </span>
                                    )}
                                    {sub.whatsapp_opt_in && (
                                        <span className="inline-flex items-center gap-1 text-green-600">
                                            <MessageSquare className="size-3" /> WhatsApp
                                        </span>
                                    )}
                                    <span>{formatDate(sub.subscribed_at)}</span>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* ── Pagination ──────────────────────────────── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                    <p className="text-sm text-foreground-muted">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        {page > 1 ? (
                            <Link
                                href={buildUrl({ page: String(page - 1) })}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background-subtle"
                            >
                                <ChevronLeft className="size-4" /> Previous
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground-subtle opacity-50">
                                <ChevronLeft className="size-4" /> Previous
                            </span>
                        )}
                        {page < totalPages ? (
                            <Link
                                href={buildUrl({ page: String(page + 1) })}
                                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background-subtle"
                            >
                                Next <ChevronRight className="size-4" />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground-subtle opacity-50">
                                Next <ChevronRight className="size-4" />
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

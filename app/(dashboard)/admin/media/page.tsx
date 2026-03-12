import Link from 'next/link'
import {
    Image as ImageIcon,
    Search,
    FileText,
    Film,
    HardDrive,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
} from 'lucide-react'
import { getMediaItems } from '@/lib/queries/media'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Badge } from '@/components/ui/Badge'

const ITEMS_PER_PAGE = 24 // Multiple of common grid columns (2/3/4/6)

const BUCKET_FILTERS = [
    { label: 'All', value: '' },
    { label: 'Posts', value: 'posts' },
    { label: 'Avatars', value: 'avatars' },
    { label: 'Organizations', value: 'organizations' },
    { label: 'Site Assets', value: 'site-assets' },
] as const

function formatBytes(bytes: number | null): string {
    if (bytes == null) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getMimeIcon(mime: string) {
    if (mime.startsWith('image/')) return ImageIcon
    if (mime.startsWith('video/')) return Film
    return FileText
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

// ── Page ───────────────────────────────────────────────────
type PageProps = {
    searchParams: Promise<{ page?: string; bucket?: string; q?: string }>
}

export default async function AdminMediaPage({ searchParams }: PageProps) {
    const params = await searchParams
    const page = parseInt(params.page ?? '1', 10)
    const bucket = params.bucket ?? ''
    const search = params.q?.trim() ?? ''

    const { data: media, count } = await getMediaItems({
        page,
        limit: ITEMS_PER_PAGE,
        bucket: bucket || undefined,
        search: search || undefined,
    })

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE)
    const totalSize = media.reduce((sum, m) => sum + (m.file_size ?? 0), 0)
    const imageCount = media.filter(m => m.mime_type.startsWith('image/')).length
    const webpCount = media.filter(m => m.is_webp_ready).length

    function buildUrl(overrides: Record<string, string>): string {
        const p = new URLSearchParams()
        const b = overrides.bucket ?? bucket
        const q = overrides.q ?? search
        const pg = overrides.page ?? (overrides.bucket !== undefined ? '1' : String(page))
        if (b) p.set('bucket', b)
        if (q) p.set('q', q)
        if (pg !== '1') p.set('page', pg)
        const qs = p.toString()
        return `/admin/media${qs ? `?${qs}` : ''}`
    }

    return (
        <div className="space-y-6">
            {/* ── Header ──────────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {count.toLocaleString('en-IN')} files
                    </p>
                </div>
                <Link
                    href="/author/posts/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
                >
                    Upload Media
                </Link>
            </div>

            {/* ── Stats ───────────────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Files" value={count} icon={HardDrive} />
                <StatsCard
                    title="Images"
                    value={imageCount}
                    icon={ImageIcon}
                    description={`of ${media.length} on this page`}
                />
                <StatsCard
                    title="WebP Ready"
                    value={webpCount}
                    icon={CheckCircle2}
                    description={imageCount > 0 ? `${((webpCount / imageCount) * 100).toFixed(0)}% optimized` : undefined}
                />
                <StatsCard
                    title="Page Size"
                    value={formatBytes(totalSize)}
                    icon={HardDrive}
                />
            </div>

            {/* ── Search + Filters ────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <form action="/admin/media" className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted" />
                    <input
                        type="search"
                        name="q"
                        defaultValue={search}
                        placeholder="Search by file name…"
                        className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {bucket && <input type="hidden" name="bucket" value={bucket} />}
                </form>

                <div className="flex flex-wrap gap-1.5">
                    {BUCKET_FILTERS.map(f => {
                        const isActive = bucket === f.value
                        return (
                            <Link
                                key={f.label}
                                href={buildUrl({ bucket: f.value })}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${isActive
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

            {/* ── Media Grid ──────────────────────────────── */}
            {media.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface py-16 text-center">
                    <ImageIcon className="mb-3 size-10 text-foreground-subtle" />
                    <p className="font-medium">No media files found</p>
                    <p className="mt-1 text-sm text-foreground-muted">
                        {search || bucket
                            ? 'Try adjusting your filters.'
                            : 'Upload your first file to get started.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {media.map(item => {
                        const Icon = getMimeIcon(item.mime_type)
                        return (
                            <div
                                key={item.id}
                                className="group relative overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md"
                            >
                                {/* Preview */}
                                {item.mime_type.startsWith('image/') ? (
                                    <div className="relative">
                                        <img
                                            src={item.webp_url ?? item.public_url}
                                            alt={item.alt_text ?? item.file_name}
                                            className="aspect-square w-full object-cover"
                                            loading="lazy"
                                        />
                                        {/* WebP badge */}
                                        {item.is_webp_ready && (
                                            <span className="absolute right-1 top-1 rounded bg-green-600/90 px-1 py-0.5 text-[9px] font-bold text-white">
                                                WebP
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex aspect-square items-center justify-center bg-background-subtle">
                                        <Icon className="size-8 text-foreground-subtle" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="p-2 space-y-1">
                                    <p className="truncate text-xs font-medium" title={item.file_name}>
                                        {item.file_name}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-foreground-subtle">
                                        <span>{formatBytes(item.file_size)}</span>
                                        {item.width && item.height && (
                                            <span>{item.width}×{item.height}</span>
                                        )}
                                    </div>
                                    <Badge className="bg-gray-100 text-gray-600 text-[10px]">
                                        {item.bucket}
                                    </Badge>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

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

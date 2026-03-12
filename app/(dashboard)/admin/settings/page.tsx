import { getSeoSettings, getRedirects } from '@/lib/queries/seo'
import { SeoSettingsForm } from '@/components/dashboard/SeoSettingsForm'
import { SITE } from '@/config/site'
import { env } from '@/config/env'
import {
    Settings,
    Globe,
    Search,
    ArrowRightLeft,
    Shield,
    Code,
    CheckCircle2,
    AlertTriangle,
    Lock,
    Eye,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { SeoSetting } from '@/lib/queries/seo'

// ── ENV-sourced settings (read-only, change in .env / Vercel dashboard) ──
const ENV_GROUPS = [
    {
        label: 'Site Identity',
        icon: Globe,
        items: [
            { key: 'Site Name', value: SITE.name },
            { key: 'Tagline', value: SITE.tagline },
            { key: 'URL', value: SITE.url },
        ],
    },
    {
        label: 'Social Profiles',
        icon: Globe,
        items: [
            { key: 'Twitter / X', value: SITE.twitter.handle },
            ...SITE.publisher.sameAs
                .filter(url => !url.includes('x.com') && !url.includes('twitter.com'))
                .map(url => {
                    const parsed = new URL(url)
                    const domain = parsed.hostname.replace('www.', '')
                    const name = domain.split('.')[0] || 'Website'
                    const username = parsed.pathname.replace(/^\//, '').replace(/\/$/, '')
                    return { key: name.charAt(0).toUpperCase() + name.slice(1), value: `@${username}` }
                }),
        ],
    },
    {
        label: 'Analytics & Ads',
        icon: Code,
        items: [
            { key: 'GTM ID', value: env.NEXT_PUBLIC_GTM_ID ?? '-', secret: false },
            { key: 'GA4 ID', value: env.NEXT_PUBLIC_GA_ID ?? '-', secret: false },
        ],
    },
    {
        label: 'Search Verification',
        icon: Shield,
        items: [
            { key: 'Google (GSC)', value: env.NEXT_PUBLIC_GSC_VERIFICATION ? '✓ Configured' : '✗ Not set' },
            { key: 'Bing', value: env.NEXT_PUBLIC_BING_VERIFICATION && !env.NEXT_PUBLIC_BING_VERIFICATION.includes('your-') ? '✓ Configured' : '✗ Not set' },
            { key: 'Yandex', value: env.NEXT_PUBLIC_YANDEX_VERIFICATION && !env.NEXT_PUBLIC_YANDEX_VERIFICATION.includes('your-') ? '✓ Configured' : '✗ Not set' },
        ],
    },
]

// ── DB-sourced setting groups (editable via admin UI) ──
const SETTING_GROUPS = [
    {
        label: 'Default Open Graph',
        icon: Globe,
        keys: ['default_og_image', 'default_og_image_width', 'default_og_image_height'],
    },
    {
        label: 'Robots / Crawling',
        icon: Search,
        keys: ['robots_global', 'robots_pagination', 'robots_search'],
    },
    {
        label: 'Sitemap',
        icon: Settings,
        keys: ['sitemap_posts_per_index', 'sitemap_ping_google'],
    },
    {
        label: 'Structured Data',
        icon: Code,
        keys: ['website_schema_json', 'organization_schema_json'],
    },
] as const

function formatRedirectType(type: string): string {
    return type === '301' ? '301 Permanent' : type === '302' ? '302 Temporary' : type
}

export default async function AdminSettingsPage() {
    const [settings, { data: redirects, count: redirectCount }] = await Promise.all([
        getSeoSettings(),
        getRedirects({ limit: 10 }),
    ])

    // Build a settings map for lookup
    const settingsMap = new Map(settings.map(s => [s.key, s]))

    // Keys managed exclusively via ENV vars - never show in editable UI
    const ENV_MANAGED_KEYS = new Set([
        'site_name', 'site_tagline', 'site_url', 'twitter_handle',
        'google_tag_id',
        'google_verification', 'bing_verification',
    ])

    // Group settings - put ungrouped ones at the end, excluding env-managed
    const groupedKeys: Set<string> = new Set(SETTING_GROUPS.flatMap(g => [...g.keys]))
    const ungroupedSettings = settings.filter(
        s => !groupedKeys.has(s.key) && !ENV_MANAGED_KEYS.has(s.key)
    )

    return (
        <div className="space-y-8">
            {/* ── Header ──────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-foreground-muted">
                    Manage SEO configuration, redirects, and site-wide settings.
                </p>
            </div>

            {/* ── Environment Configuration (read-only) ──── */}
            <section className="rounded-xl border border-border bg-surface">
                <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                    <Lock className="size-4 text-foreground-muted" />
                    <h2 className="font-semibold">Environment Configuration</h2>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Read-only
                    </Badge>
                </div>
                <p className="px-6 pt-3 text-xs text-foreground-subtle">
                    These values are set via environment variables. To change them, update your <code className="rounded bg-background-subtle px-1">.env.local</code> file or Vercel dashboard and redeploy.
                </p>
                <div className="divide-y divide-border">
                    {ENV_GROUPS.map(group => {
                        const Icon = group.icon
                        return (
                            <div key={group.label} className="px-6 py-4">
                                <div className="mb-3 flex items-center gap-2">
                                    <Icon className="size-3.5 text-foreground-subtle" />
                                    <h3 className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
                                        {group.label}
                                    </h3>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {group.items.map(item => (
                                        <div
                                            key={item.key}
                                            className="flex items-center justify-between rounded-lg border border-border/50 bg-background-subtle px-3 py-2"
                                        >
                                            <span className="text-xs font-medium text-foreground-muted">
                                                {item.key}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs">
                                                {item.value === '-' || item.value.startsWith('✗') ? (
                                                    <span className="text-foreground-subtle">{item.value}</span>
                                                ) : item.value.startsWith('✓') ? (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <Eye className="size-3" />
                                                        {item.value}
                                                    </span>
                                                ) : (
                                                    <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[11px]">
                                                        {item.value}
                                                    </code>
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* ── Editable DB Settings ────────────────────── */}
            {SETTING_GROUPS.map(group => {
                const groupSettings = group.keys
                    .map(key => settingsMap.get(key))
                    .filter((s): s is SeoSetting => s != null)

                if (groupSettings.length === 0) return null

                const Icon = group.icon
                return (
                    <section key={group.label} className="rounded-xl border border-border bg-surface">
                        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                            <Icon className="size-4 text-foreground-muted" />
                            <h2 className="font-semibold">{group.label}</h2>
                            <span className="text-xs text-foreground-subtle">
                                {groupSettings.length} {groupSettings.length === 1 ? 'setting' : 'settings'}
                            </span>
                        </div>
                        <div className="px-6 py-2">
                            <SeoSettingsForm settings={groupSettings} />
                        </div>
                    </section>
                )
            })}

            {/* ── Ungrouped Settings ──────────────────────── */}
            {ungroupedSettings.length > 0 && (
                <section className="rounded-xl border border-border bg-surface">
                    <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                        <Settings className="size-4 text-foreground-muted" />
                        <h2 className="font-semibold">Other Settings</h2>
                    </div>
                    <div className="px-6 py-2">
                        <SeoSettingsForm settings={ungroupedSettings} />
                    </div>
                </section>
            )}

            {/* ── Redirects Overview ──────────────────────── */}
            <section className="rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div className="flex items-center gap-2">
                        <ArrowRightLeft className="size-4 text-foreground-muted" />
                        <h2 className="font-semibold">Redirects</h2>
                        <span className="text-xs text-foreground-subtle">
                            {redirectCount} total
                        </span>
                    </div>
                </div>

                {redirects.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <ArrowRightLeft className="mx-auto mb-3 size-8 text-foreground-subtle" />
                        <p className="text-sm text-foreground-muted">No redirects configured.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-background-subtle">
                                <tr>
                                    <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">From</th>
                                    <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">To</th>
                                    <th className="px-4 py-2.5 text-left font-medium text-foreground-muted">Type</th>
                                    <th className="px-4 py-2.5 text-right font-medium text-foreground-muted">Hits</th>
                                    <th className="px-4 py-2.5 text-center font-medium text-foreground-muted">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {redirects.map(r => (
                                    <tr key={r.id} className="transition-colors hover:bg-background-subtle">
                                        <td className="px-4 py-2.5 font-mono text-xs">{r.from_path}</td>
                                        <td className="px-4 py-2.5 font-mono text-xs text-foreground-muted">
                                            {r.to_path ?? '-'}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <Badge className="bg-blue-100 text-blue-700">
                                                {formatRedirectType(String(r.type))}
                                            </Badge>
                                            {r.is_chained && (
                                                <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-amber-600" title="Part of a redirect chain">
                                                    <AlertTriangle className="size-3" /> Chain
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-foreground-muted">
                                            {r.hits.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                            {r.is_active ? (
                                                <CheckCircle2 className="mx-auto size-4 text-green-600" />
                                            ) : (
                                                <span className="text-xs text-foreground-subtle">Inactive</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {redirectCount > 10 && (
                    <div className="border-t border-border px-6 py-3 text-center">
                        <p className="text-xs text-foreground-muted">
                            Showing 10 of {redirectCount} redirects
                        </p>
                    </div>
                )}
            </section>
        </div>
    )
}

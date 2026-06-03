import { SITE } from '@/config/site'
import { env } from '@/config/env'
import {
    Globe,
    Shield,
    Code,
    Lock,
    Eye,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

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

export default async function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            {/* ── Header ──────────────────────────────────── */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-foreground-muted">
                    Manage global site configurations.
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
        </div>
    )
}

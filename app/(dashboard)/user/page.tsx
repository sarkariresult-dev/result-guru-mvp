import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    Bookmark, Bell, User, Briefcase, FileText,
    CreditCard, TrendingUp, ArrowRight, Search,
} from 'lucide-react'
import { getRecentPosts } from '@/lib/queries/posts'
import { ROUTE_PREFIXES, SITE } from '@/config/site'
import { Badge } from '@/components/ui/Badge'
import type { PostCard } from '@/types/post.types'

/* ── Recent post list (reusable JSX) ──────────────────────── */

function PostList({
    posts,
    type,
    emptyText,
}: {
    posts: PostCard[]
    type: keyof typeof ROUTE_PREFIXES
    emptyText: string
}) {
    if (posts.length === 0) {
        return (
            <p className="px-6 py-8 text-center text-sm text-foreground-muted">
                {emptyText}
            </p>
        )
    }

    return (
        <div className="divide-y divide-border">
            {posts.map((post) => (
                <Link
                    key={post.id}
                    href={`${ROUTE_PREFIXES[type]}/${post.slug}`}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-background-subtle sm:px-6"
                >
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                            {post.title}
                        </p>
                        <p className="mt-0.5 text-xs text-foreground-subtle">
                            {post.org_name ?? 'Unknown'}
                            {post.state_name ? ` · ${post.state_name}` : ''}
                        </p>
                    </div>
                    {post.application_status && (
                        <Badge variant="gray" className="ml-3 shrink-0 text-xs capitalize">
                            {post.application_status.replace(/_/g, ' ')}
                        </Badge>
                    )}
                </Link>
            ))}
        </div>
    )
}

/* ── Page ──────────────────────────────────────────────────── */

export default async function UserDashboardPage() {
    const supabase = await createServerClient()
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser) redirect('/login')

    /* Parallel data fetching */
    const [
        { data: dbUser },
        { count: alertCount },
        recentJobs,
        recentResults,
        recentAdmit,
    ] = await Promise.all([
        supabase
            .from('users')
            .select('name')
            .eq('auth_user_id', authUser.id)
            .single(),
        supabase
            .from('subscribers')
            .select('id', { count: 'exact', head: true })
            .eq('email', authUser.email ?? '')
            .eq('status', 'active'),
        getRecentPosts('job', 5),
        getRecentPosts('result', 5),
        getRecentPosts('admit', 3),
    ])

    const displayName =
        dbUser?.name ?? authUser.email?.split('@')[0] ?? 'User'

    const hasAlerts = (alertCount ?? 0) > 0

    return (
        <div className="space-y-8">
            {/* ── Welcome header ─────────────────────────────── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Welcome back, {displayName}
                    </h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        Stay up to date with the latest government opportunities
                        on {SITE.name}.
                    </p>
                </div>
                <Link
                    href="/search"
                    className="inline-flex items-center gap-2 self-start rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground-muted transition-colors hover:bg-background-subtle sm:self-auto"
                >
                    <Search className="size-4" />
                    Search posts…
                </Link>
            </div>

            {/* ── Quick action cards ─────────────────────────── */}
            <div className="grid gap-4 sm:grid-cols-3">
                <QuickCard
                    href="/user/saved"
                    title="Saved Posts"
                    subtitle="View your bookmarks"
                    icon={<Bookmark className="size-6" />}
                    iconBg="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                />
                <QuickCard
                    href="/user/alerts"
                    title="Job Alerts"
                    subtitle={hasAlerts ? 'Active' : 'Not subscribed'}
                    icon={<Bell className="size-6" />}
                    iconBg="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                />
                <QuickCard
                    href="/user/profile"
                    title="My Profile"
                    subtitle="Edit your account"
                    icon={<User className="size-6" />}
                    iconBg="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                />
            </div>

            {/* ── Latest Jobs ────────────────────────────────── */}
            <Section
                title="Latest Sarkari Jobs"
                icon={<Briefcase className="size-4 text-brand-600" />}
                viewAllHref={ROUTE_PREFIXES.job}
            >
                <PostList
                    posts={recentJobs}
                    type="job"
                    emptyText="No jobs available right now."
                />
            </Section>

            {/* ── Results & Admit Cards side by side ─────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Section
                    title="Latest Results"
                    icon={<FileText className="size-4 text-green-600" />}
                    viewAllHref={ROUTE_PREFIXES.result}
                >
                    <PostList
                        posts={recentResults}
                        type="result"
                        emptyText="No results available."
                    />
                </Section>

                <Section
                    title="Latest Admit Cards"
                    icon={<CreditCard className="size-4 text-orange-600" />}
                    viewAllHref={ROUTE_PREFIXES.admit}
                >
                    <PostList
                        posts={recentAdmit}
                        type="admit"
                        emptyText="No admit cards available."
                    />
                </Section>
            </div>

            {/* ── Tip banner ─────────────────────────────────── */}
            <div className="rounded-xl border border-border bg-linear-to-r from-brand-50 to-blue-50 p-5 dark:from-brand-950/30 dark:to-blue-950/30 sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400">
                        <TrendingUp className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">Pro Tip</h3>
                        <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
                            Bookmark important jobs and set up Job Alerts to never
                            miss an application deadline. We&apos;ll notify you when
                            new openings match your preferences!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ── Section card wrapper ─────────────────────────────────── */

function Section({
    title,
    icon,
    viewAllHref,
    children,
}: {
    title: string
    icon: React.ReactNode
    viewAllHref: string
    children: React.ReactNode
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="font-semibold text-foreground">{title}</h2>
                </div>
                <Link
                    href={viewAllHref}
                    className="flex items-center gap-1 text-sm text-brand-600 hover:underline"
                >
                    View all
                    <ArrowRight className="size-3.5" />
                </Link>
            </div>
            {children}
        </section>
    )
}

/* ── Quick action card ────────────────────────────────────── */

function QuickCard({
    href,
    title,
    subtitle,
    icon,
    iconBg,
}: {
    href: string
    title: string
    subtitle: string
    icon: React.ReactNode
    iconBg: string
}) {
    return (
        <Link
            href={href}
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-all hover:border-brand-300 hover:shadow-md dark:hover:border-brand-700"
        >
            <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${iconBg}`}
            >
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-foreground-subtle">{subtitle}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-foreground-subtle opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
    )
}

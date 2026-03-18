import Link from 'next/link'
import { getUsers } from '@/features/dashboard/queries'
import { Avatar } from '@/components/ui/Avatar'
import { UserRoleSelect } from '@/features/dashboard/components/UserRoleSelect'
import { Search, Users, ChevronLeft, ChevronRight, Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
import type { UserRole } from '@/types/enums'

const ROLE_FILTERS = [
    { value: '', label: 'All' },
    { value: 'admin', label: 'Admin' },
    { value: 'author', label: 'Author' },
    { value: 'user', label: 'User' },
] as const

const ROLE_BADGE: Record<string, { icon: typeof Shield; color: string }> = {
    admin: { icon: ShieldAlert, color: 'text-red-600' },
    author: { icon: ShieldCheck, color: 'text-blue-600' },
    user: { icon: Shield, color: 'text-gray-500' },
}

const ITEMS_PER_PAGE = 25

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; role?: string; q?: string }>
}) {
    const params = await searchParams
    const page = Math.max(1, parseInt(params.page ?? '1', 10))
    const role = params.role ?? ''
    const search = params.q?.trim() ?? ''

    const { data: users, count } = await getUsers({
        filters: {
            role: (role || undefined) as UserRole | undefined,
            search: search || undefined,
        },
        page,
        limit: ITEMS_PER_PAGE,
    })

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE)

    function buildUrl(overrides: Record<string, string | undefined>) {
        const p = new URLSearchParams()
        const merged = { role, q: search, page: String(page), ...overrides }
        for (const [k, v] of Object.entries(merged)) {
            if (v && v !== '' && !(k === 'page' && v === '1')) p.set(k, v)
        }
        const qs = p.toString()
        return `/admin/users${qs ? `?${qs}` : ''}`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                <p className="mt-1 text-sm text-foreground-muted">
                    {count} registered {count === 1 ? 'user' : 'users'}
                </p>
            </div>

            {/* Search */}
            <form action="/admin/users" method="GET" className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
                <input
                    type="search"
                    name="q"
                    defaultValue={search}
                    placeholder="Search by name or email…"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-foreground-subtle focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                {role && <input type="hidden" name="role" value={role} />}
            </form>

            {/* Role filter pills */}
            <div className="flex flex-wrap gap-2">
                {ROLE_FILTERS.map((f) => {
                    const isActive = role === f.value
                    return (
                        <Link
                            key={f.value}
                            href={buildUrl({ role: f.value || undefined, page: '1' })}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isActive
                                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                                    : 'border-border text-foreground-muted hover:border-brand-300 hover:text-foreground'
                                }`}
                        >
                            {f.label}
                        </Link>
                    )
                })}
            </div>

            {/* Users table / empty */}
            {users.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-16 text-center">
                    <Users className="size-10 text-foreground-subtle" />
                    <p className="font-medium text-foreground">
                        {search ? 'No users match your search' : 'No users found'}
                    </p>
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-background-subtle">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">User</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Email</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Role</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Last Login</th>
                                    <th className="px-4 py-3 text-left font-medium text-foreground-muted">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((user) => {
                                    const roleMeta = ROLE_BADGE[user.role] ?? ROLE_BADGE.user
                                    const RoleIcon = roleMeta!.icon
                                    return (
                                        <tr key={user.id} className="transition-colors hover:bg-background-subtle">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={user.avatar_url} fallback={user.name} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">{user.name}</p>
                                                        <div className="flex items-center gap-1 text-xs text-foreground-subtle">
                                                            <RoleIcon className={`size-3 ${roleMeta!.color}`} />
                                                            <span className="capitalize">{user.role}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-foreground-muted">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <UserRoleSelect userId={user.id} currentRole={user.role} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    <span className={`inline-block size-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-subtle">
                                                {user.last_login_at
                                                    ? new Date(user.last_login_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-xs text-foreground-subtle">
                                                {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="space-y-3 md:hidden">
                        {users.map((user) => (
                            <div key={user.id} className="rounded-xl border border-border bg-surface p-4">
                                <div className="flex items-center gap-3">
                                    <Avatar src={user.avatar_url} fallback={user.name} size="sm" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{user.name}</p>
                                        <p className="truncate text-xs text-foreground-muted">{user.email}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${user.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-foreground-subtle">
                                        Joined {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    <UserRoleSelect userId={user.id} currentRole={user.role} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav className="flex items-center justify-between" aria-label="User pagination">
                            <p className="text-sm text-foreground-muted">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                {page > 1 ? (
                                    <Link
                                        href={buildUrl({ page: String(page - 1) })}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle"
                                    >
                                        <ChevronLeft className="size-4" /> Previous
                                    </Link>
                                ) : (
                                    <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50">
                                        <ChevronLeft className="size-4" /> Previous
                                    </span>
                                )}
                                {page < totalPages ? (
                                    <Link
                                        href={buildUrl({ page: String(page + 1) })}
                                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-background-subtle"
                                    >
                                        Next <ChevronRight className="size-4" />
                                    </Link>
                                ) : (
                                    <span className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground-subtle opacity-50">
                                        Next <ChevronRight className="size-4" />
                                    </span>
                                )}
                            </div>
                        </nav>
                    )}
                </>
            )}
        </div>
    )
}

import Link from 'next/link'
import { ArrowRight, AlertTriangle, Link2, Trash2, ExternalLink } from 'lucide-react'
import { getRedirects } from '@/lib/queries/seo'
import { deleteRedirect, toggleRedirect } from '@/lib/actions/redirects'
import { RedirectAddForm } from './RedirectAddForm'

export default async function AdminRedirectsPage() {
    const { data: redirects, count } = await getRedirects({ limit: 100 })

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">URL Redirects</h1>
                    <p className="mt-1 text-sm text-foreground-muted">
                        Manage 301/302/410 redirects. {count} total rules.
                    </p>
                </div>
            </div>

            {/* Add New Redirect Form */}
            <RedirectAddForm />

            {/* Redirects Table */}
            <section className="rounded-xl border border-border bg-surface overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Link2 className="size-4 text-brand-600" />
                        Active Redirects
                    </h2>
                    <span className="text-xs text-foreground-muted">{redirects.length} shown</span>
                </div>

                {redirects.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-foreground-muted">
                        No redirects configured yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-background-subtle/50">
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">From</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-foreground-muted">Type</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">To</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-foreground-muted">Hits</th>
                                    <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-foreground-muted">Status</th>
                                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-foreground-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {redirects.map((redirect) => (
                                    <tr
                                        key={redirect.id}
                                        className={`transition-colors hover:bg-background-subtle/30 ${redirect.is_chained ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs font-mono bg-background-subtle px-1.5 py-0.5 rounded">
                                                    {redirect.from_path}
                                                </code>
                                                {redirect.is_chained && (
                                                    <span
                                                        className="inline-flex items-center gap-1 rounded-full bg-yellow-100 border border-yellow-300 px-1.5 py-0.5 text-[10px] font-bold text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400"
                                                        title="This redirect chains to another redirect - fix it!"
                                                    >
                                                        <AlertTriangle className="size-2.5" /> Chain
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${redirect.type === '301' ? 'bg-blue-100 text-blue-700' :
                                                    redirect.type === '302' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {redirect.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {redirect.to_path ? (
                                                <code className="text-xs font-mono bg-background-subtle px-1.5 py-0.5 rounded">
                                                    {redirect.to_path}
                                                </code>
                                            ) : (
                                                <span className="text-xs text-red-500 font-medium">Gone (410)</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className="text-xs tabular-nums text-foreground-muted font-medium">
                                                {redirect.hits}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <form action={async () => {
                                                'use server'
                                                await toggleRedirect(redirect.id, !redirect.is_active)
                                            }}>
                                                <button
                                                    type="submit"
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors ${redirect.is_active
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {redirect.is_active ? 'Active' : 'Disabled'}
                                                </button>
                                            </form>
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <form action={async () => {
                                                'use server'
                                                await deleteRedirect(redirect.id)
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                                                    title="Delete redirect"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}

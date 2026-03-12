import { Search, TrendingUp, XCircle, MousePointerClick, Clock, AlertTriangle } from 'lucide-react'
import { getTopSearchQueries, getZeroResultQueries, getRecentSearches, getSearchStats } from '@/lib/queries/search-analytics'

export default async function SearchAnalyticsPage() {
    const [stats, topQueries, zeroResults, recentSearches] = await Promise.all([
        getSearchStats(),
        getTopSearchQueries(15),
        getZeroResultQueries(15),
        getRecentSearches(20),
    ])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Search Analytics</h1>
                <p className="mt-1 text-sm text-foreground-muted">
                    Internal site search insights - discover content gaps and user intent.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                            <Search className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.totalSearches.toLocaleString()}</p>
                            <p className="text-xs text-foreground-muted">Total Searches</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                            <XCircle className="size-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{stats.zeroResults.toLocaleString()}</p>
                            <p className="text-xs text-foreground-muted">Zero Results</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-green-100">
                            <MousePointerClick className="size-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.withClicks.toLocaleString()}</p>
                            <p className="text-xs text-foreground-muted">With Clicks</p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100">
                            <TrendingUp className="size-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">{stats.clickRate}%</p>
                            <p className="text-xs text-foreground-muted">Click Rate</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Queries */}
                <section className="rounded-xl border border-border bg-surface">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="size-4 text-brand-600" />
                            Top Queries
                        </h2>
                    </div>
                    {topQueries.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-foreground-muted">No search data yet.</div>
                    ) : (
                        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                            {topQueries.map((q, i) => (
                                <div key={q.query} className="flex items-center justify-between gap-3 px-5 py-2.5">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-xs font-bold text-foreground-subtle w-5 text-right">{i + 1}</span>
                                        <span className="text-sm font-medium truncate">{q.query}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-xs text-foreground-muted">{q.avgResults} avg results</span>
                                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700 tabular-nums">
                                            {q.count}×
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Zero-Result Queries (Content Gaps) */}
                <section className="rounded-xl border border-border bg-surface">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <AlertTriangle className="size-4 text-red-500" />
                            Content Gaps (Zero Results)
                        </h2>
                    </div>
                    {zeroResults.length === 0 ? (
                        <div className="px-6 py-10 text-center text-sm text-foreground-muted">
                            All searches returned results! 🎉
                        </div>
                    ) : (
                        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                            {zeroResults.map((q) => (
                                <div key={q.query} className="flex items-center justify-between gap-3 px-5 py-2.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <XCircle className="size-3.5 text-red-400 shrink-0" />
                                        <span className="text-sm font-medium truncate">{q.query}</span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[10px] text-foreground-subtle">
                                            {new Date(q.lastSearched).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 tabular-nums">
                                            {q.count}×
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Recent Searches Log */}
            <section className="rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Clock className="size-4 text-foreground-subtle" />
                        Recent Searches
                    </h2>
                </div>
                {recentSearches.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-foreground-muted">No searches recorded yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-background-subtle/50">
                                    <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-foreground-muted">Query</th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-foreground-muted">Results</th>
                                    <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-foreground-muted">Device</th>
                                    <th className="px-5 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-foreground-muted">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recentSearches.map((s) => (
                                    <tr key={s.id} className="hover:bg-background-subtle/30 transition-colors">
                                        <td className="px-5 py-2.5 font-medium">{s.query}</td>
                                        <td className="px-3 py-2.5 text-center">
                                            <span className={`tabular-nums ${s.results_count === 0 ? 'text-red-500 font-bold' : 'text-foreground-muted'}`}>
                                                {s.results_count}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-foreground-subtle">
                                            {s.device || '-'}
                                        </td>
                                        <td className="px-5 py-2.5 text-right text-xs text-foreground-subtle">
                                            {new Date(s.searched_at).toLocaleString('en-IN', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
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

import { createServerClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui'
import { revalidatePath } from 'next/cache'
import { startMonitoringJob } from '@/lib/actions/monitoring'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'

export const dynamic = 'force-dynamic' // Ensure page fetches fresh runs on reload

export default async function AdminMonitoringPage() {
    const supabase = await createServerClient()

    const { data: jobs } = await supabase
        .from('monitoring_jobs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(30)

    const triggerCrawlerAction = async () => {
        'use server'
        const result = await startMonitoringJob('manual')
        if (result.jobId) {
            revalidatePath('/admin/monitoring')
        }
    }

    return (
        <div className="space-y-6">
            <div className='flex items-center justify-between'>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Monitoring Runs</h1>
                    <p className="text-sm text-foreground-muted">
                        Track background scraper executions across all organization sources.
                    </p>
                </div>
                <button onClick={triggerCrawlerAction} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer border border-border">
                    Run Crawler Now
                </button>
            </div>

            <div className='w-full rounded-xl overflow-hidden border border-border bg-surface'>
                <table className='w-full text-sm text-left'>
                    <thead className='border-b border-border bg-background-subtle rounded-t-xl'>
                        <tr>
                            <th className='px-4 py-3 font-medium text-foreground-muted'>Job ID</th>
                            <th className='px-4 py-3 font-medium text-foreground-muted'>Status</th>
                            <th className='px-4 py-3 font-medium text-foreground-muted'>Trigger</th>
                            <th className='px-4 py-3 font-medium text-foreground-muted'>Progress</th>
                            <th className='px-4 py-3 font-medium text-foreground-muted'>Updates</th>
                            <th className='px-4 py-3 font-medium text-foreground-muted'>Errors</th>
                            <th className='px-4 py-3 font-medium text-foreground-muted'>Started</th>
                            <th className='px-4 py-3 font-medium text-foreground-muted'>Duration</th>
                            <th className='pr-4 py-3 font-medium text-foreground-muted text-right'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-border'>
                        {jobs?.map((job) => {
                            const startedAt = new Date(job.started_at)
                            const completedAt = job.completed_at ? new Date(job.completed_at) : null
                            const durationSeconds = completedAt ? Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000) : null

                            return (
                                <tr key={job.id} className="hover:bg-background-subtle/50 transition-colors">
                                    <td className='px-4 py-3 font-mono text-foreground'>
                                        <Link href={`/admin/monitoring/${job.id}`} className='hover:underline'>
                                            {job.short_id || job.id.substring(0, 8)}
                                        </Link>
                                    </td>
                                    <td className='px-4 py-3'>
                                        <Badge variant={job.status === 'completed' ? 'green' : job.status === 'failed' ? 'red' : 'default'}>
                                            {job.status}
                                        </Badge>
                                    </td>
                                    <td className='px-4 py-3 text-foreground-muted capitalize'>{job.trigger_type.replace('_', ' ')}</td>
                                    <td className='px-4 py-3'>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs">Orgs: {job.processed_orgs}/{job.total_orgs}</span>
                                            <span className="text-xs text-foreground-muted">Sources: {job.processed_count}/{job.total_sources}</span>
                                        </div>
                                    </td>
                                    <td className='px-4 py-3'>
                                        {job.updates_count > 0 ? (
                                            <span className="font-medium text-green-600 dark:text-green-500">+{job.updates_count}</span>
                                        ) : (
                                            <span className="text-foreground-muted">0</span>
                                        )}
                                    </td>
                                    <td className='px-4 py-3'>
                                        {job.errors_count > 0 ? (
                                            <span className="font-medium text-red-600 dark:text-red-500">{job.errors_count}</span>
                                        ) : (
                                            <span className="text-foreground-muted">0</span>
                                        )}
                                    </td>
                                    <td className='px-4 py-3 text-foreground-muted' title={format(startedAt, 'PPpp')}>
                                        {formatDistanceToNow(startedAt, { addSuffix: true })}
                                    </td>
                                    <td className='px-4 py-3 text-foreground-muted'>
                                        {durationSeconds !== null ? `${durationSeconds}s` : '—'}
                                    </td>
                                    <td className='pr-4 py-3 text-right'>
                                        <Link href={`/admin/monitoring/${job.id}`}>View Details</Link>
                                    </td>
                                </tr>
                            )
                        })}
                        {(!jobs || jobs.length === 0) && (
                            <tr>
                                <td colSpan={9} className="px-4 py-8 text-center text-foreground-muted">
                                    No monitoring jobs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className="w-full border-t border-border flex items-center justify-between">
                    <p className='px-4 py-3 text-sm font-medium text-foreground-muted'>Showing last 30 runs</p>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, Badge, Progress, Tabs, Button } from '@/components/ui'
import { buttonVariants } from '@/components/ui/Button'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { deleteMonitoringJob } from '@/lib/actions/monitoring'
import type { MonitoringJob, MonitoringEvent } from '@/types/taxonomy.types'

interface PageProps {
    params: Promise<{ jobId: string }>
}

export default function JobDetailsPage({ params }: PageProps) {
    const { jobId } = use(params)
    const [job, setJob] = useState<MonitoringJob | null>(null)
    const [events, setEvents] = useState<MonitoringEvent[]>([])
    const [updates, setUpdates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this job? All related events and logs will be permanently removed.')) {
            return
        }

        setIsDeleting(true)
        const result = await deleteMonitoringJob(jobId)
        if (result.error) {
            alert('Failed to delete job: ' + result.error)
            setIsDeleting(false)
        } else {
            router.push('/admin/monitoring')
        }
    }

    // 1. Fetch initial data on mount
    useEffect(() => {
        let isMounted = true

        const fetchInitialData = async () => {
            const { data: jobData } = await supabase
                .from('monitoring_jobs')
                .select('*')
                .eq('id', jobId)
                .single()

            if (!jobData) {
                if (isMounted) notFound()
                return
            }

            const { data: eventsData } = await supabase
                .from('monitoring_events')
                .select('*')
                .eq('job_id', jobId)
                .order('created_at', { ascending: false })

            const { data: updatesData } = await supabase
                .from('monitoring_updates')
                .select('*, organizations (name, short_name), organization_sources (name, url)')
                .eq('job_id', jobId)
                .order('created_at', { ascending: false })

            if (isMounted) {
                setJob(jobData)
                setEvents(eventsData || [])
                setUpdates(updatesData || [])
                setLoading(false)
            }
        }

        fetchInitialData()

        return () => { isMounted = false }
    }, [jobId, supabase])

    // 2. Subscribe to realtime updates
    useEffect(() => {
        if (!job || job.status === 'completed' || job.status === 'failed') return

        const jobChannel = supabase.channel(`job-${job.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'monitoring_jobs', filter: `id=eq.${job.id}` }, (payload: any) => {
                setJob(payload.new as MonitoringJob)
            }).subscribe()

        const eventsChannel = supabase.channel(`events-${job.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'monitoring_events', filter: `job_id=eq.${job.id}` }, (payload: any) => {
                setEvents(prev => [payload.new as MonitoringEvent, ...prev])
            }).subscribe()

        const updatesChannel = supabase.channel(`updates-${job.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'monitoring_updates', filter: `job_id=eq.${job.id}` }, async (payload: any) => {
                const { data: newUpdate } = await supabase
                    .from('monitoring_updates')
                    .select('*, organizations (name, short_name), organization_sources (name, url)')
                    .eq('id', payload.new.id)
                    .single()
                if (newUpdate) setUpdates(prev => [newUpdate, ...prev])
            }).subscribe()

        return () => {
            supabase.removeChannel(jobChannel)
            supabase.removeChannel(eventsChannel)
            supabase.removeChannel(updatesChannel)
        }
    }, [job?.id, job?.status, supabase])

    if (loading || !job) {
        return (
            <div className="flex items-center justify-center p-12 text-foreground-muted">
                <span className="size-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mr-3" />
                Loading job details...
            </div>
        )
    }

    const progressValue = job.total_sources > 0 ? (job.processed_count / job.total_sources) * 100 : 0
    const isRunning = job.status === 'running'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Monitoring Details</h1>
                    <p className="text-sm text-foreground-muted">
                        Detailed insights into the monitoring job
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="danger"
                        size="sm"
                        loading={isDeleting}
                        onClick={handleDelete}
                    >
                        Delete Job
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        Back to Monitoring
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-foreground-muted mb-2">Sources Progress</h3>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-bold">{job.processed_count} <span className="text-sm text-foreground-muted font-normal">/ {job.total_sources}</span></span>
                        <span className="text-sm text-foreground-muted">{Math.round(progressValue)}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                </Card>
                <Card className="p-4">
                    <h3 className="text-sm font-medium text-foreground-muted mb-2">Organizations Progress</h3>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-2xl font-bold">{job.processed_orgs} <span className="text-sm text-foreground-muted font-normal">/ {job.total_orgs}</span></span>
                    </div>
                </Card>
                <Card className="p-4 flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-foreground-muted mb-1">Found Updates</h3>
                        <span className="text-3xl font-bold text-green-600 dark:text-green-500">{job.updates_count}</span>
                    </div>
                    <div className="flex gap-4 text-sm mt-2 border-t border-border pt-2">
                        <span className="text-red-500">Errors: {job.errors_count}</span>
                        <span className="text-foreground-muted">Muffled: {job.muffled_count}</span>
                    </div>
                </Card>
            </div>

            <Tabs
                defaultValue="updates"
                tabs={[
                    { value: 'updates', label: `Updates Found (${updates.length})` },
                    { value: 'timeline', label: 'Live Timeline' }
                ]}
            >
                {(activeTab) => (
                    <>
                        {activeTab === 'updates' && (
                            <div className="pt-4">
                                <div className='w-full rounded-xl overflow-hidden border border-border bg-surface'>
                                    <table className='w-full text-sm text-left'>
                                        <thead className='border-b border-border bg-background-subtle rounded-t-xl'>
                                            <tr>
                                                <th className='px-4 py-3 font-medium text-foreground-muted'>Organization</th>
                                                <th className='px-4 py-3 font-medium text-foreground-muted'>Source</th>
                                                <th className='px-4 py-3 font-medium text-foreground-muted'>AI Title</th>
                                                <th className='px-4 py-3 font-medium text-foreground-muted'>Status</th>
                                                <th className='px-4 py-3 font-medium text-foreground-muted text-right'>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-border'>
                                            {updates.map((update) => (
                                                <tr key={update.id} className="hover:bg-background-subtle/50">
                                                    <td className='px-4 py-3 font-medium'>{update.organizations?.name}</td>
                                                    <td className='px-4 py-3'>
                                                        <a href={update.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                            {update.organization_sources?.name || 'Link'}
                                                        </a>
                                                    </td>
                                                    <td className='px-4 py-3'>{update.title}</td>
                                                    <td className='px-4 py-3'>
                                                        <Badge variant="default">{update.status}</Badge>
                                                    </td>
                                                    <td className='px-4 py-3 text-right'>
                                                        {update.draft_post_id && (
                                                            <Link href={`/author/editor/${update.draft_post_id}`} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                                                                Review Draft
                                                            </Link>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {updates.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-foreground-muted">
                                                        {isRunning ? 'Scanning... Updates will appear here.' : 'No updates found during this run.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="pt-4">
                                <Card className="p-0 overflow-hidden border-border bg-surface">
                                    <div className="max-h-[600px] overflow-y-auto p-4 space-y-4 font-mono text-sm">
                                        {events.map((event) => (
                                            <div key={event.id} className="flex gap-4 border-b border-border/50 pb-4 last:border-0">
                                                <div className="text-foreground-muted shrink-0 w-24">
                                                    {format(new Date(event.created_at), 'HH:mm:ss')}
                                                </div>
                                                <div>
                                                    <span className={`font-semibold mr-2 ${event.event_type === 'error' || event.event_type === 'job_failed' ? 'text-red-500' :
                                                        event.event_type === 'change_detected' ? 'text-blue-500' :
                                                            event.event_type === 'draft_created' ? 'text-green-500' :
                                                                'text-foreground'
                                                        }`}>
                                                        [{event.event_type}]
                                                    </span>
                                                    <span className="text-foreground">{event.message}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {events.length === 0 && (
                                            <div className="text-foreground-muted text-center py-4">No events recorded yet.</div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </Tabs>
        </div>
    )
}

import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { startMonitoringJob } from '@/lib/monitoring'
import { withErrorHandling, successResponse, errorResponse } from '@/lib/api-response'

export const maxDuration = 300 // Allow up to 5 minutes for batch scraping

/**
 * GET /api/monitoring
 * 
 * Two modes:
 * 1. ?job_id=X          — Authenticated staff polls a specific job status + its logs
 * 2. No params + Bearer — Vercel Cron triggers a full monitoring run
 */
export const GET = withErrorHandling(async (request: Request) => {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('job_id')

    if (jobId) {
        // ── Mode 1: Staff polls job status ──────────────────────
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return errorResponse('Unauthorized', 401)
        }

        const { data: dbUser } = await supabase
            .from('users')
            .select('role')
            .eq('auth_user_id', user.id)
            .single()

        if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'author')) {
            return errorResponse('Forbidden', 403)
        }

        const adminSupabase = createAdminClient()

        // Fetch job
        const { data: job, error: jobErr } = await adminSupabase
            .from('monitoring_jobs')
            .select('*')
            .eq('id', jobId)
            .single()

        if (jobErr || !job) {
            return errorResponse('Job not found', 404)
        }

        // Fetch associated logs for this job
        const { data: logs } = await adminSupabase
            .from('monitoring_logs')
            .select(`
                id,
                organization_id,
                job_id,
                source_url,
                checked_at,
                status,
                error_message,
                raw_diff,
                content_hash,
                draft_post_id,
                organizations (
                    name,
                    short_name
                )
            `)
            .eq('job_id', jobId)
            .order('checked_at', { ascending: true })

        return successResponse({ job, logs: logs || [] })
    }

    // ── Mode 2: Cron-triggered monitoring batch ────────────────
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return errorResponse('Unauthorized', 401)
    }

    const result = await startMonitoringJob('cron')

    if ('error' in result) {
        return errorResponse(result.error || 'Monitoring batch check failed', 500)
    }

    // Await execution to completion in serverless/cron environment
    if (result.promise) {
        await result.promise
    }

    return successResponse({
        message: 'Monitoring checks executed successfully',
        jobId: result.jobId,
        shortId: result.shortId,
    })
})

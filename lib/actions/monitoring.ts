'use server'

import { createServerClient } from '@/lib/supabase/server'
import { startMonitoringJob as startJobInternal, deleteMonitoringJob as deleteJobInternal } from '@/lib/monitoring'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

/**
 * Validates that the caller is authenticated and holds the admin or author role.
 */
async function verifyStaff() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized: Session not found.')
    }

    const { data: dbUser, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (userError || !dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'author')) {
        throw new Error('Forbidden: Insufficient privileges.')
    }
}

/**
 * Server Action to start a full crawler/scraper run.
 */
export async function startMonitoringJob(triggerType?: 'manual' | 'cron') {
    await verifyStaff()
    
    const result = await startJobInternal(triggerType)
    
    if ('error' in result) {
        return { error: result.error }
    }

    // Keep the serverless context active on Vercel until the crawler completes
    if (result.promise) {
        try {
            after(async () => {
                await result.promise
            })
        } catch (e) {
            console.warn('after() not supported in this context, running promise in background:', e)
        }
    }

    return { 
        success: true, 
        jobId: result.jobId, 
        shortId: result.shortId 
    }
}

/**
 * Server Action to delete a monitoring run log.
 */
export async function deleteMonitoringJob(jobId: string) {
    await verifyStaff()
    
    const result = await deleteJobInternal(jobId)
    
    if (result.success) {
        revalidatePath('/admin/monitoring')
    }
    
    return result
}

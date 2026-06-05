import { createAdminClient } from '@/lib/supabase/admin'
import { scrapePage } from '@/lib/utils/scraper'
import { generateDraftFromSourceUpdate } from '@/lib/actions/ai'
import { SupabaseClient } from '@supabase/supabase-js'

interface OrgJoinData {
    id: string
    name: string
    short_name: string | null
    state_slug: string | null
    official_url: string | null
}

interface SourceJoinData {
    organization_id: string
    url: string
    name: string
    selector: string | null
    organizations: OrgJoinData | OrgJoinData[] | null
}

/** Per-source scrape timeout in milliseconds */
const SOURCE_TIMEOUT_MS = 20_000

/**
 * Normalizes a slug to match the PostgreSQL check constraint.
 */
function normalizeSlug(slug: string): string {
    return slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

/**
 * Generates a standard UUID client-side for database inserts.
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

/**
 * Generates a short 8-character alphanumeric Job Run ID (e.g. fhr8383).
 */
function generateShortId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Helper to log events to the timeline.
 */
async function logEvent(supabase: SupabaseClient, jobId: string, eventType: string, message: string, metadata: Record<string, unknown> = {}) {
    if (!jobId) return;
    try {
        await supabase.from('monitoring_events').insert({
            job_id: jobId,
            event_type: eventType,
            message,
            metadata
        })
    } catch (e) {
        console.error('Failed to log monitoring timeline event:', e)
    }
}

/**
 * Checks a specific organization source page for updates.
 * If an update is detected, triggers Gemini to analyze and create a draft post.
 */
export async function checkOrganizationSource(
    sourceId: string,
    jobId?: string
): Promise<{ status: string; error?: string; reason?: string; draftPostId?: string }> {
    const supabase = createAdminClient()
    let activeJobId = jobId
    const isSingleJobRun = !jobId
    let source: SourceJoinData | null = null

    // If it's a standalone manual check, generate a parent job entry for tracking
    if (isSingleJobRun) {
        const generatedJobId = generateUUID()
        const shortId = generateShortId()
        const { error: jobErr } = await supabase.from('monitoring_jobs').insert({
            id: generatedJobId,
            short_id: shortId,
            status: 'running',
            trigger_type: 'manual_single',
            total_sources: 1,
            processed_count: 0,
            started_at: new Date().toISOString()
        })
        if (!jobErr) {
            activeJobId = generatedJobId
        }
    }

    const startMs = Date.now()
    
    try {
        // 1. Fetch organization source & organization details
        const { data: sourceData, error: sourceError } = await supabase
            .from('organization_sources')
            .select('*, organizations(id, name, short_name, state_slug, official_url)')
            .eq('id', sourceId)
            .single()

        if (sourceError || !sourceData) {
            throw new Error(`Failed to load source: ${sourceError?.message || 'Not found'}`)
        }
        const activeSource = sourceData as SourceJoinData
        source = activeSource
        
        const org = Array.isArray(activeSource.organizations) ? activeSource.organizations[0] : activeSource.organizations;
        if (!org) throw new Error('Organization data missing');

        // 2. Load the last snapshot for this source
        const { data: lastSnapshot } = await supabase
            .from('monitoring_source_snapshots')
            .select('id, content_hash')
            .eq('source_id', sourceId)
            .order('captured_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        // 3. Scrape current source page
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS)
        
        let scrapeResult
        try {
            scrapeResult = await scrapePage(activeSource.url, activeSource.selector, controller.signal)
        } catch (e: unknown) {
            const err = e as { name?: string; message?: string }
            if (err.name === 'AbortError') {
                throw new Error(`Timeout after ${SOURCE_TIMEOUT_MS}ms: ${activeSource.url}`)
            }
            throw e;
        } finally {
            clearTimeout(timeoutId)
        }

        const durationMs = Date.now() - startMs;

        // 4. Compare content hash
        if (lastSnapshot && scrapeResult.hash === lastSnapshot.content_hash) {
            // Content has not changed
            await supabase.from('monitoring_logs').insert({
                organization_id: activeSource.organization_id,
                job_id: activeJobId || null,
                source_id: sourceId,
                source_url: activeSource.url,
                status: 'no_change',
                duration_ms: durationMs,
                content_hash: scrapeResult.hash,
                raw_diff: scrapeResult.rawContent,
                checked_at: new Date().toISOString()
            })

            // Update source checked timestamp
            await supabase.from('organization_sources').update({
                last_checked_at: new Date().toISOString()
            }).eq('id', sourceId)

            if (isSingleJobRun && activeJobId) {
                await supabase.from('monitoring_jobs').update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    processed_count: 1,
                }).eq('id', activeJobId)
            }

            return { status: 'no_change' }
        }

        // 5. Change detected! Create a new snapshot
        const { data: newSnapshot, error: snapErr } = await supabase.from('monitoring_source_snapshots').insert({
            source_id: sourceId,
            content_hash: scrapeResult.hash,
            content_text: scrapeResult.rawContent,
            captured_at: new Date().toISOString()
        }).select('id').single()

        if (snapErr) throw new Error(`Failed to save snapshot: ${snapErr.message}`);

        await supabase.from('organization_sources').update({
            last_checked_at: new Date().toISOString(),
            last_hash: scrapeResult.hash
        }).eq('id', sourceId)

        if (activeJobId) {
            await logEvent(supabase, activeJobId, 'change_detected', `Change detected for ${org.name} - ${activeSource.name}`, { source_id: sourceId })
        }

        // 6. Call Gemini to verify relevance and draft a post
        const aiRes = await generateDraftFromSourceUpdate({
            organizationName: org.name,
            organizationShortName: org.short_name,
            stateOrRegion: org.state_slug,
            sourceUrl: activeSource.url,
            scrapedContent: scrapeResult.rawContent
        })

        if (aiRes.error || !aiRes.success || !aiRes.data) {
            throw new Error(aiRes.error || 'Gemini classification returned empty response')
        }

        const aiData = aiRes.data

        if (!aiData.isRelevant) {
            // Irrelevant change
            await supabase.from('monitoring_logs').insert({
                organization_id: activeSource.organization_id,
                job_id: activeJobId || null,
                source_id: sourceId,
                source_url: activeSource.url,
                status: 'no_change',
                duration_ms: durationMs,
                error_message: `Irrelevant change: ${aiData.relevanceReason}`,
                checked_at: new Date().toISOString()
            })

            if (isSingleJobRun && activeJobId) {
                await supabase.from('monitoring_jobs').update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    processed_count: 1,
                    muffled_count: 1
                }).eq('id', activeJobId)
            }

            return { status: 'no_change', reason: aiData.relevanceReason }
        }

        // Generate draft post
        const draft = aiData.draft
        if (!draft) {
            throw new Error('AI marked notice as relevant but failed to generate a draft post object.')
        }

        // Sanitize and normalize post type to match post_type enum
        let postType = aiData.postType as string
        if (postType === 'admit_card' || postType === 'admit-card') {
            postType = 'admit'
        } else if (postType === 'answer-key') {
            postType = 'answer_key'
        } else if (postType === 'cutoff' || postType === 'cut-off') {
            postType = 'cut_off'
        } else if (postType === 'exampattern' || postType === 'exam-pattern') {
            postType = 'exam_pattern'
        } else if (postType === 'previous-paper' || postType === 'previousyearpaper') {
            postType = 'previous_paper'
        }

        const validPostTypes = [
            'job', 'result', 'admit', 'answer_key', 'cut_off', 'syllabus', 
            'exam_pattern', 'previous_paper', 'scheme', 'exam', 'admission', 
            'scholarship', 'notification'
        ]
        if (!validPostTypes.includes(postType)) {
            postType = 'notification'
        }

        let finalSlug = normalizeSlug(draft.slug || `${org.short_name || org.name}-update`)
        if (finalSlug.length < 3) finalSlug = finalSlug + '-update'

        const { data: existingPost } = await supabase
            .from('posts')
            .select('id')
            .eq('slug', finalSlug)
            .maybeSingle()

        if (existingPost) {
            finalSlug = `${finalSlug}-${Math.floor(1000 + Math.random() * 9000)}`
        }

        // 7. Insert the auto-generated draft post (with safe fallback titles and metadata constraints)
        const draftPostData = {
            type: postType,
            status: 'draft',
            title: draft.title || `New Update from ${org.short_name || org.name}`,
            slug: finalSlug,
            excerpt: draft.excerpt || '',
            content: draft.content || '',
            state_slug: org.state_slug,
            organization_id: org.id,
            org_name: org.name,
            org_short_name: org.short_name,
            qualification: draft.suggestedQualifications || [],
            official_url: org.official_url,
            primary_link: draft.primaryLink || org.official_url,
            notification_pdf: draft.notificationPdfUrl || null,
            faq: draft.faq || [],
            meta_title: draft.metaTitle ? draft.metaTitle.substring(0, 70) : null,
            meta_description: draft.metaDescription ? draft.metaDescription.substring(0, 165) : null,
            focus_keyword: draft.focusKeyword || '',
            secondary_keywords: draft.secondaryKeywords || [],
            needs_human_review: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        const { data: insertedPost, error: insertError } = await supabase
            .from('posts')
            .insert(draftPostData)
            .select('id')
            .single()

        if (insertError) {
            throw new Error(`Failed to insert auto-drafted post: ${insertError.message}`)
        }

        // 8. Create monitoring updates record
        const { data: updateRec, error: updateErr } = await supabase.from('monitoring_updates').insert({
            organization_id: activeSource.organization_id,
            source_id: sourceId,
            job_id: activeJobId || null,
            title: draft.title || `New Update from ${org.short_name || org.name}`,
            summary: draft.excerpt || '',
            source_url: activeSource.url,
            old_snapshot_id: lastSnapshot?.id || null,
            new_snapshot_id: newSnapshot.id,
            draft_post_id: insertedPost.id,
            status: 'new'
        }).select('id').single()

        if (updateErr) {
            console.error('Failed to insert monitoring_updates record:', updateErr)
        }

        // 9. Save monitoring log
        await supabase.from('monitoring_logs').insert({
            organization_id: activeSource.organization_id,
            job_id: activeJobId || null,
            source_id: sourceId,
            source_url: activeSource.url,
            status: 'updated',
            duration_ms: durationMs,
            draft_post_id: insertedPost.id,
            checked_at: new Date().toISOString()
        })

        if (isSingleJobRun && activeJobId) {
            await supabase.from('monitoring_jobs').update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                processed_count: 1,
                updates_count: 1,
            }).eq('id', activeJobId)
        }

        if (activeJobId) {
            await logEvent(supabase, activeJobId, 'draft_created', `Draft generated for ${org.name}`, { update_id: updateRec?.id })
        }

        return { status: 'updated', draftPostId: insertedPost.id }

    } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error(`Error crawling source ${sourceId}:`, errorMsg)

        try {
            // Safe logging: ensure we only log if the organization source was successfully loaded
            if (source) {
                await supabase.from('monitoring_logs').insert({
                    organization_id: source.organization_id,
                    job_id: activeJobId || null,
                    source_id: sourceId,
                    source_url: source.url,
                    status: 'error',
                    error_message: errorMsg,
                    checked_at: new Date().toISOString()
                })
            }
        } catch (e: unknown) {
            console.error('Failed to save error to monitoring_logs:', e)
        }

        if (activeJobId) {
            await logEvent(supabase, activeJobId, 'error', `Error checking source: ${errorMsg}`, { source_id: sourceId })
        }

        if (isSingleJobRun && activeJobId) {
            try {
                await supabase.from('monitoring_jobs').update({
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                    processed_count: 1,
                    errors_count: 1,
                }).eq('id', activeJobId)
            } catch (e) {
                console.error('Failed to update job status on error:', e)
            }
        }

        return { status: 'error', error: errorMsg }
    }
}

/**
 * Loops through all active organizations and runs check on their configured sources.
 * Updates processed_count incrementally after each source for real-time progress tracking.
 */
export async function startMonitoringJob(triggerType?: 'manual' | 'cron') {
    const supabase = createAdminClient()
    const jobId = generateUUID()
    const shortId = generateShortId()

    try {
        const { data: sources, error: sourcesError } = await supabase
            .from('organization_sources')
            .select('id, organization_id, url, name, organizations(name)')
            .eq('is_active', true)

        if (sourcesError) {
            throw new Error(`Failed to fetch active sources: ${sourcesError.message}`)
        }

        const activeSources = sources || []
        const uniqueOrgs = new Set(activeSources.map(s => s.organization_id))

        // 1. Insert the parent job in database
        const { error: jobInsertErr } = await supabase.from('monitoring_jobs').insert({
            id: jobId,
            short_id: shortId,
            status: 'running',
            trigger_type: triggerType ?? 'manual',
            total_sources: activeSources.length,
            total_orgs: uniqueOrgs.size,
            processed_count: 0,
            processed_orgs: 0,
            started_at: new Date().toISOString()
        })

        if (jobInsertErr) {
            throw new Error(`Failed to initialize monitoring job record: ${jobInsertErr.message}`)
        }

        await logEvent(supabase, jobId, 'job_started', `Monitoring job started with ${activeSources.length} sources across ${uniqueOrgs.size} organizations.`)

        // 2. Return success info and the promise for the long-running task so the caller can handle it
        const promise = runMonitoringTask(jobId, shortId, activeSources)

        return { success: true, jobId, shortId, promise }

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown monitoring run error'
        console.error('Failed to start monitoring job:', message)
        return { error: message }
    }
}

interface ActiveSourceItem {
    id: string
    organization_id: string
    url: string
    name: string
}

/**
 * Background task that loops through sources in chunks.
 */
async function runMonitoringTask(jobId: string, shortId: string, activeSources: ActiveSourceItem[]) {
    const supabase = createAdminClient()
    let updatesCount = 0
    let errorsCount = 0
    let muffledCount = 0
    let processedCount = 0
    const processedOrgs = new Set<string>()

    const results: Array<unknown> = []

    try {
        if (activeSources.length > 0) {
            const chunkSize = 3
            for (let i = 0; i < activeSources.length; i += chunkSize) {
                const chunk = activeSources.slice(i, i + chunkSize)
                
                await Promise.all(
                    chunk.map(async (item) => {
                        try {
                            const checkRes = await checkOrganizationSource(item.id, jobId)
                            if (checkRes.status === 'updated') updatesCount++
                            else if (checkRes.status === 'error') errorsCount++
                            else if (checkRes.status === 'no_change' && checkRes.reason) muffledCount++
                            
                            results.push({ source_id: item.id, organization_id: item.organization_id, ...checkRes })
                        } catch (e: unknown) {
                            errorsCount++
                            results.push({
                                source_id: item.id,
                                organization_id: item.organization_id,
                                status: 'error',
                                error: e instanceof Error ? e.message : String(e)
                            })
                        }
                        
                        processedOrgs.add(item.organization_id)
                    })
                )

                processedCount += chunk.length
                
                try {
                    await supabase.from('monitoring_jobs').update({
                        processed_count: processedCount,
                        processed_orgs: processedOrgs.size,
                        updates_count: updatesCount,
                        errors_count: errorsCount,
                        muffled_count: muffledCount
                    }).eq('id', jobId)
                } catch (e) {
                    console.error('Failed to update job progress metrics:', e)
                }
            }
        }

        // 2. Complete the job record
        await supabase.from('monitoring_jobs').update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            processed_count: processedCount,
            processed_orgs: processedOrgs.size,
            updates_count: updatesCount,
            errors_count: errorsCount,
            muffled_count: muffledCount
        }).eq('id', jobId)

        await logEvent(supabase, jobId, 'job_completed', `Monitoring job completed. Updates found: ${updatesCount}, Errors: ${errorsCount}`)

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown monitoring run error'
        console.error('Failed monitoring task execution:', message)
        
        try {
            await supabase.from('monitoring_jobs').update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                errors_count: 1
            }).eq('id', jobId)
            
            await logEvent(supabase, jobId, 'job_failed', `Job failed: ${message}`)
        } catch (e) {
            console.error('Failed to set job status to failed:', e)
        }
    }
}

/**
 * Deletes a monitoring job and all its related updates, events, and logs.
 */
export async function deleteMonitoringJob(jobId: string) {
    const supabase = createAdminClient()
    
    try {
        // 1. Delete associated updates explicitly (since schema has ON DELETE SET NULL for updates)
        await supabase.from('monitoring_updates').delete().eq('job_id', jobId)
        
        // 2. Delete the job itself (Logs and Events will cascade automatically per DB schema)
        const { error } = await supabase.from('monitoring_jobs').delete().eq('id', jobId)
        
        if (error) throw new Error(error.message)
        
        return { success: true }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown delete error'
        console.error('Failed to delete monitoring job:', message)
        return { error: message }
    }
}

/**
 * Content Freshness Engine
 * 
 * Detects stale content (e.g., active application windows that haven't been updated)
 * to maintain high freshness signals for Google Discover and News.
 */

import { createServerClient } from '@/lib/supabase/server'
import type { PublishedPost } from '@/types/post.types'

export interface FreshnessReport {
    stalePosts: PublishedPost[]
    totalChecked: number
}

/**
 * Scans the database for posts that need a freshness update.
 * Criteria for Stale Content:
 * 1. application_status = 'open' AND updated_at < 5 days ago
 * 2. application_status = 'closing_soon' AND updated_at < 2 days ago
 * 3. application_end_date has passed, but application_status is still 'open' or 'closing_soon'
 */
export async function findStaleContent(): Promise<FreshnessReport> {
    const supabase = await createServerClient()
    
    // Using v_published_posts which correctly computes application_status and has all fields
    const { data: posts, error } = await supabase
        .from('v_published_posts')
        .select('*')
        .eq('status', 'published')
    
    if (error || !posts) {
        console.error('Failed to fetch posts for freshness check:', error)
        return { stalePosts: [], totalChecked: 0 }
    }

    const stalePosts: PublishedPost[] = []
    const now = new Date()

    for (const post of posts as PublishedPost[]) {
        const lastUpdated = new Date(post.updated_at)
        const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 3600 * 24)
        
        let isStale = false

        if (post.application_status === 'open' && daysSinceUpdate >= 5) {
            isStale = true
        } else if (post.application_status === 'closing_soon' && daysSinceUpdate >= 2) {
            isStale = true
        } else if (post.application_end_date) {
            const endDate = new Date(post.application_end_date)
            // If end date passed but status wasn't updated to 'closed'
            if (now > endDate && ['open', 'closing_soon'].includes(post.application_status)) {
                isStale = true
            }
        }

        if (isStale) {
            stalePosts.push(post)
        }
    }

    return {
        stalePosts,
        totalChecked: posts.length
    }
}

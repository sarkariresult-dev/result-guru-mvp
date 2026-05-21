/**
 * Topical Authority System
 * 
 * Classifies content into Hubs (Pillars) and Spokes (Supporting Clusters)
 * to build semantic authority and structure internal linking.
 */

import type { PostType } from '@/types/enums'
import type { PostTag } from '@/types/post.types'

export type ContentRole = 'pillar' | 'supporting' | 'news'

export interface TopicalAuthorityScore {
    role: ContentRole
    clusterName: string
    authorityScore: number // 0-100
}

/**
 * Determines the architectural role of a post based on its type and tags.
 */
export function determineContentRole(
    postType: PostType | string,
    wordCount: number,
    _tags?: PostTag[] | null
): ContentRole {
    const pillarTypes = ['exam', 'syllabus', 'scheme']
    const newsTypes = ['notification', 'result', 'admit', 'answer_key', 'cut_off']

    // If it's a massive, comprehensive post on a broad topic, it's a pillar
    if (pillarTypes.includes(postType) && wordCount >= 1200) {
        return 'pillar'
    }

    // Fast-moving updates are news/spokes
    if (newsTypes.includes(postType)) {
        return 'news'
    }

    return 'supporting'
}

/**
 * Calculates a topical authority score for a piece of content.
 * Higher scores indicate stronger cluster relevance and depth.
 */
export function calculateTopicalAuthority(
    postType: string,
    wordCount: number,
    tags: PostTag[] | null,
    internalLinksCount: number,
    seoScore: number
): TopicalAuthorityScore {
    const role = determineContentRole(postType, wordCount, tags)
    
    // Identify primary cluster from tags (e.g., 'UPSC', 'SSC')
    const primaryClusterTag = tags && tags.length > 0 
        ? tags.find(t => t.tag_type === 'board' || t.tag_type === 'exam') 
        : null
    
    const clusterName = primaryClusterTag ? primaryClusterTag.name : 'General'

    let authorityScore = 50 // Baseline
    
    // Depth rewards
    if (wordCount > 1500) authorityScore += 15
    else if (wordCount > 800) authorityScore += 5
    
    // Internal linking rewards (Hubs should link heavily)
    if (internalLinksCount >= 5) authorityScore += 15
    else if (internalLinksCount >= 2) authorityScore += 5

    // SEO Foundation
    if (seoScore >= 80) authorityScore += 20
    else if (seoScore >= 60) authorityScore += 10

    return {
        role,
        clusterName,
        authorityScore: Math.min(100, authorityScore)
    }
}

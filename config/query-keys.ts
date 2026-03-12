/**
 * query-keys.ts - Result Guru
 *
 * Centralised React Query key factory.
 * Using factory functions keeps keys consistent across hooks and
 * makes targeted cache invalidation trivial.
 *
 * Usage:
 *   import { queryKeys } from '@/config/query-keys'
 *   queryClient.invalidateQueries({ queryKey: queryKeys.posts.all() })
 */

import type { PostFilters } from '@/types/post.types'

export const queryKeys = {
    // ── Posts ──────────────────────────────────────────────────────────
    posts: {
        all: () => ['posts'] as const,
        lists: () => ['posts', 'list'] as const,
        list: (filters: PostFilters) => ['posts', 'list', filters] as const,
        infinite: (filters: PostFilters) => ['posts', 'infinite', filters] as const,
        detail: (slug: string) => ['posts', 'detail', slug] as const,
        seoHead: (slug: string) => ['posts', 'seo', slug] as const,
        related: (slug: string) => ['posts', 'related', slug] as const,
        trending: () => ['posts', 'trending'] as const,
        attention: () => ['posts', 'attention'] as const,
        seoAudit: () => ['posts', 'seo-audit'] as const,
    },

    // ── Search ─────────────────────────────────────────────────────────
    search: {
        all: () => ['search'] as const,
        results: (query: string) => ['search', 'results', query] as const,
        suggest: (query: string) => ['search', 'suggest', query] as const,
    },

    // ── Taxonomy ───────────────────────────────────────────────────────
    taxonomy: {
        all: () => ['taxonomy'] as const,
        states: () => ['taxonomy', 'states'] as const,
        state: (slug: string) => ['taxonomy', 'state', slug] as const,
        organisations: () => ['taxonomy', 'organisations'] as const,
        organisation: (slug: string) => ['taxonomy', 'organisation', slug] as const,
        categories: () => ['taxonomy', 'categories'] as const,
        category: (slug: string) => ['taxonomy', 'category', slug] as const,
        qualifications: () => ['taxonomy', 'qualifications'] as const,
        tags: () => ['taxonomy', 'tags'] as const,
        tag: (slug: string) => ['taxonomy', 'tag', slug] as const,
        summary: () => ['taxonomy', 'summary'] as const,
    },

    // ── Ads ────────────────────────────────────────────────────────────
    ads: {
        all: () => ['ads'] as const,
        zone: (zoneSlug: string, ctx?: object) => ['ads', 'zone', zoneSlug, ctx] as const,
        campaign: (id: string) => ['ads', 'campaign', id] as const,
    },

    // ── Affiliate ──────────────────────────────────────────────────────
    affiliate: {
        all: () => ['affiliate'] as const,
        featured: () => ['affiliate', 'featured'] as const,
        post: (postId: string) => ['affiliate', 'post', postId] as const,
    },

    // ── Newsletter ─────────────────────────────────────────────────────
    newsletter: {
        subscriber: (email: string) => ['newsletter', 'subscriber', email] as const,
    },

    // ── Analytics ──────────────────────────────────────────────────────
    analytics: {
        dashboard: () => ['analytics', 'dashboard'] as const,
        post: (postId: string) => ['analytics', 'post', postId] as const,
        site: (date: string) => ['analytics', 'site', date] as const,
    },

    // ── Auth / User ────────────────────────────────────────────────────
    auth: {
        session: () => ['auth', 'session'] as const,
        user: () => ['auth', 'user'] as const,
    },

    // ── Home page ──────────────────────────────────────────────────────
    home: {
        data: () => ['home', 'data'] as const,
    },

    // ── CMS / Admin ────────────────────────────────────────────────────
    admin: {
        stats: () => ['admin', 'stats'] as const,
        users: () => ['admin', 'users'] as const,
        redirects: () => ['admin', 'redirects'] as const,
        seoSettings: () => ['admin', 'seo-settings'] as const,
        media: (filters?: object) => ['admin', 'media', filters] as const,
    },
} as const
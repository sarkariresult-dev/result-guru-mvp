import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { DATE_FORMAT, POST_TYPE_CONFIG } from '@/config/constants'
import { ROUTE_PREFIXES } from '@/config/site'
import type { PostTypeKey } from '@/config/site'

// ─── Class name merging (clsx + tailwind-merge) ─────────────────────────────

/**
 * Merge Tailwind class names with conflict resolution.
 * @example cn('px-4 py-2', isActive && 'bg-blue-500', className)
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// ─── Date formatting ────────────────────────────────────────────────────────

/**
 * Format a date string or Date object for display.
 * Uses Indian locale (en-IN) by default.
 *
 * @param date - ISO string, Date, or null/undefined
 * @param format - One of the DATE_FORMAT presets or a custom Intl.DateTimeFormatOptions
 * @returns Formatted string, or '-' for null/undefined
 */
export function formatDate(
    date: string | Date | null | undefined,
    format: keyof typeof DATE_FORMAT | Intl.DateTimeFormatOptions = 'DISPLAY',
): string {
    if (!date) return '-'

    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return '-'

    // Preset formats
    const presets: Record<string, Intl.DateTimeFormatOptions> = {
        DISPLAY: { day: 'numeric', month: 'short', year: 'numeric' },
        DISPLAY_TIME: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
        MONTH_YEAR: { month: 'long', year: 'numeric' },
        SHORT: { day: '2-digit', month: '2-digit', year: 'numeric' },
        ISO: {},
    }

    try {
        if (typeof format === 'string') {
            if (format === 'ISO') {
                return d.toISOString()
            }
            return d.toLocaleDateString('en-IN', presets[format] ?? presets.DISPLAY)
        }
        return d.toLocaleDateString('en-IN', format)
    } catch {
        // Safe fallback for restricted environments
        try {
            return d.toDateString()
        } catch {
            return '-'
        }
    }
}

// ─── Slug helpers ───────────────────────────────────────────────────────────

/** Convert a title to a URL-safe slug */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')   // remove non-word chars
        .replace(/[\s_]+/g, '-')    // spaces/underscores → hyphens
        .replace(/-+/g, '-')        // collapse multiple hyphens
        .replace(/^-|-$/g, '')      // trim leading/trailing
}

// ─── Route helpers (shared across dynamic route pages) ──────────────────────

/** Convert URL slug (e.g. "answer-key") → post_type enum key (e.g. "answer_key") */
export function slugToKey(slug: string): PostTypeKey | null {
    // Exact match in ROUTE_PREFIXES (e.g., "/admit-card" -> "admit")
    const entry = Object.entries(ROUTE_PREFIXES).find(([_, prefix]) => prefix === `/${slug}`)
    if (entry) return entry[0] as PostTypeKey

    // Fallback block for missing prefixes or direct mapping
    const key = slug.replace(/-/g, '_')
    return key in POST_TYPE_CONFIG ? (key as PostTypeKey) : null
}

/** Convert enum key (e.g. "answer_key") → URL slug (e.g. "answer-key") */
export function keyToSlug(key: string): string {
    if (key in ROUTE_PREFIXES) {
        return ROUTE_PREFIXES[key as PostTypeKey].replace(/^\//, '')
    }
    return key.replace(/_/g, '-')
}

/** Humanise a slug: "answer-key" → "Answer Key" */
export function humanise(slug: string): string {
    const key = slugToKey(slug)
    if (key && POST_TYPE_CONFIG[key]) {
        return POST_TYPE_CONFIG[key].heading
    }
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ─── String helpers ─────────────────────────────────────────────────────────

/** Truncate text to a max length, adding ellipsis if needed. */
export function truncate(str: string, max: number): string {
    if (str.length <= max) return str
    return str.slice(0, max - 1).trimEnd() + '…'
}

/** Capitalize first letter of a string */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Strip HTML tags from a string (for plain-text excerpts). */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

// ─── Number formatting ─────────────────────────────────────────────────────

/** Format a number with Indian-style commas (e.g. 12,34,567) */
export function formatNumber(num: number | null | undefined): string {
    if (num == null) return '0'
    try {
        return num.toLocaleString('en-IN')
    } catch {
        return num.toString()
    }
}

/** Format views compactly (e.g. 1.2K, 3.4L) */
export function formatViews(views: number): string {
    if (views >= 10_00_000) return `${(views / 10_00_000).toFixed(1)}Cr`
    if (views >= 1_00_000) return `${(views / 1_00_000).toFixed(1)}L`
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`
    return views.toString()
}

// ─── Reading time ───────────────────────────────────────────────────────────

/** Estimate reading time in minutes from word count. */
export function estimateReadingTime(wordCount: number, wpm = 200): number {
    return Math.max(1, Math.ceil(wordCount / wpm))
}

// ─── URL helpers ────────────────────────────────────────────────────────────

/** Ensure a URL has a trailing slash */
export function withTrailingSlash(url: string): string {
    return url.endsWith('/') ? url : `${url}/`
}

/** Remove trailing slash from a URL */
export function withoutTrailingSlash(url: string): string {
    return url.endsWith('/') && url.length > 1 ? url.slice(0, -1) : url
}

/** Check if a string is a valid URL */
export function isValidUrl(str: string): boolean {
    try {
        new URL(str)
        return true
    } catch {
        return false
    }
}

// ─── Miscellaneous ──────────────────────────────────────────────────────────

/** Wait for a given number of milliseconds */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Get initials from a name (e.g. "Rahul Sharma" → "RS") */
export function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
}

/** Generate a random hex string (browser-safe) */
export function randomHex(length = 16): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

// ─── Post logic helpers ─────────────────────────────────────────────────────

import { ApplicationStatus } from '@/types/enums'

/**
 * Calculate the application status based on start and end dates.
 * Mirrors the logic in 017_views.sql.
 */
export function calculateApplicationStatus(
    startDate: string | Date | null | undefined,
    endDate: string | Date | null | undefined
): ApplicationStatus {
    if (!startDate && !endDate) return ApplicationStatus.None
    // If no start date but there is an end date, we still treat it as 'na' or logic-less
    if (!startDate) return ApplicationStatus.NA

    const now = new Date()
    const start = new Date(startDate)

    if (now < start) return ApplicationStatus.Upcoming

    if (endDate) {
        const end = new Date(endDate)
        if (now > end) return ApplicationStatus.Closed

        // Closing soon if within 3 days of end date
        const threeDaysBefore = new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000)
        if (now > threeDaysBefore) return ApplicationStatus.ClosingSoon
    }

    return ApplicationStatus.Open
}

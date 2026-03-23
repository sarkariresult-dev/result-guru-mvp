

import type { PostTypeKey } from './site'
import type { ApplicationStatus, PostStatus } from '@/types/enums'

// ─── Pagination ─────────────────────────────────────────────────────────────

export const PAGINATION = {
    /** Default items per listing page */
    DEFAULT_LIMIT: 20,
    /** Infinite scroll page size */
    INFINITE_LIMIT: 15,
    /** Admin table page size */
    ADMIN_LIMIT: 50,
    /** Maximum allowed limit to prevent DB abuse */
    MAX_LIMIT: 100,
    /** Sitemap URLs per file */
    SITEMAP_LIMIT: 50_000,
} as const

// ─── Cache / revalidation TTLs (seconds) ────────────────────────────────────

export const CACHE_TTL = {
    /** Home page - refresh often for latest posts */
    HOME: 300,        // 5 min
    /** Listing pages */
    LISTING: 600,        // 10 min
    /** Individual post pages */
    POST: 3_600,      // 1 hr
    /** Static taxonomy pages (states, orgs) */
    TAXONOMY: 86_400,     // 24 hr
    /** Sitemap */
    SITEMAP: 3_600,      // 1 hr
    /** Search results */
    SEARCH: 60,         // 1 min (very fresh)
    /** Affiliate products */
    AFFILIATE: 1_800,      // 30 min
    /** Ad zones */
    ADS: 300,        // 5 min
    /** RSS feed */
    RSS: 600,        // 10 min
} as const

// ─── React Query stale times (ms) ───────────────────────────────────────────

export const STALE_TIME = {
    POSTS: 5 * 60 * 1000,      // 5 min
    POST_DETAIL: 10 * 60 * 1000,     // 10 min
    TAXONOMY: 30 * 60 * 1000,     // 30 min
    ADS: 3 * 60 * 1000,      // 3 min
    USER: Infinity,           // until invalidated
} as const

// ─── Post type display config ────────────────────────────────────────────────

export interface PostTypeConfig {
    label: string    // Short label for badges / chips
    heading: string    // H1 heading prefix e.g. "Government Job"
    description: string    // Meta description prefix
    color: string    // Tailwind bg class for badge
    textColor: string    // Tailwind text class for badge
    icon: string    // lucide-react icon name
    priority: number    // Sitemap priority 0–1
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}

export const POST_TYPE_CONFIG: Record<PostTypeKey, PostTypeConfig> = {
    job: {
        label: 'Job',
        heading: 'Government Job',
        description: 'Latest government job recruitment notification',
        color: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: 'Briefcase',
        priority: 1.0,
        changefreq: 'daily',
    },
    result: {
        label: 'Result',
        heading: 'Exam Result',
        description: 'Latest exam and recruitment result',
        color: 'bg-green-100',
        textColor: 'text-green-800',
        icon: 'Trophy',
        priority: 0.9,
        changefreq: 'daily',
    },
    admit: {
        label: 'Admit Card',
        heading: 'Admit Card',
        description: 'Download admit card / hall ticket',
        color: 'bg-purple-100',
        textColor: 'text-purple-800',
        icon: 'CreditCard',
        priority: 0.9,
        changefreq: 'daily',
    },
    answer_key: {
        label: 'Answer Key',
        heading: 'Answer Key',
        description: 'Official and provisional answer key',
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: 'Key',
        priority: 0.8,
        changefreq: 'weekly',
    },
    cut_off: {
        label: 'Cut Off',
        heading: 'Cut Off',
        description: 'Category-wise cut off marks',
        color: 'bg-orange-100',
        textColor: 'text-orange-800',
        icon: 'BarChart2',
        priority: 0.7,
        changefreq: 'weekly',
    },
    syllabus: {
        label: 'Syllabus',
        heading: 'Syllabus',
        description: 'Detailed exam syllabus',
        color: 'bg-teal-100',
        textColor: 'text-teal-800',
        icon: 'BookOpen',
        priority: 0.8,
        changefreq: 'monthly',
    },
    exam_pattern: {
        label: 'Exam Pattern',
        heading: 'Exam Pattern',
        description: 'Paper pattern and marking scheme',
        color: 'bg-indigo-100',
        textColor: 'text-indigo-800',
        icon: 'ClipboardList',
        priority: 0.7,
        changefreq: 'monthly',
    },
    previous_paper: {
        label: 'Previous Paper',
        heading: 'Previous Year Paper',
        description: 'Previous year question papers',
        color: 'bg-pink-100',
        textColor: 'text-pink-800',
        icon: 'FileText',
        priority: 0.7,
        changefreq: 'monthly',
    },
    scheme: {
        label: 'Scheme',
        heading: 'Government Scheme',
        description: 'Government scheme and yojana',
        color: 'bg-red-100',
        textColor: 'text-red-800',
        icon: 'Star',
        priority: 0.6,
        changefreq: 'monthly',
    },
    exam: {
        label: 'Exam',
        heading: 'Upcoming Exam',
        description: 'Upcoming exam notification',
        color: 'bg-cyan-100',
        textColor: 'text-cyan-800',
        icon: 'CalendarCheck',
        priority: 0.8,
        changefreq: 'weekly',
    },
    admission: {
        label: 'Admission',
        heading: 'Admission',
        description: 'College and university admission',
        color: 'bg-lime-100',
        textColor: 'text-lime-800',
        icon: 'GraduationCap',
        priority: 0.8,
        changefreq: 'weekly',
    },
    notification: {
        label: 'Notification',
        heading: 'Notification',
        description: 'Government notification and circular',
        color: 'bg-slate-100',
        textColor: 'text-slate-800',
        icon: 'Bell',
        priority: 0.6,
        changefreq: 'weekly',
    },
    scholarship: {
        label: 'Scholarship',
        heading: 'Scholarship',
        description: 'Government central and state scholarship',
        color: 'bg-amber-100',
        textColor: 'text-amber-800',
        icon: 'Award',
        priority: 0.7,
        changefreq: 'weekly',
    },
}

// ─── Application status badge config ────────────────────────────────────────

export interface StatusConfig {
    label: string
    color: string   // Tailwind bg class
    textColor: string
    dotColor: string   // for animated dot indicator
    pulse: boolean  // show animated dot
}

export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
    upcoming: {
        label: 'Coming Soon',
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        dotColor: 'bg-yellow-500',
        pulse: false,
    },
    open: {
        label: 'Apply Now',
        color: 'bg-green-100',
        textColor: 'text-green-800',
        dotColor: 'bg-green-500',
        pulse: true,
    },
    closing_soon: {
        label: 'Closing Soon',
        color: 'bg-orange-100',
        textColor: 'text-orange-800',
        dotColor: 'bg-orange-500',
        pulse: true,
    },
    closed: {
        label: 'Closed',
        color: 'bg-red-100',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500',
        pulse: false,
    },
    result_out: {
        label: 'Result Out',
        color: 'bg-blue-100',
        textColor: 'text-blue-800',
        dotColor: 'bg-blue-500',
        pulse: true,
    },
    na: {
        label: '-',
        color: 'bg-gray-100',
        textColor: 'text-gray-500',
        dotColor: 'bg-gray-300',
        pulse: false,
    },
    none: {
        label: '-',
        color: 'bg-gray-100',
        textColor: 'text-gray-500',
        dotColor: 'bg-gray-300',
        pulse: false,
    },
}

// ─── Post status config (CMS) ────────────────────────────────────────────────

export const POST_STATUS_CONFIG: Record<PostStatus, { label: string; color: string; textColor: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-100', textColor: 'text-gray-600' },
    review: { label: 'In Review', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
    published: { label: 'Published', color: 'bg-green-100', textColor: 'text-green-800' },
    archived: { label: 'Archived', color: 'bg-red-100', textColor: 'text-red-700' },
}

export const STORY_STATUS_CONFIG: Record<PostStatus, { label: string; color: string; textColor: string }> = POST_STATUS_CONFIG

// ─── Date formats ────────────────────────────────────────────────────────────

export const DATE_FORMAT = {
    /** e.g. 15 Jan 2025 */
    DISPLAY: 'dd MMM yyyy',
    /** e.g. 15 Jan 2025, 10:30 AM */
    DISPLAY_TIME: 'dd MMM yyyy, hh:mm a',
    /** e.g. Jan 2025 (for month-only dates) */
    MONTH_YEAR: 'MMM yyyy',
    /** ISO for schema.org / <time> datetime attribute */
    ISO: "yyyy-MM-dd'T'HH:mm:ssXXX",
    /** Short for tables: 15/01/25 */
    SHORT: 'dd/MM/yy',
} as const

// ─── Reading time thresholds ─────────────────────────────────────────────────

export const READING_TIME = {
    /** Average adult reading speed (words per minute) */
    WPM: 200,
    /** Minimum display value in minutes */
    MIN_MINS: 1,
} as const

// ─── Search ──────────────────────────────────────────────────────────────────

export const SEARCH = {
    /** Minimum query length before hitting the API */
    MIN_QUERY_LENGTH: 2,
    /** Debounce delay for search input in ms */
    DEBOUNCE_MS: 300,
    /** Max results returned from autocomplete */
    AUTOCOMPLETE_MAX: 8,
    /** Max results per search page */
    RESULTS_PER_PAGE: 20,
} as const

// ─── Debounce / throttle defaults ────────────────────────────────────────────

export const TIMING = {
    DEBOUNCE_DEFAULT: 300,   // ms
    DEBOUNCE_SEARCH: 300,
    DEBOUNCE_SAVE: 1000,
    THROTTLE_SCROLL: 100,
    THROTTLE_RESIZE: 150,
    THROTTLE_MOUSEMOVE: 50,
} as const

// ─── LocalStorage keys ───────────────────────────────────────────────────────

export const STORAGE_KEYS = {
    BOOKMARKS: 'rg_bookmarks',
    RECENT_SEARCHES: 'rg_recent_searches',
    THEME: 'rg_theme',
    COOKIE_CONSENT: 'rg_cookie_consent',
    DISMISSED_BANNERS: 'rg_dismissed_banners',
} as const

// ─── Cookie names ────────────────────────────────────────────────────────────

export const COOKIE_KEYS = {
    AUTH_TOKEN: 'sb-auth-token',
    THEME: 'rg-theme',
    COOKIE_CONSENT: 'rg-cookie-consent',
} as const

// ─── Ad zone slugs ───────────────────────────────────────────────────────────
// Match ad_zones.slug values in the database

export const AD_ZONES = {
    HEADER_TOP: 'header-top',
    SIDEBAR_TOP: 'sidebar-top',
    SIDEBAR_STICKY: 'sidebar-sticky',
    BELOW_DATES_BOX: 'below-dates-box',
    BELOW_FEE_BOX: 'below-fee-box',
    MID_CONTENT: 'mid-content',
    BELOW_CONTENT: 'below-content',
    ABOVE_FAQ: 'above-faq',
    LISTING_BETWEEN_CARDS: 'listing-between-cards',
    FOOTER_TOP: 'footer-top',
} as const

// ─── Qualification display order ─────────────────────────────────────────────

export const QUALIFICATION_ORDER = [
    '10th',
    '12th',
    'iti',
    'diploma',
    'graduation',
    'btech',
    'postgraduation',
    'mtech',
    'phd',
    'any',
] as const

// ─── Image / media ───────────────────────────────────────────────────────────

export const IMAGE = {
    /** Max upload size in bytes (5 MB) */
    MAX_SIZE: 5 * 1024 * 1024,
    /** Allowed MIME types */
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    /** Default featured image placeholder */
    PLACEHOLDER: '/images/placeholder-post.png',
    /** OG image dimensions */
    OG_WIDTH: 1200,
    OG_HEIGHT: 630,
} as const

// ─── API route paths ─────────────────────────────────────────────────────────

export const API_ROUTES = {
    POSTS: '/api/posts',
    POST: (slug: string) => `/api/posts/${slug}`,
    SEARCH: '/api/search',
    SUBSCRIBE: '/api/newsletter/subscribe',
    UNSUBSCRIBE: '/api/newsletter/unsubscribe',
    ADS: '/api/ads',
    AD_EVENT: '/api/ads/event',
    PAGE_VIEW: '/api/analytics/view',
    AFFILIATE_CLICK: '/api/affiliate/click',
    REVALIDATE: '/api/revalidate',
    SITEMAP: '/api/sitemap',
    RSS: '/rss.xml',
} as const

// ─── Max recent searches stored ──────────────────────────────────────────────

export const MAX_RECENT_SEARCHES = 8

// ─── Bookmark limit ──────────────────────────────────────────────────────────

export const MAX_BOOKMARKS = 100

// ─── Derived arrays for UI dropdowns / filter chips ──────────────────────────

import { ROUTE_PREFIXES } from './site'

export const POST_TYPES = (Object.keys(POST_TYPE_CONFIG) as PostTypeKey[]).map(
    (key) => ({
        key,
        value: key,
        label: POST_TYPE_CONFIG[key].label,
        icon: POST_TYPE_CONFIG[key].icon,
        color: POST_TYPE_CONFIG[key].color,
        textColor: POST_TYPE_CONFIG[key].textColor,
        href: ROUTE_PREFIXES[key],
    }),
)

export const POST_TYPE_MAP: Record<string, PostTypeConfig & { slug: string }> =
    Object.fromEntries(
        (Object.keys(POST_TYPE_CONFIG) as PostTypeKey[]).map((key) => [
            key,
            { ...POST_TYPE_CONFIG[key], slug: ROUTE_PREFIXES[key] },
        ]),
    )

export const APPLICATION_STATUSES = (
    Object.keys(APPLICATION_STATUS_CONFIG) as ApplicationStatus[]
).map((key) => ({
    value: key,
    label: APPLICATION_STATUS_CONFIG[key].label,
    color: APPLICATION_STATUS_CONFIG[key].color,
    textColor: APPLICATION_STATUS_CONFIG[key].textColor,
}))

export const POST_STATUSES = (
    Object.keys(POST_STATUS_CONFIG) as PostStatus[]
).map((key) => ({
    value: key,
    label: POST_STATUS_CONFIG[key].label,
    color: POST_STATUS_CONFIG[key].color,
    textColor: POST_STATUS_CONFIG[key].textColor,
}))

/** Placeholder - hydrate from DB via getStates() for real data. */
export const STATES_MAP: Record<string, string> = {}

export const QUALIFICATION_MAP: Record<string, string> = Object.fromEntries(
    QUALIFICATION_ORDER.map((slug) => [
        slug,
        slug
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
    ]),
)
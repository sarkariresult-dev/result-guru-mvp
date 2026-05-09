
import { env, appUrl } from './env'

// ─── Core identity ──────────────────────────────────────────────────────────

export const SITE = {
    name: env.NEXT_PUBLIC_APP_NAME ?? 'Result Guru',
    tagline: env.NEXT_PUBLIC_APP_TAGLINE ?? 'India\'s #1 Sarkari Result & Free Job Alert Portal',
    description: 'Result Guru - India\'s fastest Sarkari Result portal. Latest Govt Jobs, Free Job Alerts, Admit Cards, Answer Keys & Exam Results from SSC, UPSC, Railway, IBPS & all state commissions.',
    url: appUrl,
    locale: 'en_IN',
    language: 'en',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    address: {
        street: 'A6, Mangal Bazar, Sector 33, Rohini',
        city: 'New Delhi',
        region: 'Delhi',
        postalCode: '110099',
        country: 'India',
    },

    // ── Social handles ──────────────────────────────────────────────────
    twitter: {
        handle: env.NEXT_PUBLIC_TWITTER_HANDLE ?? '@ResultGuru247',
        cardType: 'summary_large_image' as const,
    },

    // ── Publisher / organisation schema ─────────────────────────────────
    publisher: {
        name: env.NEXT_PUBLIC_APP_NAME ?? 'Result Guru',
        url: appUrl,
        logo: `${appUrl}/logo.png`,
        sameAs: [
            'https://x.com/resultguru247',
            'https://www.facebook.com/resultguru247',
            'https://www.instagram.com/resultguru247',
            'https://www.threads.net/@resultguru247',
            'https://www.linkedin.com/company/resultguru247',
            'https://www.youtube.com/@resultguru247'
        ],
        editorialPolicy: '/editorial-policy',
        ethicsPolicy: '/editorial-policy#ethics',
    },

    // ── Default OG / Twitter images ──────────────────────────────────────
    defaultOgImage: `${appUrl}/og-default.png`,
    defaultOgWidth: 1200,
    defaultOgHeight: 630,

    // ── Favicon / theme ──────────────────────────────────────────────────
    themeColor: '#1d4ed8',     // indigo-700 - matches brand
    backgroundColor: '#ffffff',

    // ── Google / Ads ─────────────────────────────────────────────────────
    gaId: env.NEXT_PUBLIC_GA_ID,
    gtmId: env.NEXT_PUBLIC_GTM_ID,
    adsenseId: env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID,

    // ── Search engine verification meta tags ─────────────────────────────
    verification: {
        google: env.NEXT_PUBLIC_GSC_VERIFICATION,
        bing: env.NEXT_PUBLIC_BING_VERIFICATION,
        yandex: env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },

    // ── Robots defaults ─────────────────────────────────────────────────
    robots: {
        index: true,
        follow: true,
    },
} as const

// ─── URL helpers ────────────────────────────────────────────────────────────

/** Build an absolute URL from a relative path */
export function siteUrl(path: string): string {
    return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`
}

/** OG image URL - defaults to site default if no custom image */
export function ogImageUrl(customImage?: string | null): string {
    return customImage ? siteUrl(customImage) : SITE.defaultOgImage
}

// ─── Post-type route prefixes ───────────────────────────────────────────────
// Keep in sync with Next.js app/ directory structure

export const ROUTE_PREFIXES = {
    job: '/job',
    result: '/result',
    admit: '/admit-card',
    answer_key: '/answer-key',
    cut_off: '/cut-off',
    syllabus: '/syllabus',
    exam_pattern: '/exam-pattern',
    previous_paper: '/previous-paper',
    scheme: '/scheme',
    exam: '/exam',
    admission: '/admission',
    scholarship: '/scholarship',
    notification: '/notification',
} as const

export type PostTypeKey = keyof typeof ROUTE_PREFIXES

// ─── CTR Optimization Config ────────────────────────────────────────────────
// Per-type signals for SERP title and meta description enhancement.

export interface CTRTypeConfig {
    /** Action words that trigger urgency in titles */
    urgencyWords: string[]
    /** Freshness label for the type */
    freshnessLabel: string
    /** CTA suffix for meta descriptions */
    ctaSuffix: string
    /** Generic action verb for this type */
    actionVerb: string
}

export const CTR_CONFIG: Record<PostTypeKey, CTRTypeConfig> = {
    job: {
        urgencyWords: ['[OUT]', 'LIVE', 'Apply Before Last Date', '10th/12th Pass', 'Vacancies Open'],
        freshnessLabel: 'LIVE Vacancy',
        ctaSuffix: 'Posts, Salary, Age Limit, Eligibility, Apply Online - Direct Link',
        actionVerb: 'Apply Online Now',
    },
    result: {
        urgencyWords: ['[DECLARED]', 'Check Score', 'Direct Link', 'Scorecard OUT', 'Merit List'],
        freshnessLabel: 'Result Declared',
        ctaSuffix: 'Score, Merit List, Cut Off, Scorecard Download - Direct Link',
        actionVerb: 'Check Result Now',
    },
    admit: {
        urgencyWords: ['[DOWNLOAD]', 'Hall Ticket LIVE', 'Print Now', 'Exam Date Confirmed'],
        freshnessLabel: 'Admit Card Update',
        ctaSuffix: 'Exam Date, City, Roll Number, Hall Ticket Download - Direct Link',
        actionVerb: 'Download Admit Card',
    },
    answer_key: {
        urgencyWords: ['[RELEASED]', 'Raise Objection', 'Check Score', 'PDF OUT'],
        freshnessLabel: 'Answer Key LIVE',
        ctaSuffix: 'Set-Wise PDF, Objection Link, Expected Cut Off - Direct Link',
        actionVerb: 'Check Answer Key',
    },
    cut_off: {
        urgencyWords: ['[OFFICIAL]', 'Category-Wise', 'Safe Score', 'Selection Status'],
        freshnessLabel: 'Cut Off Update',
        ctaSuffix: 'Gen, OBC, SC, ST Category-Wise Minimum Safe Score - Official Data',
        actionVerb: 'Check Safe Score',
    },
    syllabus: {
        urgencyWords: ['[UPDATED]', 'Topic-Wise', 'Download PDF', 'New Pattern'],
        freshnessLabel: 'Syllabus Update',
        ctaSuffix: 'Subject-Wise Topics, Weightage, PDF Download - Complete Guide',
        actionVerb: 'Download Syllabus',
    },
    exam_pattern: {
        urgencyWords: ['[NEW PATTERN]', 'Marking Scheme', 'Negative Marking', 'Paper Structure'],
        freshnessLabel: 'Exam Pattern',
        ctaSuffix: 'Paper Structure, Marking Scheme, Negative Marking, Time Limit - Full Details',
        actionVerb: 'Check Exam Pattern',
    },
    previous_paper: {
        urgencyWords: ['[FREE PDF]', '10 Years Solved', 'With Solutions', 'Download'],
        freshnessLabel: 'Previous Papers',
        ctaSuffix: 'Year-Wise Solved Papers With Answers - Free PDF Download',
        actionVerb: 'Download Papers',
    },
    scheme: {
        urgencyWords: ['[APPLY FREE]', 'Last Date Soon', 'Direct Benefit', 'Registration Open'],
        freshnessLabel: 'Scheme Update',
        ctaSuffix: 'Eligibility, Benefits, Documents, Apply Online - Step-by-Step Guide',
        actionVerb: 'Apply For Scheme',
    },
    exam: {
        urgencyWords: ['[DATE OUT]', 'Schedule Released', 'City Slip', 'Exam Month Fixed'],
        freshnessLabel: 'Exam Update',
        ctaSuffix: 'Exam Date, City, Schedule, Preparation Tips - Complete Details',
        actionVerb: 'Check Exam Date',
    },
    admission: {
        urgencyWords: ['[OPEN]', 'Seats Filling', 'Last Date Soon', 'Direct Link'],
        freshnessLabel: 'Admission LIVE',
        ctaSuffix: 'Eligibility, Fees, Seats, Apply Online - Admission Guide',
        actionVerb: 'Apply Now',
    },
    scholarship: {
        urgencyWords: ['[APPLY NOW]', 'Last Date Alert', 'Full Fee Waiver', 'Eligibility Check'],
        freshnessLabel: 'Scholarship LIVE',
        ctaSuffix: 'Amount, Eligibility, Documents, Apply Online - Free Scholarship',
        actionVerb: 'Apply For Scholarship',
    },
    notification: {
        urgencyWords: ['[NEW]', 'Full Details', 'Age Limit', 'Eligibility Changed'],
        freshnessLabel: 'Official Notification',
        ctaSuffix: 'Posts, Eligibility, Fee, Selection Process - Official PDF',
        actionVerb: 'Read Notification',
    },
}

/** Build a canonical post URL from type + slug */
export function postUrl(type: PostTypeKey, slug: string): string {
    return siteUrl(`${ROUTE_PREFIXES[type]}/${slug}`)
}

/** Build a state listing URL */
export function stateUrl(stateSlug: string): string {
    return siteUrl(`/states/${stateSlug}`)
}

/** Build an organisation listing URL */
export function orgUrl(orgSlug: string): string {
    return siteUrl(`/organizations/${orgSlug}`)
}

/** Build a tag URL */
export function tagUrl(tagSlug: string): string {
    return siteUrl(`/tag/${tagSlug}`)
}

// ─── Navigation types ───────────────────────────────────────────────────────

export interface NavItem {
    label: string
    href: string
    icon?: string   // lucide-react icon name
    description?: string
}

export interface NavGroup {
    label: string
    items: NavItem[]
}

export const TOP_NAV_LINKS: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
]

export const MAIN_NAV: NavItem[] = [
    { label: 'Job', href: ROUTE_PREFIXES.job, icon: 'Briefcase' },
    { label: 'Result', href: ROUTE_PREFIXES.result, icon: 'Trophy' },
    { label: 'Admit Card', href: ROUTE_PREFIXES.admit, icon: 'CreditCard' },
    { label: 'Answer Key', href: ROUTE_PREFIXES.answer_key, icon: 'Key' },
    { label: 'Syllabus', href: ROUTE_PREFIXES.syllabus, icon: 'BookOpen' },
    { label: 'Exam Pattern', href: ROUTE_PREFIXES.exam_pattern, icon: 'ClipboardList' },
    { label: 'Admission', href: ROUTE_PREFIXES.admission, icon: 'GraduationCap' },
    { label: 'Scholarship', href: ROUTE_PREFIXES.scholarship, icon: 'Award' },
    { label: 'Scheme', href: ROUTE_PREFIXES.scheme, icon: 'Star' },
]

export const FOOTER_NAV: NavGroup[] = [
    {
        label: 'Latest Update',
        items: [
            { label: 'Latest Job', href: ROUTE_PREFIXES.job },
            { label: 'Exam Result', href: ROUTE_PREFIXES.result },
            { label: 'Admit Card', href: ROUTE_PREFIXES.admit },
            { label: 'Answer Key', href: ROUTE_PREFIXES.answer_key },
        ],
    },
    {
        label: 'Exam Resource',
        items: [
            { label: 'Syllabus', href: ROUTE_PREFIXES.syllabus },
            { label: 'Exam Pattern', href: ROUTE_PREFIXES.exam_pattern },
            { label: 'Previous Paper', href: ROUTE_PREFIXES.previous_paper },
            { label: 'Cut Off', href: ROUTE_PREFIXES.cut_off },
        ],
    },
    {
        label: 'Directory',
        items: [
            { label: 'Organizations', href: '/organizations' },
            { label: 'States', href: '/states' },
            { label: 'Qualifications', href: '/qualifications' },
            { label: 'Admission', href: ROUTE_PREFIXES.admission },
            { label: 'Scholarship', href: ROUTE_PREFIXES.scholarship },
            { label: 'Govt Scheme', href: ROUTE_PREFIXES.scheme },
        ],
    },
    {
        label: 'Company',
        items: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact', href: '/contact' },
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms of Service', href: '/terms-of-service' },
            { label: 'Editorial & Ethics', href: '/editorial-policy' },
            { label: 'Disclaimer', href: '/disclaimer' },
            { label: 'Sitemap', href: '/site-map' },
        ],
    },
]

// ─── Breadcrumb root ────────────────────────────────────────────────────────

export const BREADCRUMB_HOME = { label: 'Home', href: '/' }

// ─── Alias for components that import siteConfig ────────────────────────────

export const siteConfig = SITE

export const SOCIAL_MEDIA_LINKS = [
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/resultguru247',
        icon: 'Facebook',
    },
    {
        name: 'Twitter',
        href: 'https://x.com/resultguru247',
        icon: 'Twitter',
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/resultguru247',
        icon: 'Instagram',
    },
    {
        name: 'Threads',
        href: 'https://www.threads.net/@resultguru247',
        icon: 'Threads',
    },
    {
        name: 'LinkedIn',
        href: 'https://www.linkedin.com/company/resultguru247',
        icon: 'LinkedIn',
    },
    {
        name: 'YouTube',
        href: 'https://www.youtube.com/@resultguru247',
        icon: 'Youtube',
    },
]

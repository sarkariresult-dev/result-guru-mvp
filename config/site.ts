
import { env, appUrl } from './env'

// ─── Core identity ──────────────────────────────────────────────────────────

export const SITE = {
    name: env.NEXT_PUBLIC_APP_NAME ?? 'Result Guru',
    tagline: env.NEXT_PUBLIC_APP_TAGLINE ?? 'India\'s trusted source for Sarkari Updates',
    description:
        'Result Guru - India\'s premier platform for Latest Sarkari Results, Govt Jobs, Admit Cards & Answer Keys. Get instant, 100% verified notifications from SSC, UPSC, Railway & state commissions.',
    url: appUrl,
    locale: 'en_IN',
    language: 'en',
    /** ISO 3166-1 alpha-2 */
    country: 'IN',
    /** IANA timezone */
    timezone: 'Asia/Kolkata',
    /** Business physical presence for E-E-A-T */
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
    adsenseId: env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-2318647751686627',

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
        urgencyWords: ['Apply Now', 'New Vacancy', 'Last Date Soon'],
        freshnessLabel: 'Latest Vacancy',
        ctaSuffix: 'Apply before the last date →',
        actionVerb: 'Apply Online',
    },
    result: {
        urgencyWords: ['OUT NOW', 'LIVE', 'Declared', 'Check Score'],
        freshnessLabel: 'Result Update',
        ctaSuffix: 'Check your score now →',
        actionVerb: 'Check Result',
    },
    admit: {
        urgencyWords: ['Download Now', 'Released', 'Hall Ticket LIVE'],
        freshnessLabel: 'Admit Card Update',
        ctaSuffix: 'Download admit card now →',
        actionVerb: 'Download',
    },
    answer_key: {
        urgencyWords: ['Released', 'Objection Open', 'Check Answers'],
        freshnessLabel: 'Answer Key Update',
        ctaSuffix: 'Check answers & raise objections →',
        actionVerb: 'Check Answer Key',
    },
    cut_off: {
        urgencyWords: ['Official', 'Category-Wise', 'Updated'],
        freshnessLabel: 'Cut Off Update',
        ctaSuffix: 'Check category-wise cut off marks →',
        actionVerb: 'Check Cut Off',
    },
    syllabus: {
        urgencyWords: ['Updated', 'Complete Guide', 'Subject-Wise'],
        freshnessLabel: 'Syllabus Guide',
        ctaSuffix: 'Download subject-wise syllabus PDF →',
        actionVerb: 'Download Syllabus',
    },
    exam_pattern: {
        urgencyWords: ['Updated', 'Detailed Analysis', 'Strategy'],
        freshnessLabel: 'Exam Pattern Guide',
        ctaSuffix: 'Check paper pattern & marking scheme →',
        actionVerb: 'Check Pattern',
    },
    previous_paper: {
        urgencyWords: ['Free Download', 'With Solutions', 'PDF'],
        freshnessLabel: 'Previous Papers',
        ctaSuffix: 'Download free PDF with solutions →',
        actionVerb: 'Download Papers',
    },
    scheme: {
        urgencyWords: ['Registration Open', 'Apply Free', 'New Benefit'],
        freshnessLabel: 'Scheme Update',
        ctaSuffix: 'Check eligibility & apply online →',
        actionVerb: 'Apply Now',
    },
    exam: {
        urgencyWords: ['Date Announced', 'Registration Open', 'Notification'],
        freshnessLabel: 'Exam Update',
        ctaSuffix: 'Check exam dates & start preparing →',
        actionVerb: 'Check Details',
    },
    admission: {
        urgencyWords: ['Open Now', 'Last Date', 'Counseling'],
        freshnessLabel: 'Admission Update',
        ctaSuffix: 'Apply for admission before the deadline →',
        actionVerb: 'Apply Now',
    },
    scholarship: {
        urgencyWords: ['Apply Free', 'Last Date', 'New Scholarship'],
        freshnessLabel: 'Scholarship Update',
        ctaSuffix: 'Check eligibility & apply for free →',
        actionVerb: 'Apply for Scholarship',
    },
    notification: {
        urgencyWords: ['New Release', 'Official', 'Important'],
        freshnessLabel: 'Notification Update',
        ctaSuffix: 'Read full notification & apply →',
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
    { label: 'About', href: '/about' },
    { label: 'Organizations', href: '/organizations' },
    { label: 'Qualifications', href: '/qualifications' },
    { label: 'States', href: '/states' },
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

import { z } from 'zod'

// ── Auth ───────────────────────────────────────────────────

export const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
    .object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Please enter a valid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
export type RegisterInput = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email'),
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// ── Profile ────────────────────────────────────────────────

export const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    avatar_url: z.string().url().nullable().optional(),
})
export type ProfileInput = z.infer<typeof profileSchema>

// ── Post ───────────────────────────────────────────────────
// Mirrors 002_enums.sql + 007_posts.sql columns exactly.

/** All 13 post_type enum values from 002_enums.sql */
const POST_TYPES = [
    'job', 'result', 'admit', 'answer_key', 'cut_off',
    'syllabus', 'exam_pattern', 'previous_paper',
    'scheme', 'exam', 'admission', 'scholarship', 'notification',
] as const

/** All 5 post_status enum values from 002_enums.sql */
const POST_STATUSES = [
    'draft', 'review', 'scheduled', 'published', 'archived',
] as const

/** All 7 application_status enum values from 017_views.sql / ApplicationStatus enum */
const APPLICATION_STATUSES = [
    'upcoming', 'open', 'closing_soon', 'closed', 'result_out', 'na', 'none',
] as const

export const postSchema = z.object({
    // Identity
    type: z.enum(POST_TYPES),
    status: z.enum(POST_STATUSES).default('draft'),
    application_start_date: z.string().datetime({ offset: true }).nullable().optional(),
    application_end_date: z.string().datetime({ offset: true }).nullable().optional(),

    // Content
    title: z.string().min(10, 'Title must be at least 10 characters').max(255),
    slug: z.string().min(3).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
    excerpt: z.string().max(500).nullable().optional(),
    content: z.string().nullable().optional(),

    // Taxonomy - matches DB columns
    state_slug: z.string().nullable().optional(),
    organization_id: z.string().uuid().nullable().optional(),
    qualification: z.array(z.string()).nullable().optional(),       // TEXT[] of qualification slugs
    category_id: z.string().uuid().nullable().optional(),

    // Media
    featured_image: z.string().nullable().optional(),
    featured_image_alt: z.string().max(255).nullable().optional(),
    featured_image_width: z.number().int().nullable().optional(),
    featured_image_height: z.number().int().nullable().optional(),
    notification_pdf: z.string().nullable().optional(),

    // Key links (external URLs)
    admit_card_link: z.string().nullable().optional(),
    result_link: z.string().nullable().optional(),
    answer_key_link: z.string().nullable().optional(),

    // Structured content (JSONB) - DB columns are NOT NULL with defaults

    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    related_post_ids: z.array(z.string().uuid()).nullable().optional(),

    // SEO - NOT NULL columns have proper defaults
    meta_title: z.string().max(70).nullable().optional(),
    meta_description: z.string().max(165).nullable().optional(),
    meta_keywords: z.array(z.string()).nullable().optional(),
    focus_keyword: z.string().max(100).nullable().optional(),
    secondary_keywords: z.array(z.string()).nullable().optional(),
    canonical_url: z.string().url().nullable().optional(),
    robots_directive: z.string().default('index,follow'),
    noindex: z.boolean().default(false),
    structured_data_type: z.string().default('auto'),
    schema_json: z.record(z.string(), z.unknown()).nullable().optional(),

    // Open Graph / Twitter - NOT NULL columns have proper defaults
    og_title: z.string().max(70).nullable().optional(),
    og_description: z.string().max(200).nullable().optional(),
    og_image: z.string().nullable().optional(),
    og_image_width: z.number().int().positive().default(1200),
    og_image_height: z.number().int().positive().default(630),
    twitter_title: z.string().max(70).nullable().optional(),
    twitter_description: z.string().max(200).nullable().optional(),
    twitter_card_type: z.enum(['summary', 'summary_large_image', 'app', 'player']).default('summary_large_image'),

    // i18n / Advanced SEO - NOT NULL columns
    hreflang: z.array(z.unknown()).default([]),
    breadcrumb_override: z.array(z.unknown()).default([]),

    // Publishing
    author_id: z.string().uuid().nullable().optional(),
    published_at: z.string().datetime().nullable().optional(),
    scheduled_at: z.string().datetime().nullable().optional(),
    expires_at: z.string().datetime().nullable().optional(),
    last_reviewed_at: z.string().datetime().nullable().optional(),
})
export type PostInput = z.infer<typeof postSchema>

// ── Newsletter / Subscribe ─────────────────────────────────

export const subscribeSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    phone: z.string().max(15).nullable().optional(),
    whatsapp_opt_in: z.boolean().default(false),
    preferences: z.record(z.string(), z.unknown()).default({}),
})
export type SubscribeInput = z.infer<typeof subscribeSchema>

// ── SEO Settings ───────────────────────────────────────────

export const seoSettingSchema = z.object({
    key: z.string().min(1),
    value: z.string(),
})
export type SeoSettingInput = z.infer<typeof seoSettingSchema>

// ── Contact Form ───────────────────────────────────────────

export const contactSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Please enter a valid email'),
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    message: z.string().min(20, 'Message must be at least 20 characters'),
})
export type ContactInput = z.infer<typeof contactSchema>

// ── API Validation ─────────────────────────────────────────

export const viewTrackSchema = z.object({
    post_id: z.string().uuid(),
})

export const revalidateSchema = z.object({
    secret: z.string().min(1),
    tag: z.string().optional(),
    path: z.string().optional(),
})

// ── Taxonomy: Category ─────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    slug: z.string().min(2).max(100).regex(SLUG_REGEX, 'Invalid slug format'),
    parent_id: z.string().uuid().nullable().optional(),
    description: z.string().max(500).nullable().optional(),
    icon: z.string().max(50).nullable().optional(),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    is_active: z.boolean().default(true),
    meta_title: z.string().max(70).nullable().optional(),
    meta_description: z.string().max(165).nullable().optional(),
    meta_robots: z.string().default('index,follow'),
    h1_override: z.string().max(200).nullable().optional(),
    intro_html: z.string().nullable().optional(),
})
export type CategoryInput = z.infer<typeof categorySchema>

// ── Taxonomy: Tag ──────────────────────────────────────────

const TAG_TYPES = ['general', 'job', 'exam', 'result', 'admission', 'scheme', 'scholarship'] as const

export const tagSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    slug: z.string().min(2).max(100).regex(SLUG_REGEX, 'Invalid slug format'),
    description: z.string().max(500).nullable().optional(),
    tag_type: z.enum(TAG_TYPES).default('general'),
    is_active: z.boolean().default(true),
    canonical_tag_id: z.string().uuid().nullable().optional(),
    meta_title: z.string().max(70).nullable().optional(),
    meta_description: z.string().max(165).nullable().optional(),
    meta_robots: z.string().default('index,follow'),
})
export type TagInput = z.infer<typeof tagSchema>

// ── Taxonomy: Organization ─────────────────────────────────

export const organizationSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(200),
    slug: z.string().min(2).max(200).regex(SLUG_REGEX, 'Invalid slug format'),
    short_name: z.string().max(50).nullable().optional(),
    state_slug: z.string().nullable().optional(),
    official_url: z.string().url('Invalid URL').nullable().optional().or(z.literal('')),
    logo_url: z.string().nullable().optional(),
    description: z.string().max(1000).nullable().optional(),
    is_active: z.boolean().default(true),
    meta_title: z.string().max(70).nullable().optional(),
    meta_description: z.string().max(165).nullable().optional(),
    meta_robots: z.string().default('index,follow'),
    schema_json: z.union([
        z.string().transform((str, ctx) => {
            if (!str || !str.trim()) return null;
            try { return JSON.parse(str); }
            catch (e) { ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid JSON format' }); return z.NEVER; }
        }),
        z.record(z.string(), z.unknown())
    ]).nullable().optional(),
})
export type OrganizationInput = z.infer<typeof organizationSchema>

// ── Taxonomy: State ────────────────────────────────────────

export const stateSchema = z.object({
    slug: z.string().min(2).max(50).regex(SLUG_REGEX, 'Invalid slug format'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    abbr: z.string().max(2).nullable().optional(),
    is_active: z.boolean().default(true),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    meta_title: z.string().max(70).nullable().optional(),
    meta_description: z.string().max(165).nullable().optional(),
    meta_robots: z.string().default('index,follow'),
    h1_override: z.string().max(200).nullable().optional(),
    intro_html: z.string().nullable().optional(),
})
export type StateInput = z.infer<typeof stateSchema>

// ── Taxonomy: Qualification ────────────────────────────────

export const qualificationSchema = z.object({
    slug: z.string().min(1).max(100).regex(SLUG_REGEX, 'Invalid slug format'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    short_name: z.string().max(50).nullable().optional(),
    sort_order: z.coerce.number().int().min(0).max(9999).default(0),
    is_active: z.boolean().default(true),
    meta_title: z.string().max(70).nullable().optional(),
    meta_description: z.string().max(165).nullable().optional(),
    meta_robots: z.string().default('index,follow'),
})
export type QualificationInput = z.infer<typeof qualificationSchema>

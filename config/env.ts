import { z } from 'zod'

// ─── Schema ────────────────────────────────────────────────────────────────

const envSchema = z.object({
    // ── Supabase ──────────────────────────────────────────────────────────
    NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // ── App ───────────────────────────────────────────────────────────────
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default('Result Guru'),
    NEXT_PUBLIC_APP_TAGLINE: z.string().optional(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    // ── Google ────────────────────────────────────────────────────────────
    NEXT_PUBLIC_GA_ID: z.string().regex(/^G-[A-Z0-9]+$/).optional(),
    NEXT_PUBLIC_GTM_ID: z.string().regex(/^GTM-[A-Z0-9]+$/).optional(),

    // ── Search engine verification ────────────────────────────────────────
    NEXT_PUBLIC_GSC_VERIFICATION: z.string().optional(),
    NEXT_PUBLIC_BING_VERIFICATION: z.string().optional(),
    NEXT_PUBLIC_YANDEX_VERIFICATION: z.string().optional(),

    // ── Social ────────────────────────────────────────────────────────────
    NEXT_PUBLIC_TWITTER_HANDLE: z.string().regex(/^@?[\w]{1,15}$/).optional(),

    // ── Security / Cron ───────────────────────────────────────────────────
    CRON_SECRET: z.string().min(32, 'CRON_SECRET must be ≥32 characters').optional(),
    REVALIDATE_SECRET: z.string().min(16).optional(),

    // ── Rate-limiting (Upstash Redis) ─────────────────────────────────────
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // ── AI ────────────────────────────────────────────────────────────────
    GOOGLE_GENAI_API_KEY: z.string().optional(),
    GOOGLE_GENAI_MODEL: z.string().optional(),
    GOOGLE_GENAI_TEMPERATURE: z.coerce.number().optional(),
})

// ─── Validate ───────────────────────────────────────────────────────────────

const _parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_TAGLINE: process.env.NEXT_PUBLIC_APP_TAGLINE,
    NODE_ENV: process.env.NODE_ENV,

    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,

    NEXT_PUBLIC_GSC_VERIFICATION: process.env.NEXT_PUBLIC_GSC_VERIFICATION,

    NEXT_PUBLIC_BING_VERIFICATION: process.env.NEXT_PUBLIC_BING_VERIFICATION,
    NEXT_PUBLIC_YANDEX_VERIFICATION: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    NEXT_PUBLIC_TWITTER_HANDLE: process.env.NEXT_PUBLIC_TWITTER_HANDLE,

    CRON_SECRET: process.env.CRON_SECRET,
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,

    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY,
    GOOGLE_GENAI_MODEL: process.env.GOOGLE_GENAI_MODEL,
    GOOGLE_GENAI_TEMPERATURE: process.env.GOOGLE_GENAI_TEMPERATURE,
})

if (!_parsed.success) {
    const formatted = _parsed.error.format()
    console.error('❌  Invalid environment variables:\n', JSON.stringify(formatted, null, 2))
    throw new Error(
        '❌  Invalid / missing environment variables. Check the server logs for details.',
    )
}

export const env = _parsed.data

// ─── Derived helpers ────────────────────────────────────────────────────────

// True in production
export const isProduction = env.NODE_ENV === 'production'

// True in development
export const isDevelopment = !isProduction

export const appUrl = isProduction ? 'https://www.resultguru.co.in' : (env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
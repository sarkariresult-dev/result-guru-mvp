import type { Metadata, Viewport } from 'next'
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import { Providers } from '@/components/providers'
import { CookieConsent } from '@/features/shared/components/CookieConsent'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SITE } from '@/config/site'
import './globals.css'

/* ── Fonts - next/font self-hosts for zero layout shift ────── */
const fontSans = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-sans-next',
    preload: true,
})

const fontDisplay = Outfit({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-display-next',
    weight: ['600', '700', '800'],
    preload: true,
})

const fontMono = JetBrains_Mono({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-mono-next',
    weight: ['400', '500'],
    preload: false,
})

/* ── Metadata - comprehensive SEO + OG + Twitter ───────────── */
export const metadata: Metadata = {
    metadataBase: new URL(SITE.url),

    title: {
        default: `${SITE.name} - Sarkari Result 2026 | Govt Jobs & Admit Cards`,
        template: `%s | ${SITE.name} `,
    },
    description: SITE.description,

    keywords: [
        'sarkari result',
        'sarkari result 2026',
        'sarkari naukri',
        'government jobs india',
        'govt jobs 2026',
        'admit card download',
        'answer key',
        'exam result',
        'upsc',
        'ssc',
        'railway jobs',
        'state government jobs',
        'government schemes',
        'exam syllabus',
        'latest govt job',
        'result guru',
    ],

    authors: [{ name: SITE.name, url: SITE.url }],
    creator: SITE.name,
    publisher: SITE.publisher.name,

    /* Open Graph - optimised for Facebook, WhatsApp, Telegram sharing */
    openGraph: {
        type: 'website',
        locale: SITE.locale,
        siteName: SITE.name,
        title: `${SITE.name} — Sarkari Result 2026 | Govt Jobs & Admit Cards`,
        description: SITE.description,
        url: SITE.url,
        images: [
            {
                url: SITE.defaultOgImage,
                width: SITE.defaultOgWidth,
                height: SITE.defaultOgHeight,
                alt: `${SITE.name} - India's Government Job Portal`,
                type: 'image/png',
            },
        ],
    },

    /* Twitter / X card */
    twitter: {
        card: SITE.twitter.cardType,
        site: SITE.twitter.handle,
        creator: SITE.twitter.handle,
        title: `${SITE.name} — Sarkari Result 2026 | Govt Jobs & Admit Cards`,
        description: SITE.description,
        images: [
            {
                url: `${SITE.url}/twitter-image.png`,
                width: 1200,
                height: 630,
                alt: `${SITE.name} - India's Government Job Portal`,
            },
        ],
    },

    /* Crawl directives - maximise indexing */
    robots: {
        index: SITE.robots.index,
        follow: SITE.robots.follow,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },

    /* Canonical - root points to base */
    alternates: {
        canonical: '/',
        types: {
            'application/rss+xml': [
                { url: '/feed.xml', title: `${SITE.name} RSS Feed` },
            ],
        },
    },

    /* PWA manifest - served by app/manifest.ts */
    manifest: '/manifest.webmanifest',

    /* Favicons - complete set */
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '48x48' },
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
        other: [
            { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: SITE.themeColor },
        ],
    },

    /* Category hint for search engines */
    category: 'government information',

    /* Search engine verification - from env.ts via SITE config */
    verification: {
        google: SITE.verification.google,
        yandex: SITE.verification.yandex,
        other: SITE.verification.bing
            ? { 'msvalidate.01': SITE.verification.bing }
            : undefined,
    },

    /* Prevent phone/email/address auto-detection */
    formatDetection: { telephone: false, email: false, address: false },
}

/* ── Viewport - separate export (Next.js 14+) ──────────────── */
export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: SITE.backgroundColor },
        { media: '(prefers-color-scheme: dark)', color: '#121524' },
    ],
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    colorScheme: 'light dark',
}

/* ── Root Layout ────────────────────────────────────────────── */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    return (
        <html
            lang={`${SITE.language}-${SITE.country}`}
            dir="ltr"
            suppressHydrationWarning
            className={[
                fontSans.variable,
                fontDisplay.variable,
                fontMono.variable,
            ].join(' ')}
        >
            <head>
                {/* Preconnect to critical 3rd-party origins for faster loads */}
                {supabaseUrl && (
                    <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
                )}
                <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
                <link rel="dns-prefetch" href="https://www.google-analytics.com" />
            </head>
            <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
                {/* Skip-to-content link is in each route group layout (public/dashboard)
                    to target the correct main content container. */}

                <Providers>
                    <div className="flex min-h-screen flex-col">
                        {children}
                    </div>
                    <CookieConsent />
                </Providers>

                {/* Google Tag Manager - loaded after hydration for perf */}
                {SITE.gtmId && (
                    <Script
                        id="gtm-script"
                        strategy="lazyOnload"
                        dangerouslySetInnerHTML={{
                            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${SITE.gtmId}');`,
                        }}
                    />
                )}

                {/* Google Analytics 4 - loaded after interactive */}
                {SITE.gaId && !SITE.gtmId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${SITE.gaId}`}
                            strategy="lazyOnload"
                        />
                        <Script
                            id="ga4-init"
                            strategy="lazyOnload"
                            dangerouslySetInnerHTML={{
                                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${SITE.gaId}',{send_page_view:false});`,
                            }}
                        />
                    </>
                )}

                {/* GTM noscript fallback */}
                {SITE.gtmId && (
                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${SITE.gtmId}`}
                            height="0"
                            width="0"
                            style={{ display: 'none', visibility: 'hidden' }}
                            title="GTM"
                        />
                    </noscript>
                )}

                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}

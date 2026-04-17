import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Providers } from '@/components/providers'
import CookieConsentWrapper from '@/components/CookieConsentWrapper'
import { LocalErrorBoundary } from '@/components/shared/LocalErrorBoundary'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SITE } from '@/config/site'
import './globals.css'

/* ── Fonts - next/font self-hosts for zero layout shift ────── */
// Consolidating to Inter only to reduce initial request count (22 -> <15 goal)
const fontSans = Inter({
    subsets: ['latin', 'latin-ext'],
    display: 'swap',
    variable: '--font-sans-next',
    preload: true,
})

/* ── Metadata - comprehensive SEO + OG + Twitter ───────────── */
export const metadata: Metadata = {
    metadataBase: new URL(SITE.url),

    title: {
        default: `${SITE.name} - Sarkari Result | Govt Jobs & Admit Cards`,
        template: '%s',
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
        title: `${SITE.name} - Sarkari Result 2026 | Govt Jobs & Admit Cards`,
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
        title: `${SITE.name} - Sarkari Result 2026 | Govt Jobs & Admit Cards`,
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

    /* Alternates - RSS Auto-Discovery */
    alternates: {
        types: {
            'application/rss+xml': '/feed.xml',
        },
    },

    /* Apply PWA capabilities for iOS 'Add to Home Screen' */
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: SITE.name,
    },
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
            className={fontSans.variable}
        >
            <head>
                {/* Preconnect to critical 3rd-party origins for faster loads */}
                {supabaseUrl && (
                    <link rel="preconnect" href={supabaseUrl} crossOrigin="anonymous" />
                )}
                {/* Only preconnect to what we actually use above-the-fold */}
                <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
                <link rel="dns-prefetch" href="https://www.google-analytics.com" />
                {/* AI discoverability link */}
                <link rel="alternate" type="text/plain" title="LLM Context" href="/llms.txt" />
                
                {/* Google AdSense moved to end of body for stability */}
                
                {/* ── GURU ADSENSE HARDENING (NUCLEAR MODE) ── */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        (function() {
                            if (window.self === window.top) return;

                            // 1. Guru Debug & Heartbeat
                            var debugDiv = document.createElement('div');
                            debugDiv.id = 'guru-debug-overlay';
                            debugDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:rgba(0,0,0,0.9);color:#0f0;font-family:monospace;font-size:10px;padding:6px;z-index:999999;border-bottom:1px solid #0f0;pointer-events:none;';
                            var header = document.createElement('div');
                            header.innerHTML = '<b>[GURU] STABLE MODE</b> | Heartbeat: <span id="guru-hb">0s</span>';
                            debugDiv.appendChild(header);
                            var errorC = document.createElement('div');
                            debugDiv.appendChild(errorC);
                            
                            function logGuru(msg, color) {
                                var e = document.createElement('div');
                                e.style.color = color || '#fff';
                                e.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
                                errorC.insertBefore(e, errorC.firstChild);
                                if (errorC.childNodes.length > 3) errorC.removeChild(errorC.lastChild);
                            }

                            var start = Date.now();
                            setInterval(function() {
                                var hb = document.getElementById('guru-hb');
                                if (hb) hb.textContent = Math.floor((Date.now() - start)/1000) + 's';
                            }, 5000); // 5s heartbeat for maximum stability

                            window.onerror = function(m, u, l) { logGuru('Err: ' + m + ' (L' + l + ')', '#f44'); };
                            window.onunhandledrejection = function(e) { logGuru('Promise: ' + (e.reason?.message || e.reason), '#ff0'); };

                            // 2. Storage & History Polyfills
                            var mockS = { getItem:function(){}, setItem:function(){}, removeItem:function(){}, clear:function(){}, key:function(){}, length:0 };
                            try {
                                Object.defineProperties(window, {
                                    'sessionStorage': { value: mockS, configurable: true },
                                    'localStorage': { value: mockS, configurable: true }
                                });
                            } catch(e) { try { window.sessionStorage = window.localStorage = mockS; } catch(err){} }

                            if (window.history) {
                                ['pushState', 'replaceState'].forEach(function(m) {
                                    var orig = window.history[m];
                                    window.history[m] = function() {
                                        try { return orig.apply(this, arguments); } catch(e) { logGuru('Blocked ' + m, '#0af'); return null; }
                                    };
                                });
                            }

                            // 3. Iron Seal Navigation & Popup Lock
                            window.location.reload = function() { logGuru('Blocked reload'); };
                            window.location.replace = function() { logGuru('Blocked replace'); };
                            window.location.assign = function() { logGuru('Blocked assign'); };
                            window.open = function() { logGuru('Blocked popup'); return null; };
                            window.alert = window.confirm = window.prompt = function() { logGuru('Blocked dialog'); return false; };

                            window.onbeforeunload = function() { return "Navigation locked."; };

                            window.addEventListener('click', function(e) {
                                var t = e.target;
                                while (t && t.tagName !== 'A') t = t.parentNode;
                                if (t && t.tagName === 'A') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    logGuru('Link Blocked: ' + t.href, '#0af');
                                }
                            }, true);

                            // 4. Systemic UI Hiding (CSS Fallback)
                            var style = document.createElement('style');
                            style.innerHTML = 'a[href*="login"], a[href*="register"], a[href*="signin"], a[href*="signup"], button:contains("Login"), button:contains("Sign In") { display: none !important; }';
                            document.head.appendChild(style);

                            document.addEventListener('DOMContentLoaded', function() { document.body.appendChild(debugDiv); });
                        })();
                        `
                    }}
                />
                
                {/* Google AdSense - Recommended to be in <head> for auto-ads detection */}
                {SITE.adsenseId && (
                    <script
                        async
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseId}`}
                        crossOrigin="anonymous"
                    />
                )}
            </head>
            <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
                {/* Skip-to-content link is in each route group layout (public/dashboard)
                    to target the correct main content container. */}

                <Providers>
                    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
                        {children}
                    </div>
                    <CookieConsentWrapper />
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

                <LocalErrorBoundary name="VercelAnalytics" silent>
                    <Analytics />
                </LocalErrorBoundary>
                
                <LocalErrorBoundary name="VercelInsights" silent>
                    <SpeedInsights />
                </LocalErrorBoundary>
            </body>
        </html>
    )
}

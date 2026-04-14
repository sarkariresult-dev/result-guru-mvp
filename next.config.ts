import bundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  /* ── Turbopack (stable - default bundler in Next 16) ────── */
  turbopack: {},

  /* ── Cache Components (Next 16 - replaces experimental.ppr) */
  cacheComponents: true,

  /* ── Performance ────────────────────────────────────────── */
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  /* ── Compiler ───────────────────────────────────────────── */
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? true : false,
  },

  /* ── React 19 Compiler (Stable in Next.js 15+) ──────────── */
  reactCompiler: true,

  /* ── Server Dependencies ────────────────────────────────── */
  serverExternalPackages: [],

  /* ── Experimental ───────────────────────────────────────── */
  experimental: {
    /* Enable Turbopack file-system caching for faster dev restarts */
    turbopackFileSystemCacheForDev: true,
    /* Server actions with larger body for post forms */
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['resultguru.co.in', 'www.resultguru.co.in', 'localhost:3000'],
    },
    /* Optimize package imports - tree-shake heavy packages */
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@supabase/supabase-js',
      'zod',
      'react-hook-form',
      'nuqs',
      'class-variance-authority',
      '@vercel/analytics',
      '@vercel/speed-insights',
      'recharts',
      'framer-motion',
      'sonner',
    ],
    /* Default stale-times for client router cache (seconds) */
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  /* ── Images ─────────────────────────────────────────────── */
  images: {
    loader: 'custom',
    loaderFile: './lib/supabase/loader.ts',
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    qualities: [50, 60, 75, 80, 90],
    dangerouslyAllowSVG: true,
    deviceSizes: [390, 412, 640, 750, 828, 1080, 1200, 1920],
    /* Next 16 removed 16 from default imageSizes */
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    /* Next 16 default is 14400 (4h); we keep 30 days for our static images */
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  /* ── Logging (dev only - avoid production I/O overhead) ──── */
  ...(process.env.NODE_ENV === 'development' && {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),

  /* ── Security + caching headers ─────────────────────────── */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://images.unsplash.com https://www.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://*.g.doubleclick.net https://*.google.com https://pagead2.googlesyndication.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://*.analytics.google.com https://*.google.com https://*.g.doubleclick.net https://pagead2.googlesyndication.com https://www.googleadservices.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
              "frame-src 'self' https://www.googletagmanager.com https://googleads.g.doubleclick.net https://*.google.com https://tpc.googlesyndication.com",
              "frame-ancestors 'self' https://*.google.com https://*.googlesyndication.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      /* Static assets - aggressive cache */
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      /* Fonts - long cache */
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      /* RSS Feed - Edge cache with background revalidation */
      {
        source: '/feed.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      /* API routes - short cache with stale-while-revalidate */
      {
        source: '/api/og',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      /* Supabase Storage proxy images */
      {
        source: '/storage/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
    ]

  },

  /* ── Redirects (plural to singular + legacy) ────────────────── */
  async redirects() {
    return [
      /* Permanent redirect for /index.php to / (Google Search Console fix) */
      { source: '/index.php', destination: '/', permanent: true },

      /* Plural → Singular mapping */
      { source: '/jobs', destination: '/job', permanent: true },
      { source: '/results', destination: '/result', permanent: true },
      { source: '/admit-cards', destination: '/admit-card', permanent: true },
      { source: '/answer-keys', destination: '/answer-key', permanent: true },
      { source: '/syllabuses', destination: '/syllabus', permanent: true },
      { source: '/exam-patterns', destination: '/exam-pattern', permanent: true },
      { source: '/previous-papers', destination: '/previous-paper', permanent: true },
      { source: '/schemes', destination: '/scheme', permanent: true },
      { source: '/exams', destination: '/exam', permanent: true },
      { source: '/admissions', destination: '/admission', permanent: true },
      { source: '/scholarships', destination: '/scholarship', permanent: true },
      { source: '/notifications', destination: '/notification', permanent: true },

      /* Legacy route prefixes → new clean routes */
      {
        source: '/sarkari-job',
        destination: '/job',
        permanent: true,
      },
      {
        source: '/sarkari-job/:slug',
        destination: '/job/:slug',
        permanent: true,
      },
      {
        source: '/sarkari-result',
        destination: '/result',
        permanent: true,
      },
      {
        source: '/sarkari-result/:slug',
        destination: '/result/:slug',
        permanent: true,
      },
    ]
  },
  trailingSlash: false,
}

export default withBundleAnalyzer(nextConfig)

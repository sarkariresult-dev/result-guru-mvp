import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* ── Turbopack (stable — default bundler in Next 16) ────── */
  turbopack: {},

  /* ── Cache Components (Next 16 — replaces experimental.ppr) */
  cacheComponents: true,

  /* ── Performance ────────────────────────────────────────── */
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  /* ── Experimental ───────────────────────────────────────── */
  experimental: {
    /* Enable Turbopack file-system caching for faster dev restarts */
    turbopackFileSystemCacheForDev: true,
    /* Server actions with larger body for post forms */
    serverActions: {
      bodySizeLimit: '2mb',
    },
    /* Optimize package imports — tree-shake heavy packages */
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
    ],
    /* Default stale-times for client router cache (seconds) */
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  /* ── Images ─────────────────────────────────────────────── */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.supabase.in' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    /* Next 16 removed 16 from default imageSizes */
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    /* Next 16 default is 14400 (4h); we keep 30 days for our static images */
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  /* ── Logging (dev only — avoid production I/O overhead) ──── */
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
          { key: 'X-Frame-Options', value: 'DENY' },
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
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://*.supabase.in https://www.google-analytics.com https://www.googletagmanager.com",
              "frame-src 'self' https://www.googletagmanager.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin',
          },
        ],
      },
      /* Static assets — aggressive cache */
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      /* Fonts — long cache */
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      /* RSS Feed — Edge cache with background revalidation */
      {
        source: '/feed.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]

  },

  /* ── Redirects (plural to singular + legacy) ────────────────── */
  async redirects() {
    return [
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
}

export default nextConfig

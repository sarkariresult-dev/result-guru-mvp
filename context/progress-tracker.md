# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Active development — full CMS, public site, and AI content pipeline are built and functional.

## Current Goal

- Context file audit and alignment — ensuring documentation matches the real codebase state.

## Completed

### Infrastructure
- [x] Next.js 15 App Router setup with Turbopack dev server
- [x] TypeScript strict mode configuration (strict, noUncheckedIndexedAccess, noImplicitReturns)
- [x] Tailwind CSS v4 with CSS-first config, @theme tokens, @utility directives
- [x] Supabase integration (4 client factories: server, client, admin, static)
- [x] Zod-validated environment variables (config/env.ts)
- [x] Site configuration (config/site.ts — identity, nav, route prefixes, CTR config)
- [x] React Query setup with centralised query key factory
- [x] next-themes integration with SafeThemeProvider error boundary
- [x] Middleware (proxy.ts — session refresh, www→non-www redirect, security headers)

### Testing
- [x] Centralized Playwright configuration (`playwright.config.ts`) with development server autostart and setup/chromium project dependencies
- [x] Programmatic auth injection (`tests/auth.setup.ts`) using fresh Supabase JWT session stored in standard `localStorage` key
- [x] Clean Page Object Models (POMs) for modularity (`LoginPage.ts`, `DashboardPage.ts`, `PostEditorPage.ts`)
- [x] Public Site E2E Suite (`tests/public-site.spec.ts`) testing homepage, dynamic Nuqs query-parameter filters, full-text search forms, and detail layouts
- [x] Auth E2E Suite (`tests/auth-flow.spec.ts`) testing control presence, invalid credential alerts, and author role-based sidebar restrictions
- [x] CMS Editor E2E Suite (`tests/cms-editor.spec.ts`) testing modular post creation tabs, draft saving, validation states, and dashboard table presence
- [x] Zero-code-touch rate-limit bypass wrapper (`lib/rate-limit.ts`) dynamically reading Next.js 15 request headers and NODE_ENV test check
- [x] Programmatic database cleanup (`tests/global-teardown.ts`) using admin client to clear `e2e-test-` data on all tables after test runs

### Database
- [x] Full PostgreSQL schema via Supabase migrations (001–023)
- [x] 13 post type enum, 4 post statuses, and all supporting enums
- [x] Posts table with 50+ columns (content, SEO, OG, dates, links, structured data)
- [x] Taxonomy tables: states, organizations, categories, tags, qualifications
- [x] Many-to-many: post_tags, post_qualifications, post_internal_links
- [x] Advertising tables: ad_zones, advertisers, ad_campaigns, ads, ad_events (partitioned), ad_stats_daily
- [x] Affiliate table with full product schema
- [x] Newsletter: subscribers, broadcasts
- [x] Analytics: post_views (partitioned by quarter), search_queries
- [x] SEO: seo_settings, redirects, sitemap_config
- [x] Stories: web_stories, web_story_slides
- [x] Media: media table (metadata, Supabase Storage for files)
- [x] Users table synced with Supabase Auth (fn_sync_user_on_signup trigger)
- [x] RLS policies on ALL tables (018_rls.sql)
- [x] JWT role sync via fn_sync_role_to_claims trigger
- [x] Materialized views: mv_post_counts, mv_active_ads_lookup
- [x] Regular views: v_posts_detail, v_posts_list, v_posts_attention
- [x] Database functions: fn_increment_post_view, fn_is_admin, fn_is_author_or_admin
- [x] Analytics view partition maintenance: fn_create_quarterly_partitions

### Auth
- [x] Supabase Auth (email/password + Google OAuth)
- [x] Login, register, forgot-password, reset-password pages
- [x] OAuth callback handler
- [x] useAuth hook with role checking (isAdmin, isAuthor, isLoggedIn)
- [x] Dashboard layout auth gate (redirect to /login if unauthenticated)
- [x] Role-based nav groups in dashboard sidebar

### CMS Dashboard
- [x] Admin dashboard home with stats overview
- [x] Post CRUD (create, edit, list, with AI content generation)
- [x] Tiptap rich text editor with 13 extensions
- [x] Taxonomy management: states, organizations, categories, tags, qualifications
- [x] Ad management: zones, campaigns, ads with analytics
- [x] Affiliate product management with AI-powered description generation
- [x] Subscriber management
- [x] Media library
- [x] Redirect management
- [x] SEO settings management
- [x] Search analytics
- [x] User management (admin only)
- [x] Stories management
- [x] Author dashboard (posts, stories, profile)
- [x] User dashboard (profile, saved posts, alerts)

### AI Content Pipeline
- [x] Gemini integration via @google/genai
- [x] Per-post-type prompt templates (17 files in config/prompts/)
- [x] Randomised style/structure/conclusion seeds for content variance
- [x] Quality gate with AI heuristic scoring and auto-retry (up to 3 attempts)
- [x] Humanisation pipeline (humanizeContent)
- [x] HTML sanitisation (sanitizeHtml)
- [x] SEO internal link injection (injectContextualLinks)
- [x] Affiliate product AI generation from URL
- [x] Twitter thread generation from post content
- [x] CTR-optimised titles per post type (config/site.ts CTR_CONFIG)

### Public Site
- [x] Homepage with hero and categorised post listings
- [x] Post listing pages for all 13 post types
- [x] Post detail pages with structured content, FAQs, related posts
- [x] State directory and per-state listing pages
- [x] Organization directory and per-org pages
- [x] Qualification directory pages
- [x] Search with autocomplete
- [x] Shop page (affiliate products)
- [x] Google Web Stories listing and detail pages
- [x] Static pages: about, contact, privacy policy, terms of service, disclaimer, editorial policy
- [x] Cookie consent

### SEO
- [x] JSON-LD schema generation (JobPosting, Article, FAQPage, BreadcrumbList, Organization, WebSite)
- [x] Dynamic meta titles/descriptions with per-type CTR optimisation
- [x] Automated sitemaps (posts, taxonomy, static, stories) with sitemap index
- [x] RSS/Atom feed (/feed.xml)
- [x] robots.txt, ads.txt, llms.txt, manifest.webmanifest
- [x] Canonical URL management and 301 redirects
- [x] SEO score analysis and content quality scoring
- [x] Google Indexing API integration
- [x] Open Graph + Twitter Card meta tags
- [x] Breadcrumb navigation with JSON-LD
- [x] Internal link injection in post content

### Performance & Security
- [x] Upstash Redis rate limiting (5 pre-configured limiters)
- [x] Security headers (X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy)
- [x] CSP headers via next.config.ts
- [x] Content sanitisation (sanitize-html)
- [x] AdSense CLS prevention (min-height on ad slots)
- [x] Image optimisation (sharp, next/image with remote patterns)
- [x] Font preloading (next/font/google)
- [x] Vercel Analytics + Speed Insights
- [x] Google Analytics 4 + Google Tag Manager (lazy loaded)

### Component Library
- [x] 18 UI primitives in components/ui/ (Alert, Avatar, Badge, Button, Card, Drawer, Dropdown, Input, Modal, Pagination, Progress, Select, Skeleton, Spinner, Table, Tabs, Textarea, Tooltip)
- [x] Layout components (Header, Footer, Sidebar, DesktopNav, MobileNav, Breadcrumb, ThemeToggle, UserMenu, DashboardHeader)
- [x] Shared components (CookieConsentWrapper, LocalErrorBoundary, RetryButton, SocialIcons)

## Completed Features (Recent)

- [x] Organization Monitoring Database schema migrations (`026_monitoring.sql`)
- [x] Intelligent notices scraper and hash change detector (`lib/utils/scraper.ts`)
- [x] AI relevance filter and post drafting action (`generateDraftFromSourceUpdate`)
- [x] Admin Monitoring Dashboard with manual/batch controls and history feed (`MonitoringClient.tsx`)
- [x] Dynamic Sidebar navigation count badge for pending human-review drafts
- [x] Full Web Push Notification system — native Web Push API (no third-party), VAPID keys, service worker with install/activate lifecycle, subscribe/unsubscribe API routes, admin broadcast dashboard, click tracking, paginated send, iOS Safari guidance, UTM analytics, CSP hardening
- [x] Secured and refactored organization notice board monitoring crawler: moved core logic into service layer (`lib/monitoring.ts`), wrapped Server Actions with role verification checks using `createServerClient()`, resolved RSC rendering click handler crash by converting to HTML form action, resolved database constraint log failures during scraping/AI error (`monitoring_logs` NOT NULL constraint), and integrated Next.js 15 `after` API + cron awaiting to prevent serverless execution freezes.
- [x] Resolved client-side routing, query relationships, and broken navigation issues in the monitoring job details view page (`app/(dashboard)/admin/monitoring/[jobId]/page.tsx`). Fixed unhandled promise rejection by moving `notFound()` to the render phase; handled single-relationship Supabase joined objects returning as arrays; dynamically linked "Review Draft" button to `/admin/posts/[id]` for admins and `/author/posts/[id]/edit` for authors using `useAuth()`.
- [x] Hardened post-generation FAQ schemas, resolved database and UI key discrepancies (`{q, a}` vs `{question, answer}`), resolved indexing contradictions by pruning empty/noindexed archives from `sitemap-taxonomy.xml`, and integrated the Google Web Stories sitemap into the main sitemap index. Passed strict compilation and production build tests with zero errors.
- [x] Post View Count Tracking Fix: Implemented the missing `fn_increment_post_view` database RPC function under `SECURITY DEFINER` context in `017_rpc_functions.sql`, refactored `/api/views/route.ts` to properly pass `referrer` and `device` metadata, and integrated the client-side `ViewCounter` component into the public [PostDetail.tsx](file:///c:/Users/shiva/OneDrive/Documents/Desktop/Startups/result-guru-mvp/features/posts/components/PostDetail.tsx) header meta row. Verified complete type-checking and Next.js production builds.
- [x] Newsletter Subscription Fix: Resolved `new row violates row-level security policy` errors on the `subscribers` table by upgrading both the `/api/newsletter/subscribe` REST route and the `subscribe` Server Action (`features/subscribers/actions.ts`) to use `createAdminClient()`. Refactored `NewsletterForm` to be fully responsive (stacking vertically on small screen viewports using Tailwind `flex-col sm:flex-row` and input `w-full sm:flex-1` classes) and aligned its input and button heights to `h-10` for a sleek aesthetic.

## In Progress

- [ ] (None)

## Next Up

- Automated social media posting (Twitter thread generation exists but posting is manual)

## Open Questions

- **Search infrastructure**: Current search uses Supabase full-text search. Is migration to Algolia/Meilisearch/Typesense planned for better Hindi/Hinglish support?
- **Social media automation**: Will Twitter thread posting be automated (via Twitter API), or remain manual copy-paste?
- **Image CDN**: Is a dedicated image CDN (Cloudinary, Imgix) planned, or will Supabase Storage + Next.js Image Optimization remain sufficient?
- **Monitoring**: No error monitoring (Sentry, LogRocket) is currently configured. Is this planned?
- **Staging environment**: Is there a separate staging Supabase project / Vercel preview deployment for testing?

## Architecture Decisions

- **Supabase over Prisma**: Chose Supabase direct (SQL migrations + JS client) over Prisma ORM for tighter control over PostgreSQL features (RLS, triggers, materialized views, partitioning, custom functions). Trade-off: no type-safe query builder — relies on Supabase's generated types.
- **Tailwind v4 CSS-first**: Adopted CSS-first config (`@theme`, `@utility`) over traditional `tailwind.config.ts` for better editor integration and reduced config complexity. Trade-off: less familiar to developers used to v3 config.
- **Server Actions over API routes for mutations**: CMS CRUD operations use Server Actions (`'use server'`) for simpler data flow. API routes reserved for external integrations, webhooks, and stateless GET endpoints.
- **Custom UI library over shadcn/ui**: Built project-specific components using CVA + clsx + tailwind-merge pattern instead of installing shadcn/ui. Rationale: full control over design system and no dependency on Radix UI primitives.
- **Client-side Supabase hardening**: Added in-memory storage fallback and error boundaries around theme provider to handle cross-origin iframe environments (Google AdSense preview).
- **Partitioned tables**: post_views and ad_events are quarterly-partitioned to manage analytics data volume. Partition maintenance is automated via SQL functions.
- **OKLCH colour space**: All colour tokens use OKLCH for perceptual uniformity and better dark mode contrast. Trade-off: less familiar to developers used to hex/HSL.
- **Organization Source Scraper**: Scraping organization notifications boards using CSS selector selectors and fallbacks to notice/links lists hash detection, paired with Gemini validation logic.

## Session Notes

- Context files have been fully rewritten based on comprehensive codebase audit (2026-06-01).
- All six files now reflect actual codebase state — no template placeholders remain.
- Database schema analysis covered migrations 001–024 (enums, functions, tables, triggers, indexes, views, RLS, maintenance).
- AI pipeline analysis covered the full generation flow including prompt system, quality scoring, and humanisation.
- Aligned `post_status` across database, TypeScript `PostStatus` enum, Zod schema `POST_STATUSES` (now dynamically derived), constants, filter pills in admin/author dashboards, and ~27 hardcoded string comparisons throughout the codebase. Passed strict type-checking checks. (2026-06-01)
- Implemented and wired up a robust Playwright E2E testing framework, complete with programmatic auth injection, Page Object Models, three modular test suites, dynamic rate-limiting bypass handlers, and a global database cleanup teardown hook. Passed strict type checking with zero compilation errors. (2026-06-01)
- Fixed Next.js 15 ESM `@next/env` loading issues by introducing a robust custom environment variable loader (`tests/load-env.ts`).
- Resolved Turbopack dev-server streaming compilation race conditions on Windows by disabling Playwright parallel workers and using sequential single-worker execution (`workers: 1`).
- Hardened all E2E specs for public search forms, hydration delays, and fallback static routes, resulting in a 100% green, fully passing E2E test suite run! (2026-06-01)
- Implemented Organization Sources monitoring system, scraping delta logic, Gemini relevance checking/auto-drafting, and added the monitoring admin dashboard with dual-surface notifications (sidebar badge + activity feed) successfully compiling with zero TypeScript errors. (2026-06-01)
- Resolved Next.js runtime error `baseGroups.map is not a function` in `app/(dashboard)/layout.tsx` by dynamically resolving navigation groups on the client. We consolidated all navigation configurations (`adminNavGroups`, `authorNavGroups`, `userNavGroups`) and a `getNavGroups` helper inside `components/layout/Sidebar.tsx`, deleted the temporary `components/layout/navigation.ts` file, and refactored the layout and shell to avoid server-side array mapping. (2026-06-01)
- Updated [OrgsClient.tsx](file:///c:/Users/shiva/OneDrive/Documents/Desktop/Startups/result-guru-mvp/features/taxonomy/components/OrgsClient.tsx) to display active source counts in both desktop and mobile dashboards so admins can instantly see monitoring configurations. (2026-06-01)
- Overhauled the `/admin/monitoring` dashboard ([MonitoringClient.tsx](file:///c:/Users/shiva/OneDrive/Documents/Desktop/Startups/result-guru-mvp/features/admin/components/MonitoringClient.tsx)) into an interactive accordion interface grouped by organization. Each organization displays a health/crawling status and expands inline to show configured sources, manual scrape controls, detailed historical timelines (last 5 runs), raw crawled HTML content viewers, and AI draft review hooks. (2026-06-01)
- Ran a successful Next.js production build (`npm run build`) and strict type-check validation (`npx tsc --noEmit`) with zero compilation, typescript, or bundle errors. (2026-06-01)
- Hardened the monitoring system database schema in `026_monitoring.sql` to include `processed_count` in `monitoring_jobs`, `content_hash` in `monitoring_logs` for optimized hash comparisons, and index optimizations. (2026-06-02)
- Added signal-based AbortController timeouts to `scrapePage` fetch calls to ensure clean connection terminations and prevent leaking hanging fetches. (2026-06-02)
- Fixed Next.js build-time static generation errors by marking the push broadcasts page (`/admin/broadcasts`) as `force-dynamic`, resulting in a fully successful Next.js production build (`npm run build`). (2026-06-02)
- Created comprehensive `027_security_hardening.sql` migration to fix all Supabase Dashboard Linter issues: enabled RLS on all 26 partition tables (post_views_*, ad_events_*), patched `fn_create_quarterly_partitions()` to auto-enable RLS on new partitions, recreated all 8 views with `security_invoker = true`, pinned `search_path = public` on 10+ unprotected functions, revoked EXECUTE on admin-only SECURITY DEFINER functions from anon/authenticated roles, revoked SELECT on materialized views from API roles, created 15+ missing FK indexes, dropped confirmed duplicate partition indexes, and added safe RLS setup for content_clusters/post_affiliate_products. (2026-06-03)
- Successfully distributed all security hardening logic from `027_security_hardening.sql` into the original migration files (`003_functions.sql`, `005_users.sql`, `007_analytics.sql`, `009_advertising.sql`, `016_indexes.sql`, `017_views.sql`, `018_rls.sql`, `019_materialized_views.sql`, `020_rpc_functions.sql`, `021_maintenance.sql`, `022_db_optimizations.sql`, `023_webhooks.sql`, `026_monitoring.sql`) to maintain a clean schema history, and removed the temporary `027` migration. (2026-06-03)
- Deleted the Search Analytics feature entirely from the codebase (UI, API telemetry, database schemas, cron jobs, indexing, RLS) to keep the app lean, fast, and optimized. (2026-06-03)
- Deleted the SEO and Redirects Admin UI pages to simplify the dashboard.
- Completely removed the dynamic database-driven SEO architecture (`012_seo.sql`, `lib/queries/seo.ts`, `lib/actions/seo.ts`) in favor of the inherently faster hardcoded approach (in `next.config.ts`, `app/robots.ts`, `app/sitemap-static.xml/route.ts`). This removes unused DB tables and dead code, resulting in an optimized, zero-latency setup. (2026-06-03)
- Fully refactored and scrubbed the database schema migration sequence (001 - 023). Removed all orphaned analytics, trending, and tracking elements from views, functions, RLS, optimization configurations, and CRON schedules, then sequentially renamed the files to eliminate numbering gaps and patched all inter-file reference headers. (2026-06-03)
- Comprehensive push notification system audit and fix — resolved 13 issues across service worker, API routes, client components, send infrastructure, and config. Key fixes: created missing `/api/analytics/push-click` route for click tracking, rewrote `sw.js` with `install`/`activate` lifecycle + versioning + rich notification actions + vibrate, fixed >1000 subscriber cap with paginated fetching, added UTM analytics parameters, added iOS Safari PWA guidance modal, fixed `any` type violations and `void 0` silent errors across 3 files, added `worker-src 'self'` CSP and `Cache-Control` headers for SW, wired `PushNotificationPrompt` into `/user/alerts` dashboard, updated manifest with `id`/`scope` for iOS 16.4+. Passed `tsc --noEmit` and `npm run build` with zero errors. (2026-06-05)
- Fixed Google SERP title rewriting and site name detection issues. Root cause: 5 signals (applicationName, appleWebApp.title, WebSite JSON-LD, Organization JSON-LD, manifest.json) all said "Result Guru", causing Google to strip keywords from title and show domain as site name. Fixes: switched homepage + layout titles to keyword-first format ("Sarkari Result 2026 – ... | Result Guru"), aligned layout description with homepage, added WebSite JSON-LD to root layout for site-wide site name detection, made manifest `name` keyword-rich. Passed `tsc --noEmit` with zero errors. (2026-06-06)
- Implemented dynamic noindexing for empty archives (organizations, states, categories, tags) when post counts are 0, preserving crawl budget and domain authority from thin content dilution. Fixed broken filtering links inside the `TaxonomyRibbon` component (routing to `/states/[slug]`, `/organizations/[slug]`, and `/qualifications` instead of non-existent subpaths). Passed `tsc --noEmit` and E2E Playwright tests with zero errors. (2026-06-06)
- Expanded the Scraper Monitoring system by configuring active notice board monitoring sources for 6 major recruitment boards (UPSC, BPSC, UPPSC, IBPS, RRB, DSSSB) in the `organization_sources` database table, enabling automatic scraping and Gemini draft generation for these high-traffic entities. Verified registration in the database and overall app stability via Playwright E2E tests. (2026-06-06)
- Resolved prompt contradictions in `system.md` by stripping HTML-embedded FAQ instructions, securing that FAQ items are parsed strictly via JSON fields to prevent duplicate UI rendering. Wired the user-updated `GOOGLE_GENAI_TEMPERATURE` environment variable across all post and affiliate generation actions. Successfully verified complete type safety and Next.js production builds. (2026-06-06)


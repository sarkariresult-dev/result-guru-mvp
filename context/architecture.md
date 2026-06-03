# Architecture Context

## Stack

| Layer | Technology + Version | Role in this codebase |
|-------|---------------------|----------------------|
| Framework | Next.js ^15.1.7 + TypeScript ^5 | App Router SSR/SSG framework with Turbopack dev server, React Server Components, Server Actions |
| React | React 19.2.3 | UI rendering with React Compiler (experimental) enabled |
| Database | PostgreSQL via Supabase (supabase-js ^2.97.0, @supabase/ssr ^0.8.0) | All persistent data — posts, taxonomy, users, ads, analytics, media metadata |
| Auth | Supabase Auth (email/password + Google OAuth) | User authentication, session management via cookies, JWT role claims |
| Styling | Tailwind CSS v4.2.0 (@tailwindcss/postcss ^4) | CSS-first config via @theme in globals.css, custom utilities via @utility |
| UI Components | Custom component library in components/ui/ (built with CVA ^0.7.1, clsx ^2.1.1, tailwind-merge ^3.5.0) | Button, Card, Modal, Drawer, Table, Tabs, Input, Select, Badge, Alert, Avatar, Pagination, etc. |
| Rich Text Editor | Tiptap ^3.20.0 (13 extensions) | Post content editing — tables, images, code blocks, links, typography, character count |
| Icons | lucide-react ^0.575.0 | All UI icons — stroke-based, tree-shaken via optimizePackageImports |
| State Management | @tanstack/react-query ^5.90.21 | Server state caching, query invalidation, infinite scroll; local state via useState |
| URL State | nuqs ^2.8.8 | Type-safe URL search parameter management for filters/pagination |
| Forms | react-hook-form ^7.71.2 + @hookform/resolvers ^5.2.2 | Form state management with Zod resolver for validation |
| Validation | zod ^4.3.6 | Runtime schema validation for all external input — forms, API requests, env vars |
| AI | @google/genai ^1.44.0 (Gemini) | Content generation, affiliate product description generation, Twitter thread generation |
| Rate Limiting | @upstash/ratelimit ^2.0.8 + @upstash/redis ^1.36.3 | Sliding-window rate limiting on API routes (subscribe, views, search, revalidate) |
| Theme | next-themes ^0.4.6 | Dark/light mode toggle via class strategy |
| Date Handling | date-fns ^4.1.0 | Date formatting and manipulation throughout the app |
| HTML Sanitisation | sanitize-html ^2.17.1 | XSS prevention for AI-generated and user-authored HTML content |
| HTML Parsing | node-html-parser ^7.1.0 | Server-side HTML parsing for content processing and internal link injection |
| Image Optimisation | sharp ^0.34.5 | Server-side image processing |
| Tooltips | @floating-ui/dom ^1.7.6 | Tooltip/popover positioning |
| Google Indexing | google-auth-library ^10.6.2 | Google Indexing API integration for instant URL submission |
| Syntax Highlighting | lowlight ^3.3.0 | Code block syntax highlighting in Tiptap editor |
| Analytics | @vercel/analytics ^1.6.1 + @vercel/speed-insights ^1.3.1 | Client-side performance and usage analytics |
| CSS Typography | @tailwindcss/typography ^0.5.19 | Prose styling for post content rendering |
| Deployment | Vercel (bom1 region) | Serverless hosting, edge caching, cron jobs |
| Bundle Analysis | @next/bundle-analyzer ^16.2.1 | Production bundle size analysis |
| Linting | ESLint ^9 + eslint-config-next ^15.1.7 | Code quality enforcement |
| Testing | Playwright ^1.59.1 | E2E browser testing (installed, no test files found yet) |

## System Boundaries

- `app/` — Next.js App Router. Route definitions, layouts, loading/error states, page components, and API route handlers. Does NOT contain business logic or data access — those live in `lib/` and `features/`.
- `app/(public)/` — All public-facing pages: homepage, post listings (`/[type]`), post detail (`/[type]/[slug]`), directory pages (states, organizations, qualifications), static pages (about, contact, privacy, terms, disclaimer, editorial policy), search, shop, and stories.
- `app/(auth)/` — Authentication pages: login, register, forgot-password, reset-password, and OAuth callback.
- `app/(dashboard)/` — Protected CMS dashboard. Three sub-routes: `admin/` (full CMS access), `author/` (post + story management), `user/` (profile, saved posts, alerts).
- `app/api/` — API route handlers: ads, affiliate, analytics, cron, feed, health, newsletter, OG image, related jobs, revalidation, search, SEO, and view tracking.
- `components/ui/` — Reusable, presentational UI primitives (Button, Card, Modal, Input, etc.). Built with CVA. Do NOT add business logic here.
- `components/layout/` — App shell components: Header, Footer, Sidebar, DesktopNav, MobileNav, Breadcrumb, ThemeToggle, UserMenu.
- `components/shared/` — Cross-cutting components used across multiple pages: CookieConsentWrapper, LocalErrorBoundary, RetryButton, SocialIcons.
- `components/sections/` — Page-specific section components (homepage sections, etc.).
- `components/ads/` — Ad rendering components for the self-hosted ad system.
- `components/seo/` — SEO-specific components (JSON-LD injection, meta tag helpers).
- `components/stories/` — Google Web Stories rendering components.
- `components/providers/` — React context providers: ThemeProvider (next-themes) + QueryClientProvider (react-query).
- `features/` — Feature-sliced business logic. Each subdirectory owns a specific domain: `admin/`, `auth/`, `dashboard/`, `posts/`, `taxonomy/`, `advertising/`, `affiliate/`, `analytics/`, `stats/`, `subscribers/`, `shared/`.
- `hooks/` — Client-side React hooks: useAuth, usePosts, useTaxonomy, useSearch, useBookmarks, useAds, useSubscribe, usePageView, useDebounce, useThrottle, useMediaQuery, useLocalStorage, useInfiniteScroll, useIntersectionObserver, useScrollPosition, useCopyToClipboard, useTheme.
- `lib/` — Shared server/client utilities, the data access layer, and core business logic.
- `lib/supabase/` — Supabase client factories: `server.ts` (cookie-based, for RSC/actions), `client.ts` (browser singleton), `admin.ts` (service role, bypasses RLS), `static.ts` (cookie-free, for `'use cache'` scopes).
- `lib/dal/` — Data Access Layer mappers (DB row → app type transformations).
- `lib/queries/` — Server-side query functions for fetching data from Supabase (analytics, media, organizations, SEO, states, stories, subscribers, tags, taxonomy).
- `lib/actions/` — Server Actions: `ai.ts` (Gemini content generation, affiliate generation, Twitter thread generation), `stories.ts`, `redirects.ts`, `seo.ts`.
- `lib/validations/` — Zod schemas for all input validation: auth forms, post creation, taxonomy CRUD, contact form, newsletter, API inputs.
- `lib/seo/` — SEO utilities: schema-generator (JSON-LD), seo-analyzer (scoring), internal-linking, freshness, indexing (Google API), topical-authority.
- `lib/utils/` — General-purpose utilities: `image.ts`.
- `lib/ads/` — Ad serving logic.
- `config/` — Application configuration: `site.ts` (site identity, nav, route prefixes), `env.ts` (Zod-validated env vars), `constants.ts` (app-wide constants, stale times), `query-keys.ts` (React Query key factory), `prompts/` (AI prompt templates per post type).
- `types/` — TypeScript type definitions: post types, user types, enums, API types, taxonomy types, advertising types, affiliate types, analytics types, media types, newsletter types, SEO types, stories types, post-content types.
- `supabase/` — SQL migration files (001–024): schema definitions, enums, functions, triggers, indexes, views, materialized views, RLS policies, RPC functions, maintenance, optimisations, webhooks, cron.
- `public/` — Static assets: favicons, logos, OG images, llms.txt.
- `context/` — Project documentation files (this file and its siblings).

## Storage Model

### Database (Supabase PostgreSQL)

All structured data lives in Supabase PostgreSQL:

- **Content**: `posts` (all 13 post types), `post_tags` (M2M), `post_qualifications` (M2M), `post_internal_links`
- **Taxonomy**: `states`, `organizations`, `categories`, `qualifications`, `tags`
- **Users**: `users` (CMS accounts, synced with Supabase Auth via triggers)
- **Analytics**: `post_views` (partitioned by quarter), `search_queries`
- **Advertising**: `ad_zones`, `advertisers`, `ad_campaigns`, `ads`, `ad_events` (partitioned), `ad_stats_daily`
- **Affiliate**: `affiliate` (product listings)
- **Newsletter**: `subscribers`, `broadcasts`
- **SEO**: `seo_settings`, `redirects`, `sitemap_config`
- **Stories**: `web_stories`, `web_story_slides`
- **Media**: `media` (metadata only — actual files in Supabase Storage)

### Blob/File Storage (Supabase Storage)

- Post featured images
- Notification PDFs
- Media library assets (images uploaded by staff)
- Organization logos
- WebP conversions

### Cache (Upstash Redis)

- Rate limiting state only (sliding window counters per IP per route)
- No application-level caching in Redis — Next.js ISR/stale-while-revalidate handles page caching

### In-Memory / Client-Side State

- React Query cache (posts, taxonomy, search results, analytics) — configurable staleTime per entity
- Auth session state (useAuth hook) — synced via Supabase onAuthStateChange
- Bookmarks (localStorage via useBookmarks hook)
- Theme preference (localStorage via next-themes)
- URL filter state (nuqs — URL search params, no localStorage)

## Auth and Access Model

- **Authentication Provider**: Supabase Auth with two strategies: email/password sign-up/sign-in, and Google OAuth.
- **Session Mechanism**: Cookie-based sessions managed by `@supabase/ssr`. The `proxy.ts` middleware (exported as Next.js middleware) refreshes the session on every page navigation. Server Actions and API routes access the session via `createServerClient()` which reads cookies.
- **Server-Side Access**: `const supabase = await createServerClient()` → `supabase.auth.getUser()` returns the authenticated user. For bypassing RLS: `createAdminClient()` (service role key).
- **Client-Side Access**: `useAuth()` hook wraps `createClient()` (browser singleton) → provides `user`, `session`, `isAdmin`, `isAuthor`, `isLoggedIn`.
- **Route Protection**:
  - `proxy.ts` (middleware) runs on all document routes — refreshes session cookies but does NOT redirect unauthenticated users.
  - `app/(dashboard)/layout.tsx` — server-side auth gate: calls `supabase.auth.getUser()`, redirects to `/login` if not authenticated. Fetches user profile and determines nav groups based on role.
  - `app/(auth)/layout.tsx` — auth pages accessible to all, redirect to dashboard if already logged in.
- **Role Model**: Three roles defined as `user_role` enum: `admin`, `author`, `user`. Stored in `public.users.role` and synced to Supabase Auth JWT claims via `fn_sync_role_to_claims()` trigger.
- **Ownership Model**:
  - Posts: `author_id` FK to `users.id`. Authors can update/delete their own posts. Admins can update/delete any post. RLS enforces this.
  - Web Stories: Same pattern — `author_id` with author-or-admin RLS.
  - Reference data (states, orgs, categories, tags, qualifications, ad zones): public read, admin-only write.
  - Ads/campaigns: service_role only for mutations, public read for active ads.
  - Subscribers/broadcasts: anonymous insert for subscribers, service_role/admin for management.
  - Media: public read, staff (author+admin) write.
- **RLS**: Enabled on ALL tables (018_rls.sql). Helper functions `fn_is_admin()` and `fn_is_author_or_admin()` check JWT claims. Service role bypasses all RLS.

## AI / Background Task Model

### AI Content Generation

- **SDK**: `@google/genai` ^1.44.0 (Google Gemini)
- **Model**: Configurable via `GOOGLE_GENAI_MODEL` env var (default: `gemini-2.5-flash-preview-05-20`)
- **Temperature**: 0.85 for content generation (creative), 0.3 for affiliate data extraction (factual), 0.7 for Twitter threads
- **Streaming**: Not used — all generation is non-streaming JSON responses with `responseMimeType: 'application/json'` and structured `responseSchema`
- **Quality Pipeline**: Generated content passes through: humanisation (`humanizeContent`) → HTML sanitisation (`sanitizeHtml`) → SEO internal link injection (`injectContextualLinks`) → AI heuristic scoring (`analyzeAiHeuristics`). If score exceeds threshold (60), auto-retries up to 3 times with different random seeds.
- **Prompt System**: Per-post-type prompt templates in `config/prompts/` (17 files: system.md, job.md, result.md, etc.). Randomised style/structure/conclusion seeds injected per generation for variance.

### Cron Jobs

- **Provider**: Vercel Cron
- **Schedule**: `0 0 * * *` (daily at midnight UTC) → `POST /api/cron`
- **Purpose**: Not inspected in detail — likely maintenance tasks (partition management, stale content cleanup based on `021_maintenance.sql`)

### Background Tasks

- No queue system (BullMQ, Inngest, etc.) exists. All work runs within the HTTP request lifecycle.
- Vercel serverless function timeout: 10s for general API routes, 30s for AI routes, 60s for sitemap generation, 300s (5 min) for the dashboard layout (to support heavy AI content generation via Server Actions).

## Invariants

1. **All external input must be validated with Zod before use.** Environment variables are validated at startup in `config/env.ts`. Form inputs are validated via `lib/validations/`. API request bodies must be parsed before any logic executes.
2. **All database mutations must go through Supabase client with RLS enforcement.** Use `createServerClient()` for user-scoped operations. Use `createAdminClient()` only for operations that require bypassing RLS (cron jobs, system-level tasks). Never use the admin client for user-initiated mutations.
3. **Auth checks happen at the layout level, never inside individual page components.** The `(dashboard)/layout.tsx` verifies authentication and loads the user profile. Individual dashboard pages rely on this gate.
4. **No raw SQL — all DB access goes through the Supabase JS client.** The SQL files in `supabase/` are migration scripts applied directly to the database, not called from application code.
5. **CSS custom properties and Tailwind utility classes only — no hardcoded hex/oklch values in component files.** All colour tokens are defined via `--color-*` in `app/globals.css` @theme block and `--bg`, `--fg`, `--border`, `--surface`, `--ring` CSS custom properties.
6. **Server Components are the default.** Add `'use client'` only when browser interactivity (useState, useEffect, event handlers, browser APIs) is required. Server Actions use `'use server'`.
7. **AI-generated content must pass through the humanisation + sanitisation pipeline before storage.** Raw Gemini output is never stored directly — it goes through `humanizeContent()` → `sanitizeHtml()` → `injectContextualLinks()`.
8. **Rate limiting is enforced on all public-facing API routes.** Each route uses a specific limiter from `lib/rate-limit.ts` (subscribe: 5/min, views: 30/min, search: 20/min, general: 60/min).
9. **Post slugs must match the format `^[a-z0-9][a-z0-9-]*[a-z0-9]$`.** This is enforced both in the Zod schema and as a PostgreSQL CHECK constraint.
10. **TypeScript strict mode is enabled with `noUncheckedIndexedAccess`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`.** No `allowJs`. The codebase must pass `tsc --noEmit` with zero errors.

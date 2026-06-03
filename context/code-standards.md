# Code Standards

## General

- Keep modules small and single-purpose. A file should do one thing well.
- Fix root causes — do not layer workarounds or suppress errors without documenting why.
- Do not mix unrelated concerns. A component that fetches data should not also handle layout. A Server Action should not also render UI.
- Prefer composition over inheritance. Build complex behaviour by composing small, testable functions and components.
- Every function/component that is exported from a module must have a JSDoc comment explaining its purpose. Internal helpers can omit this.

## TypeScript

- **Strict mode is required.** The project enables `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitReturns: true`, and `noFallthroughCasesInSwitch: true` in `tsconfig.json`.
- **Never use `any`.** Use `unknown` for truly unknown external data, then narrow with type guards or Zod parsing. If you must escape the type system, use `as unknown as TargetType` and add a comment explaining why.
- **Prefer `interface` for object shapes, `type` for unions/intersections.** Use `type` only when you need capabilities that `interface` cannot provide.
- **Validate all external input at system boundaries.** Environment variables: validated in `config/env.ts`. Form inputs: validated via Zod schemas in `lib/validations/`. API route bodies: parsed with Zod before any logic. Database rows: typed via Supabase's generated types (not manually validated — RLS and schema constraints handle correctness).
- **Use the `enums.ts` file for all enum values.** TypeScript enums in `types/enums.ts` mirror `002_enums.sql` exactly. Never use raw strings for enum values — import and use the enum member.
- **Path aliases are mandatory.** Use `@/` (maps to project root) for all imports. Never use relative paths like `../../`. Aliases configured in `tsconfig.json` paths: `@/*`.

## Next.js

- **Server Components are the default.** Every component file is a Server Component unless it has `'use client'` at the top. Only add `'use client'` when the component uses browser-only APIs (useState, useEffect, event handlers, window, document, localStorage).
- **Server Actions use `'use server'` at the top of the file.** All mutation logic (create/update/delete) should be Server Actions in `lib/actions/`. API routes (`app/api/`) are reserved for external integrations, webhooks, cron endpoints, and stateless GET endpoints.
- **Route handlers in `app/api/` must follow a consistent pattern:**
  1. Parse and validate request input (Zod)
  2. Enforce rate limiting (lib/rate-limit.ts)
  3. Check authentication (if required)
  4. Execute business logic
  5. Return a consistent JSON response shape: `{ data }` on success, `{ error }` on failure with appropriate HTTP status code
- **Use `next/font/google` for all web fonts.** Never use `<link>` tags for Google Fonts. Fonts are defined in `app/layout.tsx` and exposed via CSS custom properties (`--font-sans-next`, `--font-display-next`, `--font-mono-next`).
- **Use Next.js `<Image>` for all images.** Add `width`, `height`, and `alt` attributes to every image. External domains must be allowlisted in `next.config.ts` `images.remotePatterns`.
- **`cookies()` is async in Next.js 15+.** Always `await cookies()` — it returns a Promise.
- **Use `optimizePackageImports` in `next.config.ts` for tree-shaking.** Currently enabled for: `lucide-react`, `date-fns`, `@supabase/ssr`, `react-hook-form`, `@tiptap/react`.

## Styling

- **Use semantic CSS custom property tokens — never hardcode OKLCH or hex values in component files.** All colours come from `--bg`, `--fg`, `--border`, `--surface`, `--ring`, `--color-brand-*`, `--color-accent-*`, `--color-success/warning/error/info`.
- **Use the Tailwind utility classes defined in `globals.css`** (e.g., `bg-background`, `text-foreground-muted`, `border-border`, `animate-fade-up`, `skeleton`, `glass`). Do not create ad-hoc style definitions.
- **Follow the border radius scale.** Use the `--radius-*` tokens: `xs` for tiny UI, `sm` for inputs, `md` for buttons, `lg` for cards, `xl/2xl` for panels/modals, `full` for pills.
- **Follow the shadow/elevation scale.** Cards at rest use `--shadow-sm`. Hover adds `--shadow-md`. Dropdowns use `--shadow-lg`. Modals use `--shadow-xl`.
- **This is Tailwind CSS v4 — CSS-first config.** There is no `tailwind.config.ts`. All tokens are defined in `@theme {}`, custom utilities via `@utility`, components via `@layer components`.
- **Respect dark mode.** Always test both themes. Use `dark:` variant for Tailwind classes. Custom CSS uses `.dark &` nesting or the `:where(.dark, .dark *)` custom variant.
- **Respect `prefers-reduced-motion`.** All animations are suppressed via the global reduced-motion media query. Do not add animations that bypass this.

## API Routes

- **Validate and parse every request body with Zod before any logic runs.** Use `safeParse` and return 400 with error details on failure.
- **Enforce rate limiting on all public-facing API routes.** Import the appropriate limiter from `lib/rate-limit.ts`: `subscribeLimiter` (5/min), `viewLimiter` (30/min), `searchLimiter` (20/min), `revalidateLimiter` (10/min), `generalLimiter` (60/min).
- **Authenticate before mutating.** For mutation routes, call `supabase.auth.getUser()` and verify the user's role before proceeding.
- **Return consistent response shapes.** Success: `NextResponse.json({ data: ... })`. Error: `NextResponse.json({ error: 'message' }, { status: 4xx/5xx })`.
- **Set `maxDuration` on long-running routes.** AI content generation and sitemap generation routes should set `export const maxDuration = 300` (5 minutes). General routes should not exceed 10s.
- **Use `getClientIp(request)` from `lib/rate-limit.ts` for IP extraction.** It checks `x-forwarded-for` first, then `x-real-ip`, then falls back to `127.0.0.1`.

## Data Access

- **Use the correct Supabase client for the context:**
  - `createServerClient()` (from `lib/supabase/server.ts`) — for Server Components, Server Actions, and API routes that need user-scoped access with RLS.
  - `createClient()` (from `lib/supabase/client.ts`) — for client-side components. Singleton pattern. Hardened against cross-origin iframe issues (in-memory storage fallback).
  - `createAdminClient()` (from `lib/supabase/admin.ts`) — for service-role operations that bypass RLS. Only for cron jobs, system-level maintenance, and specific admin operations.
  - `createStaticClient()` (from `lib/supabase/static.ts`) — for cookie-free data fetching in `'use cache'` scopes.
- **Never import the admin client in user-facing code.** It bypasses all RLS policies.
- **All data access for Server Components should go through `lib/queries/`.** Query functions return typed data ready for rendering.
- **Use React Query (`@tanstack/react-query`) for client-side data fetching.** All query keys must come from `config/query-keys.ts`. Invalidation must target specific keys, not `queryClient.clear()`.
- **Query key naming**: Use the `queryKeys` factory. Example: `queryKeys.posts.list(filters)`, `queryKeys.taxonomy.states()`.
- **Stale time is configured centrally** in `config/constants.ts` via `STALE_TIME` and applied in the QueryClient default options (see `components/providers/index.tsx`).

## State Management

- **Server state**: React Query (posts, taxonomy, search, analytics, admin data). No Redux, Zustand, or Jotai.
- **URL state**: nuqs (filters, pagination, search queries). All filter state is URL-serialised so pages are shareable and bookmarkable.
- **Local UI state**: React `useState` / `useReducer`. Keep state as close to where it's used as possible.
- **Persistent client state**: `localStorage` via hooks (`useBookmarks`, `useLocalStorage`). Theme preference via `next-themes`.
- **Auth state**: `useAuth` hook subscribes to Supabase `onAuthStateChange` and exposes `user`, `session`, `isAdmin`, `isAuthor`, `isLoggedIn`.

## File Organization

- `app/` — Route definitions only. Page components should be thin wrappers that import from `features/` or `components/`.
- `features/[domain]/` — Feature-sliced business logic, feature-specific components, and domain types. Each feature owns its own components, hooks, and server functions.
- `components/ui/` — Presentational primitives. No data fetching. No business logic. No Supabase imports.
- `components/layout/` — App shell components (Header, Footer, Sidebar, Nav, Breadcrumb).
- `components/shared/` — Components used across multiple features (error boundaries, social icons, consent).
- `hooks/` — Reusable client-side hooks.
- `lib/actions/` — Server Actions (`'use server'`).
- `lib/queries/` — Server-side data query functions.
- `lib/validations/` — Zod schemas and derived TypeScript types.
- `lib/supabase/` — Supabase client factories.
- `lib/seo/` — SEO utilities (JSON-LD, analysis, linking, indexing).
- `config/` — App configuration (site, env, constants, query keys, AI prompts).
- `types/` — Shared TypeScript type definitions and enums.
- `supabase/` — SQL migration files (numbered 001–024). Applied to the DB via Supabase CLI, never called from app code.

## Naming Conventions

- **Files**: kebab-case for utilities (`rate-limit.ts`, `seo-analyzer.ts`), PascalCase for React components (`Button.tsx`, `PostCard.tsx`).
- **Variables/functions**: camelCase (`createServerClient`, `postSchema`, `buildKeywordSeed`).
- **TypeScript types/interfaces**: PascalCase (`PostInput`, `NavItem`, `CTRTypeConfig`).
- **Enums**: PascalCase enum name, PascalCase members (`PostType.Job`, `UserRole.Admin`).
- **CSS custom properties**: kebab-case with `--` prefix (`--bg`, `--fg-muted`, `--color-brand-500`, `--radius-lg`).
- **Tailwind utilities**: kebab-case (`text-foreground-muted`, `bg-gradient-brand`, `animate-fade-up`).
- **Database columns**: snake_case (`application_start_date`, `meta_description`, `focus_keyword`).
- **Route segments**: kebab-case (`/admit-card`, `/answer-key`, `/exam-pattern`).
- **Query keys**: dot-separated factory pattern (`queryKeys.posts.list(filters)`).

## Error Handling

- **Use `LocalErrorBoundary` for non-critical UI regions.** Wraps components that might fail (Vercel Analytics, third-party scripts) with a `silent` mode that renders nothing on error, or a recovery UI.
- **Server Actions return `{ success, data }` or `{ error }`.** Never throw from a Server Action — always return a structured result that the UI can handle gracefully.
- **API routes catch and log errors, then return structured JSON with appropriate status codes.** 400 for bad input, 401 for unauthenticated, 403 for forbidden, 429 for rate-limited, 500 for unexpected errors.
- **React Query `retry` is configured to NOT retry 4xx errors** (they represent bad input, not transient failures). Only transient errors (5xx, network) are retried up to 2 times with exponential backoff.

## Performance

- **Use `next/dynamic` or React `lazy()` for heavy components** (Tiptap editor, chart libraries) that are not needed on initial render.
- **Images**: Allowlisted remote patterns for Supabase Storage, Google user content, and `resultguru.co.in`. Sharp is installed for server-side optimisation.
- **Fonts**: Preloaded via `next/font/google` with `display: 'swap'` and `preload: true`.
- **Third-party scripts**: Loaded with appropriate strategies:
  - AdSense: `strategy="afterInteractive"`
  - GTM and GA4: `strategy="lazyOnload"`
  - Vercel Analytics/SpeedInsights: rendered in JSX (auto-lazy)
- **Preconnect/prefetch**: Supabase URL, Vercel scripts, Google Tag Manager, Google Analytics origins are preconnected or DNS-prefetched in `<head>`.

# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. The six context files define what to build (`project-overview.md`), how the system is structured (`architecture.md`), how the UI is designed (`ui-context.md`), what standards to follow (`code-standards.md`), the current state of progress (`progress-tracker.md`), and these workflow rules.

Always implement against these specs — do not infer or invent behaviour from scratch. If a spec is missing or ambiguous, add an open question to `progress-tracker.md` and resolve it before implementing.

## Context File Reading Order

Before implementing any feature or making any architectural decision, read these files in order:

1. `context/project-overview.md` — what the product does and its features
2. `context/architecture.md` — system structure, boundaries, storage, auth, invariants
3. `context/ui-context.md` — theme, colours, typography, component library
4. `context/code-standards.md` — implementation rules, naming, file organisation
5. `context/ai-workflow-rules.md` — this file
6. `context/progress-tracker.md` — current phase, completed work, next steps, open questions

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step
- Each unit should be deployable and testable independently

## When to Split Work

Split an implementation step if it combines:

- UI changes and database schema changes
- Multiple unrelated feature domains (e.g., ads + newsletter)
- Server-side and client-side logic that could be developed independently
- Behaviour not clearly defined in the context files

If a change cannot be verified end-to-end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behaviour not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing
- Never guess at database schema — check the `supabase/` migration files for ground truth

## Critical Technical Constraints

These are non-obvious gotchas discovered during codebase audit that must be respected:

### Next.js 15+
- `cookies()` is **async** — always `await cookies()`. This affects every `createServerClient()` call.
- `maxDuration` is set to 300 (5 minutes) on the dashboard layout to support AI content generation.
- The React Compiler (experimental) is enabled — avoid patterns that break its optimisation assumptions (e.g., mutable refs used as dependencies).

### Supabase Client Selection
- **Server Components / Server Actions / API routes**: Use `createServerClient()` from `lib/supabase/server.ts`
- **Client components**: Use `createClient()` from `lib/supabase/client.ts`
- **System-level / cron / bypassing RLS**: Use `createAdminClient()` from `lib/supabase/admin.ts`
- **`'use cache'` scopes**: Use `createStaticClient()` from `lib/supabase/static.ts`
- **NEVER** import the admin client in user-facing code paths

### Client-Side Supabase Hardening
- The browser Supabase client in `lib/supabase/client.ts` uses `persistSession: true` with a custom `storage` implementation that falls back to in-memory storage when `localStorage` is inaccessible (cross-origin iframe / AdSense preview contexts). This is intentional — do not simplify it.
- `flowType: 'pkce'` is enabled for OAuth security.
- `detectSessionInUrl: true` is required for the OAuth callback flow.

### Tailwind CSS v4
- Configuration is CSS-first in `app/globals.css`. There is no `tailwind.config.ts`.
- Custom utilities use `@utility` directive (not `@apply` in `@layer utilities`).
- Dark mode uses `@custom-variant dark (&:where(.dark, .dark *))`.
- Token definitions use `@theme { }` block.

### AI Content Pipeline
- AI-generated content MUST pass through: `humanizeContent()` → `sanitizeHtml()` → `injectContextualLinks()` → `analyzeAiHeuristics()`. Never store raw Gemini output.
- Up to 3 auto-retries with different random seeds if the AI heuristic score exceeds threshold (60).
- 17 prompt template files in `config/prompts/` — one system prompt, one per post type, plus Hinglish guide and Discover/AI SEO guide.

### Database
- Several tables are partitioned: `post_views` (quarterly), `ad_events` (quarterly). Partition management is handled by `021_maintenance.sql`.
- RLS is enabled on ALL tables. The helper functions `fn_is_admin()` and `fn_is_author_or_admin()` check JWT claims.
- The `fn_sync_role_to_claims()` trigger syncs the user role from `public.users` to Supabase Auth JWT metadata.
- TypeScript enums in `types/enums.ts` MUST mirror `002_enums.sql` exactly. If the SQL changes, the TS file must be updated in the same commit.

## Protected Files

Do not modify the following unless explicitly instructed:

- `components/ui/*` — Component library primitives. Changes affect the entire UI.
- `lib/supabase/client.ts` — Hardened browser client with iframe-safe storage. The complexity is intentional.
- `lib/supabase/server.ts` — Cookie-based server client. Changes can break auth across the entire app.
- `config/env.ts` — Environment validation. Changes can break startup.
- `config/site.ts` — Site identity and navigation config. Changes affect SEO, OG tags, and nav across all pages.
- `supabase/*.sql` — Database migrations. Never modify an already-applied migration. Add new numbered files instead.
- `proxy.ts` — Middleware (session refresh, canonical redirect, security headers). Changes affect every request.
- `app/globals.css` — Design system tokens and base styles. Changes affect the entire visual system.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → `architecture.md`
- Storage model or database schema → `architecture.md`
- Design tokens, colours, or typography → `ui-context.md`
- Component library additions → `ui-context.md`
- Code conventions or standards → `code-standards.md`
- Feature scope or user flow → `project-overview.md`
- Any meaningful progress → `progress-tracker.md`

## Before Moving to the Next Unit

1. The current unit works end-to-end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. `npm run build` passes with zero errors
5. Both light and dark themes render correctly
6. Rate limiting is in place for any new public API routes
7. Zod validation covers any new external input boundaries

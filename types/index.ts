// =============================================================
// index.ts — Result Guru Types
// Single entry point — import everything from here.
//
// Usage:
//   import type { Post, PostCard, PostType } from '@/types'
//   import { supabaseToApiResponse } from '@/types'
// =============================================================

// ── Enums ──────────────────────────────────────────────────
export * from './enums'

// ── JSONB content shapes ───────────────────────────────────
export * from './post-content.types'

// ── Tables ────────────────────────────────────────────────
export * from './taxonomy.types'
export * from './user.types'
export * from './post.types'
export * from './media.types'
export * from './advertising.types'
export * from './affiliate.types'
export * from './seo.types'
export * from './newsletter.types'
export * from './analytics.types'
export * from './automation.types'

// ── API / response types ───────────────────────────────────
export * from './api.types'
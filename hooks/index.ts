/**
 * hooks/index.ts — Result Guru
 * Barrel export for all custom hooks.
 *
 * Usage:
 *   import { useDebounce, useAuth, usePosts } from '@/hooks'
 */

// ── Utilities ──────────────────────────────────────────────────────────────
export { useDebounce } from './useDebounce'
export { useThrottle, useThrottledCallback } from './useThrottle'
export { useLocalStorage } from './useLocalStorage'
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, useIsXs, useIsSm, useIsMd, useIsLg, useIsXl, usePrefersDark, usePrefersReducedMotion, useIsTouch } from './useMediaQuery'
export { useIntersectionObserver } from './useIntersectionObserver'
export { useInfiniteScroll } from './useInfiniteScroll'
export { useScrollPosition, scrollToTop } from './useScrollPosition'
export { useCopyToClipboard } from './useCopyToClipboard'

// ── Auth ───────────────────────────────────────────────────────────────────
export { useAuth } from './useAuth'
export type { AuthUser, UseAuthReturn } from './useAuth'

// ── Theme ──────────────────────────────────────────────────────────────────
export { useTheme, useNextTheme } from './useTheme'

// ── Posts ──────────────────────────────────────────────────────────────────
export { usePosts, useInfinitePosts, usePost, useRelatedPosts, useTrendingPosts } from './usePosts'

// ── Search ─────────────────────────────────────────────────────────────────
export { useSearch, useSearchResults } from './useSearch'

// ── Taxonomy ───────────────────────────────────────────────────────────────
export {
    useStates,
    useOrganizations, useOrganization,
    useOrganisations, useOrganisation,   // deprecated aliases
    useState_hook as useStateData,
    useCategories, useQualifications, useTags, useTag,
    useTaxonomySummary,
} from './useTaxonomy'

// ── User features ──────────────────────────────────────────────────────────
export { useBookmarks } from './useBookmarks'
export type { BookmarkEntry } from './useBookmarks'

// ── Newsletter ─────────────────────────────────────────────────────────────
export { useSubscribe, useUnsubscribe } from './useSubscribe'

// ── Analytics ─────────────────────────────────────────────────────────────
export { usePageView } from './usePageView'

// ── Ads ────────────────────────────────────────────────────────────────────
export { useAds, recordAdEvent } from './useAds'
export type { AdRenderContext } from './useAds'
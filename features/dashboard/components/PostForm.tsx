/**
 * PostForm - Re-export from modular post-form package.
 *
 * The full implementation is now in components/dashboard/post-form/:
 *   - PostFormContext.tsx  - Centralized state (useReducer + context)
 *   - type-config.ts      - Post type section visibility config
 *   - primitives.tsx       - Shared UI components (Panel, Field, SearchableSelect)
 *   - ContentSection.tsx   - Title, slug, editor, FAQ, links
 *   - TaxonomySection.tsx  - State, org, category, qualifications, tags
 *   - SeoSection.tsx       - Keywords, meta fields, SERP preview, readability
 *   - SocialSection.tsx    - OG/Twitter fields with preview
 *   - PublishSection.tsx   - Type selector, AI generation, dates
 *   - MediaSection.tsx     - Featured image + notification PDF
 *   - SeoScoreWidget.tsx   - SEO gauge + checklist + pre-save modal
 *   - index.tsx            - Orchestrator component
 */
export { PostForm } from './post-form'

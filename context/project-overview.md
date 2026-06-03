# Result Guru

## Overview

Result Guru is a content-driven portal for Indian government job seekers. It aggregates and publishes structured information about Sarkari (government) job notifications, exam results, admit cards, answer keys, syllabi, exam patterns, previous papers, government schemes, admissions, and scholarships. Content is authored by staff (admin/author) via a built-in CMS dashboard, with AI-assisted content generation powered by Google Gemini. The site is SEO-optimised for Google India, monetised via Google AdSense and a self-hosted ad management system, and targets India's Hindi-belt audience (18–35 age group) preparing for competitive examinations.

## Goals

1. A visitor can browse listings of 13 distinct post types (job, result, admit card, answer key, cut-off, syllabus, exam pattern, previous paper, scheme, exam, admission, scholarship, notification) filtered by state, organization, qualification, category, and tag.
2. A visitor can read full post detail pages with structured content (dates, FAQs, related posts, key links) and semantic SEO metadata (JSON-LD, Open Graph, Twitter Cards).
3. An admin/author can create, edit, publish, schedule, and archive posts using a rich-text editor (Tiptap) and AI-powered content generation (Gemini).
4. An admin can manage all taxonomy entities: states, organizations, qualifications, categories, and tags.
5. An admin can manage a self-hosted advertising system: ad zones, campaigns, ads, and view impression/click analytics.
6. An admin can manage affiliate product listings displayed in a /shop page.
7. A visitor can subscribe to the newsletter; admins can manage subscribers and broadcasts.
8. An admin can manage URL redirects, SEO settings, media library, and user accounts.
9. A visitor can search posts via full-text search with autocomplete.
10. A visitor can view Google Web Stories published by staff.
11. The site generates dynamic sitemaps, RSS feed, robots.txt, manifest, ads.txt, and llms.txt for discoverability.

## Core User Flow (Public Visitor)

1. Visitor lands on the homepage (`/`) — sees a hero section and categorised post listings (latest jobs, results, admit cards, etc.).
2. Visitor clicks a category tab (e.g., "Job") — navigates to `/job` listing page showing paginated post cards.
3. Visitor filters by state, organization, or qualification using sidebar/URL query parameters.
4. Visitor clicks a post card — navigates to `/job/[slug]` detail page.
5. Visitor reads the full article with important dates, FAQs, related posts, and key action links (Apply Online, Download PDF).
6. Visitor optionally subscribes to the newsletter via the inline subscribe form.
7. Visitor optionally browses the `/shop` page for recommended books and study materials (affiliate products).

## Core User Flow (Admin/Author)

1. Staff signs in via `/login` (email/password or Google OAuth).
2. Staff lands on `/admin` or `/author` dashboard — sees overview stats.
3. Staff creates a new post via the post editor — fills in type, topic, organization context, then clicks "Generate with AI" to produce full content.
4. Staff reviews AI-generated content in the Tiptap editor, edits as needed, sets SEO fields, and publishes.
5. Staff manages taxonomy (states, organizations, categories, tags, qualifications) via dedicated admin pages.
6. Admin manages ads, affiliate products, subscribers, media, redirects, and SEO settings.

## Features

### Content Management

- 13 post types with structured fields (dates, links, FAQs, SEO metadata)
- AI-powered content generation with Gemini (humanisation pipeline, quality scoring, auto-retry)
- Rich-text editing with Tiptap (tables, images, code blocks, links, subscript/superscript)
- Post scheduling, archiving, and expiration
- Related posts computation (auto-populated)
- Internal link injection for SEO

### Taxonomy & Navigation

- States/regions directory with per-state listing pages
- Organizations directory with per-org pages
- Qualification-based filtering
- Hierarchical categories
- Tags with canonical tag support
- Dynamic sidebar navigation

### SEO & Discoverability

- Automated JSON-LD schema generation (JobPosting, Article, FAQPage, BreadcrumbList, Organization, WebSite)
- Dynamic meta titles/descriptions with CTR optimisation config per post type
- Automated sitemaps (posts, taxonomy, static, stories) with sitemap index
- RSS/Atom feed (`/feed.xml`)
- `robots.txt`, `ads.txt`, `llms.txt`, `manifest.webmanifest`
- Canonical URL management and 301 redirects (plural → singular, legacy → new)
- SEO score computation and content quality analysis
- Google Indexing API integration for instant URL indexing

### Advertising

- Self-hosted ad management (zones, campaigns, ads)
- Impression/click tracking via partitioned event store
- Daily aggregated ad stats
- Targeted ads by state, post type, qualification, device
- Google AdSense integration (auto-ads)

### Affiliate

- Product listing with categories, pricing, ratings, FAQs
- AI-powered product description generation from URL
- Featured products on `/shop` page

### Newsletter & Subscribers

- Email subscriber collection with unsubscribe tokens
- WhatsApp/Telegram opt-in fields
- Broadcast system (email, WhatsApp, Telegram, push channels)

### Authentication & Roles

- Supabase Auth (email/password + Google OAuth)
- Three roles: admin, author, user
- Role-based dashboard navigation and access
- JWT-synced role claims for middleware-level checks

### Google Web Stories

- AMP-compliant story creation with slide-based content
- Stories listing page and individual story pages

### Analytics

- Page view tracking (partitioned by quarter)
- Post view counts, time-on-page, share counts
- Internal search query logging
- Vercel Analytics and Speed Insights integration
- Google Analytics 4 and Google Tag Manager

## Scope

### In Scope

- All 13 post type CRUD and listing/detail pages
- AI content generation and humanisation pipeline
- Full CMS dashboard (admin + author + user roles)
- Taxonomy management (states, orgs, categories, tags, qualifications)
- Self-hosted ad management system
- Affiliate product management and shop page
- Newsletter subscriber management
- SEO automation (sitemaps, JSON-LD, meta, redirects)
- Google Web Stories
- Cookie consent
- Dark/light theme toggle
- PWA manifest and mobile-optimised design
- Search with autocomplete

### Out of Scope

- Native mobile application (iOS/Android)
- User-generated content or comments
- Forum or community features
- E-commerce checkout or payment processing
- Multi-language i18n (site is English/Hinglish only)
- Real-time notifications (push, WebSocket)
- Multi-tenancy (single-tenant CMS only)
- Automated social media posting (Twitter thread generation exists but posting is manual)
- Email delivery infrastructure (broadcast table exists but no send integration)

## Success Criteria

1. A visitor can land on the homepage, browse post listings by type, filter by state/org/qualification, and read a full post detail page with structured content, FAQs, and action links.
2. An admin can sign in, create a new post using AI generation, review/edit content in the Tiptap editor, and publish it — the post appears on the public listing within seconds.
3. Every published post has valid JSON-LD structured data, complete Open Graph/Twitter meta tags, and appears in the auto-generated sitemap.
4. The site loads with a Lighthouse performance score above 85 on mobile, with proper CLS prevention for ad slots.
5. All API routes enforce rate limiting via Upstash Redis, and all mutations verify auth and ownership via Supabase RLS.
6. An admin can create and manage ad campaigns, view impression/click stats, and configure ad zones.
7. A visitor can subscribe to the newsletter and an admin can view the subscriber list.

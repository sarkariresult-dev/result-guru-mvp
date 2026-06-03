# UI Context

## Theme

Dual-mode (light + dark) with light as default. Controlled by next-themes via `class` attribute strategy on `<html>`. System preference is respected via `enableSystem` but can be overridden by the user via ThemeToggle component. The dark theme uses deep indigo-tinted near-black backgrounds (`oklch(0.12 0.014 264)`) with layered surfaces. The light theme uses warm off-whites (`oklch(0.988 0.002 264)`). All transitions between themes are instantaneous (`disableTransitionOnChange` is enabled).

A `SafeThemeProvider` error boundary wraps the theme provider to prevent full-page crashes when running inside cross-origin iframes (AdSense preview environments), where `localStorage` access can throw.

## Color System

All colours are defined in **OKLCH** colour space in `app/globals.css`. Components MUST use the semantic CSS custom properties (not the raw brand/accent scale). The brand/accent scales exist for use in composite utilities and gradient definitions only.

### Semantic Tokens (use these in components)

| Role | Light Mode (OKLCH) | Dark Mode (OKLCH) | CSS Variable |
|------|-------------------|-------------------|-------------|
| Page background | `oklch(0.988 0.002 264)` | `oklch(0.12 0.014 264)` | `--bg` via `bg-background` |
| Muted background | `oklch(0.965 0.005 264)` | `oklch(0.15 0.014 264)` | `--bg-muted` via `bg-background-muted` |
| Subtle background | `oklch(0.945 0.008 264)` | `oklch(0.18 0.014 264)` | `--bg-subtle` via `bg-background-subtle` |
| Primary text | `oklch(0.145 0.020 264)` | `oklch(0.94 0.005 264)` | `--fg` via `text-foreground` |
| Muted text | `oklch(0.35 0.016 264)` | `oklch(0.65 0.008 264)` | `--fg-muted` via `text-foreground-muted` |
| Subtle text | `oklch(0.45 0.010 264)` | `oklch(0.48 0.007 264)` | `--fg-subtle` via `text-foreground-subtle` |
| Surface | `oklch(1 0 0)` | `oklch(0.15 0.014 264)` | `--surface` via `bg-surface` |
| Raised surface | `oklch(0.995 0.002 264)` | `oklch(0.19 0.015 264)` | `--surface-raised` via `bg-surface-raised` |
| Border | `oklch(0.905 0.008 264)` | `oklch(0.24 0.016 264)` | `--border` via `border-border` |
| Strong border | `oklch(0.80 0.016 264)` | `oklch(0.34 0.020 264)` | `--border-strong` via `border-border-strong` |
| Focus ring | `oklch(0.48 0.192 264)` | `oklch(0.65 0.145 264)` | `--ring` via `focus-ring` |
| Overlay | `oklch(0.145 0.020 264 / 0.50)` | `oklch(0 0 0 / 0.60)` | `--overlay` |

### Brand Scale (Indigo — authority / trust)

10-step scale from `--color-brand-50` (lightest) to `--color-brand-950` (darkest), hue 264. Primary brand colour: `--color-brand-500` at `oklch(0.55 0.180 264)`. Used in CTA buttons, active nav, focus rings, link colours, editor caret, brand gradients.

### Accent Scale (Saffron — energy / India / warmth)

10-step scale from `--color-accent-50` to `--color-accent-950`, hue 45–60. Used in secondary CTAs, badges, hero gradients, notification highlights.

### Status Colours (WCAG AA on both themes)

| Role | OKLCH | Tailwind Class |
|------|-------|---------------|
| Success | `oklch(0.58 0.150 155)` | `text-success` / `bg-success` |
| Warning | `oklch(0.72 0.160 78)` | `text-warning` / `bg-warning` |
| Error | `oklch(0.55 0.185 25)` | `text-error` / `bg-error` |
| Info | `oklch(0.58 0.160 230)` | `text-info` / `bg-info` |

## Typography

| Role | Font | CSS Variable | Source |
|------|------|-------------|--------|
| Sans / body text | Inter | `--font-sans` via `--font-sans-next` (next/font) | Google Fonts via `next/font/google`, subsets: latin + latin-ext, display: swap, preloaded |
| Display / headings | Inter (shared with sans) | `--font-display` via `--font-display-next` (falls back to `--font-sans`) | Same as above |
| Monospace / code | System monospace stack | `--font-mono` via `--font-mono-next` | `ui-monospace, "Cascadia Code", "Fira Code", monospace` |

### Heading Scale

| Level | Mobile | Desktop (≥640px) | Weight | Tracking |
|-------|--------|-----------------|--------|----------|
| h1 | 1.875rem (30px) | 2.25rem (36px) | 700 | -0.015em |
| h2 | 1.5rem (24px) | 1.75rem (28px) | 700 | -0.015em |
| h3 | 1.25rem (20px) | 1.375rem (22px) | 700 | -0.015em |
| h4 | 1.1rem (~17.6px) | 1.1rem | 700 | -0.015em |

### Fluid Text Utilities

Custom `@utility` classes for responsive text sizing using `clamp()`:
`text-fluid-xs` through `text-fluid-5xl` (8 sizes).

### Body Text

- Base font size: 0.9375rem (15px)
- Line height: 1.6
- Headings line height: 1.25
- Text rendering: `optimizeLegibility`, `-webkit-font-smoothing: antialiased`
- Text wrapping: `text-wrap: pretty` on paragraphs, `text-wrap: balance` on headings

## Border Radius

Defined in `@theme` as `--radius-*` tokens:

| Context | Token | Value | Usage |
|---------|-------|-------|-------|
| Tags / small chips | `--radius-xs` | 0.25rem | Tiny inline elements |
| Inputs / badges | `--radius-sm` | 0.375rem | Form inputs, focus outlines |
| Buttons / chips | `--radius-md` | 0.5rem | Standard interactive elements |
| Cards / dropdowns | `--radius-lg` | 0.75rem | Cards, dropdown menus, images |
| Panels / large cards | `--radius-xl` | 1rem | Large content cards |
| Modals / drawers | `--radius-2xl` | 1.25rem | Modal dialogs, prose tables |
| Hero sections | `--radius-3xl` | 1.5rem | Full-width feature sections |
| Pill / avatar | `--radius-full` | 9999px | Fully rounded elements |

## Shadow / Elevation System

| Token | Usage |
|-------|-------|
| `--shadow-xs` | Subtle buttons, inputs |
| `--shadow-sm` | Cards at rest |
| `--shadow-md` | Cards on hover, images |
| `--shadow-lg` | Dropdowns, popovers |
| `--shadow-xl` | Modals, drawers |
| `--shadow-brand` | Brand CTA buttons (indigo glow) |
| `--shadow-accent` | Accent CTA buttons (saffron glow) |

## Transition / Animation System

### Easing Functions

| Token | Curve | Usage |
|-------|-------|-------|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy scale-in |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Fade-up, slide-in |
| `--ease-in-out-quad` | `cubic-bezier(0.45, 0, 0.55, 1)` | General smooth |

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 120ms | Hover colour changes, focus rings |
| `--duration-base` | 200ms | Scale-in, micro-interactions |
| `--duration-slow` | 350ms | Fade-up, slide-in, drawer open |
| `--duration-slower` | 550ms | Page-level transitions |

### Animation Utilities

Custom `@utility` classes: `animate-fade-up`, `animate-fade-in`, `animate-slide-right`, `animate-drawer-in`, `animate-scale-in`, `animate-spin-slow`, `animate-pulse-ring`, `animate-float`, `animate-pulse-subtle`.

Stagger delays: `delay-75`, `delay-150`, `delay-225`, `delay-300`, `delay-450`, `delay-600`.

### Reduced Motion

All animations and transitions are suppressed under `@media (prefers-reduced-motion: reduce)` — durations set to 0.01ms, iteration count to 1, scroll-behavior to auto.

## Component Library

Custom-built primitives in `components/ui/`. NOT shadcn/ui — these are project-specific components using a similar CVA + clsx + tailwind-merge pattern.

### Available Primitives (components/ui/)

| Component | File | Description |
|-----------|------|-------------|
| Alert | Alert.tsx | Status message display (success, error, warning, info) |
| Avatar | Avatar.tsx | User avatar with fallback initials |
| Badge | Badge.tsx | Status labels and tags |
| Button | Button.tsx | Primary, secondary, ghost, destructive variants (CVA) |
| Card | Card.tsx | Content container with header/body/footer |
| Drawer | Drawer.tsx | Slide-in side panel |
| Dropdown | Dropdown.tsx | Dropdown menu |
| Input | Input.tsx | Text input with error state |
| Modal | Modal.tsx | Centered overlay dialog |
| Pagination | Pagination.tsx | Page navigation controls |
| Progress | Progress.tsx | Progress bar |
| Select | Select.tsx | Select dropdown |
| Skeleton | Skeleton.tsx | Loading placeholder |
| Spinner | Spinner.tsx | Loading spinner |
| Table | Table.tsx | Data table with header/body/row/cell |
| Tabs | Tabs.tsx | Tab navigation |
| Textarea | Textarea.tsx | Multi-line text input |
| Tooltip | Tooltip.tsx | Hover tooltip |

All are re-exported from `components/ui/index.ts`.

## Layout Patterns

- **Public site**: Header (glassmorphic, sticky) + main content + Footer (multi-column with nav groups). Full-width on mobile, max-width container on desktop.
- **Dashboard**: Left sidebar (collapsible, 280px) + top header (breadcrumb, user menu) + main content area. Mobile: sidebar collapses into a hamburger menu.
- **Post detail**: Single-column prose layout (max-width `65ch` via `--container-prose`) with optional sidebar for ads/related posts on large screens.
- **Post listings**: Grid of post cards (1 col mobile, 2 col tablet, 3 col desktop) with filter sidebar.
- **Modals**: Centered overlay with `--overlay` backdrop, `--radius-2xl` corners, `--shadow-xl` elevation.
- **Drawers**: Slide-in from left (`animate-drawer-in`), full height, backdrop overlay.

## Special Utilities

| Utility | Class | Purpose |
|---------|-------|---------|
| Brand gradient text | `text-gradient-brand` | Indigo→saffron gradient clip on text |
| Brand gradient BG | `bg-gradient-brand` | Indigo gradient for CTAs |
| Accent gradient BG | `bg-gradient-accent` | Saffron gradient for secondary CTAs |
| Hero gradient BG | `bg-gradient-hero` | Radial gradient page backgrounds |
| Glass effect | `glass` | Frosted glass with backdrop-blur |
| Glass minimal | `glass-minimal` | Lighter frosted glass variant |
| Noise texture | `noise` | SVG noise overlay via ::after pseudo |
| Skeleton loader | `skeleton` | Shimmer animation for loading states |
| GPU acceleration | `gpu` | `translateZ(0)` with conditional `will-change` |
| Screen reader only | `sr-only` | Visually hidden, accessible text |
| Scrollbar hide | `scrollbar-hide` | Hide scrollbars (webkit + firefox) |
| Prose recruitment | `prose-recruitment` | Premium table styling for job/result posts |
| Prose editorial | `prose-editorial` | Enhanced typography for editorial content |
| Icon badge | `icon-badge` | Consistent icon container (32×32, rounded-lg) |
| Step number | `step-number` | Numbered step indicator (28×28, fully rounded) |

## Icons

lucide-react ^0.575.0. Stroke-based icons only. Standard sizes:
- `h-4 w-4` (16px) — inline text, badges, table cells
- `h-5 w-5` (20px) — buttons, nav items
- `h-6 w-6` (24px) — section headers, empty states

Tree-shaken via Next.js `optimizePackageImports: ['lucide-react']` in `next.config.ts`.

## Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4 — CSS-first config, NOT `tailwind.config.ts`. All configuration is in `app/globals.css`:

- `@import "tailwindcss"` — loads the framework
- `@plugin "@tailwindcss/typography"` — prose styling
- `@custom-variant dark (&:where(.dark, .dark *))` — class-based dark mode
- `@theme { ... }` — all design tokens (fonts, brand colours, semantic colours, radii, shadows, transitions, containers)
- `@layer base { ... }` — base element styles (html, body, headings, forms, tables, scrollbars, focus rings)
- `@layer components { ... }` — Tiptap editor styles, AdSense CLS prevention
- `@utility <name> { ... }` — custom utility classes (fluid text, semantic colours, animations, visual effects, structural helpers)

There is NO `tailwind.config.ts` or `tailwind.config.js` file. Do not create one.

## AdSense CLS Prevention

AdSense ad slots (`ins.adsbygoogle`) have minimum heights to prevent Cumulative Layout Shift:
- Mobile: `min-height: 90px`
- Desktop (≥768px): `min-height: 250px`

# Spec: Playwright E2E Test Setup

## 1. Background & Objectives

As a highly scalable, content-driven portal, Result Guru relies on seamless operation across the public aggregation site, the staff CMS dashboard, the AI content generator, and complex database triggers. 

This spec establishes a robust **Playwright End-to-End (E2E) Test Suite** to:
1. Automate verification of critical public and protected user journeys.
2. Prevent regressions in routing, authentication, dynamic filters, forms, and AdSense CLS prevention.
3. Enforce system invariants (e.g. strict Zod boundaries on inputs, role-based dashboard gates).
4. Facilitate continuous integration testing with single-command local runs.

---

## 2. Technical Stack & Config Architecture

### Dependencies
We will install the standard Playwright testing framework as a dev dependency to work alongside the existing `"playwright": "^1.59.1"` in the project:
* `@playwright/test` — The test runner, assertions, and page utilities.

### Configuration (`playwright.config.ts`)
A centralized Playwright config file will be placed in the project root:
* **Target Server**: Autostart the Next.js development server using Playwright's `webServer` option on `http://localhost:3000` with `reuseExistingServer: !process.env.CI`.
* **Browsers**: Test across Chromium (default), Firefox, and WebKit (Safari).
* **Parallelism**: Enable fully parallel runs locally and serial/limited execution on CI to conserve resources.
* **Reporters**: HTML reporter for rich local analysis, and line/dot reporters for CI.
* **Trace & Screenshots**: Capture screenshots and trace recordings automatically on first failure.

---

## 3. Core Test Scenarios

We will implement three main suites of E2E tests:

### Suite A: Public Portal & Search (`tests/public-site.spec.ts`)
* **Homepage Render**: Verify the home page mounts successfully, checking that key structural elements (sticky Header, navigation, latest post card grids, and Footer) render without layout shifts.
* **Listing & Filters**: Navigate to a post type route (e.g. `/job`). Verify the filter pills mount, and clicking a state or organization filter dynamically updates the URL parameters (using `nuqs` state) and filters the visible cards.
* **Detail Page & Layouts**: Click into a post detail page (e.g. `/job/ssc-cgl-recruitment-2026`). Verify that the recruitment-specific table (`prose-recruitment`), important dates box, FAQ list, and action links are visible and correctly styled.
* **Full-Text Search**: Type into the header search bar, verify the autocomplete dropdown pops up with relevant results, and submitting the form redirects to `/search?q=...` with populated results.

### Suite B: Authentication & Session Gate (`tests/auth-flow.spec.ts`)
* **LoginPage Rendering**: Verify `/login` displays email/password inputs and Google OAuth buttons.
* **Invalid Login**: Submit wrong credentials and verify the error alert displays with a clear warning message.
* **Successful Login**: Input mock user credentials, submit, and verify automated redirection to the dashboard (`/admin` or `/author` depending on role).
* **Role-Based Nav Check**: Log in as an `author`, verify that the sidebar only shows author-scoped navigation (Posts, Stories, Profile) and does NOT display admin links (Users, Settings, Ads).

### Suite C: CMS Post Creator & Editor (`tests/cms-editor.spec.ts`)
* **Editor Mounting**: Access the modular post form editor (`/author/posts/new` or `/admin/posts/new`). Verify all sections (Content, Taxonomy, Media, SEO, Publish) mount correctly.
* **Validation and Constraints**: Attempt to save a blank post and verify Zod validation error messages appear (e.g., "Title must be at least 10 characters").
* **Post Form Creation**:
  1. Fill in Title, Slug, Type (`job`), and Dates.
  2. Select state, organization, and category dropdown options.
  3. Type content into the Tiptap editor canvas.
  4. Fill in SEO meta title/description and FAQ blocks.
  5. Click "Save Draft".
  6. Verify success alert, automated redirection back to post list, and the presence of the newly created post in the dashboard table.

---

## 4. Test Isolation & Mocking Strategy

### 4.1 Supabase Authentication Bypassing
To prevent E2E tests from executing slow, repetitive manual OAuth or email login steps for every single dashboard test, we will write a local auth setup utility:
1. Log in once programmatically via a global setup block or bypass authentication entirely.
2. Injects a valid Supabase Auth session token (JWT) into `localStorage` / cookies before page load.
3. Uses Playwright's `browserContext.storageState()` to persist authenticated state across all protected test cases.

### 4.2 Rate Limit Bypassing
Since public API routes (search, newsletter subscribe, revalidation) use Upstash Redis rate limiters, E2E tests can easily trigger a `429 Too Many Requests` code. 
To resolve this:
* We will verify if a custom bypass header (e.g. `X-E2E-Bypass-Token` matched against an env variable `E2E_BYPASS_TOKEN`) can be passed in test requests to bypass the Upstash limiters during E2E test runs.

---

## 5. Implementation Roadmap

### Step 1: Install Dev Dependencies & CLI Setup
```bash
npm install -D @playwright/test
npx playwright install chromium firefox webkit
```

### Step 2: Add npm scripts (`package.json`)
```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug"
}
```

### Step 3: Write Playwright Config (`playwright.config.ts`)
Configure test paths, local server variables, tracers, and viewport scaling rules.

### Step 4: Implement Page Object Models (POM)
Create a `tests/pages/` directory to modularize page selectors:
* `LoginPage` page object.
* `DashboardPage` page object.
* `PostEditorPage` page object.

### Step 5: Implement Test Suites
* `tests/public.spec.ts`
* `tests/auth.spec.ts`
* `tests/cms.spec.ts`

---

## 6. Definition of Done (Success Criteria)

1. `npx playwright test` runs end-to-end against a locally launched Next.js dev server successfully.
2. Zero invariant violations. All routes are checked in light and dark modes.
3. Tests leverage clean, structured page-object patterns to avoid fragile CSS selectors.
4. Programmatic Supabase session injection is verified and functional for protected routes.
5. All test runs produce zero lint or TypeScript compilation errors.

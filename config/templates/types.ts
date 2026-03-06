// =============================================================
// Template Types — Result Guru
// Strict interface for SEO-optimized post templates.
//
// Token reference for patterns:
//   [ORG]       – Organization (SSC, UPSC, Railway, etc.)
//   [POST]      – Post / exam name (CGL, NDA, Clerk, etc.)
//   [YEAR]      – Current year (auto-filled)
//   [VACANCIES] – Total vacancy count
//   [STATE]     – State name
// =============================================================

export interface PostTemplate {
  /* ── Content ─────────────────────────────────────── */
  /** Post title — target 30-65 chars with tokens filled */
  titlePattern: string
  /** URL slug — target ≤60 chars, no stop words */
  slugPattern: string
  /** Listing excerpt — target 50-200 chars */
  excerptPattern: string
  /** Tiptap HTML body — target 1000+ words (E-E-A-T depth) */
  contentTemplate: string
  /** Default application status value */
  applicationStatus: string

  /* ── SEO (Google 2026 guidelines) ────────────────── */
  seo: {
    /** ≤60 chars — truncation-safe for SERP */
    metaTitlePattern: string
    /** 120-155 chars — optimized snippet length */
    metaDescriptionPattern: string
    /** Primary keyword — must appear in title first 60 chars */
    focusKeywordPattern: string
    /** ≥2 long-tail secondary keywords */
    secondaryKeywords: string[]
    /** Featured image alt text with keyword */
    featuredImageAlt: string
  }

  /* ── Structured Data ─────────────────────────────── */
  importantDates: Record<string, string>
  applicationFee: Record<string, string>
  vacancyDetails: Record<string, string>
  eligibility: Record<string, string>
  ageLimit: Record<string, string>
  payScale: Record<string, string>
  selectionProcess: string[]
  howToApply: string[]
  faq: { question: string; answer: string }[]
  syllabusSections: { subject: string; topics: string[]; marks: number | null }[]
  examPatternData: { paper: string; questions: number | null; marks: number | null; duration: string; type: string }[]
  previousYearPapers: { year: string; title: string; pdf_url: string }[]
  preparationTips: string[]
  cutOffMarks: Record<string, string>
  totalVacancies: string
}

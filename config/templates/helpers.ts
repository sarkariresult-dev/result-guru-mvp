import type { PostTemplate } from './types'

export const CURRENT_YEAR = new Date().getFullYear().toString()
export const NEXT_YEAR = (new Date().getFullYear() + 1).toString()

/** Replace [YEAR] / [NEXT_YEAR] tokens with actual values */
export function y(s: string): string {
  return s.replace(/\[YEAR\]/g, CURRENT_YEAR).replace(/\[NEXT_YEAR\]/g, NEXT_YEAR)
}

// ── Apply template defaults to empty form fields ──────────────

const isEmpty = (v: unknown): boolean => {
  if (v === null || v === undefined || v === '') return true
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v as object).length === 0
  return false
}

export function getTemplateDefaults(
  template: PostTemplate,
  current: {
    title: string
    excerpt: string
    content: string
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
    metaTitle: string
    metaDescription: string
    focusKeyword: string
    secondaryKeywords: string[]
    featuredImageAlt: string
  },
  options: { force?: boolean } = {},
): Partial<typeof current & { applicationStatus: string }> {
  const updates: Record<string, unknown> = {}
  const force = options.force ?? false

  // Content fields
  if (force || isEmpty(current.title)) updates.title = template.titlePattern
  if (force || isEmpty(current.excerpt)) updates.excerpt = template.excerptPattern
  if (force || isEmpty(current.content)) updates.content = template.contentTemplate

  // SEO fields
  if (force || isEmpty(current.metaTitle)) updates.metaTitle = template.seo.metaTitlePattern
  if (force || isEmpty(current.metaDescription)) updates.metaDescription = template.seo.metaDescriptionPattern
  if (force || isEmpty(current.focusKeyword)) updates.focusKeyword = template.seo.focusKeywordPattern
  if (force || isEmpty(current.secondaryKeywords)) updates.secondaryKeywords = template.seo.secondaryKeywords
  if (force || isEmpty(current.featuredImageAlt)) updates.featuredImageAlt = template.seo.featuredImageAlt

  // Structured data
  if (force || isEmpty(current.importantDates)) updates.importantDates = template.importantDates
  if (force || isEmpty(current.applicationFee)) updates.applicationFee = template.applicationFee
  if (force || isEmpty(current.eligibility)) updates.eligibility = template.eligibility
  if (force || isEmpty(current.ageLimit)) updates.ageLimit = template.ageLimit
  if (force || isEmpty(current.payScale)) updates.payScale = template.payScale
  if (force || isEmpty(current.selectionProcess)) updates.selectionProcess = template.selectionProcess
  if (force || isEmpty(current.howToApply)) updates.howToApply = template.howToApply
  if (force || isEmpty(current.faq)) updates.faq = template.faq
  if (force || isEmpty(current.syllabusSections)) updates.syllabusSections = template.syllabusSections
  if (force || isEmpty(current.examPatternData)) updates.examPatternData = template.examPatternData
  if (force || isEmpty(current.previousYearPapers)) updates.previousYearPapers = template.previousYearPapers
  if (force || isEmpty(current.preparationTips)) updates.preparationTips = template.preparationTips
  if (force || isEmpty(current.cutOffMarks)) updates.cutOffMarks = template.cutOffMarks
  if (force || isEmpty(current.totalVacancies)) updates.totalVacancies = template.totalVacancies
  if (force || isEmpty(current.vacancyDetails)) {
    if (!isEmpty(template.vacancyDetails)) updates.vacancyDetails = template.vacancyDetails
  }

  if (template.applicationStatus) updates.applicationStatus = template.applicationStatus

  return updates as Partial<typeof current & { applicationStatus: string }>
}

// ── Check if form already has user content ─────────────────────

export function hasStructuredContent(current: {
  title: string
  excerpt: string
  content: string
  importantDates: Record<string, string>
  applicationFee: Record<string, string>
  eligibility: Record<string, string>
  selectionProcess: string[]
  howToApply: string[]
  faq: { question: string; answer: string }[]
}): boolean {
  const hasKV = (kv: Record<string, string>) =>
    Object.entries(kv).some(([k, v]) => k.trim() !== '' && v.trim() !== '')

  return (
    current.title.trim() !== '' ||
    current.excerpt.trim() !== '' ||
    current.content.trim() !== '' ||
    hasKV(current.importantDates) ||
    hasKV(current.applicationFee) ||
    hasKV(current.eligibility) ||
    current.selectionProcess.some(s => s.trim() !== '') ||
    current.howToApply.some(s => s.trim() !== '') ||
    current.faq.some(f => f.question.trim() !== '' || f.answer.trim() !== '')
  )
}

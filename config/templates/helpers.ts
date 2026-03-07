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
    faq: { question: string; answer: string }[]
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
  if (force || isEmpty(current.faq)) updates.faq = template.faq

  if (template.applicationStatus) updates.applicationStatus = template.applicationStatus

  return updates as Partial<typeof current & { applicationStatus: string }>
}

// ── Check if form already has user content ─────────────────────

export function hasStructuredContent(current: {
  title: string
  excerpt: string
  content: string
  faq: { question: string; answer: string }[]
}): boolean {
  return (
    current.title.trim() !== '' ||
    current.excerpt.trim() !== '' ||
    current.content.trim() !== '' ||
    current.faq.some(f => f.question.trim() !== '' || f.answer.trim() !== '')
  )
}

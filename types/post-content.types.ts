// =============================================================
// post-content.types.ts — Result Guru
// Typed shapes for every JSONB column on the posts table.
// These are the most important types — they drive all frontend
// post-detail rendering.
// =============================================================

// ── Important Dates ────────────────────────────────────────
// Column: posts.important_dates
// Used by: job, exam, admit, result, admission
export interface ImportantDates {
    /** Notification / advt release date — ISO date string */
    notification?: string | null
    apply_start?: string | null
    apply_end?: string | null
    fee_last_date?: string | null
    correction_window?: string | null
    exam_date?: string | null
    /** May be a date range: "15 Jan – 20 Jan 2025" */
    exam_date_display?: string | null
    admit_card?: string | null
    result?: string | null
    interview_date?: string | null
    document_verification?: string | null
    /** Catch-all for post-type specific extra dates */
    extra?: ImportantDateEntry[]
}

export interface ImportantDateEntry {
    label: string
    date: string          // ISO date or display string
    is_important?: boolean
}

// ── Application Fee ────────────────────────────────────────
// Column: posts.application_fee
// Used by: job, exam, admission
export interface ApplicationFee {
    general?: number | null     // INR
    obc?: number | null
    sc?: number | null
    st?: number | null
    ews?: number | null
    female?: number | null
    pwd?: number | null         // Persons with disability
    ex_servicemen?: number | null
    /** ["online","offline","challan"] */
    payment_mode?: string[]
    /** Free-text note about refund policy etc. */
    note?: string | null
}

// ── Vacancy Details ────────────────────────────────────────
// Column: posts.vacancy_details
// Used by: job
export interface VacancyDetails {
    total?: number | null
    posts?: VacancyPost[]
}

export interface VacancyPost {
    name: string                // Post name e.g. "Junior Clerk"
    code?: string | null        // Post code if applicable
    total?: number | null
    general?: number | null
    obc?: number | null
    sc?: number | null
    st?: number | null
    ews?: number | null
    female?: number | null
    pwd?: number | null
    ex_servicemen?: number | null
    department?: string | null
    pay_level?: string | null   // "Level-4 (7th CPC)"
}

// ── Eligibility ────────────────────────────────────────────
// Column: posts.eligibility
// Used by: job, exam, scheme, admission
export interface Eligibility {
    /** Qualification slugs e.g. ["graduation","b-tech"] */
    qualification?: string[]
    age_min?: number | null
    age_max?: number | null
    /** Age relaxation in years by category */
    age_relaxation?: AgeRelaxation
    nationality?: string | null
    /** Any additional eligibility note */
    note?: string | null
    /** Subject / stream requirements */
    subject_requirement?: string | null
    experience?: string | null
}

export interface AgeRelaxation {
    obc?: number
    sc?: number
    st?: number
    ews?: number
    pwd?: number
    ex_servicemen?: number
    women?: number
    [key: string]: number | undefined
}

// ── Selection Process ──────────────────────────────────────
// Column: posts.selection_process
// Shape: string[] (ordered)
// Used by: job, exam
// Example: ["Written Exam","Physical Test","Interview","Medical"]
export type SelectionProcess = string[]

// ── How to Apply ───────────────────────────────────────────
// Column: posts.how_to_apply
// Shape: string[] (ordered steps)
// Used by: job, scheme, admission
// Example: ["Visit official website","Click Apply Online",...]
export type HowToApply = string[]

// ── Pay Scale ──────────────────────────────────────────────
// Column: posts.pay_scale
// Used by: job
export interface PayScale {
    /** e.g. "Level-4 (7th CPC)" */
    level?: string | null
    /** Annual min INR */
    min?: number | null
    /** Annual max INR */
    max?: number | null
    /** Pre-7th CPC grade pay */
    grade_pay?: number | null
    /** Human-readable note e.g. "Plus HRA, DA, TA" */
    note?: string | null
}

// ── Syllabus Sections ──────────────────────────────────────
// Column: posts.syllabus_sections
// Used by: syllabus, exam
export interface SyllabusSection {
    subject: string
    topics: string[]
    marks?: number | null
    questions?: number | null
    duration_min?: number | null
    is_optional?: boolean
    note?: string | null
}

export type SyllabusSections = SyllabusSection[]

// ── Exam Pattern ───────────────────────────────────────────
// Column: posts.exam_pattern_data
// Used by: exam_pattern, exam
export interface ExamPatternStage {
    /** e.g. "Tier I", "Preliminary", "Paper I" */
    stage: string
    /** "online" | "offline" */
    mode?: 'online' | 'offline' | null
    duration_min?: number | null
    total_marks?: number | null
    total_questions?: number | null
    negative_marking?: boolean
    negative_marks_per_question?: number | null
    sections?: ExamPatternSection[]
    qualifying?: boolean         // TRUE = qualifying; marks not counted in merit
    note?: string | null
}

export interface ExamPatternSection {
    name: string
    questions?: number | null
    marks?: number | null
    duration_min?: number | null
}

export type ExamPatternData = ExamPatternStage[]

// ── Previous Year Papers ───────────────────────────────────
// Column: posts.previous_year_papers
// Used by: previous_paper
export interface PreviousYearPaper {
    year: number
    exam: string
    /** External URL to PDF or page */
    url: string
    is_solved: boolean
    language?: string | null
    set?: string | null          // "Set A", "Set B" etc.
}

export type PreviousYearPapers = PreviousYearPaper[]

// ── Preparation Tips ───────────────────────────────────────
// Column: posts.preparation_tips
// Shape: string[] (ordered tips)
// Used by: any post type
export type PreparationTips = string[]

// ── Cut Off Marks ──────────────────────────────────────────
// Column: posts.cut_off_marks
// Used by: cut_off, result
export interface CutOffMarks {
    year?: number | null
    exam?: string | null
    categories?: CutOffByCategory
    post_wise?: PostWiseCutOff[]
    note?: string | null
}

export interface CutOffByCategory {
    general?: number | null
    obc?: number | null
    sc?: number | null
    st?: number | null
    ews?: number | null
    pwd?: number | null
    ex_servicemen?: number | null
    [key: string]: number | null | undefined
}

export interface PostWiseCutOff {
    post_name: string
    categories: CutOffByCategory
}

// ── FAQ ────────────────────────────────────────────────────
// Column: posts.faq
// Used by: any post type
export interface FaqItem {
    q: string   // Question
    a: string   // Answer (may contain HTML)
}

export type Faq = FaqItem[]

// ── Hreflang ──────────────────────────────────────────────
// Column: posts.hreflang
export interface HreflangEntry {
    lang: string    // BCP-47 e.g. "hi-IN", "en-IN"
    url: string
}

export type Hreflang = HreflangEntry[]

// ── Breadcrumb Override ────────────────────────────────────
// Column: posts.breadcrumb_override
export interface BreadcrumbItem {
    label: string
    href: string
}

export type BreadcrumbOverride = BreadcrumbItem[]

// ── Aggregate: all JSONB content columns ──────────────────
// Useful when passing structured content around in one object
export interface PostStructuredContent {
    important_dates: ImportantDates
    application_fee: ApplicationFee
    vacancy_details: VacancyDetails
    eligibility: Eligibility
    selection_process: SelectionProcess
    how_to_apply: HowToApply
    pay_scale: PayScale
    syllabus_sections: SyllabusSections
    exam_pattern_data: ExamPatternData
    previous_year_papers: PreviousYearPapers
    preparation_tips: PreparationTips
    cut_off_marks: CutOffMarks
    faq: Faq
}
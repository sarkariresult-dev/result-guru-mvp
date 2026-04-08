/**
 * Post type configuration - Defines which structured data sections are visible per type.
 */

export interface TypeSections {
    dates: boolean
    eligibility: boolean
    applicationFee: boolean
    vacancyDetails: boolean
    totalVacancies: boolean
    ageLimit: boolean
    payScale: boolean
    selectionProcess: boolean
    howToApply: boolean
    admitCardLink: boolean
    resultLink: boolean
    cutOffMarks: boolean
    syllabus: boolean
    examPattern: boolean
    preparationTips: boolean
    previousPapers: boolean
    faq: boolean
}

export interface TypeConfig {
    label: string
    description: string
    showAppStatus: boolean
    sections: TypeSections
}

export const TYPE_CONFIG: Record<string, TypeConfig> = {
    job: {
        label: 'Job',
        description: 'Government job vacancy with full recruitment details',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: true, vacancyDetails: true, totalVacancies: true, ageLimit: true, payScale: true, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    notification: {
        label: 'Notification',
        description: 'Official notification for recruitment or exam',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: true, vacancyDetails: true, totalVacancies: true, ageLimit: true, payScale: true, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    admission: {
        label: 'Admission',
        description: 'College/university admission notice',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: true, vacancyDetails: false, totalVacancies: false, ageLimit: true, payScale: false, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: true, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    result: {
        label: 'Result',
        description: 'Exam results with cut-off marks',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: true, cutOffMarks: true, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    admit: {
        label: 'Admit Card',
        description: 'Admit card / Hall ticket download',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: true, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    answer_key: {
        label: 'Answer Key',
        description: 'Official/unofficial answer key with objection details',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: true, cutOffMarks: true, syllabus: false, examPattern: false, preparationTips: false, previousPapers: true, faq: true },
    },
    exam: {
        label: 'Exam',
        description: 'Competitive exam overview with pattern and syllabus',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: true, vacancyDetails: false, totalVacancies: false, ageLimit: true, payScale: false, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: true, examPattern: true, preparationTips: true, previousPapers: true, faq: true },
    },
    scheme: {
        label: 'Scheme',
        description: 'Government scheme',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: true, payScale: false, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    syllabus: {
        label: 'Syllabus',
        description: 'Detailed exam syllabus with subject breakdown',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: true, examPattern: true, preparationTips: true, previousPapers: true, faq: true },
    },
    exam_pattern: {
        label: 'Exam Pattern',
        description: 'Paper pattern - marking, duration, question types',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: true, examPattern: true, preparationTips: true, previousPapers: true, faq: true },
    },
    previous_paper: {
        label: 'Previous Paper',
        description: 'Past year question papers with PDF downloads',
        showAppStatus: false,
        sections: { dates: false, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: true, preparationTips: true, previousPapers: true, faq: true },
    },
    cut_off: {
        label: 'Cut Off',
        description: 'Category-wise cut-off marks for exams',
        showAppStatus: false,
        sections: { dates: true, eligibility: false, applicationFee: false, vacancyDetails: false, totalVacancies: false, ageLimit: false, payScale: false, selectionProcess: false, howToApply: false, admitCardLink: false, resultLink: true, cutOffMarks: true, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
    scholarship: {
        label: 'Scholarship',
        description: 'Government central or state scholarship / fellowship',
        showAppStatus: true,
        sections: { dates: true, eligibility: true, applicationFee: true, vacancyDetails: false, totalVacancies: false, ageLimit: true, payScale: false, selectionProcess: true, howToApply: true, admitCardLink: false, resultLink: false, cutOffMarks: false, syllabus: false, examPattern: false, preparationTips: false, previousPapers: false, faq: true },
    },
}

// Map post type → matching tag_types for smart tag suggestions
export const TYPE_TO_TAG_TYPES: Record<string, string[]> = {
    job: ['job'], notification: ['job'], result: ['result'],
    admit: ['admit'], exam: ['exam', 'syllabus', 'exam_pattern'],
    scheme: ['scheme'], admission: ['admission'],
    answer_key: ['answer_key'], syllabus: ['syllabus', 'exam_pattern'],
    exam_pattern: ['exam_pattern', 'syllabus'],
    previous_paper: ['previous_paper', 'exam'],
    cut_off: ['cut_off', 'result'],
    scholarship: ['scholarship', 'admission'],
}

import type { PostTemplate } from './types'
import { y } from './helpers'

const syllabus: PostTemplate = {
  titlePattern: y('[ORG] [POST] Syllabus [YEAR] – Subject-wise Topics'),
  slugPattern: '[org]-[post]-syllabus-[year]',
  excerptPattern: y('[ORG] [POST] [YEAR] complete syllabus with subject-wise topics, marks distribution, and preparation strategy. Download the official syllabus PDF and plan your study schedule.'),
  applicationStatus: 'na',

  seo: {
    metaTitlePattern: y('[ORG] [POST] Syllabus [YEAR] | Complete Topics & PDF'),
    metaDescriptionPattern: y('[ORG] [POST] [YEAR] syllabus — subject-wise topics, marks distribution, high-priority areas & preparation strategy. Download syllabus PDF.'),
    focusKeywordPattern: y('[ORG] [POST] Syllabus [YEAR]'),
    secondaryKeywords: [
      y('[ORG] [POST] syllabus PDF [YEAR]'),
      y('[POST] subject-wise topics [YEAR]'),
      y('[ORG] [POST] preparation strategy'),
    ],
    featuredImageAlt: y('[ORG] [POST] Syllabus [YEAR] – Subject-wise Topics & PDF'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] Syllabus [YEAR] – Complete Guide</h2>
<p>Understanding the syllabus is the first and most important step in your exam preparation journey. The [POST] [YEAR] syllabus covers all subjects and topics from which questions are asked in the examination. Knowing the syllabus helps you create a focused study plan, allocate time effectively, identify high-weightage topics, and avoid wasting time on irrelevant material. The detailed subject-wise syllabus with topic breakdown is provided in the structured sections below.</p>

<h2>Syllabus Overview</h2>
<table>
<thead><tr><th>Detail</th><th>Information</th></tr></thead>
<tbody>
<tr><td>Organization</td><td>[ORG]</td></tr>
<tr><td>Exam Name</td><td>[POST]</td></tr>
<tr><td>Total Subjects</td><td>4 (typically)</td></tr>
<tr><td>Question Type</td><td>Objective MCQ</td></tr>
<tr><td>Negative Marking</td><td>Yes (0.25 per wrong answer)</td></tr>
</tbody>
</table>

<h2>High-Priority Topics (Based on Previous Papers)</h2>
<p>Analysis of the last 5 years of [POST] papers reveals these high-priority topic areas:</p>
<ul>
<li><strong>Reasoning:</strong> Puzzles, Seating Arrangement, Coding-Decoding — together account for 40-50% of the section</li>
<li><strong>Maths:</strong> Arithmetic (Percentage, P&amp;L, SI/CI, Ratio, Average) + DI — combined 60% of section</li>
<li><strong>English:</strong> Reading Comprehension, Error Spotting, Vocabulary — combined 60% of section</li>
<li><strong>GK:</strong> Current Affairs (last 6 months) alone covers 40-50% of GK questions</li>
</ul>

<h2>Preparation Strategy</h2>
<ol>
<li>Read the syllabus thoroughly and create a study timetable covering all subjects</li>
<li>Start with NCERT books (Class 6-10) for basics in Maths, Science, History, and Geography</li>
<li>Move to subject-specific books after building the foundation</li>
<li>Practice topic-wise questions first, then attempt full-length mock tests</li>
<li>Solve at least 5-7 previous year papers under timed conditions</li>
<li>Read daily current affairs (newspapers + monthly magazine compilation)</li>
<li>Revise short notes and formula sheets weekly</li>
<li>In the last month, focus purely on revision and mock test analysis</li>
</ol>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Download Syllabus PDF</td><td>Link will be updated</td></tr>
<tr><td>Exam Pattern &amp; Paper Structure</td><td>–</td></tr>
<tr><td>Previous Year Papers</td><td>–</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Notification Date': '',
    'Application Deadline': '',
    'Exam Date': '',
  },
  applicationFee: {},
  vacancyDetails: {},
  eligibility: {},
  ageLimit: {},
  payScale: {},
  selectionProcess: [],
  howToApply: [],
  faq: [
    { question: y('Has [POST] [YEAR] syllabus changed from last year?'), answer: 'Check the official notification for any syllabus changes. Major changes are usually highlighted in the notification. This page reflects the latest syllabus.' },
    { question: y('Where can I download [POST] [YEAR] syllabus PDF?'), answer: 'Click the "Download Syllabus PDF" link in the Important Links section above to get the official syllabus document.' },
    { question: 'Which books are recommended for preparation?', answer: 'Start with NCERT books for basics. For advanced preparation, use subject-specific books recommended by toppers and coaching guides.' },
    { question: 'How many months should I prepare for this exam?', answer: 'A focused preparation of 4-6 months is generally recommended, covering all subjects with regular mock tests.' },
  ],
  syllabusSections: [
    { subject: 'General Intelligence & Reasoning', topics: ['Analogies', 'Classification', 'Series', 'Coding-Decoding', 'Puzzle', 'Syllogism', 'Blood Relations', 'Direction Sense', 'Venn Diagrams', 'Matrix'], marks: null },
    { subject: 'Quantitative Aptitude', topics: ['Number System', 'Arithmetic', 'Algebra', 'Geometry', 'Mensuration', 'Trigonometry', 'Data Interpretation', 'Statistics'], marks: null },
    { subject: 'English Language', topics: ['Reading Comprehension', 'Cloze Test', 'Error Detection', 'Sentence Improvement', 'Idioms & Phrases', 'Synonyms & Antonyms', 'One Word Substitution', 'Active/Passive Voice'], marks: null },
    { subject: 'General Awareness', topics: ['Current Affairs', 'Indian History', 'Indian Geography', 'Indian Polity', 'Indian Economy', 'General Science', 'Computer Awareness', 'Static GK'], marks: null },
  ],
  examPatternData: [],
  previousYearPapers: [],
  preparationTips: [
    'Start with the official syllabus — map every topic and check off as you complete it',
    'Use NCERT books (Class 6-10) for building a strong foundation',
    'Practice previous year papers to understand question patterns',
    'Focus on high-weightage topics identified from previous year papers',
    'Revise formulas and shortcuts weekly for Maths and Reasoning',
    'Attempt sectional tests to identify and improve weak areas',
  ],
  cutOffMarks: {},
  totalVacancies: '',
}

export default syllabus

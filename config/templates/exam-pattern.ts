import type { PostTemplate } from './types'
import { y } from './helpers'

const examPattern: PostTemplate = {
  titlePattern: y('[ORG] [POST] Exam Pattern [YEAR] – Paper Structure'),
  slugPattern: '[org]-[post]-exam-pattern-[year]',
  excerptPattern: y('[ORG] [POST] [YEAR] exam pattern with detailed paper structure, marking scheme, question types, and negative marking rules. Plan your exam strategy effectively.'),
  applicationStatus: 'na',

  seo: {
    metaTitlePattern: y('[ORG] [POST] Exam Pattern [YEAR] | Paper Structure'),
    metaDescriptionPattern: y('[ORG] [POST] [YEAR] exam pattern — paper structure, total marks, duration, question types, negative marking & stage-wise breakdown explained.'),
    focusKeywordPattern: y('[ORG] [POST] Exam Pattern [YEAR]'),
    secondaryKeywords: [
      y('[ORG] [POST] marking scheme [YEAR]'),
      y('[POST] paper structure [YEAR]'),
      y('[ORG] [POST] negative marking rules'),
    ],
    featuredImageAlt: y('[ORG] [POST] Exam Pattern [YEAR] – Paper Structure & Marking'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] Exam Pattern [YEAR] – Detailed Guide</h2>
<p>Understanding the exam pattern is crucial for effective preparation. The [POST] [YEAR] exam follows a structured pattern with defined stages, marking scheme, and time limits. Knowing the pattern helps you allocate time between sections, decide when to guess and when to skip, and build a strategy that maximizes your score. The detailed stage-wise paper structure is provided in the sections below.</p>

<h2>Exam Pattern Overview</h2>
<table>
<thead><tr><th>Detail</th><th>Information</th></tr></thead>
<tbody>
<tr><td>Organization</td><td>[ORG]</td></tr>
<tr><td>Exam Name</td><td>[POST]</td></tr>
<tr><td>Total Stages</td><td>3-4 (varies by post)</td></tr>
<tr><td>Question Type</td><td>Objective MCQ + Descriptive (if applicable)</td></tr>
<tr><td>Negative Marking</td><td>Yes</td></tr>
<tr><td>Mode</td><td>Online CBT</td></tr>
</tbody>
</table>

<h2>Marking Scheme</h2>
<ul>
<li><strong>Correct Answer:</strong> +2 marks (or as specified per paper)</li>
<li><strong>Wrong Answer:</strong> − negative marks (typically 0.25 or 0.50 per wrong answer)</li>
<li><strong>Unattempted:</strong> 0 marks — no penalty for questions left blank</li>
</ul>
<p><strong>Strategy Tip:</strong> If you are unsure about an answer, eliminate 2 out of 4 options first. If you can confidently eliminate 2 wrong options, it is statistically better to guess from the remaining 2 options even with negative marking.</p>

<h2>Time Management Strategy</h2>
<p>Many candidates who know the syllabus well still fail to clear the exam due to poor time management. Here are proven techniques:</p>
<ol>
<li>Practice with a strict timer — simulate exam conditions during mock tests</li>
<li>Attempt your strongest section first to build confidence and secure easy marks</li>
<li>Never spend more than 1.5 minutes on a single question in the first pass</li>
<li>In the second pass, attempt marked/skipped questions with educated guesses</li>
<li>Reserve the last 5-10 minutes for review — check for bubbling errors or obvious mistakes</li>
</ol>

<h2>Key Changes From Previous Year (If Any)</h2>
<p>Candidates should be aware of any changes in the exam pattern compared to previous years. Common changes include:</p>
<ul>
<li>Number of questions per section or total questions in the paper</li>
<li>Introduction or removal of sectional time limits</li>
<li>Changes in negative marking percentage or formula</li>
<li>Addition of new sections or merger of existing sections</li>
<li>Change in exam mode (offline to online or vice versa)</li>
<li>Introduction of normalization in multi-shift exams</li>
</ul>
<p>Always verify the pattern from the official notification as [ORG] reserves the right to modify the exam structure.</p>

<h2>Attempt Strategy by Stage</h2>
<ul>
<li><strong>Tier-I (Screening):</strong> Focus on speed — this stage is about qualifying, not topping. Attempt maximum questions with reasonable accuracy (75-80% accuracy is ideal)</li>
<li><strong>Tier-II (Mains):</strong> Focus on accuracy — this stage determines your final rank. Spend more time on each question and avoid blind guessing</li>
<li><strong>Descriptive Paper:</strong> Practice essay and letter writing with proper structure. Focus on grammar, coherence, and word limit</li>
<li><strong>Skill Test:</strong> Practice typing speed (35 WPM English / 30 WPM Hindi for most posts). This is qualifying in nature</li>
</ul>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Official Notification (Exam Pattern)</td><td>Link will be updated</td></tr>
<tr><td>Syllabus PDF</td><td>–</td></tr>
<tr><td>Previous Year Papers</td><td>–</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Exam Date (Tier-I)': '',
    'Exam Date (Tier-II)': '',
    'Skill Test Date': '',
  },
  applicationFee: {},
  vacancyDetails: {},
  eligibility: {},
  ageLimit: {},
  payScale: {},
  selectionProcess: [],
  howToApply: [],
  faq: [
    { question: y('What is the exam pattern for [POST] [YEAR]?'), answer: 'The complete paper structure with questions, marks, and duration for each stage is provided in the Exam Pattern sections above.' },
    { question: y('Is there negative marking in [POST] [YEAR]?'), answer: 'Yes, there is negative marking. Typically 0.25 or 0.50 marks are deducted for each wrong answer. Check the Marking Scheme section for exact details.' },
    { question: 'Is there sectional cut off?', answer: 'Check the notification carefully. Some exams have overall cut off only, while others have both sectional and overall limits.' },
    { question: 'Are there sectional time limits?', answer: 'This varies by exam and stage. Some papers have combined time for all sections, while others enforce sectional time limits. Check the official pattern.' },
  ],
  syllabusSections: [],
  examPatternData: [
    { paper: 'Tier-I / Prelims', questions: null, marks: null, duration: '', type: 'Objective MCQ' },
    { paper: 'Tier-II / Mains (Paper-I)', questions: null, marks: null, duration: '', type: 'Objective MCQ' },
    { paper: 'Tier-II / Mains (Paper-II)', questions: null, marks: null, duration: '', type: 'Objective MCQ' },
    { paper: 'Tier-III / Descriptive', questions: null, marks: null, duration: '', type: 'Descriptive' },
    { paper: 'Skill Test / Typing', questions: null, marks: null, duration: '', type: 'Practical' },
  ],
  previousYearPapers: [],
  preparationTips: [],
  cutOffMarks: {},
  totalVacancies: '',
}

export default examPattern

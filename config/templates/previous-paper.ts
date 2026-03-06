import type { PostTemplate } from './types'
import { y } from './helpers'

const previousPaper: PostTemplate = {
  titlePattern: y('[ORG] [POST] Previous Year Papers – PDF Download'),
  slugPattern: '[org]-[post]-previous-year-papers',
  excerptPattern: y('[ORG] [POST] previous year question papers with solutions available for free PDF download. Practice papers from the last 5 years to understand exam pattern and boost your preparation.'),
  applicationStatus: 'na',

  seo: {
    metaTitlePattern: y('[ORG] [POST] Previous Year Papers | Free PDF Download'),
    metaDescriptionPattern: y('[ORG] [POST] previous year question papers PDF download. Last 5 years shift-wise papers with solutions for effective exam preparation.'),
    focusKeywordPattern: y('[ORG] [POST] Previous Year Papers'),
    secondaryKeywords: [
      y('[ORG] [POST] question papers PDF'),
      y('[POST] previous papers with solutions'),
      y('[ORG] [POST] old papers download'),
    ],
    featuredImageAlt: y('[ORG] [POST] Previous Year Papers – Download PDF'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] Previous Year Question Papers – Complete Collection</h2>
<p>Practicing previous year question papers is one of the most effective preparation strategies for any competitive exam. These papers give you a real understanding of the question pattern, difficulty level, frequently asked topics, and time required per section. Download the year-wise and shift-wise papers from the sections below and practice them under timed conditions.</p>

<h2>Why Practice Previous Year Papers?</h2>
<ul>
<li><strong>Understand exam pattern:</strong> Know the exact format, number of questions, type of questions, and marking scheme from real papers</li>
<li><strong>Identify high-weightage topics:</strong> Topics that appear repeatedly across multiple years are likely to appear again</li>
<li><strong>Time management practice:</strong> Attempt papers under timed conditions to build speed and efficiency</li>
<li><strong>Build exam confidence:</strong> Familiarity with the question format reduces anxiety and improves performance on exam day</li>
<li><strong>Self-assessment:</strong> Compare your scores across papers to track progress and identify areas that need improvement</li>
</ul>

<h2>How to Use Previous Year Papers Effectively</h2>
<ol>
<li><strong>Start after completing the syllabus:</strong> Solve papers only after you have covered at least 70-80% of the syllabus so you can attempt most questions</li>
<li><strong>Simulate real exam conditions:</strong> Set a timer, sit at a desk, avoid distractions, and attempt the full paper in one sitting</li>
<li><strong>Analyze every paper:</strong> After solving, calculate your score and review every wrong answer. Note down the topics you struggled with</li>
<li><strong>Track your progress:</strong> Maintain a score sheet across papers. Your scores should show an upward trend over time</li>
<li><strong>Revise mistakes:</strong> Create an "error log" with commonly repeated mistakes. Review this log before each new paper attempt</li>
<li><strong>Attempt in order:</strong> Start with the oldest paper and work towards the most recent for a natural progression</li>
</ol>

<h2>Topic Frequency Analysis (Last 5 Years)</h2>
<table>
<thead><tr><th>Topic Area</th><th>Questions Per Paper (Approx.)</th><th>Priority</th></tr></thead>
<tbody>
<tr><td>Current Affairs &amp; GK</td><td>15-20</td><td>High</td></tr>
<tr><td>Arithmetic (Percentage, P&amp;L, SI/CI)</td><td>8-12</td><td>High</td></tr>
<tr><td>Geometry &amp; Mensuration</td><td>5-8</td><td>High</td></tr>
<tr><td>Reading Comprehension</td><td>5-10</td><td>High</td></tr>
<tr><td>Coding &amp; Puzzles</td><td>5-8</td><td>High</td></tr>
<tr><td>Data Interpretation</td><td>5-8</td><td>Medium</td></tr>
<tr><td>Grammar (Error/Improvement)</td><td>5-8</td><td>Medium</td></tr>
<tr><td>Vocabulary</td><td>3-5</td><td>Medium</td></tr>
<tr><td>Static GK</td><td>5-8</td><td>Medium</td></tr>
</tbody>
</table>

<h2>Common Mistakes While Practicing Papers</h2>
<ul>
<li><strong>Not timing yourself:</strong> Practicing without a timer gives a false sense of preparedness. Always use a stopwatch</li>
<li><strong>Ignoring the analysis:</strong> The real value is in the post-paper analysis, not just the score. Spend 30-60 minutes analyzing each paper</li>
<li><strong>Solving only recent papers:</strong> Older papers might cover topics that are being asked again after a gap. Solve at least 3-5 years of papers</li>
<li><strong>Skipping difficult papers:</strong> If a paper is hard, that is exactly the one you need to practice more. Easy papers don't expose weaknesses</li>
</ul>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Download All Papers (ZIP)</td><td>Link will be updated</td></tr>
<tr><td>Syllabus &amp; Exam Pattern</td><td>–</td></tr>
<tr><td>Mock Tests</td><td>–</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Exam Date': '',
    'Answer Key Release': '',
    'Papers Available From': '',
  },
  applicationFee: {},
  vacancyDetails: {},
  eligibility: {},
  ageLimit: {},
  payScale: {},
  selectionProcess: [],
  howToApply: [],
  faq: [
    { question: y('Where can I download [POST] previous year papers?'), answer: 'Year-wise and shift-wise papers are available in the Previous Year Papers section above. Click the PDF links to download.' },
    { question: 'Are solutions included with the papers?', answer: 'Where available, answer keys are provided. You can also use the official answer key to verify your answers after solving a paper.' },
    { question: 'Can I use these papers for mock tests?', answer: 'Yes. Solve each paper under timed conditions to simulate the real exam experience and track your improvement.' },
    { question: 'How many papers should I solve?', answer: 'Solve at least 10-15 papers from the last 3-5 years. More is better, as each paper exposes new patterns and question types.' },
  ],
  syllabusSections: [],
  examPatternData: [],
  previousYearPapers: [
    { year: y('[YEAR]'), title: y('[POST] [YEAR] – Shift 1'), pdf_url: '' },
    { year: y('[YEAR]'), title: y('[POST] [YEAR] – Shift 2'), pdf_url: '' },
    { year: (parseInt(y('[YEAR]')) - 1).toString(), title: y('[POST] ' + (parseInt(y('[YEAR]')) - 1).toString() + ' – Shift 1'), pdf_url: '' },
    { year: (parseInt(y('[YEAR]')) - 1).toString(), title: y('[POST] ' + (parseInt(y('[YEAR]')) - 1).toString() + ' – Shift 2'), pdf_url: '' },
  ],
  preparationTips: [
    'Solve at least 10-15 full papers before the exam',
    'Always practice under timed, exam-like conditions',
    'Analyze mistakes after each paper — create an error log',
    'Practice at least 10-15 full papers before the exam',
    'Revise weak areas immediately after identifying them through paper analysis',
  ],
  cutOffMarks: {},
  totalVacancies: '',
}

export default previousPaper

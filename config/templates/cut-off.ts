import type { PostTemplate } from './types'
import { y } from './helpers'

const cutOff: PostTemplate = {
  titlePattern: y('[ORG] [POST] Cut Off [YEAR] – Category-wise Marks'),
  slugPattern: '[org]-[post]-cut-off-[year]',
  excerptPattern: y('[ORG] [POST] [YEAR] cut off marks released. Check category-wise qualifying marks (General, OBC, SC, ST, EWS, PwBD), previous year comparison, and what to do next.'),
  applicationStatus: 'na',

  seo: {
    metaTitlePattern: y('[ORG] [POST] Cut Off [YEAR] | Category-wise Marks'),
    metaDescriptionPattern: y('[ORG] [POST] [YEAR] cut off marks declared. Check expected & official category-wise cut off, previous year comparison & qualifying criteria.'),
    focusKeywordPattern: y('[ORG] [POST] Cut Off [YEAR]'),
    secondaryKeywords: [
      y('[ORG] [POST] expected cut off [YEAR]'),
      y('[POST] category-wise cut off [YEAR]'),
      y('[ORG] [POST] category-wise cut off'),
    ],
    featuredImageAlt: y('[ORG] [POST] Cut Off [YEAR] – Category-wise Qualifying Marks'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] Cut Off [YEAR] – Complete Analysis</h2>
<p>[ORG] has released the official cut off marks for [POST] [YEAR]. The cut off is the minimum qualifying score that candidates must achieve to be eligible for the next stage of the selection process. Cut off marks vary by category and are determined by factors including the difficulty level of the paper, total number of candidates, and the number of available vacancies. This page provides a complete analysis of the current year's cut off along with a comparison of previous years.</p>

<h2>Factors That Determine the Cut Off</h2>
<ul>
<li><strong>Difficulty Level:</strong> Harder papers generally result in lower cut offs across all categories</li>
<li><strong>Number of Candidates:</strong> Higher competition leads to higher cut off marks</li>
<li><strong>Available Vacancies:</strong> More vacancies typically mean a relatively lower cut off</li>
<li><strong>Answer Key Changes:</strong> If questions are dropped or answers are changed, cut off marks may shift</li>
<li><strong>Normalization:</strong> For multi-shift exams, normalized scores are used which can affect cut offs</li>
<li><strong>Previous Year Trends:</strong> Historical data provides insight into the general range of cut off marks</li>
</ul>

<h2>Previous Year Cut Off Comparison</h2>
<p>Understanding the trend of cut off marks over the past few years helps candidates set realistic targets and gauge their chances. Below is a comparison:</p>
<table>
<thead><tr><th>Category</th><th>[YEAR] (Current)</th><th>Previous Year</th></tr></thead>
<tbody>
<tr><td>General</td><td>–</td><td>–</td></tr>
<tr><td>OBC</td><td>–</td><td>–</td></tr>
<tr><td>SC</td><td>–</td><td>–</td></tr>
<tr><td>ST</td><td>–</td><td>–</td></tr>
<tr><td>EWS</td><td>–</td><td>–</td></tr>
<tr><td>PwBD</td><td>–</td><td>–</td></tr>
</tbody>
</table>

<h2>How to Check If You Qualified</h2>
<ol>
<li>Calculate your estimated raw score using the official answer key (account for negative marking)</li>
<li>If normalization applies, note that your final score may differ from raw marks</li>
<li>Compare your estimated score with the cut off for your category</li>
<li>If your score is equal to or above the cut off for your category, you have qualified</li>
<li>For borderline cases, wait for the official result — cut offs sometimes change due to answer key objections</li>
</ol>

<h2>Tie-breaking Rules</h2>
<p>When two or more candidates score the same total marks, [ORG] uses tie-breaking criteria to determine the order of merit. The standard tie-breaking rules used by most government exams are:</p>
<ol>
<li>Candidate with higher marks in a specific section (usually the subject-specific paper) is ranked higher</li>
<li>If still tied, the candidate with fewer negative marks (i.e., fewer wrong attempts) is ranked higher</li>
<li>If still tied, the older candidate (earlier date of birth) is placed higher in the merit list</li>
<li>In rare cases, alphabetical order of names may be used as the final tiebreaker</li>
</ol>

<h2>What to Do Next</h2>
<ul>
<li>If you scored above the cut off — prepare for the next stage (Tier-II / Skill Test / DV)</li>
<li>If you scored below the cut off — start preparing for the next cycle and focus on weak areas</li>
<li>Download your scorecard from the official website once the result is declared</li>
<li>Bookmark this page for updates on the next stage schedule and final result</li>
</ul>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Official Cut Off PDF</td><td>Link will be updated</td></tr>
<tr><td>Check Result / Scorecard</td><td>Link will be updated</td></tr>
<tr><td>Previous Year Cut Off</td><td>Link will be updated</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Exam Date': '',
    'Answer Key Release': '',
    'Cut Off Release Date': '',
    'Result Date': '',
  },
  applicationFee: {},
  vacancyDetails: {},
  eligibility: {},
  ageLimit: {},
  payScale: {},
  selectionProcess: [],
  howToApply: [],
  faq: [
    { question: y('What is the [POST] [YEAR] cut off for General category?'), answer: 'The category-wise cut off marks are listed in the Cut Off section above. The exact marks depend on difficulty level and competition.' },
    { question: 'Is the cut off based on raw or normalized marks?', answer: 'For multi-shift exams, cut off is based on normalized marks. For single-shift exams, raw marks are used.' },
    { question: y('When will the [POST] [YEAR] official cut off be released?'), answer: 'The official cut off is usually released along with the result. Expected cut off provides an early estimate based on analysis.' },
    { question: 'What happens if I score exactly equal to the cut off?', answer: 'You are considered qualified. Tie-breaking rules (explained above) determine your position relative to others with the same score.' },
  ],
  syllabusSections: [],
  examPatternData: [],
  previousYearPapers: [],
  preparationTips: [],
  cutOffMarks: {
    'General': '',
    'OBC': '',
    'SC': '',
    'ST': '',
    'EWS': '',
    'PwBD': '',
    'Ex-Servicemen': '',
  },
  totalVacancies: '',
}

export default cutOff

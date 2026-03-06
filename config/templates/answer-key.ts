import type { PostTemplate } from './types'
import { y } from './helpers'

const answerKey: PostTemplate = {
  titlePattern: y('[ORG] [POST] Answer Key [YEAR] – Download PDF'),
  slugPattern: '[org]-[post]-answer-key-[year]',
  excerptPattern: y('[ORG] has released the [POST] [YEAR] answer key. Download the provisional/final answer key PDF, check your response sheet, and submit objections if needed. Direct links provided below.'),
  applicationStatus: 'na',

  seo: {
    metaTitlePattern: y('[ORG] [POST] Answer Key [YEAR] | PDF Download'),
    metaDescriptionPattern: y('[ORG] [POST] [YEAR] answer key released. Download PDF, check response sheet & submit objections. Direct download and objection links inside.'),
    focusKeywordPattern: y('[ORG] [POST] Answer Key [YEAR]'),
    secondaryKeywords: [
      y('[ORG] [POST] answer key PDF [YEAR]'),
      y('[POST] response sheet [YEAR]'),
      y('[ORG] [POST] objection form'),
    ],
    featuredImageAlt: y('[ORG] [POST] Answer Key [YEAR] – PDF Download'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] Answer Key [YEAR] – Complete Details</h2>
<p>[ORG] has released the answer key for [POST] [YEAR] examination. Candidates who appeared for the exam can now view the correct answers for all questions and compare them with their responses. The answer key helps candidates estimate their score and assess their chances of qualifying for the next stage. Both the provisional and final answer keys will be made available through the official portal.</p>

<h2>Answer Key Details</h2>
<table>
<thead><tr><th>Detail</th><th>Information</th></tr></thead>
<tbody>
<tr><td>Organization</td><td>[ORG]</td></tr>
<tr><td>Exam Name</td><td>[POST]</td></tr>
<tr><td>Answer Key Status</td><td>Provisional / Final</td></tr>
<tr><td>Objection Window</td><td>–</td></tr>
<tr><td>Result Date (Expected)</td><td>–</td></tr>
</tbody>
</table>

<h2>How to Download Answer Key &amp; Response Sheet</h2>
<ol>
<li>Visit the official website of [ORG] — link is provided in the Important Links section below</li>
<li>Navigate to the "Answer Key" or "Candidate Login" section on the homepage</li>
<li>Click on "[POST] [YEAR] Answer Key Download" link</li>
<li>Log in using your Registration Number / Roll Number and Password / Date of Birth</li>
<li>Your recorded response sheet will be displayed with the question paper</li>
<li>Click "View Answer Key" to see the official answers for all questions</li>
<li>Download both the answer key and response sheet as PDF for comparison</li>
<li>Calculate your estimated score using the marking scheme provided</li>
</ol>

<h2>Provisional vs. Final Answer Key</h2>
<h3>Provisional Answer Key</h3>
<p>The provisional answer key is the first version released by [ORG]. Candidates can review the answers and raise objections if they believe any answer is incorrect. Objections must be supported with valid proof such as textbook references, official sources, or published research papers. A fee per objection is usually charged, which is refunded if the objection is upheld.</p>

<h3>Final Answer Key</h3>
<p>After evaluating all objections, [ORG] releases the final answer key. The final answer key is used for preparing the result and merit list. No further objections are accepted after the final answer key is published. If any question is found incorrect or has multiple correct answers, marks may be awarded to all candidates or the question may be dropped from evaluation.</p>

<h2>How to Submit Objection Against the Answer Key</h2>
<ol>
<li>Log in to the official answer key portal using your credentials</li>
<li>View the provisional answer key alongside your response sheet</li>
<li>Click on "Submit Objection" or "Challenge Answer Key" link</li>
<li>Select the question number and provide proof for your objection</li>
<li>Upload supporting documents (textbook scans, official references)</li>
<li>Pay the objection fee per question (usually ₹100-200 — refundable if upheld)</li>
<li>Submit and save the receipt — do this before the deadline</li>
</ol>

<h2>Common Reasons for Objection</h2>
<ul>
<li><strong>Incorrect answer marked:</strong> The official answer doesn't match established facts or standard references</li>
<li><strong>Multiple correct answers:</strong> More than one option is technically correct based on the question framing</li>
<li><strong>Ambiguous question:</strong> The question can be interpreted in multiple valid ways</li>
<li><strong>Out of syllabus:</strong> The question falls outside the prescribed syllabus for the exam</li>
<li><strong>Wrong subject tag:</strong> Question appears in the wrong section, affecting sectional scoring</li>
</ul>

<h2>What Happens After the Final Answer Key</h2>
<p>Once the final answer key is published, [ORG] begins the result preparation process. Scores are calculated based on the final answer key with normalization applied for multi-shift exams. The result is typically declared within 2-4 weeks after the final answer key. Candidates should download their response sheet and answer key PDF for their records.</p>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Download Answer Key PDF</td><td>Link will be updated</td></tr>
<tr><td>View Response Sheet</td><td>Link will be updated</td></tr>
<tr><td>Submit Objection</td><td>Link will be updated</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Exam Date': '',
    'Answer Key Release Date': '',
    'Objection Submission Deadline': '',
    'Final Answer Key Date': '',
    'Result Declaration (Expected)': '',
  },
  applicationFee: {},
  vacancyDetails: {},
  eligibility: {},
  ageLimit: {},
  payScale: {},
  selectionProcess: [],
  howToApply: [],
  faq: [
    { question: y('How to download [POST] [YEAR] answer key?'), answer: 'Visit the official website and log in with your credentials. Click the Answer Key link to download the PDF and view your response sheet.' },
    { question: 'How to submit objection against the answer key?', answer: 'Log in to the portal, select the question you want to challenge, upload supporting proof, pay the objection fee, and submit before the deadline.' },
    { question: 'Is the objection fee refundable?', answer: 'Yes, the objection fee is refunded if your objection is upheld and the answer is changed in the final answer key.' },
    { question: y('When will the [POST] [YEAR] final answer key be released?'), answer: 'The final answer key is usually released 2-3 weeks after the provisional answer key, once all objections are reviewed.' },
    { question: 'What if my answer matches the provisional key but changes in the final key?', answer: 'Your score will be calculated based on the final answer key only. Changes may increase or decrease your marks.' },
  ],
  syllabusSections: [],
  examPatternData: [],
  previousYearPapers: [],
  preparationTips: [],
  cutOffMarks: {},
  totalVacancies: '',
}

export default answerKey

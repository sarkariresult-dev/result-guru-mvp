import type { PostTemplate } from './types'
import { y } from './helpers'

const exam: PostTemplate = {
  titlePattern: y('[ORG] [POST] [YEAR] – Eligibility, Syllabus &amp; Apply'),
  slugPattern: '[org]-[post]-[year]-complete-guide',
  excerptPattern: y('[ORG] [POST] [YEAR] complete exam guide. Check eligibility, syllabus, exam pattern, application process, selection stages, salary, and preparation strategy.'),
  applicationStatus: 'upcoming',

  seo: {
    metaTitlePattern: y('[ORG] [POST] [YEAR] | Complete Exam Guide'),
    metaDescriptionPattern: y('[ORG] [POST] [YEAR] — eligibility, vacancy, syllabus, exam pattern, selection process, salary & how to apply. Your one-stop guide for this exam.'),
    focusKeywordPattern: y('[ORG] [POST] [YEAR]'),
    secondaryKeywords: [
      y('[ORG] [POST] eligibility [YEAR]'),
      y('[POST] syllabus exam pattern [YEAR]'),
      y('[ORG] [POST] how to apply'),
    ],
    featuredImageAlt: y('[ORG] [POST] [YEAR] – Complete Exam Guide'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] [YEAR] – Everything You Need to Know</h2>
<p>[ORG] conducts the [POST] examination every year to recruit candidates for various Group B and Group C posts across government departments. This is one of the most sought-after competitive exams in India, attracting lakhs of aspirants. This comprehensive guide covers everything from eligibility and syllabus to exam pattern, preparation strategy, and career prospects — helping you plan your journey from application to appointment.</p>

<h2>Exam Overview</h2>
<table>
<thead><tr><th>Detail</th><th>Information</th></tr></thead>
<tbody>
<tr><td>Conducting Body</td><td>[ORG]</td></tr>
<tr><td>Exam Name</td><td>[POST]</td></tr>
<tr><td>Exam Level</td><td>National</td></tr>
<tr><td>Exam Frequency</td><td>Annual</td></tr>
<tr><td>Exam Mode</td><td>Online CBT</td></tr>
<tr><td>Duration</td><td>–</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>

<h2>Eligibility Criteria</h2>
<h3>Educational Qualification</h3>
<p>Candidates must possess the minimum educational qualification prescribed for the post they are applying for. The specific requirements vary by post — some require a Bachelor's degree, while others may accept 12th pass or require professional qualifications. Refer to the official notification for the exact post-wise educational requirements. Candidates in the final year of their qualifying exam may also apply provisionally.</p>

<h3>Nationality</h3>
<p>A candidate must be a citizen of India. In certain cases, citizens of Nepal, Bhutan, or Tibetan refugees who came to India before 01-01-1962 may also be eligible, subject to a certificate of eligibility issued by the Government of India.</p>

<h2>Salary &amp; Career Growth</h2>
<p>Selected candidates will receive salary as per the 7th CPC (Central Pay Commission) or the applicable state pay structure. The in-hand salary depends on the pay level, place of posting, and applicable allowances. Career progression through departmental exams, annual increments, and promotion avenues makes this a highly rewarding career option. Additional benefits include pension (NPS), LTC, medical facilities, and housing allowance.</p>

<h2>Preparation Strategy</h2>
<p>Preparing for [POST] requires a systematic and consistent approach. Here are proven strategies used by toppers:</p>
<ol>
<li>Start with the official syllabus — map every topic and prioritize based on weightage from previous years</li>
<li>Build your foundation with NCERT books (Class 6-10 for basics, Class 11-12 for advanced topics)</li>
<li>Solve at least 5 years of previous year papers under timed conditions</li>
<li>Take 15-20 full-length mock tests with thorough analysis of each attempt</li>
<li>Read daily current affairs for 30 minutes from a reliable source</li>
<li>Revise formulas, facts, and key concepts weekly — make short notes for last-minute revision</li>
<li>Focus on speed and accuracy — practice sectional tests with a timer</li>
</ol>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Apply Online</td><td>Link will be updated</td></tr>
<tr><td>Notification PDF</td><td>Link will be updated</td></tr>
<tr><td>Syllabus (Detailed)</td><td>–</td></tr>
<tr><td>Exam Pattern</td><td>–</td></tr>
<tr><td>Previous Year Papers</td><td>–</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Notification Date': '',
    'Online Registration Start': '',
    'Last Date to Apply': '',
    'Fee Payment Deadline': '',
    'Correction Window': '',
    'Admit Card Release': '',
    'Tier-I Exam Date': '',
    'Tier-II Exam Date': '',
    'Result Date (Expected)': '',
  },
  applicationFee: {
    'General / OBC / EWS': '',
    'SC / ST': '',
    'Female (All Categories)': '',
    'PwD': 'Exempted',
    'Payment Mode': 'Online (Net Banking / UPI / Debit Card)',
  },
  vacancyDetails: {},
  eligibility: {
    'Educational Qualification': '',
    'Minimum Qualification': '',
    'Nationality': 'Indian',
  },
  ageLimit: {
    'Minimum Age': '18 years',
    'Maximum Age (General)': '',
    'OBC Relaxation': '3 years',
    'SC/ST Relaxation': '5 years',
    'PwD Relaxation': '10 years',
    'Ex-Servicemen': 'As per govt rules',
  },
  payScale: {
    'Pay Level': '',
    'Pay Band': '',
    'Grade Pay': '',
    'Gross Salary (Approx.)': '',
  },
  selectionProcess: [
    'Tier-I: CBT (Screening)',
    'Tier-II: CBT (Detailed)',
    'Tier-III: Descriptive Paper (if applicable)',
    'Skill Test / Typing Test (qualifying)',
    'Document Verification',
    'Medical Examination',
  ],
  howToApply: [
    'Visit the official website of [ORG]',
    'Click "New Registration" and create your account',
    'Fill the application form with correct personal and educational details',
    'Upload photograph and signature as per specifications',
    'Pay the application fee via online mode (Net Banking / UPI / Card)',
    'Preview all details — verify accuracy before final submission',
    'Click "Submit" and download the confirmation page',
  ],
  faq: [
    { question: y('What is the eligibility for [POST] [YEAR]?'), answer: 'Eligibility varies by post — check the Eligibility section above for qualification, age, and nationality requirements.' },
    { question: y('How many vacancies are there in [POST] [YEAR]?'), answer: 'The total vacancy count is updated once the official notification is released. Check the Recruitment Highlights table above.' },
    { question: y('What is the [POST] [YEAR] syllabus?'), answer: 'The subject-wise syllabus is listed in the Syllabus section. Click the Syllabus link in Important Links for the detailed PDF.' },
    { question: y('When is the [POST] [YEAR] exam date?'), answer: 'The tentative exam date will be announced in the notification. Check the Important Dates section above for updates.' },
  ],
  syllabusSections: [
    { subject: 'General Intelligence & Reasoning', topics: ['Series', 'Coding-Decoding', 'Puzzles', 'Syllogism', 'Blood Relations', 'Direction Sense'], marks: null },
    { subject: 'Quantitative Aptitude', topics: ['Arithmetic', 'Algebra', 'Geometry', 'Trigonometry', 'Data Interpretation', 'Statistics'], marks: null },
    { subject: 'English Language', topics: ['Reading Comprehension', 'Cloze Test', 'Error Detection', 'Sentence Improvement', 'Vocabulary'], marks: null },
    { subject: 'General Awareness', topics: ['Current Affairs', 'History', 'Geography', 'Polity', 'Economy', 'Science', 'Computer'], marks: null },
  ],
  examPatternData: [
    { paper: 'Tier-I', questions: null, marks: null, duration: '', type: 'Objective MCQ' },
    { paper: 'Tier-II', questions: null, marks: null, duration: '', type: 'Objective MCQ' },
  ],
  previousYearPapers: [],
  preparationTips: [
    'Start with NCERT books for building strong basics',
    'Solve previous year papers to understand question patterns',
    'Take sectional mock tests weekly and full-length tests bi-weekly',
    'Read daily current affairs for 30 minutes',
    'Revise formulas and key facts weekly',
    'Attempt 15-20 mock tests with analysis before the exam',
  ],
  cutOffMarks: {},
  totalVacancies: '',
}

export default exam

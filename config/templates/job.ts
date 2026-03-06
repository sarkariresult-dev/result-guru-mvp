import type { PostTemplate } from './types'
import { y } from './helpers'

const job: PostTemplate = {
  titlePattern: y('[ORG] [POST] Recruitment [YEAR] – [VACANCIES] Vacancies'),
  slugPattern: '[org]-[post]-recruitment-[year]',
  excerptPattern: y('[ORG] has released the official notification for [POST] Recruitment [YEAR]. Total [VACANCIES] vacancies available. Check eligibility, application fee, important dates, selection process, and how to apply online.'),
  applicationStatus: 'upcoming',

  seo: {
    metaTitlePattern: y('[ORG] [POST] Recruitment [YEAR] | Apply Online'),
    metaDescriptionPattern: y('[ORG] [POST] [YEAR] recruitment notification released. Check eligibility, vacancy, fee, selection process, salary details & apply online before the last date.'),
    focusKeywordPattern: y('[ORG] [POST] Recruitment [YEAR]'),
    secondaryKeywords: [
      y('[ORG] [POST] online form [YEAR]'),
      y('[ORG] [POST] vacancy [YEAR]'),
      y('[POST] eligibility criteria'),
    ],
    featuredImageAlt: y('[ORG] [POST] Recruitment [YEAR] – Apply Online'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] Recruitment [YEAR] – Complete Overview</h2>
<p>[ORG] has officially released the recruitment notification for [POST] [YEAR]. A total of [VACANCIES] vacancies have been announced across various departments and reservation categories. Eligible and interested candidates can submit their application through the official website before the closing date. This is an excellent opportunity for candidates looking to secure a government position with attractive salary, job security, and long-term career growth. Read the complete details below to understand eligibility, vacancy distribution, application process, and selection procedure thoroughly.</p>

<h2>Recruitment Highlights</h2>
<table>
<thead><tr><th>Particular</th><th>Details</th></tr></thead>
<tbody>
<tr><td>Recruiting Body</td><td>[ORG]</td></tr>
<tr><td>Post Name</td><td>[POST]</td></tr>
<tr><td>Total Vacancies</td><td>[VACANCIES]</td></tr>
<tr><td>Application Mode</td><td>Online</td></tr>
<tr><td>Job Location</td><td>All India / [STATE]</td></tr>
<tr><td>Notification Status</td><td>Released</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>

<h2>Eligibility Criteria</h2>
<h3>Educational Qualification</h3>
<p>Candidates must have completed the required educational qualification from a recognized university, board, or institution approved by the Government of India. The specific qualification varies by post — please refer to the official notification for post-wise qualification requirements. Candidates who are in the final year or awaiting results may also be eligible to apply provisionally, subject to producing the qualification certificate at the time of document verification.</p>

<h3>Nationality</h3>
<p>The candidate must be a citizen of India. For certain posts, citizens of Nepal, Bhutan, or Tibetan refugees who came to India before 1962 may also be eligible, subject to a certificate of eligibility issued by the Government of India.</p>

<h2>Documents Required for Verification</h2>
<p>Candidates who qualify the selection process will be called for document verification. Keep the following documents ready in original along with two sets of self-attested photocopies:</p>
<ul>
<li>10th Class Mark Sheet and Certificate (for date of birth proof)</li>
<li>12th / Graduation / Post-Graduation Mark Sheets and Degree Certificate</li>
<li>Category Certificate (SC/ST/OBC/EWS) issued by the competent authority</li>
<li>PwBD Certificate from a recognized medical board (if applicable)</li>
<li>Aadhaar Card, PAN Card, or Voter ID for identity verification</li>
<li>Domicile / Residence Certificate (if required for state-level posts)</li>
<li>Recent passport-size photographs (same as uploaded in application)</li>
<li>NOC / Relieving Order (for candidates already in government service)</li>
<li>Experience Certificate (if applicable for the post)</li>
</ul>

<h2>Important Guidelines for Candidates</h2>
<ul>
<li>Read the official notification thoroughly before applying — do not rely on third-party summaries alone</li>
<li>Ensure you meet all eligibility criteria before submitting the application</li>
<li>Keep checking the official website regularly for updates on exam dates, admit cards, and results</li>
<li>Do not share your login credentials with anyone to avoid unauthorized changes</li>
<li>Beware of fraudulent websites and touts — apply only through the official portal</li>
<li>Bookmark this page on Result Guru for the latest updates and notifications about [POST] [YEAR]</li>
</ul>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Apply Online</td><td>Link will be updated</td></tr>
<tr><td>Official Notification PDF</td><td>Link will be updated</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
<tr><td>Syllabus &amp; Exam Pattern</td><td>–</td></tr>
<tr><td>Previous Year Papers</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Notification Date': '',
    'Online Application Start': '',
    'Last Date to Apply': '',
    'Last Date for Fee Payment': '',
    'Correction Window': '',
    'Exam Date': '',
    'Admit Card Available': '',
    'Result Declaration': '',
  },
  applicationFee: {
    'General / OBC': '',
    'SC / ST': '',
    'EWS': '',
    'Female (All Categories)': '',
    'PwD': '',
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
    'Other Benefits': 'DA, HRA, TA as per rules',
  },
  selectionProcess: [
    'Written Examination / Computer Based Test (CBT)',
    'Skill Test / Typing Test (if applicable)',
    'Physical Efficiency Test (PET) / Physical Standard Test (PST) (if applicable)',
    'Document Verification',
    'Medical Examination',
  ],
  howToApply: [
    'Visit the official website of [ORG]',
    'Click on "Apply Online" or "New Registration"',
    'Register with valid email ID and mobile number',
    'Fill personal, educational, and other required details',
    'Upload scanned photograph and signature as per specs',
    'Upload required documents (marksheets, certificates, ID proof)',
    'Pay the application fee via online mode',
    'Review all details and submit the application form',
    'Download and print the confirmation page',
  ],
  faq: [
    { question: y('What is the last date to apply for [ORG] [POST] [YEAR]?'), answer: 'The last date to apply online will be updated once the official notification is released. Bookmark this page for the latest updates.' },
    { question: 'What is the application fee?', answer: 'The application fee varies by category. General/OBC candidates pay the full fee, while SC/ST/PwD/Female candidates may get partial or full fee exemption.' },
    { question: 'Can I apply offline?', answer: 'No. Applications are accepted only through the online mode via the official website.' },
    { question: y('What is the selection process for [POST] [YEAR]?'), answer: 'Selection typically includes Written Exam/CBT, Skill Test, Document Verification, and Medical Examination. Exact stages may vary by post.' },
    { question: 'Is there age relaxation for reserved categories?', answer: 'Yes. OBC: 3 years, SC/ST: 5 years, PwBD: 10 years age relaxation as per government norms.' },
  ],
  syllabusSections: [],
  examPatternData: [],
  previousYearPapers: [],
  preparationTips: [],
  cutOffMarks: {},
  totalVacancies: '',
}

export default job

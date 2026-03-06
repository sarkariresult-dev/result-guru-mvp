import type { PostTemplate } from './types'
import { y } from './helpers'

const admission: PostTemplate = {
  titlePattern: y('[ORG] Admission [YEAR] – Courses, Eligibility &amp; Apply'),
  slugPattern: '[org]-admission-[year]',
  excerptPattern: y('[ORG] Admission [YEAR] — complete guide with courses offered, eligibility criteria, application process, fee structure, merit list schedule, and required documents. Apply before the deadline.'),
  applicationStatus: 'upcoming',

  seo: {
    metaTitlePattern: y('[ORG] Admission [YEAR] | Courses & Apply Online'),
    metaDescriptionPattern: y('[ORG] Admission [YEAR] — courses, eligibility, fee, merit list & how to apply. Complete admission guide with direct registration link.'),
    focusKeywordPattern: y('[ORG] Admission [YEAR]'),
    secondaryKeywords: [
      y('[ORG] admission online form [YEAR]'),
      y('[ORG] courses eligibility [YEAR]'),
      y('[ORG] merit list [YEAR]'),
    ],
    featuredImageAlt: y('[ORG] Admission [YEAR] – Apply Online for Courses'),
  },

  contentTemplate: y(`<h2>[ORG] Admission [YEAR] – Complete Guide</h2>
<p>[ORG] has started the admission process for the academic session [YEAR]. Students seeking admission to undergraduate (UG), postgraduate (PG), diploma, or professional courses can apply through the official portal. This guide covers everything you need to know — from available courses and eligibility criteria to the application process, merit list schedule, and documents required for counselling. Make sure to apply before the deadline and keep all original documents ready for verification.</p>

<h2>Admission Overview</h2>
<table>
<thead><tr><th>Detail</th><th>Information</th></tr></thead>
<tbody>
<tr><td>Institution</td><td>[ORG]</td></tr>
<tr><td>Academic Session</td><td>[YEAR]</td></tr>
<tr><td>Application Mode</td><td>Online</td></tr>
<tr><td>Admission Basis</td><td>Merit / Entrance Exam</td></tr>
<tr><td>Official Portal</td><td>–</td></tr>
</tbody>
</table>

<h2>Courses Offered</h2>
<table>
<thead><tr><th>Stream</th><th>Courses</th><th>Duration</th><th>Admission Basis</th></tr></thead>
<tbody>
<tr><td>Arts / Humanities</td><td>BA, BA (Hons.), MA</td><td>3-5 years</td><td>Merit</td></tr>
<tr><td>Science</td><td>BSc, BSc (Hons.), MSc</td><td>3-5 years</td><td>Merit / Entrance</td></tr>
<tr><td>Commerce</td><td>BCom, BCom (Hons.), MCom</td><td>3-5 years</td><td>Merit</td></tr>
<tr><td>Engineering</td><td>BTech, MTech</td><td>4-5 years</td><td>JEE / State CET</td></tr>
<tr><td>Medical</td><td>MBBS, BDS, BAMS</td><td>4.5-5.5 years</td><td>NEET</td></tr>
<tr><td>Law</td><td>BA LLB, LLB, LLM</td><td>3-5 years</td><td>CLAT / Merit</td></tr>
<tr><td>Management</td><td>BBA, MBA</td><td>2-3 years</td><td>CAT / MAT / Merit</td></tr>
</tbody>
</table>

<h2>Eligibility Criteria</h2>
<h3>For Undergraduate (UG) Courses</h3>
<ul>
<li>Must have passed Class 12 from a recognized board with minimum required percentage</li>
<li>Minimum percentage: – % aggregate (varies by course and category)</li>
<li>Entrance score: Required for professional courses (JEE, NEET, CUET, state CETs)</li>
<li>Subject requirements: Specific stream subjects may be mandatory for certain courses</li>
</ul>

<h3>For Postgraduate (PG) Courses</h3>
<ul>
<li>Must hold a Bachelor's degree from a recognized university with minimum percentage</li>
<li>Minimum percentage: – % aggregate in the relevant subject</li>
<li>Entrance exam score may be required (CUET PG / University entrance)</li>
</ul>

<h2>Merit List &amp; Counselling Process</h2>
<p>Admission is granted based on the merit list prepared by [ORG]. The merit list is usually based on Class 12 marks (for UG) or graduation marks (for PG). For courses requiring entrance exams, the merit is based on entrance scores. The counselling process typically follows these steps:</p>
<ol>
<li>First merit list published — shortlisted candidates appear for document verification</li>
<li>Pay the admission fee within the specified deadline</li>
<li>If seats remain, second and third merit lists are released</li>
<li>Spot admission rounds may be conducted for remaining seats</li>
</ol>

<h2>Documents Required for Admission</h2>
<ul>
<li>Class 10 Mark Sheet and Certificate (for date of birth verification)</li>
<li>Class 12 Mark Sheet and Certificate (for eligibility verification)</li>
<li>Graduation Degree and Mark Sheets (for PG admissions)</li>
<li>Entrance Exam Score Card (CUET / JEE / NEET / State CET, if applicable)</li>
<li>Transfer Certificate (TC) and Migration Certificate (from previous institution)</li>
<li>Character Certificate from the last attended institution</li>
<li>Category Certificate (SC/ST/OBC/EWS) issued by competent authority</li>
<li>Income Certificate (for fee concession / scholarship, if applicable)</li>
<li>Aadhaar Card and 4-6 passport-size photographs</li>
<li>Anti-ragging affidavit (signed by student and parent)</li>
</ul>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Apply Online / Registration</td><td>Link will be updated</td></tr>
<tr><td>Admission Prospectus PDF</td><td>Link will be updated</td></tr>
<tr><td>Merit List</td><td>Link will be updated</td></tr>
<tr><td>Course List &amp; Fee Structure</td><td>Link will be updated</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Application Start Date': '',
    'Application Deadline': '',
    'First Merit List': '',
    'Second Merit List': '',
    'Admission Fee Deadline': '',
    'Classes Commence': '',
  },
  applicationFee: {
    'General / OBC': '',
    'SC / ST': '',
    'EWS': '',
    'Payment Mode': 'Online (Net Banking / UPI / Card)',
  },
  vacancyDetails: {},
  eligibility: {
    'UG: Minimum Qualification': 'Class 12 Passed',
    'UG: Minimum Percentage': '',
    'PG: Minimum Qualification': "Bachelor's Degree",
    'PG: Minimum Percentage': '',
    'Entrance Exam': 'As per course requirement',
  },
  ageLimit: {},
  payScale: {},
  selectionProcess: [
    'Merit List / Entrance Score Ranking',
    'Document Verification & Counselling',
    'Fee Payment & Seat Confirmation',
  ],
  howToApply: [
    'Visit the official admission portal of [ORG]',
    'Click "New Registration" and create your account',
    'Select course(s) and fill personal & academic details',
    'Upload documents (photograph, mark sheets, certificates)',
    'Pay the application fee online',
    'Submit and download confirmation page',
  ],
  faq: [
    { question: y('When does [ORG] admission [YEAR] start?'), answer: 'The admission dates are listed in the Important Dates section above. Registration typically opens 2-3 months before the academic session.' },
    { question: 'What is the admission process?', answer: 'Apply online, wait for the merit list, appear for document verification, and pay the admission fee to confirm your seat.' },
    { question: 'Is there an entrance exam for admission?', answer: 'It depends on the course. Professional courses (Engineering, Medical, Law) require entrance scores. Arts, Science, and Commerce courses are usually merit-based.' },
    { question: 'What if my name is not in the first merit list?', answer: 'Wait for the second and third merit lists. Spot admission rounds may also be conducted for remaining seats.' },
    { question: 'Can I change my course after admission?', answer: 'Course change policies vary by institution. Contact the admission office for details on internal transfers.' },
  ],
  syllabusSections: [],
  examPatternData: [],
  previousYearPapers: [],
  preparationTips: [],
  cutOffMarks: {},
  totalVacancies: '',
}

export default admission

import type { PostTemplate } from './types'
import { y } from './helpers'

const notification: PostTemplate = {
  titlePattern: y('[ORG] [POST] Notification [YEAR] – Official Notice Out'),
  slugPattern: '[org]-[post]-notification-[year]',
  excerptPattern: y('[ORG] has released the official [POST] [YEAR] notification. Check complete details including eligibility, vacancy, important dates, fee, and how to apply online.'),
  applicationStatus: 'upcoming',

  seo: {
    metaTitlePattern: y('[ORG] [POST] Notification [YEAR] | Apply Online'),
    metaDescriptionPattern: y('[ORG] [POST] [YEAR] official notification released. Get complete details — eligibility, vacancy, fee, important dates & how to apply online.'),
    focusKeywordPattern: y('[ORG] [POST] notification [YEAR]'),
    secondaryKeywords: [
      y('[ORG] [POST] official notice [YEAR]'),
      y('[ORG] [POST] vacancy [YEAR]'),
      y('[ORG] recruitment [YEAR] details'),
    ],
    featuredImageAlt: y('[ORG] [POST] Notification [YEAR] – Official Notice'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] Notification [YEAR] – Complete Details</h2>
<p>[ORG] has published the official notification for [POST] [YEAR]. This notification contains all the details that candidates need to know before applying — from eligibility criteria and vacancy distribution to the complete application process and selection procedure. Candidates who are interested and meet the eligibility requirements should read the full notification carefully and apply before the deadline through the official portal only.</p>

<h2>Notification Overview</h2>
<table>
<thead><tr><th>Detail</th><th>Information</th></tr></thead>
<tbody>
<tr><td>Organization</td><td>[ORG]</td></tr>
<tr><td>Post Name</td><td>[POST]</td></tr>
<tr><td>Total Vacancies</td><td>[VACANCIES]</td></tr>
<tr><td>Application Mode</td><td>Online</td></tr>
<tr><td>Notification Status</td><td>Released</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>

<h2>Key Points From the Notification</h2>
<p>The official notification includes the following key information. Candidates are advised to read the notification PDF thoroughly before applying:</p>
<ul>
<li>Complete post-wise and category-wise vacancy breakdown with distribution across departments</li>
<li>Educational qualification requirements for each post along with minimum percentage norms</li>
<li>Age limit criteria with category-wise relaxation details as per central/state government rules</li>
<li>Complete application process — online registration, fee payment, document upload steps</li>
<li>Application fee details with category-wise breakdown and exemptions</li>
<li>Selection process stages — Written Exam, Skill Test, Interview, DV, Medical</li>
<li>Pay scale and perks offered for each post</li>
</ul>

<h2>What Has Changed From Last Year?</h2>
<p>Candidates who applied for [POST] previously should pay special attention to changes in the [YEAR] notification. Common areas where changes can occur:</p>
<ul>
<li>Revised vacancy count — increase or decrease in post-wise vacancies</li>
<li>Updated application fee amounts or new payment modes</li>
<li>Changes in selection process stages or new stages added</li>
<li>Age limit modifications or cut-off date changes</li>
<li>New educational qualifications or experience requirements</li>
<li>New document requirements or verification procedures</li>
</ul>
<p>Always compare the current notification with the previous year's notification to identify what has changed before you begin your application.</p>

<h2>Who Can Apply?</h2>
<p>Before you start the application process, check whether you meet all eligibility criteria. Applying without meeting the requirements will waste your fee and time — your application will be rejected during document verification even if you qualify the written exam.</p>

<h2>Common Mistakes to Avoid While Reading the Notification</h2>
<ul>
<li>Do NOT assume eligibility criteria are the same as last year — always read the updated notification</li>
<li>Pay attention to the exact cut-off date for age calculation — it is NOT always the application date</li>
<li>Check if your qualification stream matches the post requirements — "Any Graduate" and "Specific Degree" are different</li>
<li>Verify your caste/category certificate format — some posts require certificates from specific issuing authorities</li>
<li>Note whether experience is mandatory or preferred — there is a big difference</li>
</ul>

<h2>Action Plan After Reading the Notification</h2>
<ol>
<li>Download the official notification PDF and read it completely — do not rely on summaries alone</li>
<li>Verify all eligibility criteria — qualification, age, nationality, category</li>
<li>Gather all required documents before starting the application</li>
<li>Prepare your photograph and signature scan as per the specified dimensions</li>
<li>Register on the official portal and fill the application form step by step</li>
<li>Pay the application fee before the deadline</li>
<li>Take a printout of the submitted application for your records</li>
<li>Start your exam preparation based on the syllabus and exam pattern mentioned in the notification</li>
</ol>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Official Notification PDF</td><td>Link will be updated</td></tr>
<tr><td>Apply Online</td><td>Link will be updated</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Notification Release Date': '',
    'Online Registration Start': '',
    'Last Date to Apply Online': '',
    'Last Date for Fee Payment': '',
    'Correction Window': '',
    'Exam Date (Tentative)': '',
  },
  applicationFee: {
    'General / OBC': '',
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
  },
  payScale: {
    'Pay Level': '',
    'Pay Band': '',
    'Grade Pay': '',
  },
  selectionProcess: [
    'Written Examination / CBT',
    'Skill Test / Typing Test (if applicable)',
    'Document Verification',
    'Medical Examination',
  ],
  howToApply: [
    'Visit the official website of [ORG]',
    'Click on "New Registration" and create your account',
    'Log in and fill the application form with correct details',
    'Upload photo, signature, and required documents',
    'Pay the application fee through online mode',
    'Submit and print the confirmation page',
  ],
  faq: [
    { question: y('When was the [ORG] [POST] notification [YEAR] released?'), answer: 'The official notification date is mentioned in the Important Dates section above. Bookmark this page for real-time updates.' },
    { question: 'How can I download the official notification PDF?', answer: 'Click the "Official Notification PDF" link in the Important Links section above to download the full notification.' },
    { question: 'What is the last date to apply?', answer: 'The last date to apply is listed in the Important Dates section. Apply well before the deadline to avoid last-minute technical issues.' },
    { question: 'What documents do I need to apply?', answer: 'You need a valid email, mobile number, scanned photograph, signature, and educational certificates. Category certificates are needed for reserved candidates.' },
  ],
  syllabusSections: [],
  examPatternData: [],
  previousYearPapers: [],
  preparationTips: [],
  cutOffMarks: {},
  totalVacancies: '',
}

export default notification

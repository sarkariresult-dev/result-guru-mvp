import type { PostTemplate } from './types'
import { y } from './helpers'

const scheme: PostTemplate = {
  titlePattern: y('[POST] Scheme [YEAR] – Benefits, Eligibility &amp; Apply'),
  slugPattern: '[post]-scheme-[year]-apply-online',
  excerptPattern: y('[POST] [YEAR] government scheme — check complete details including benefits, eligibility criteria, required documents, and step-by-step application process. Apply online or offline before the deadline.'),
  applicationStatus: 'open',

  seo: {
    metaTitlePattern: y('[POST] Scheme [YEAR] | Benefits & How to Apply'),
    metaDescriptionPattern: y('[POST] [YEAR] government scheme — check eligibility, benefits, required documents & how to apply online. Complete guide with direct apply link.'),
    focusKeywordPattern: y('[POST] scheme [YEAR]'),
    secondaryKeywords: [
      y('[POST] scheme eligibility [YEAR]'),
      y('[POST] scheme benefits list'),
      y('[POST] online application form'),
    ],
    featuredImageAlt: y('[POST] Government Scheme [YEAR] – Benefits & How to Apply'),
  },

  contentTemplate: y(`<h2>[POST] Scheme [YEAR] – Complete Guide</h2>
<p>The [POST] scheme is a government initiative designed to provide financial assistance, social security, or developmental support to eligible citizens. This comprehensive guide covers everything you need to know about the scheme — who can apply, what benefits are offered, what documents are needed, and the complete step-by-step application process. If you or your family members meet the eligibility criteria, do not miss this opportunity to avail the benefits before the application deadline.</p>

<h2>Scheme Overview</h2>
<table>
<thead><tr><th>Detail</th><th>Information</th></tr></thead>
<tbody>
<tr><td>Scheme Name</td><td>[POST]</td></tr>
<tr><td>Launched By</td><td>[ORG]</td></tr>
<tr><td>Beneficiary</td><td>–</td></tr>
<tr><td>Benefit Type</td><td>Financial / Subsidy / Material</td></tr>
<tr><td>Application Mode</td><td>Online / Offline</td></tr>
<tr><td>Official Portal</td><td>–</td></tr>
<tr><td>Status</td><td>Active</td></tr>
</tbody>
</table>

<h2>Objectives of the Scheme</h2>
<p>The [POST] scheme was designed with specific objectives to address key challenges faced by the target beneficiary group. Understanding these objectives helps applicants determine whether this scheme is relevant to their needs:</p>
<ul>
<li>Provide direct financial support to eligible beneficiaries through DBT (Direct Benefit Transfer)</li>
<li>Reduce economic burden by subsidizing essential services or materials</li>
<li>Promote social equity and inclusion for underserved communities</li>
<li>Encourage self-employment, education, or skill development</li>
<li>Improve access to healthcare, housing, insurance, or other essential services</li>
</ul>

<h2>Scheme Benefits</h2>
<p>The [POST] scheme offers the following benefits to eligible applicants. The exact benefit amount and type may vary based on the applicant's category, location, and specific scheme guidelines:</p>
<ul>
<li>Direct cash transfer to beneficiary's Aadhaar-linked bank account</li>
<li>Subsidy on goods, services, or equipment (as applicable)</li>
<li>Free or subsidized training / skill development programs</li>
<li>Insurance coverage / social security benefits</li>
<li>Material support (housing, equipment, seeds, etc. — scheme specific)</li>
</ul>

<h2>Documents Required</h2>
<ul>
<li><strong>Aadhaar Card:</strong> Mandatory for identity verification and DBT</li>
<li><strong>Ration Card / BPL Certificate:</strong> To verify economic status and family details</li>
<li><strong>Bank Passbook / Account Statement:</strong> First page showing account number, IFSC, and name</li>
<li><strong>Income Certificate:</strong> Issued by the Tehsildar / Sub-Divisional Magistrate</li>
<li><strong>Domicile / Residence Proof:</strong> Voter ID, utility bill, or government-issued residence certificate</li>
<li><strong>Caste / Category Certificate:</strong> If the scheme is category-specific (SC/ST/OBC/Minority)</li>
<li><strong>Passport-size Photographs:</strong> 2-3 recent photographs</li>
<li><strong>Mobile Number:</strong> Active mobile linked with Aadhaar for OTP verification</li>
</ul>

<p><strong>Offline Option:</strong> Applicants who cannot apply online may visit the nearest Common Service Centre (CSC), Panchayat Office, Block Office, or designated government office with all documents for assisted registration.</p>

<h2>How to Check Application Status</h2>
<ol>
<li>Visit the official scheme portal</li>
<li>Click on "Application Status" or "Track Beneficiary" link</li>
<li>Enter your Application Reference Number or Aadhaar Number</li>
<li>Your current application status will be displayed (Pending / Approved / Rejected / Disbursed)</li>
</ol>

<h2>Helpline &amp; Support</h2>
<ul>
<li>For queries related to the scheme, call the official helpline number available on the portal</li>
<li>Visit your nearest CSC / Block Office / District Office for in-person assistance</li>
<li>Email queries to the official email address with your application reference number</li>
</ul>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Official Scheme Portal</td><td>Link will be updated</td></tr>
<tr><td>Apply Online / Registration</td><td>Link will be updated</td></tr>
<tr><td>Check Application Status</td><td>Link will be updated</td></tr>
<tr><td>Scheme Guidelines PDF</td><td>Link will be updated</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Scheme Launch Date': '',
    'Application Start Date': '',
    'Application Deadline': '',
    'Benefit Disbursal Date': '',
  },
  applicationFee: {
    'Application Fee': 'Free (No Charge)',
  },
  vacancyDetails: {},
  eligibility: {
    'Citizenship': 'Indian',
    'Age Group': '',
    'Income Limit': '',
    'Category': 'Open to all / specified categories',
    'Bank Account': 'Required (Aadhaar-linked for DBT)',
  },
  ageLimit: {},
  payScale: {},
  selectionProcess: [],
  howToApply: [
    'Visit the official scheme portal or nearest CSC / Block Office',
    'Click on "Apply Online" / "New Registration"',
    'Register with Aadhaar number and mobile number',
    'Fill the application form with accurate personal details',
    'Upload required documents (Aadhaar, bank passbook, income certificate, etc.)',
    'Review and submit the application form',
    'Note down the Application Reference Number',
    'Take a printout for your records',
  ],
  faq: [
    { question: y('Who is eligible for [POST] scheme [YEAR]?'), answer: 'Eligibility criteria are detailed in the section above. Key requirements include citizenship, income limit, and bank account linked with Aadhaar.' },
    { question: 'Is there any application fee?', answer: 'No. Most government schemes have no application fee. The registration is completely free.' },
    { question: 'How will I receive the benefits?', answer: 'Benefits are transferred directly to your Aadhaar-linked bank account via DBT (Direct Benefit Transfer).' },
    { question: 'What if my application is rejected?', answer: 'If rejected, check the reason mentioned in the status. Correct any errors and re-apply. You can also contact the helpline for assistance.' },
    { question: 'Can I apply offline?', answer: 'Yes. Visit your nearest Common Service Centre (CSC), Panchayat Office, or Block Office with all documents for assisted registration.' },
  ],
  syllabusSections: [],
  examPatternData: [],
  previousYearPapers: [],
  preparationTips: [],
  cutOffMarks: {},
  totalVacancies: '',
}

export default scheme

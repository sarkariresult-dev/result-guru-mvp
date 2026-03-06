import type { PostTemplate } from './types'
import { y } from './helpers'

const admit: PostTemplate = {
  titlePattern: y('[ORG] [POST] Admit Card [YEAR] – Download Hall Ticket'),
  slugPattern: '[org]-[post]-admit-card-[year]',
  excerptPattern: y('[ORG] has released the [POST] [YEAR] admit card. Download your hall ticket from the official website. Check exam date, reporting time, exam centre details, and documents required on exam day.'),
  applicationStatus: 'na',

  seo: {
    metaTitlePattern: y('[ORG] [POST] Admit Card [YEAR] | Download Now'),
    metaDescriptionPattern: y('[ORG] [POST] [YEAR] admit card released. Download hall ticket, check exam date, reporting time & documents required. Direct download link inside.'),
    focusKeywordPattern: y('[ORG] [POST] Admit Card [YEAR]'),
    secondaryKeywords: [
      y('[ORG] [POST] hall ticket [YEAR]'),
      y('[POST] exam date [YEAR]'),
      y('[ORG] admit card download link'),
    ],
    featuredImageAlt: y('[ORG] [POST] Admit Card [YEAR] – Hall Ticket Download'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] Admit Card [YEAR] – Complete Information</h2>
<p>[ORG] has released the admit card / hall ticket for [POST] [YEAR] examination. Candidates who have successfully applied and paid the application fee can now download their admit card from the official website. The admit card is a mandatory document for entry into the examination hall — without a valid admit card along with a photo ID proof, candidates will NOT be allowed to take the exam. Download your admit card at the earliest and verify all details printed on it.</p>

<h2>Admit Card Details</h2>
<table>
<thead><tr><th>Detail</th><th>Information</th></tr></thead>
<tbody>
<tr><td>Organization</td><td>[ORG]</td></tr>
<tr><td>Exam Name</td><td>[POST]</td></tr>
<tr><td>Admit Card Status</td><td>Released / Awaited</td></tr>
<tr><td>Download Start Date</td><td>–</td></tr>
<tr><td>Exam Date</td><td>–</td></tr>
<tr><td>Exam Mode</td><td>Online CBT / Offline (OMR)</td></tr>
<tr><td>Exam Duration</td><td>–</td></tr>
</tbody>
</table>

<h2>How to Download Admit Card – Step by Step</h2>
<ol>
<li>Visit the official website of [ORG] or click the direct download link provided in the Important Links section below</li>
<li>Look for the "Admit Card" or "Hall Ticket" section on the portal</li>
<li>Click on the "[POST] [YEAR] Admit Card Download" link</li>
<li>Enter your Registration Number / Application Number and Date of Birth or Password</li>
<li>Complete the CAPTCHA verification (if applicable)</li>
<li>Click "Download Admit Card" or "Print Admit Card" button</li>
<li>Your admit card will open in a new tab or download as a PDF</li>
<li>Carefully verify all details — name, photograph, exam centre, date, and shift timing</li>
<li>Take at least 2-3 colour printouts on A4 size paper</li>
<li>Keep one copy at home and carry the other to the exam centre</li>
</ol>

<h2>Information Printed on the Admit Card</h2>
<ul>
<li><strong>Candidate Details:</strong> Full Name, Father's Name, Date of Birth, Gender, Category</li>
<li><strong>Registration / Roll Number:</strong> Your unique identification number for this exam</li>
<li><strong>Photograph &amp; Signature:</strong> Should match the photo and signature you uploaded during registration</li>
<li><strong>Exam Date &amp; Time:</strong> The specific date and shift (morning/afternoon/evening) for your exam</li>
<li><strong>Reporting Time:</strong> The time you must arrive at the exam centre — usually 60-90 minutes before the exam starts</li>
<li><strong>Gate Closing Time:</strong> After this time, no candidate will be allowed entry under any circumstances</li>
<li><strong>Exam Centre:</strong> Full name and address of the venue where you need to appear</li>
<li><strong>Exam Duration:</strong> Total time allotted for the paper</li>
<li><strong>Important Instructions:</strong> Dress code, prohibited items, and exam day rules</li>
</ul>

<h2>What If Details Are Wrong on the Admit Card?</h2>
<ol>
<li>Contact the exam conducting authority through the helpline number or email mentioned on the official website</li>
<li>Visit the "Grievance" or "Contact Us" section on the official portal and raise a complaint</li>
<li>Carry a correct government-issued ID proof to the exam centre for verification</li>
<li>In most cases, minor discrepancies (spelling errors) are resolved at the centre level</li>
</ol>

<h2>Documents Required on Exam Day</h2>
<ul>
<li><strong>Printed Admit Card:</strong> Colour printout on A4 paper (mandatory)</li>
<li><strong>Valid Photo ID Proof (Original):</strong> Aadhaar Card / PAN Card / Voter ID / Driving License / Passport</li>
<li><strong>Passport-size Photograph:</strong> One extra photo (same as used in application form)</li>
<li><strong>Black Ball Point Pen:</strong> For OMR-based exams (do not carry gel or ink pens)</li>
<li><strong>PWD Certificate:</strong> If applicable, carry the original disability certificate and scribe letter</li>
</ul>

<h2>Items NOT Allowed in the Exam Hall</h2>
<ul>
<li>Mobile phones, smartwatches, fitness bands, or any Bluetooth/electronic device</li>
<li>Calculators (unless specifically allowed by the notification)</li>
<li>Bags, purses, wallets, and pouches</li>
<li>Books, notes, printed or handwritten material</li>
<li>Food items, water bottles (transparent bottles may be allowed at some centres)</li>
<li>Jewellery, metallic items, or any item that could be used for unfair means</li>
</ul>

<h2>Exam Day Tips &amp; Guidelines</h2>
<ul>
<li>Reach the exam centre at least 30 minutes before reporting time to avoid last-minute rush</li>
<li>Familiarize yourself with the exam centre location one day before the exam if possible</li>
<li>Wear comfortable clothing — formal dress code may be required for certain exams</li>
<li>Stay hydrated and have a light meal before leaving for the centre</li>
<li>Do not discuss questions or answers with anyone during or after the exam — it causes unnecessary panic</li>
<li>In CBT exams, read the on-screen instructions carefully before starting</li>
</ul>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Download Admit Card</td><td>Link will be updated</td></tr>
<tr><td>Exam City / Centre Details</td><td>Link will be updated</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Admit Card Download Start': '',
    'Admit Card Download Last Date': '',
    'Exam Date': '',
    'Reporting Time': '',
    'Gate Closing Time': '',
  },
  applicationFee: {},
  vacancyDetails: {},
  eligibility: {},
  ageLimit: {},
  payScale: {},
  selectionProcess: [],
  howToApply: [],
  faq: [
    { question: y('How to download [POST] [YEAR] admit card?'), answer: 'Visit the official website and log in with your Registration Number and Date of Birth. Click "Download Admit Card" to get your hall ticket.' },
    { question: 'What if my photo or details are wrong on the admit card?', answer: 'Contact the exam authority immediately through their helpline or email. Carry a valid government-issued ID proof to the centre.' },
    { question: 'Can I appear for the exam without an admit card?', answer: 'No. The admit card is mandatory for entry. Without a valid admit card and photo ID, you will NOT be allowed to take the exam.' },
    { question: 'What ID proof should I carry?', answer: 'Carry an original government-issued photo ID — Aadhaar Card, PAN Card, Voter ID, Driving License, or Passport.' },
    { question: 'My admit card is not downloading. What should I do?', answer: 'Try a different browser, clear cache, or try during off-peak hours. If the issue persists, check your application and fee payment status.' },
  ],
  syllabusSections: [],
  examPatternData: [],
  previousYearPapers: [],
  preparationTips: [],
  cutOffMarks: {},
  totalVacancies: '',
}

export default admit

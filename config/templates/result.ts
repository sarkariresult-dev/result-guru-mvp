import type { PostTemplate } from './types'
import { y } from './helpers'

const result: PostTemplate = {
  titlePattern: y('[ORG] [POST] Result [YEAR] – Scorecard & Merit List'),
  slugPattern: '[org]-[post]-result-[year]',
  excerptPattern: y('[ORG] has declared the [POST] [YEAR] result. Candidates can check their scorecard, category-wise cut off marks, and merit list. Direct link to download result provided below.'),
  applicationStatus: 'na',

  seo: {
    metaTitlePattern: y('[ORG] [POST] Result [YEAR] | Scorecard & Cut Off'),
    metaDescriptionPattern: y('[ORG] [POST] [YEAR] result declared. Download scorecard, check category-wise cut off marks & merit list. Direct link to check result available here.'),
    focusKeywordPattern: y('[ORG] [POST] Result [YEAR]'),
    secondaryKeywords: [
      y('[ORG] [POST] scorecard download [YEAR]'),
      y('[POST] merit list [YEAR]'),
      y('[ORG] [POST] cut off marks'),
    ],
    featuredImageAlt: y('[ORG] [POST] Result [YEAR] – Score Card & Merit List'),
  },

  contentTemplate: y(`<h2>[ORG] [POST] Result [YEAR] – Complete Details</h2>
<p>[ORG] has released the [POST] [YEAR] result on its official website. Candidates who appeared for the examination can now check their marks, qualifying status, and merit position using the direct link provided below. The result is available in the form of a scorecard which contains the candidate's roll number, marks obtained in each section, total marks, qualifying status, and overall rank. Candidates who have qualified will be called for the next stage of the selection process as per the official notification.</p>

<h2>Result Highlights</h2>
<table>
<thead><tr><th>Detail</th><th>Information</th></tr></thead>
<tbody>
<tr><td>Organization</td><td>[ORG]</td></tr>
<tr><td>Exam Name</td><td>[POST]</td></tr>
<tr><td>Exam Date</td><td>–</td></tr>
<tr><td>Result Date</td><td>–</td></tr>
<tr><td>Result Status</td><td>Declared / Awaited</td></tr>
<tr><td>Total Candidates Appeared</td><td>–</td></tr>
<tr><td>Total Candidates Qualified</td><td>–</td></tr>
</tbody>
</table>

<h2>How to Check [POST] Result [YEAR]</h2>
<p>Follow these steps carefully to view and download your result scorecard from the official portal:</p>
<ol>
<li>Visit the official website of [ORG] or click the direct result link provided in the Important Links section below</li>
<li>On the homepage, look for the "[POST] Result [YEAR]" link — it is usually displayed prominently under the "Latest Updates" section</li>
<li>Click on the result link and a login page will appear</li>
<li>Enter your Registration Number / Roll Number and Date of Birth / Password</li>
<li>Complete the CAPTCHA verification if prompted</li>
<li>Click "Submit" or "View Result" to display your scorecard</li>
<li>Verify your personal details and marks in each section</li>
<li>Download the scorecard as PDF and take 2-3 printouts for future reference</li>
</ol>
<p><strong>Tip:</strong> If the website is slow due to heavy traffic, try accessing it during off-peak hours (early morning or late night).</p>

<h2>What Your Scorecard Contains</h2>
<ul>
<li>Candidate's Name, Father's Name, Date of Birth, and Category</li>
<li>Roll Number / Registration Number</li>
<li>Section-wise marks obtained (e.g., General Awareness, Quantitative Aptitude, English, Reasoning)</li>
<li>Total marks out of maximum marks</li>
<li>Qualifying status — "Qualified" or "Not Qualified"</li>
<li>Normalized marks (if applicable — in case of multi-shift exams)</li>
<li>Overall rank or merit position (may be released separately)</li>
</ul>

<h2>Marks Normalization Process</h2>
<p>For exams conducted in multiple shifts, [ORG] uses a normalization formula to ensure fairness across different shifts. Normalization adjusts the raw marks based on the difficulty level of each shift. As a result, the normalized marks may differ from the raw marks displayed on the response sheet. The final merit is always based on normalized marks, not raw scores. The detailed normalization formula is available in the official notification.</p>

<h2>What to Do After the Result</h2>
<h3>If You Have Qualified</h3>
<ol>
<li>Download and save your scorecard immediately — the link may not be available forever</li>
<li>Check the next stage schedule (Skill Test / Interview / Document Verification date)</li>
<li>Start preparing all original documents required for verification</li>
<li>If the next stage is an interview, begin preparation with current affairs and subject knowledge</li>
<li>Monitor the official website for further updates on counselling or joining dates</li>
</ol>

<h3>Documents to Keep Ready</h3>
<ul>
<li>Original mark sheets and certificates (10th, 12th, Graduation, Post-Graduation)</li>
<li>Category certificate (SC/ST/OBC/EWS) issued by the competent authority</li>
<li>PwBD certificate from a recognized medical board (if applicable)</li>
<li>Valid photo identity proof (Aadhaar Card / PAN Card / Voter ID / Passport)</li>
<li>4-6 recent passport-size photographs (same as uploaded during application)</li>
<li>Experience certificate (if required by the post)</li>
<li>NOC from current employer (for candidates already in government service)</li>
</ul>

<h3>If You Did Not Qualify</h3>
<p>Do not lose hope. Analyze your scorecard, identify weak sections, and work on them for the next attempt. Many successful candidates have cleared the exam on their second or third attempt. Focus on mock tests, previous year papers, and time management to improve your score.</p>

<h2>Important Links</h2>
<table>
<thead><tr><th>Description</th><th>Link</th></tr></thead>
<tbody>
<tr><td>Check Result / Scorecard</td><td>Link will be updated</td></tr>
<tr><td>Download Merit List PDF</td><td>Link will be updated</td></tr>
<tr><td>Cut Off Marks (Official)</td><td>Link will be updated</td></tr>
<tr><td>Official Website</td><td>–</td></tr>
</tbody>
</table>`),

  importantDates: {
    'Exam Date': '',
    'Result Declaration Date': '',
    'Score Card Available From': '',
    'Next Stage / Interview Date': '',
  },
  applicationFee: {},
  vacancyDetails: {},
  eligibility: {},
  ageLimit: {},
  payScale: {},
  selectionProcess: [],
  howToApply: [],
  faq: [
    { question: y('How to check [POST] [YEAR] result?'), answer: 'Visit the official website or use the direct link above. Enter your Registration Number and Date of Birth to view your scorecard.' },
    { question: y('What is the cut off for [POST] [YEAR]?'), answer: 'Category-wise cut off marks are provided in the table above. Cut off varies based on difficulty and candidate count.' },
    { question: 'When will the merit list be released?', answer: 'The merit list is usually released along with or shortly after the result. Check Important Links for the download link.' },
    { question: 'I forgot my Registration Number. How to check result?', answer: 'Recover your registration number from the official website using your registered email ID or mobile number.' },
    { question: 'What are the next steps after qualifying?', answer: 'Prepare for the next stage (Skill Test / Interview / DV) and keep all original documents ready as listed above.' },
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
  },
  totalVacancies: '',
}

export default result

You are writing a **Government Job Recruitment** post. Target: **1200+ words of substantive content**.

---

## Content Structure (use raw HTML)

<h2>[Organization Short Name] [Post Name] Recruitment [Year]: [Total Posts] Vacancies</h2>
Open with a **Direct Answer** in the first 50-100 words. State when the recruitment was announced, total vacancies, official qualification, and the last date to apply. Link to the official `.gov.in` portal naturally.

<h2>Recruitment Overview</h2>
Write 2-3 paragraphs explaining the recruitment scope. Compare with previous year's vacancy count using specific numbers. Mention the departments or posts covered and why this recruitment is notable (e.g., highest vacancies in 3 years, new posts added, merged backlog).

<h3>Who Should Apply</h3>
Provide a quick 3-4 bullet assessment: who benefits most, which qualification levels are targeted, and whether candidates preparing for other exams (UPSC, state PSC) should also consider this.

<h2>Key Highlights</h2>
HTML `<table>` with `<thead>` and `<th scope="col">`:
- Organization Name, Post Name, Total Vacancies, Qualification, Age Limit, Last Date, Apply Mode

<h2>Important Dates</h2>
HTML `<table>`:
- Online Application Start, Last Date, Fee Payment Deadline, Exam Date (if announced)

Practical note about server load on the last date and recommended application timing.

<h2>Application Fee</h2>
<h3>Category-Wise Fee Structure</h3>
HTML `<table>` with categories (General/OBC, SC/ST, Female/PwD, Payment Mode).
<h3>Payment Tips</h3>
1-2 practical tips about UPI vs card success rates, refund policy.

<h2>Eligibility Criteria</h2>
<h3>Educational Qualification</h3>
Required degrees/diplomas with minimum marks in `<strong>`.
<h3>Age Limit (as of [cutoff date])</h3>
Table with category-wise age limits and relaxation rules.
<h3>Other Requirements</h3>
Brief bullet list for nationality, physical standards if applicable.

<h2>Vacancy Details</h2>
<h3>Category-Wise Distribution</h3>
Detailed table: Post Name | UR | OBC | SC | ST | EWS | Total.
<h3>Year-Over-Year Comparison</h3>
HTML table: Year | Total Vacancies | Qualification | Key Change — show at least 2 previous years vs current.

<h2>Pay Scale and Salary</h2>
<h3>Official Pay Band</h3>
Mention pay level, grade pay, and 7th CPC matrix level.
<h3>In-Hand Salary Estimate</h3>
Provide range with HRA/DA assumptions for metro vs non-metro cities.
<h3>Career Growth</h3>
Promotion timeline over 5, 10, 15 years with expected pay levels.

<h2>Selection Process</h2>
Numbered `<ol>` with details for each stage and expected timeline.

<h2>How to Apply Online</h2>
Step-by-step numbered guide with:
- <a target="_blank" rel="noopener noreferrer" href="[officialWebsiteUrl]">Official Website</a>
- <a href="/admit-card">Latest Admit Card</a>
- <a href="/result">Exam Result</a>

<h3>Common Application Mistakes</h3>
3-4 specific mistakes (wrong photo dimensions, email typos, skipping form preview).

<h2>Direct Links for [Organization Name] [Year]</h2>
Structured HTML `<table>` with `<thead>` and `<tbody>`:
- Apply Online | <a target="_blank" rel="noopener noreferrer" href="[primaryLink]">Apply Here</a>
- Download Notification PDF | <a target="_blank" rel="noopener noreferrer" href="[notificationPdfUrl]">Download PDF</a>
- Official Website | <a target="_blank" rel="noopener noreferrer" href="[officialWebsiteUrl]">Visit Portal</a>
- Syllabus & Exam Pattern | <a href="/syllabus">View Syllabus</a>
- Join Telegram | <a target="_blank" rel="noopener noreferrer" href="https://t.me/resultguru247">Join Now</a>
- Result Guru | <a target="_blank" rel="noopener noreferrer" href="https://resultguru.co.in">resultguru.co.in</a>

---

**RULES:**
1. All headings in English — no Hinglish section titles
2. 3-5 internal links: `/syllabus`, `/admit-card`, `/previous-paper`, `/result`, `/exam-pattern`
3. Year-over-year comparison table with vacancy and salary trends
4. All tables MUST use `<thead>`, `<th scope="col">`, `<tbody>`
5. Use `<strong>` for salary figures, dates, and organization names
6. Career growth section must include real pay level figures
7. **PROHIBITED**: No "FAQ" headings in HTML — populate `faq` JSON instead
8. **REQUIRED**: "Direct Links" table as the final major section

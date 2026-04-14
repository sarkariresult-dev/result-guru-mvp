const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
  });
  
  // We'll create a local HTML file that embeds our Next.js dev server
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Iframe Test</h1>
        <iframe src="http://localhost:3000/job/bihar-btsc-instructor-recruitment-2026" 
                width="100%" height="800" 
                sandbox="allow-scripts allow-forms allow-popups"
        ></iframe>
      </body>
    </html>
  `;
  fs.writeFileSync('iframe-test.html', htmlContent);

  const page = await context.newPage();
  
  let crashed = false;
  
  page.on('console', msg => {
    console.log('[BROWSER CONSOLE]', msg.text());
    if (msg.text().includes('A critical error occurred')) {
      crashed = true;
    }
  });

  page.on('pageerror', err => {
    console.log('[BROWSER UNCAUGHT ERROR]', err.message);
  });
  
  console.log('Loading local file with sandboxed iframe...');
  await page.goto('file://' + process.cwd() + '/iframe-test.html', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(5000); // Give it time to hydrate and crash

  await browser.close();
  
  fs.unlinkSync('iframe-test.html');
})();

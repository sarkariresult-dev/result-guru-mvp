import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Create an iframe to test defineProperty
  const result = await page.evaluate(() => {
    return new Promise(resolve => {
        const iframe = document.createElement('iframe');
        // Sandbox without allow-same-origin makes it cross-origin
        iframe.sandbox = 'allow-scripts';
        // Add a script that tries to overwrite storage and access it
        iframe.srcdoc = `
        <html><body><script>
            try {
                let err1 = 'none';
                let polyfilled = false;
                try {
                    window.localStorage.getItem('test');
                } catch(e) { err1 = e.name; } // Should be SecurityError
                
                try {
                    Object.defineProperty(window, 'localStorage', { value: { getItem: () => 'mock' }, configurable: true });
                    polyfilled = true;
                } catch(e) {
                    polyfilled = false;
                }
                
                let err2 = 'none';
                try {
                    window.localStorage.getItem('test');
                } catch(e) { err2 = e.name; }

                window.parent.postMessage({ err1, polyfilled, err2 }, '*');
            } catch(e) {}
        </script></body></html>
        `;
        window.addEventListener('message', e => {
            resolve(e.data);
        });
        document.body.appendChild(iframe);
    });
  });
  console.log('Result:', result);
  await browser.close();
})();

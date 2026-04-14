import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const result = await page.evaluate(() => {
    return new Promise(resolve => {
        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts';
        iframe.srcdoc = `
        <html><body><script>
            try {
                let desc = Object.getOwnPropertyDescriptor(window, 'sessionStorage');
                let isConfigurable = desc ? desc.configurable : false;
                
                try {
                     Object.defineProperty(window, 'sessionStorage', { value: {}, configurable: true });
                     isConfigurable = true;
                } catch(e) {
                     isConfigurable = false;
                }
                window.parent.postMessage({ configurable: isConfigurable, desc: !!desc }, '*');
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

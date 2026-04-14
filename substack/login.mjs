// Open Substack login page in Playwright Firefox persistent context
// Sign in, then close the browser. Cookies will be saved for other scripts.

import { launchBrowser, getPage } from './lib.mjs';

const browser = await launchBrowser();
const page = await getPage(browser);
await page.goto('https://substack.com/sign-in', { waitUntil: 'domcontentloaded' });

console.log('Browser open. Sign in to Substack, then close the browser window.');
console.log('Your session will be saved for future use.');

// Keep alive until browser is closed by user
page.on('close', async () => {
  console.log('Page closed. Saving session...');
  await browser.close();
  console.log('Done. Session saved.');
});

// Wait for browser context to close
await new Promise(resolve => {
  browser.on('close', resolve);
});

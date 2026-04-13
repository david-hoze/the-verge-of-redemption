// Open Substack login page in Playwright Firefox persistent context
// Sign in, then close the browser. Cookies will be saved for post-comment.mjs

import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const PROFILE_DIR = join(homedir(), '.substack-playwright');

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});

const page = browser.pages()[0] || await browser.newPage();
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

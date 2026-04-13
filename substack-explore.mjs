// Browse Substack explore by category or feed
// Usage: node substack-explore.mjs [url]

import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const PROFILE_DIR = join(homedir(), '.substack-playwright');
const url = process.argv[2] || 'https://substack.com/home';
const count = parseInt(process.argv[3]) || 6;

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1400, height: 1000 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  for (let i = 0; i < count; i++) {
    await page.screenshot({ path: join(homedir(), `substack-explore-${i}.png`) });
    console.log(`Screenshot: ~/substack-explore-${i}.png`);
    await page.evaluate(() => window.scrollBy(0, 900));
    await page.waitForTimeout(1500);
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

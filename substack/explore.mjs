// Browse Substack explore by category or feed
// Usage: node substack-explore.mjs [url]

import { launchBrowser, getPage, screenshot, HOME } from './lib.mjs';
import { join } from 'path';
const url = process.argv[2] || 'https://substack.com/home';
const count = parseInt(process.argv[3]) || 6;

const browser = await launchBrowser({ viewport: { width: 1400, height: 1000 } });
const page = await getPage(browser);

try {
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  for (let i = 0; i < count; i++) {
    await page.screenshot({ path: join(HOME, `substack-explore-${i}.png`) });
    console.log(`Screenshot: ~/substack-explore-${i}.png`);
    await page.evaluate(() => window.scrollBy(0, 900));
    await page.waitForTimeout(1500);
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

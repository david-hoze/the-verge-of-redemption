// Check Substack activity/notifications via Playwright
// Usage: node substack-activity.mjs [url]

import { launchBrowser, getPage, screenshot, HOME } from './lib/substack.mjs';

const url = process.argv[2] || 'https://substack.com/activity';

const browser = await launchBrowser();
const page = await getPage(browser);

try {
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Take multiple screenshots scrolling down
  for (let i = 0; i < 3; i++) {
    await screenshot(page, `substack-activity-${i}.png`);
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await screenshot(page, 'substack-error.png');
} finally {
  await browser.close();
}

// Check Substack activity/notifications via Playwright
// Usage: node substack-activity.mjs [url]

import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const PROFILE_DIR = join(homedir(), '.substack-playwright');
const url = process.argv[2] || 'https://substack.com/profile/activity';

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Take multiple screenshots scrolling down
  for (let i = 0; i < 3; i++) {
    await page.screenshot({ path: join(homedir(), `substack-activity-${i}.png`) });
    console.log(`Screenshot: ~/substack-activity-${i}.png`);
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(homedir(), 'substack-error.png') });
} finally {
  await browser.close();
}

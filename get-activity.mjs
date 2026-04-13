// Extract activity feed items
import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const PROFILE_DIR = join(homedir(), '.substack-playwright');

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1920, height: 1200 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  await page.goto('https://substack.com/activity', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Scroll to load more items
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(800);
  }

  // Extract activity items
  const items = await page.evaluate(() => {
    // Get all text content from the activity feed
    const feed = document.querySelector('[class*="activity"]') || document.body;
    const all = feed.querySelectorAll('div, span, a, p');
    const texts = [];
    const seen = new Set();
    for (const el of all) {
      const t = el.textContent.trim().substring(0, 200);
      if (t.length > 20 && !seen.has(t)) {
        seen.add(t);
        texts.push({ tag: el.tagName, class: (el.className || '').substring(0, 60), text: t });
      }
    }
    return texts.slice(0, 100);
  });

  // Filter for interesting items (names, comments)
  for (const item of items) {
    if (item.text.toLowerCase().includes('lightwing') ||
        item.text.toLowerCase().includes('light') ||
        item.text.includes('replied') ||
        item.text.includes('commented') ||
        item.text.includes('liked')) {
      console.log(`[${item.tag}.${item.class.substring(0,30)}] ${item.text}`);
    }
  }

  console.log('\n=== ALL ACTIVITY TEXT ===');
  const bodyText = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText.substring(0, 5000);
  });
  console.log(bodyText);

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

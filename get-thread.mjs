// Get full thread text - opens browser, expands all comments, extracts text, closes
import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const PROFILE_DIR = join(homedir(), '.substack-playwright');
const url = process.argv[2] || 'https://substack.com/profile/480779762-structure-and-biography/note/c-242036756#comment-242592493';

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1920, height: 1200 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Click all "See more" via DOM clicks in a loop until none remain
  for (let round = 0; round < 15; round++) {
    const clicked = await page.evaluate(() => {
      const link = document.querySelector('a.link-LIBpto');
      if (link && link.textContent.trim() === 'See more') {
        link.click();
        return true;
      }
      // Fallback: any element with exact "See more" text
      const all = Array.from(document.querySelectorAll('a, span, button'));
      const sm = all.find(el => el.textContent.trim() === 'See more' && el.childElementCount === 0);
      if (sm) { sm.click(); return true; }
      return false;
    });
    if (!clicked) break;
    await page.waitForTimeout(1500);
  }

  await page.waitForTimeout(1000);

  // Extract all comment texts
  const comments = await page.evaluate(() => {
    const bodies = document.querySelectorAll('[class*="feedCommentBodyInner"]');
    return Array.from(bodies).map(el => el.innerText);
  });

  for (let i = 0; i < comments.length; i++) {
    console.log(`\n=== COMMENT ${i + 1} ===`);
    console.log(comments[i]);
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

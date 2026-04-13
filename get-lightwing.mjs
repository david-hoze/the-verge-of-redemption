// Navigate to Lightwing note by clicking the note content in activity
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

  // Find the Lightwing row and get its href (the row itself might be a link)
  const rowInfo = await page.evaluate(() => {
    const rows = document.querySelectorAll('[class*="linkRow"]');
    for (const row of rows) {
      const text = row.textContent;
      if (text.includes('Lightwing') && text.includes('liked your note')) {
        return {
          tag: row.tagName,
          href: row.href || row.getAttribute('href') || '',
          className: row.className.substring(0, 100),
          isAnchor: row.tagName === 'A',
          parentTag: row.parentElement?.tagName,
          parentHref: row.parentElement?.href || ''
        };
      }
    }
    return null;
  });

  console.log('Row info:', JSON.stringify(rowInfo, null, 2));

  // The linkRow class suggests it's clickable - try clicking it directly via Playwright
  const rows = await page.$$('[class*="linkRow"]');
  for (const row of rows) {
    const text = await row.textContent();
    if (text.includes('Lightwing') && text.includes('liked your note')) {
      console.log('Found the row, clicking...');
      await row.click();
      break;
    }
  }

  await page.waitForTimeout(5000);
  console.log('Current URL:', page.url());

  // Extract the page content
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(500);
  }

  // Click See more links
  for (let round = 0; round < 10; round++) {
    const expanded = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('a, span, button'));
      const sm = all.find(el => el.textContent.trim() === 'See more' && el.childElementCount === 0);
      if (sm) { sm.click(); return true; }
      return false;
    });
    if (!expanded) break;
    await page.waitForTimeout(1500);
  }

  // Extract comments/notes
  const comments = await page.evaluate(() => {
    const bodies = document.querySelectorAll('[class*="feedCommentBodyInner"], [class*="noteBody"], [class*="feedPostBody"]');
    if (bodies.length > 0) {
      return Array.from(bodies).map(el => el.innerText.substring(0, 2000));
    }
    const main = document.querySelector('main') || document.body;
    return [main.innerText.substring(0, 5000)];
  });

  for (let i = 0; i < comments.length; i++) {
    console.log(`\n=== ITEM ${i} ===`);
    console.log(comments[i]);
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

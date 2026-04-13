// Inspect a Substack note page to understand reply mechanism
import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const PROFILE_DIR = join(homedir(), '.substack-playwright');
const url = process.argv[2] || 'https://substack.com/@inneralgorithms/note/c-242135423';

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});
const page = browser.pages()[0] || await browser.newPage();

await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(5000);
await page.screenshot({ path: join(homedir(), 'note-page.png') });
console.log('Screenshot: ~/note-page.png');

const info = await page.evaluate(() => {
  const textareas = Array.from(document.querySelectorAll('textarea'));
  const editables = Array.from(document.querySelectorAll('[contenteditable]'));
  const all = [...textareas, ...editables];
  const placeholders = all.map(el => ({
    tag: el.tagName,
    placeholder: el.placeholder || el.getAttribute('data-placeholder') || '',
    text: el.textContent ? el.textContent.substring(0, 50) : '',
    visible: el.offsetParent != null,
  }));

  const buttons = Array.from(document.querySelectorAll('button'));
  const replyBtns = buttons.filter(b => /reply|comment|respond|post/i.test(b.textContent.trim()))
    .map(b => b.textContent.trim().substring(0, 40));

  const links = Array.from(document.querySelectorAll('a'));
  const commentLinks = links.filter(l => /reply|comment/i.test(l.textContent.trim()))
    .map(l => ({ text: l.textContent.trim().substring(0, 40), href: (l.href || '').substring(0, 80) }));

  const hasRipened = document.body.innerText.includes('ripened');
  return {
    placeholders,
    replyBtns,
    commentLinks,
    hasRipened,
    snippet: document.body.innerText.substring(0, 400)
  };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();

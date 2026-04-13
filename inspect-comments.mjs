// Inspect comment section structure on a Substack article
import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const url = process.argv[2] || 'https://richardtuschman.substack.com/p/my-2024-mental-health-crisis';

const browser = await firefox.launchPersistentContext(join(homedir(), '.substack-playwright'), {
  headless: false,
  viewport: { width: 1280, height: 900 },
});
const page = browser.pages()[0] || await browser.newPage();

try {
  console.log(`Navigating to ${url}/comments ...`);
  await page.goto(url + '/comments', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: join(homedir(), 'tc0.png') });
  console.log('Screenshot: ~/tc0.png');

  await page.evaluate(() => window.scrollBy(0, 900));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(homedir(), 'tc1.png') });
  console.log('Screenshot: ~/tc1.png');

  const info = await page.evaluate(() => {
    const body = document.body.innerText;
    const hasSketchbook = body.includes('sketchbook');
    const hasDavidHoze = body.includes('David Hoze');
    const buttons = Array.from(document.querySelectorAll('button'));
    const replyBtns = buttons.filter(b => b.textContent.trim().toLowerCase() === 'reply');
    const authors = [];
    document.querySelectorAll('a[href*="substack.com/@"]').forEach(a => {
      if (a.textContent.trim()) authors.push(a.textContent.trim());
    });
    return {
      hasSketchbook,
      hasDavidHoze,
      replyButtonCount: replyBtns.length,
      authors: [...new Set(authors)],
    };
  });
  console.log(JSON.stringify(info, null, 2));

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(homedir(), 'tc-error.png') }).catch(() => {});
} finally {
  await browser.close();
}

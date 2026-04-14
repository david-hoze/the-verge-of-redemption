// Reply to a Substack note
// Usage: node reply-note.mjs <note-url> <comment-file> [--dry-run]

import { launchBrowser, getPage, screenshot, navigateTo,
         clickButton, findInput, typeText, clickSubmit } from './lib.mjs';
import { readFileSync } from 'fs';

const noteUrl = process.argv[2];
const commentFile = process.argv[3];
const dryRun = process.argv.includes('--dry-run');

if (!noteUrl || !commentFile) {
  console.error('Usage: node reply-note.mjs <note-url> <comment-file> [--dry-run]');
  process.exit(1);
}

const commentText = readFileSync(commentFile, 'utf-8').trim();
console.log('---');
console.log(commentText);
console.log('---');
if (dryRun) console.log('[DRY RUN]');

const browser = await launchBrowser();
const page = await getPage(browser);

try {
  await navigateTo(page, noteUrl, { timeout: 30000 });

  // Open the reply input
  const opened = await clickButton(page, 'leave a reply');
  console.log('Open reply:', JSON.stringify(opened));
  if (!opened.found) {
    await screenshot(page, 'note-reply-fail.png');
    console.log('Could not find "Leave a reply" button.');
    process.exit(1);
  }

  await page.waitForTimeout(2000);
  const input = await findInput(page);
  if (!input.found) {
    await screenshot(page, 'note-reply-noinput.png', { fullPage: true });
    console.log('Reply input not found.');
    process.exit(1);
  }

  await page.waitForTimeout(500);
  await typeText(page, commentText);
  await page.waitForTimeout(1000);
  await screenshot(page, 'note-before-reply.png');

  if (dryRun) {
    console.log('DRY RUN complete.');
    await page.waitForTimeout(10000);
    process.exit(0);
  }

  const result = await clickSubmit(page);
  if (result.clicked) {
    await page.waitForTimeout(5000);
    await screenshot(page, 'note-after-reply.png');
    console.log('REPLIED!');
  } else {
    await screenshot(page, 'note-reply-nobutton.png', { fullPage: true });
    console.log('Browser stays open 60s for manual posting.');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await screenshot(page, 'note-reply-error.png').catch(() => {});
} finally {
  await browser.close();
}

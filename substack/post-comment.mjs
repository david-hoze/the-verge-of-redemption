// Post a comment on a Substack article
// Usage: node post-comment.mjs <article-url> <comment-file> [--dry-run] [--restack]

import { launchBrowser, getPage, screenshot, navigateTo,
         findCommentInput, typeText, checkRestack, clickSubmit, checkPaywall } from './lib.mjs';
import { readFileSync } from 'fs';

const articleUrl = process.argv[2];
const commentFile = process.argv[3];
const dryRun = process.argv.includes('--dry-run');
const restack = process.argv.includes('--restack');

if (!articleUrl || !commentFile) {
  console.error('Usage: node post-comment.mjs <article-url> <comment-file> [--dry-run] [--restack]');
  process.exit(1);
}

const commentText = readFileSync(commentFile, 'utf-8').trim();
console.log('---');
console.log(commentText);
console.log('---');
if (dryRun) console.log('[DRY RUN]');
if (restack) console.log('[RESTACK]');

const browser = await launchBrowser();
const page = await getPage(browser);

try {
  await navigateTo(page, articleUrl, { wait: 4000 });

  // Scroll to comments area
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7));
  await page.waitForTimeout(2000);

  const input = await findCommentInput(page);
  if (!input) {
    await screenshot(page, 'substack-no-input.png');
    console.log('ERROR: Could not find comment input.');
    await page.waitForTimeout(10000);
    process.exit(1);
  }

  console.log(`Found input: ${input.selector}`);
  await input.element.click();
  await page.waitForTimeout(4000);

  // Check if clicking the input triggered a paywall modal
  const paywall = await checkPaywall(page);
  if (paywall.blocked) {
    await screenshot(page, 'substack-paywall.png');
    console.log('ERROR: Comments are paywalled on this post. Cannot comment.');
    process.exit(1);
  }

  await input.element.focus();
  await page.waitForTimeout(500);
  await typeText(page, commentText);
  await page.waitForTimeout(1000);

  if (restack) await checkRestack(page);
  await screenshot(page, 'substack-before-post.png', { fullPage: true });

  if (dryRun) {
    console.log('DRY RUN complete.');
    await page.waitForTimeout(15000);
    process.exit(0);
  }

  const result = await clickSubmit(page);
  if (result.clicked) {
    await page.waitForTimeout(5000);
    await screenshot(page, 'substack-after-post.png');
    console.log('POSTED!');
  } else {
    await screenshot(page, 'substack-no-button.png', { fullPage: true });
    console.log('Browser stays open 60s for manual posting.');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await screenshot(page, 'substack-error.png').catch(() => {});
} finally {
  await browser.close();
}

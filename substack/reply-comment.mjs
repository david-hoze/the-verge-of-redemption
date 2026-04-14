// Reply to a specific comment on Substack
// Usage: node reply-comment.mjs <url> <comment-file> <search-text> [--dry-run] [--restack] [--newest]
//
// <url> can be:
//   - Article URL: https://pub.substack.com/p/slug (navigates to /comments)
//   - Comment thread URL: https://pub.substack.com/p/slug/comment/12345
//   - With hash: .../comment/12345#comment-67890 (targets hash comment)

import { launchBrowser, getPage, screenshot, navigateTo, loadAllContent,
         sortNewest, findComment, findInput, setText, checkRestack,
         clickSubmit } from './lib.mjs';
import { readFileSync } from 'fs';

const inputUrl = process.argv[2];
const commentFile = process.argv[3];
const searchText = process.argv[4];
const dryRun = process.argv.includes('--dry-run');
const restack = process.argv.includes('--restack');
const preferNewest = process.argv.includes('--newest');

const hashMatch = (inputUrl || '').match(/#comment-(\d+)/);
const targetCommentId = hashMatch ? hashMatch[1] : null;

if (!inputUrl || !commentFile || !searchText) {
  console.error('Usage: node reply-comment.mjs <url> <comment-file> <search-text> [--dry-run] [--restack] [--newest]');
  process.exit(1);
}

const commentText = readFileSync(commentFile, 'utf-8').trim();
console.log(`Search: "${searchText}"${targetCommentId ? ` (target ID: ${targetCommentId})` : ''}`);
console.log('---');
console.log(commentText);
console.log('---');
if (dryRun) console.log('[DRY RUN]');

const isCommentThread = /\/comment\/\d+/.test(inputUrl);
const navUrl = isCommentThread
  ? inputUrl.split('?')[0].split('#')[0]
  : inputUrl.replace(/\/$/, '') + '/comments';

const browser = await launchBrowser();
const page = await getPage(browser);
page.setDefaultTimeout(30000);

try {
  await navigateTo(page, navUrl);
  if (!isCommentThread) await sortNewest(page);
  await loadAllContent(page);

  const found = await findComment(page, { search: searchText, targetId: targetCommentId, newest: preferNewest });
  if (!found.found) {
    await screenshot(page, 'substack-reply-notfound.png', { fullPage: true });
    if (found.searchTextOnPage) console.log('NOTE: Search text IS on page but no Reply button found near it.');
    console.log('Browser stays open 60s for manual action.');
    await page.waitForTimeout(60000);
    process.exit(1);
  }

  await page.waitForTimeout(3000);
  const input = await findInput(page);
  if (!input.found) {
    await screenshot(page, 'substack-reply-noinput.png', { fullPage: true });
    console.log('Browser stays open 60s for manual action.');
    await page.waitForTimeout(60000);
    process.exit(1);
  }

  await page.waitForTimeout(500);
  await setText(page, commentText);
  await page.waitForTimeout(1000);

  if (restack) await checkRestack(page);
  await screenshot(page, 'substack-before-reply.png');

  if (dryRun) {
    console.log('DRY RUN complete.');
    await page.waitForTimeout(15000);
    process.exit(0);
  }

  const result = await clickSubmit(page);
  if (result.clicked) {
    await page.waitForTimeout(5000);
    await screenshot(page, 'substack-after-reply.png');
    console.log('REPLIED!');
  } else {
    await screenshot(page, 'substack-reply-nobutton.png', { fullPage: true });
    console.log('Browser stays open 60s for manual posting.');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await screenshot(page, 'substack-reply-error.png').catch(() => {});
} finally {
  await browser.close();
}

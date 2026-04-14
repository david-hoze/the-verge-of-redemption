// Post a reply in a Substack chat thread
// Usage: node post-chat.mjs <chat-url> <reply-file> [--dry-run]

import { launchBrowser, getPage, screenshot, navigateTo,
         findInput, typeChatText, clickSubmit } from './lib.mjs';
import { readFileSync } from 'fs';

const chatUrl = process.argv[2];
const replyFile = process.argv[3];
const dryRun = process.argv.includes('--dry-run');

if (!chatUrl || !replyFile) {
  console.error('Usage: node post-chat.mjs <chat-url> <reply-file> [--dry-run]');
  process.exit(1);
}

const replyText = readFileSync(replyFile, 'utf-8').trim();
console.log('---');
console.log(replyText);
console.log('---');
if (dryRun) console.log('[DRY RUN]');

const browser = await launchBrowser();
const page = await getPage(browser);

try {
  await navigateTo(page, chatUrl, { wait: 8000, timeout: 30000 });

  const input = await findInput(page);
  if (!input.found) {
    await screenshot(page, 'chat-reply-fail.png');
    console.log('Reply input not found.');
    process.exit(1);
  }

  await page.waitForTimeout(500);
  await typeChatText(page, replyText);
  await page.waitForTimeout(1000);
  await screenshot(page, 'chat-before-send.png');

  if (dryRun) {
    console.log('DRY RUN complete.');
    await page.waitForTimeout(10000);
    process.exit(0);
  }

  // Chat uses send/post buttons or Enter to submit
  const result = await clickSubmit(page, ['send', 'post', 'reply']);
  if (!result.clicked) {
    // Fallback: try SVG button or Enter key
    const svgResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const svgBtn = buttons.filter(b => b.querySelector('svg') && b.offsetParent);
      if (svgBtn.length > 0) {
        const btn = svgBtn[svgBtn.length - 1];
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return { sent: true, method: 'svg-button' };
      }
      return { sent: false };
    });
    if (!svgResult.sent) {
      console.log('No send button found, pressing Enter...');
      await page.keyboard.press('Enter');
    }
  }

  await page.waitForTimeout(3000);
  await screenshot(page, 'chat-after-send.png');
  console.log('SENT!');

} catch (err) {
  console.error('Error:', err.message);
  await screenshot(page, 'chat-reply-error.png').catch(() => {});
} finally {
  await browser.close();
}

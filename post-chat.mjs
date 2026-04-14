// Post a reply in a Substack chat thread
// Usage: node post-chat.mjs <chat-url> <reply-file> [--dry-run]

import { launchBrowser, getPage, screenshot, HOME } from './lib/substack.mjs';
import { join } from 'path';
import { readFileSync } from 'fs';
const chatUrl = process.argv[2];
const replyFile = process.argv[3];
const dryRun = process.argv.includes('--dry-run');

if (!chatUrl || !replyFile) {
  console.error('Usage: node post-chat.mjs <chat-url> <reply-file> [--dry-run]');
  process.exit(1);
}

const replyText = readFileSync(replyFile, 'utf-8').trim();
console.log('Reply to post:');
console.log('---');
console.log(replyText);
console.log('---');
if (dryRun) console.log('[DRY RUN - will not post]');

const browser = await launchBrowser();
const page = await getPage(browser);

try {
  console.log(`Navigating to ${chatUrl} ...`);
  await page.goto(chatUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(8000);

  // Find the contenteditable reply input in the right panel (thread view)
  console.log('Looking for reply input...');
  const inputInfo = await page.evaluate(() => {
    const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    // Chat reply inputs are contenteditable divs
    // Find the one in the thread/replies panel (right side)
    for (let i = editables.length - 1; i >= 0; i--) {
      const el = editables[i];
      if (el.offsetParent) {
        const rect = el.getBoundingClientRect();
        el.scrollIntoView({ block: 'center' });
        el.focus();
        el.click();
        return { found: true, index: i, total: editables.length, left: rect.left, width: rect.width };
      }
    }
    return { found: false, total: editables.length };
  });
  console.log('Input info:', JSON.stringify(inputInfo));

  if (!inputInfo.found) {
    console.log('Reply input not found.');
    await page.screenshot({ path: join(HOME, 'chat-reply-fail.png') });
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(500);

  // Type the reply - chat uses Enter for newlines differently
  // In Substack chat, Enter sends the message, Shift+Enter adds a newline
  console.log('Typing reply...');
  const paragraphs = replyText.split('\n\n');
  for (let i = 0; i < paragraphs.length; i++) {
    // Type each line within the paragraph
    const lines = paragraphs[i].split('\n');
    for (let j = 0; j < lines.length; j++) {
      await page.keyboard.type(lines[j], { delay: 3 });
      if (j < lines.length - 1) {
        await page.keyboard.press('Shift+Enter');
      }
    }
    if (i < paragraphs.length - 1) {
      await page.keyboard.press('Shift+Enter');
      await page.keyboard.press('Shift+Enter');
    }
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(HOME, 'chat-before-send.png') });
  console.log('Screenshot before sending: ~/chat-before-send.png');

  if (dryRun) {
    console.log('DRY RUN complete. Reply typed but not sent.');
    await page.waitForTimeout(10000);
    await browser.close();
    process.exit(0);
  }

  // Send - in Substack chat, clicking the send button or pressing Enter
  // Look for a send button first
  const sendResult = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    // Look for send/post/reply button
    for (const btn of buttons) {
      const text = btn.textContent.trim().toLowerCase();
      const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
      if (text === 'send' || text === 'post' || text === 'reply' ||
          ariaLabel === 'send' || ariaLabel === 'post' ||
          btn.querySelector('svg[class*="send"]')) {
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return { sent: true, method: 'button', text: btn.textContent.trim().substring(0, 20) };
      }
    }

    // Look for any button with an SVG (send icon) near the input
    const svgButtons = buttons.filter(b => b.querySelector('svg') && b.offsetParent);
    if (svgButtons.length > 0) {
      const btn = svgButtons[svgButtons.length - 1];
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return { sent: true, method: 'svg-button' };
    }

    return { sent: false, buttonCount: buttons.length };
  });

  console.log('Send result:', JSON.stringify(sendResult));

  // If no button found, try pressing Enter (chat standard)
  if (!sendResult.sent) {
    console.log('No send button found, pressing Enter...');
    await page.keyboard.press('Enter');
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(HOME, 'chat-after-send.png') });
  console.log('SENT! Screenshot: ~/chat-after-send.png');

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(HOME, 'chat-reply-error.png') }).catch(() => {});
} finally {
  await browser.close();
}

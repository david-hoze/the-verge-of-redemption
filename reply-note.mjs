// Reply to a Substack note
// Usage: node reply-note.mjs <note-url> <comment-file> [--dry-run]

import { launchBrowser, getPage, screenshot, HOME } from './lib/substack.mjs';
import { join } from 'path';
import { readFileSync } from 'fs';
const noteUrl = process.argv[2];
const commentFile = process.argv[3];
const dryRun = process.argv.includes('--dry-run');

if (!noteUrl || !commentFile) {
  console.error('Usage: node reply-note.mjs <note-url> <comment-file> [--dry-run]');
  process.exit(1);
}

const commentText = readFileSync(commentFile, 'utf-8').trim();
console.log('Reply to post:');
console.log('---');
console.log(commentText);
console.log('---');
if (dryRun) console.log('[DRY RUN - will not post]');

const browser = await launchBrowser();
const page = await getPage(browser);

try {
  console.log(`Navigating to ${noteUrl} ...`);
  await page.goto(noteUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Click "Leave a reply..." button to open the input
  console.log('Looking for "Leave a reply..." button...');
  const opened = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const btn of buttons) {
      if (/leave a reply/i.test(btn.textContent.trim())) {
        btn.scrollIntoView({ block: 'center' });
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return { found: true, text: btn.textContent.trim() };
      }
    }
    return { found: false };
  });
  console.log('Button result:', JSON.stringify(opened));

  if (!opened.found) {
    console.log('Could not find "Leave a reply" button.');
    await page.screenshot({ path: join(HOME, 'note-reply-fail.png') });
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(HOME, 'note-reply-opened.png') });
  console.log('Screenshot after opening: ~/note-reply-opened.png');

  // Find the textarea or contenteditable that appeared
  const inputInfo = await page.evaluate(() => {
    // Check for textareas first
    const textareas = Array.from(document.querySelectorAll('textarea'));
    for (let i = textareas.length - 1; i >= 0; i--) {
      const ta = textareas[i];
      if (ta.offsetParent != null) {
        ta.scrollIntoView({ block: 'center' });
        ta.focus();
        ta.click();
        return { found: true, type: 'textarea', index: i, placeholder: ta.placeholder };
      }
    }

    // Check for contenteditable
    const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    for (let i = editables.length - 1; i >= 0; i--) {
      const el = editables[i];
      if (el.offsetParent != null) {
        el.scrollIntoView({ block: 'center' });
        el.focus();
        el.click();
        return { found: true, type: 'contenteditable', index: i };
      }
    }

    return { found: false, textareaCount: textareas.length, editableCount: editables.length };
  });
  console.log('Input info:', JSON.stringify(inputInfo));

  if (!inputInfo.found) {
    console.log('Reply input not found after clicking button.');
    await page.screenshot({ path: join(HOME, 'note-reply-noinput.png'), fullPage: true });
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(500);

  // Type the reply
  console.log('Typing reply...');
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');

  const paragraphs = commentText.split('\n\n');
  for (let i = 0; i < paragraphs.length; i++) {
    await page.keyboard.type(paragraphs[i], { delay: 5 });
    if (i < paragraphs.length - 1) {
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');
    }
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(HOME, 'note-before-reply.png') });
  console.log('Screenshot before posting: ~/note-before-reply.png');

  if (dryRun) {
    console.log('DRY RUN complete. Reply typed but not posted.');
    await page.waitForTimeout(10000);
    await browser.close();
    process.exit(0);
  }

  // Click the submit button - look for Reply/Post button
  console.log('Looking for submit button...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const candidates = buttons.filter(b => {
      const text = b.textContent.trim().toLowerCase();
      return (text === 'reply' || text === 'post' || text === 'comment') && b.offsetParent != null;
    });

    if (candidates.length > 0) {
      const btn = candidates[candidates.length - 1];
      btn.scrollIntoView({ block: 'center' });
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return { clicked: true, text: btn.textContent.trim() };
    }

    // Fallback: any button with reply/post
    const fallback = buttons.filter(b => /^(reply|post|comment|send)/i.test(b.textContent.trim()) && b.offsetParent != null);
    if (fallback.length > 0) {
      const btn = fallback[fallback.length - 1];
      btn.scrollIntoView({ block: 'center' });
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return { clicked: true, text: btn.textContent.trim(), method: 'fallback' };
    }

    return { clicked: false, allButtons: buttons.map(b => b.textContent.trim().substring(0, 30)).filter(t => t.length > 0) };
  });

  console.log('Click result:', JSON.stringify(clicked));

  if (clicked.clicked) {
    await page.waitForTimeout(5000);
    await page.screenshot({ path: join(HOME, 'note-after-reply.png') });
    console.log('REPLIED! Screenshot: ~/note-after-reply.png');
  } else {
    await page.screenshot({ path: join(HOME, 'note-reply-nobutton.png'), fullPage: true });
    console.log('Could not find submit button. Buttons found:', JSON.stringify(clicked.allButtons));
    console.log('Browser stays open 60s for manual posting.');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(HOME, 'note-reply-error.png') }).catch(() => {});
} finally {
  await browser.close();
}

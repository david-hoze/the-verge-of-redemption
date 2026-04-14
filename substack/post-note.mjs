// Post a Note to Substack
// Usage: node substack/post-note.mjs <text-or-file> [--link URL] [--dry-run]
//
// Posts a Note from the Substack Notes composer.
// If argument is a file path, reads the file content.
// --link appends a clickable link card.

import { launchBrowser, getPage, screenshot, navigateTo, typeText, clickSubmit } from './lib.mjs';
import { readFileSync, existsSync } from 'fs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const linkIdx = args.indexOf('--link');
const link = linkIdx >= 0 ? args[linkIdx + 1] : null;
const textArg = args.find(a => a !== '--dry-run' && a !== '--link' && a !== link);

if (!textArg) {
  console.error('Usage: node post-note.mjs <text-or-file> [--link URL] [--dry-run]');
  process.exit(1);
}

let noteText = existsSync(textArg) ? readFileSync(textArg, 'utf-8').trim() : textArg;

// If there is a link, append it on a new line
if (link) {
  noteText += '\n\n' + link;
}

console.log('--- Note to post ---');
console.log(noteText);
console.log('---');
if (dryRun) console.log('[DRY RUN]');

const browser = await launchBrowser({ timeout: 60000 });
const page = await getPage(browser);

try {
  // Navigate to Notes
  await navigateTo(page, 'https://substack.com/notes', { wait: 5000, timeout: 60000 });

  // Find and click the Notes composer
  // The composer is typically a placeholder like "What's on your mind?" or a button
  const opened = await page.evaluate(() => {
    // Try placeholder text
    const placeholders = [
      'what\'s on your mind',
      'write a note',
      'share a thought',
      'post',
    ];

    // Look for contenteditable or textarea
    const editables = Array.from(document.querySelectorAll('[contenteditable="true"], textarea'));
    for (const el of editables) {
      const ph = (el.getAttribute('placeholder') || el.getAttribute('data-placeholder') || el.textContent || '').toLowerCase();
      if (placeholders.some(p => ph.includes(p)) || el.classList.contains('ProseMirror')) {
        el.scrollIntoView({ block: 'center' });
        el.focus();
        el.click();
        return { found: true, method: 'editable', placeholder: ph.substring(0, 50) };
      }
    }

    // Try clicking a button that opens the composer
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    for (const btn of buttons) {
      const text = (btn.textContent || '').toLowerCase().trim();
      if (placeholders.some(p => text.includes(p))) {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        return { found: true, method: 'button', text: text.substring(0, 50) };
      }
    }

    // Try any visible ProseMirror
    const pm = document.querySelector('.ProseMirror');
    if (pm) {
      pm.scrollIntoView({ block: 'center' });
      pm.focus();
      pm.click();
      return { found: true, method: 'prosemirror' };
    }

    return { found: false, editableCount: editables.length, buttonTexts: buttons.map(b => b.textContent.trim().substring(0, 30)).slice(0, 10) };
  });

  console.log('Composer:', JSON.stringify(opened));

  if (!opened.found) {
    await screenshot(page, 'note-composer-fail.png', { fullPage: true });
    console.error('Could not find Notes composer. Screenshot saved.');
    process.exit(1);
  }

  await page.waitForTimeout(1000);

  // Type the note
  await typeText(page, noteText);
  await page.waitForTimeout(1000);

  await screenshot(page, 'note-before-post.png');

  if (dryRun) {
    console.log('DRY RUN complete. Browser stays open 30s for inspection.');
    await page.waitForTimeout(30000);
    process.exit(0);
  }

  // Click Post
  const result = await clickSubmit(page, ['post']);
  if (result.clicked) {
    await page.waitForTimeout(5000);
    await screenshot(page, 'note-after-post.png');
    console.log('NOTE POSTED!');
  } else {
    await screenshot(page, 'note-post-fail.png', { fullPage: true });
    console.log('Could not find Post button. Screenshot saved.');
    console.log('Browser stays open 60s for manual posting.');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await screenshot(page, 'note-error.png').catch(() => {});
} finally {
  await browser.close();
}

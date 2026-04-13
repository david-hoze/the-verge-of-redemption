// Reply to a note/comment thread on Substack
// Usage: node post-note-reply.mjs <note-url> <comment-file> [--dry-run]

import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';
import { readFileSync } from 'fs';

const PROFILE_DIR = join(homedir(), '.substack-playwright');
const noteUrl = process.argv[2];
const commentFile = process.argv[3];
const dryRun = process.argv.includes('--dry-run');

if (!noteUrl || !commentFile) {
  console.error('Usage: node post-note-reply.mjs <note-url> <comment-file> [--dry-run]');
  process.exit(1);
}

const commentText = readFileSync(commentFile, 'utf-8').trim();
console.log('Reply to post:');
console.log('---');
console.log(commentText);
console.log('---');

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  console.log(`Navigating to ${noteUrl}...`);
  await page.goto(noteUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: join(homedir(), 'note-debug-0.png') });
  console.log('Screenshot: ~/note-debug-0.png');

  // Click "Leave a reply..." to open the reply input
  console.log('Looking for reply area...');

  // First try clicking the "Leave a reply" placeholder
  const placeholder = await page.$('text=Leave a reply')
    || await page.$('text=Write a reply')
    || await page.$('text=Add a comment');
  if (placeholder) {
    await placeholder.click();
    console.log('Clicked "Leave a reply" placeholder');
    await page.waitForTimeout(2000);
  }

  let replyInput = await page.$('div.ProseMirror[contenteditable="true"]')
    || await page.$('[role="textbox"]');

  if (!replyInput) {
    // Try clicking the speech bubble icon in the note action bar
    console.log('Trying speech bubble icon...');
    await page.evaluate(() => {
      // Find all action bar buttons that contain an SVG (like/comment/restack/share)
      const actionBtns = Array.from(document.querySelectorAll('button'));
      for (const btn of actionBtns) {
        const svg = btn.querySelector('svg');
        if (!svg) continue;
        // The comment icon typically has a speech bubble path
        const paths = svg.querySelectorAll('path');
        for (const p of paths) {
          const d = p.getAttribute('d') || '';
          // Speech bubble paths typically contain curves that look like bubbles
          if (d.includes('M7') || d.includes('comment') || d.includes('bubble')) {
            btn.click();
            return true;
          }
        }
        // Also check aria-label
        const label = (btn.getAttribute('aria-label') || '').toLowerCase();
        if (label.includes('comment') || label.includes('reply') || label.includes('respond')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    await page.waitForTimeout(2000);

    replyInput = await page.$('div.ProseMirror[contenteditable="true"]')
      || await page.$('[role="textbox"]');
  }

  if (!replyInput) {
    // Last resort: find any contenteditable
    replyInput = await page.$('[contenteditable="true"]');
  }

  await page.screenshot({ path: join(homedir(), 'note-debug-1.png') });
  console.log('Screenshot: ~/note-debug-1.png');

  if (!replyInput) {
    console.log('ERROR: Could not find reply input.');
    console.log('Keeping browser open 60s for manual inspection...');
    await page.waitForTimeout(60000);
    await browser.close();
    process.exit(1);
  }

  console.log('Found reply input, typing...');
  await replyInput.click();
  await page.waitForTimeout(500);
  await replyInput.focus();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');

  // Type paragraphs
  const paragraphs = commentText.split('\n\n');
  for (let i = 0; i < paragraphs.length; i++) {
    await page.keyboard.type(paragraphs[i], { delay: 5 });
    if (i < paragraphs.length - 1) {
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');
    }
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: join(homedir(), 'note-before-post.png'), fullPage: true });
  console.log('Screenshot: ~/note-before-post.png');

  if (dryRun) {
    console.log('DRY RUN complete. Reply typed but not posted.');
    await page.waitForTimeout(30000);
    await browser.close();
    process.exit(0);
  }

  // Step 1: Click "Reply" button to trigger the confirmation modal
  console.log('Step 1: Looking for Reply button...');
  const step1 = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const replyBtn = buttons.find(b => {
      const text = b.textContent.trim().toLowerCase();
      return (text === 'reply' || text === 'post' || text === 'comment') && !b.disabled;
    });
    if (replyBtn) {
      replyBtn.scrollIntoView({ block: 'center' });
      replyBtn.click();
      return { clicked: true, text: replyBtn.textContent.trim() };
    }
    return { clicked: false, buttons: buttons.map(b => b.textContent.trim().substring(0, 40)).filter(t => t.length > 0) };
  });
  console.log('Step 1 result:', JSON.stringify(step1));

  // Wait for confirmation modal to appear
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(homedir(), 'note-modal.png') });
  console.log('Screenshot after step 1: ~/note-modal.png');

  // Step 2: Click "Post" in the confirmation modal
  console.log('Step 2: Looking for Post button in modal...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const allTexts = buttons.map(b => b.textContent.trim().substring(0, 40)).filter(t => t.length > 0);

    // Look for "Post" button (the orange confirmation button)
    const postBtn = buttons.find(b => {
      const text = b.textContent.trim().toLowerCase();
      return text === 'post' && !b.disabled;
    });
    if (postBtn) {
      postBtn.click();
      return { clicked: true, text: postBtn.textContent.trim() };
    }
    return { clicked: false, buttons: allTexts };
  });

  console.log('Click result:', JSON.stringify(clicked));

  if (clicked.clicked) {
    await page.waitForTimeout(5000);
    await page.screenshot({ path: join(homedir(), 'note-after-post.png') });
    console.log('POSTED! Screenshot: ~/note-after-post.png');
  } else {
    console.log('Could not find post button. Keeping browser open 60s...');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(homedir(), 'note-error.png') });
} finally {
  await browser.close();
}

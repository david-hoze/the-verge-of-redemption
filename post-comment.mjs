// Post a comment on Substack using Playwright
// Usage: node post-comment.mjs <article-url> <comment-file> [--dry-run] [--restack]
// Uses persistent context so login is remembered between runs

import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';
import { readFileSync } from 'fs';

const PROFILE_DIR = join(homedir(), '.substack-playwright');

const articleUrl = process.argv[2];
const commentFile = process.argv[3];
const dryRun = process.argv.includes('--dry-run');
const restack = process.argv.includes('--restack');

if (!articleUrl || !commentFile) {
  console.error('Usage: node post-comment.mjs <article-url> <comment-file> [--dry-run] [--restack]');
  process.exit(1);
}

const commentText = readFileSync(commentFile, 'utf-8').trim();
console.log('Comment to post:');
console.log('---');
console.log(commentText);
console.log('---');
if (dryRun) console.log('[DRY RUN - will not post]');
if (restack) console.log('[RESTACK - will also share to Notes]');

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  console.log('Navigating to article...');
  await page.goto(articleUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Screenshot initial state
  await page.screenshot({ path: join(homedir(), 'substack-debug.png') });
  console.log('Screenshot: ~/substack-debug.png');

  // Scroll to comments
  console.log('Scrolling to comments...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7));
  await page.waitForTimeout(2000);

  // Try to find comment input with multiple selectors
  const selectors = [
    '.comment-input .ProseMirror',
    '[data-testid="comment-input"]',
    '.comment-input',
    'div.ProseMirror[contenteditable="true"]',
    '[contenteditable="true"]',
    'textarea[placeholder*="comment" i]',
    'textarea[placeholder*="write" i]',
    '[role="textbox"]',
  ];

  let commentInput = null;
  let usedSelector = '';
  for (const sel of selectors) {
    commentInput = await page.$(sel);
    if (commentInput) {
      usedSelector = sel;
      break;
    }
  }

  if (!commentInput) {
    console.log('No comment input found, looking for comment button...');
    const commentButton = await page.$('button:has-text("comment")')
      || await page.$('a:has-text("comment")')
      || await page.$('[data-testid="comment-button"]');
    if (commentButton) {
      await commentButton.click();
      await page.waitForTimeout(2000);
      for (const sel of selectors) {
        commentInput = await page.$(sel);
        if (commentInput) {
          usedSelector = sel;
          break;
        }
      }
    }
  }

  if (!commentInput) {
    await page.screenshot({ path: join(homedir(), 'substack-no-input.png') });
    console.log('ERROR: Could not find comment input. Screenshot: ~/substack-no-input.png');
    await page.waitForTimeout(10000);
    await browser.close();
    process.exit(1);
  }

  console.log(`Found comment input: ${usedSelector}`);
  await commentInput.click();
  await page.waitForTimeout(500);

  // Type the comment
  console.log('Typing comment...');
  await commentInput.focus();
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

  // Check the "Also share to Notes" checkbox if restack requested
  if (restack) {
    console.log('Looking for "share to Notes" checkbox...');
    const checked = await page.evaluate(() => {
      // Look for checkbox near "Notes" or "share" text
      const labels = Array.from(document.querySelectorAll('label'));
      const notesLabel = labels.find(l => /notes|share|restack/i.test(l.textContent));
      if (notesLabel) {
        const checkbox = notesLabel.querySelector('input[type="checkbox"]')
          || notesLabel.previousElementSibling
          || document.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) {
          checkbox.click();
          return 'checked';
        }
        if (checkbox && checkbox.checked) return 'already-checked';
      }
      // Try any checkbox near the comment area
      const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
      if (checkboxes.length) {
        const unchecked = checkboxes.find(c => !c.checked);
        if (unchecked) { unchecked.click(); return 'checked-fallback'; }
      }
      return 'not-found';
    });
    console.log(`Notes checkbox: ${checked}`);
  }

  // Screenshot before posting
  await page.screenshot({ path: join(homedir(), 'substack-before-post.png'), fullPage: true });
  console.log('Screenshot: ~/substack-before-post.png');

  if (dryRun) {
    console.log('DRY RUN complete. Comment typed but not posted.');
    await page.waitForTimeout(15000);
    await browser.close();
    process.exit(0);
  }

  // Click Post using JavaScript directly (bypasses visibility checks)
  console.log('Looking for Post button...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    // Log all buttons for debugging
    const info = buttons.map(b => ({
      text: b.textContent.trim().substring(0, 50),
      disabled: b.disabled,
      visible: b.offsetParent !== null,
      rect: b.getBoundingClientRect()
    }));
    console.log('All buttons:', JSON.stringify(info));

    // Find post button
    const postBtn = buttons.find(b => {
      const text = b.textContent.trim().toLowerCase();
      return (text === 'post' || text === 'reply' || text === 'comment')
        && !b.disabled;
    });

    if (postBtn) {
      postBtn.scrollIntoView({ block: 'center' });
      postBtn.click();
      return { clicked: true, text: postBtn.textContent.trim() };
    }
    return { clicked: false, buttons: info };
  });

  console.log('Click result:', JSON.stringify(clicked));

  if (clicked.clicked) {
    await page.waitForTimeout(5000);
    await page.screenshot({ path: join(homedir(), 'substack-after-post.png') });
    console.log('POSTED! Screenshot: ~/substack-after-post.png');
  } else {
    await page.screenshot({ path: join(homedir(), 'substack-no-button.png'), fullPage: true });
    console.log('Could not find post button. Screenshot: ~/substack-no-button.png');
    console.log('Browser stays open 60s for manual posting.');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(homedir(), 'substack-error.png') });
  console.log('Error screenshot: ~/substack-error.png');
} finally {
  await browser.close();
}

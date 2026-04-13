// Post a reply to a specific comment in a Substack thread
// Usage: node post-reply.mjs <url> <text-file> <target-text>
//   url: Substack note/comment URL
//   text-file: path to file containing reply text
//   target-text: text snippet to match the comment you're replying to
// If target-text is omitted, lists all comments and exits so you can pick.
import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';
import { readFileSync } from 'fs';

const PROFILE_DIR = join(homedir(), '.substack-playwright');
const url = process.argv[2];
const textFile = process.argv[3];
const targetText = process.argv[4];

if (!url) {
  console.log('Usage: node post-reply.mjs <url> <text-file> [target-text]');
  console.log('  If target-text is omitted, lists comments and exits.');
  process.exit(1);
}

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1920, height: 1200 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  console.log('Navigating...');
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Scroll to load all comments
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(800);
  }

  // Find all comments
  const comments = await page.evaluate(() => {
    const bodies = document.querySelectorAll('[class*="feedCommentBodyInner"]');
    return Array.from(bodies).map(el => el.textContent.substring(0, 80));
  });
  console.log(`Found ${comments.length} comments`);
  comments.forEach((c, i) => console.log(`  ${i}: ${c}`));

  // If no target or text file, just list and exit
  if (!textFile || !targetText) {
    console.log('\nNo target specified. Pass a text snippet as 3rd arg to reply.');
    await browser.close();
    process.exit(0);
  }

  const text = readFileSync(textFile, 'utf-8').trim();
  console.log(`\nReply text: ${text.length} chars, ${text.split('\n\n').length} paragraphs`);

  // Find the target comment
  const targetIdx = comments.findIndex(c => c.includes(targetText));
  console.log(`Target comment index: ${targetIdx}`);
  if (targetIdx === -1) throw new Error('Target comment not found: ' + targetText);

  // Click the reply icon for that comment
  const clicked = await page.evaluate((idx) => {
    const bodies = document.querySelectorAll('[class*="feedCommentBodyInner"]');
    const body = bodies[idx];
    if (!body) return { error: 'no comment body at index ' + idx };

    // Walk up to find the action bar with the reply button
    let container = body;
    for (let i = 0; i < 10; i++) {
      container = container.parentElement;
      if (!container) break;
      const buttons = container.querySelectorAll('button');
      for (const btn of Array.from(buttons)) {
        const parent = btn.parentElement;
        const siblings = Array.from(parent.querySelectorAll(':scope > button, :scope > a'));
        if (siblings.length >= 3 && siblings.indexOf(btn) === 1) {
          btn.scrollIntoView({ block: 'center' });
          btn.click();
          return { clicked: true };
        }
      }
    }
    return { error: 'no reply button found' };
  }, targetIdx);

  console.log('Click result:', JSON.stringify(clicked));
  if (clicked.error) throw new Error(clicked.error);
  await page.waitForTimeout(3000);

  // Find the text input
  const input = await page.$('div.ProseMirror[contenteditable="true"]')
    || await page.$('[role="textbox"]')
    || await page.$('[contenteditable="true"]');

  if (!input) throw new Error('No text input found');

  await input.click();
  await input.focus();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');

  // Type paragraph by paragraph
  const paragraphs = text.split('\n\n');
  for (let i = 0; i < paragraphs.length; i++) {
    await page.keyboard.type(paragraphs[i], { delay: 3 });
    if (i < paragraphs.length - 1) {
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');
    }
  }
  console.log('Text typed');
  await page.waitForTimeout(2000);

  // Click Post/Reply button
  const postResult = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => {
      const t = b.textContent.trim().toLowerCase();
      return (t === 'reply' || t === 'post' || t === 'comment') && !b.disabled;
    });
    if (btn) { btn.click(); return { clicked: true, text: btn.textContent.trim() }; }
    return { clicked: false };
  });
  console.log('Post step 1:', JSON.stringify(postResult));
  await page.waitForTimeout(3000);

  // Confirmation modal if any
  const confirmResult = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.trim().toLowerCase() === 'post' && !b.disabled);
    if (btn) { btn.click(); return { clicked: true }; }
    return { clicked: false };
  });
  console.log('Post step 2:', JSON.stringify(confirmResult));
  await page.waitForTimeout(3000);

  console.log('Done! Reply posted.');

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

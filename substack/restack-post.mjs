// Restack a Substack post to your Notes
// Usage: node substack/restack-post.mjs <article-url> [comment-text-or-file] [--dry-run]
//
// Navigates to the article, clicks restack/share, optionally adds a comment,
// and posts to Notes.

import { launchBrowser, getPage, screenshot, navigateTo, typeText } from './lib.mjs';
import { readFileSync, existsSync } from 'fs';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const articleUrl = args.find(a => a.startsWith('http'));
const commentArg = args.find(a => a !== articleUrl && a !== '--dry-run');

if (!articleUrl) {
  console.error('Usage: node restack-post.mjs <article-url> [comment-text-or-file] [--dry-run]');
  process.exit(1);
}

let comment = null;
if (commentArg) {
  comment = existsSync(commentArg) ? readFileSync(commentArg, 'utf-8').trim() : commentArg;
}

console.log('Restacking:', articleUrl);
if (comment) console.log('Comment:', comment.substring(0, 100));
if (dryRun) console.log('[DRY RUN]');

const browser = await launchBrowser({ timeout: 60000 });
const page = await getPage(browser);

try {
  await navigateTo(page, articleUrl, { wait: 5000, timeout: 60000 });

  // Find and click the restack/share button
  const restackResult = await page.evaluate(() => {
    // Look for restack button (various Substack UI variants)
    const allButtons = Array.from(document.querySelectorAll('button, [role="button"]'));

    // Try to find by aria-label or title
    for (const btn of allButtons) {
      const label = (btn.getAttribute('aria-label') || '').toLowerCase();
      const title = (btn.getAttribute('title') || '').toLowerCase();
      const text = (btn.textContent || '').toLowerCase().trim();
      if (label.includes('restack') || title.includes('restack') ||
          label.includes('share') || title.includes('share to notes') ||
          text.includes('restack')) {
        btn.scrollIntoView({ block: 'center' });
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return { found: true, method: 'button', label: label || title || text };
      }
    }

    // Look for restack icon (the rotate/share icon)
    const icons = document.querySelectorAll('svg, [class*="restack"], [class*="share"]');
    for (const icon of icons) {
      const parent = icon.closest('button, [role="button"], a');
      if (parent) {
        const text = (parent.textContent || '').toLowerCase();
        const label = (parent.getAttribute('aria-label') || '').toLowerCase();
        if (text.includes('restack') || label.includes('restack') || text === '' || /^\d+$/.test(text.trim())) {
          // Likely a restack/share icon button
          parent.scrollIntoView({ block: 'center' });
          parent.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
          parent.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
          parent.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return { found: true, method: 'icon-parent', text: text.substring(0, 30), label };
        }
      }
    }

    return { found: false, buttonLabels: allButtons.map(b => (b.getAttribute('aria-label') || b.textContent || '').trim().substring(0, 40)).filter(Boolean).slice(0, 15) };
  });

  console.log('Restack button:', JSON.stringify(restackResult));

  if (!restackResult.found) {
    await screenshot(page, 'restack-fail.png', { fullPage: true });
    console.error('Could not find restack button. Screenshot saved.');
    process.exit(1);
  }

  await page.waitForTimeout(2000);

  // After clicking restack, a modal/dropdown appears
  // Look for "Restack" option or "Quote restack" if we have a comment
  if (comment) {
    // Click "Quote restack" or "Restack with note" to add commentary
    const quoteResult = await page.evaluate(() => {
      const items = document.querySelectorAll('button, [role="menuitem"], [role="option"], a, div');
      for (const item of items) {
        const text = (item.textContent || '').toLowerCase().trim();
        if (text.includes('quote') || text.includes('with note') || text.includes('add comment')) {
          item.scrollIntoView({ block: 'center' });
          item.click();
          return { found: true, text: text.substring(0, 50) };
        }
      }
      return { found: false };
    });

    console.log('Quote option:', JSON.stringify(quoteResult));

    if (quoteResult.found) {
      await page.waitForTimeout(2000);
      await typeText(page, comment);
      await page.waitForTimeout(1000);
    }
  } else {
    // Simple restack - click "Restack" in the dropdown
    const simpleResult = await page.evaluate(() => {
      const items = document.querySelectorAll('button, [role="menuitem"], [role="option"], a, div');
      for (const item of items) {
        const text = (item.textContent || '').toLowerCase().trim();
        if (text === 'restack' || text === 'restack to notes') {
          item.scrollIntoView({ block: 'center' });
          item.click();
          return { found: true, text: text };
        }
      }
      return { found: false };
    });
    console.log('Simple restack:', JSON.stringify(simpleResult));
  }

  await page.waitForTimeout(1000);
  await screenshot(page, 'restack-before-confirm.png');

  if (dryRun) {
    console.log('DRY RUN complete. Browser stays open 30s.');
    await page.waitForTimeout(30000);
    process.exit(0);
  }

  // Confirm / Post the restack
  const posted = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const btn of buttons) {
      const text = btn.textContent.trim().toLowerCase();
      if ((text === 'restack' || text === 'post' || text.includes('restack')) && !btn.disabled && btn.offsetParent !== null) {
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return { clicked: true, text };
      }
    }
    return { clicked: false };
  });

  if (posted.clicked) {
    await page.waitForTimeout(5000);
    await screenshot(page, 'restack-done.png');
    console.log('RESTACKED!');
  } else {
    await screenshot(page, 'restack-noconfirm.png', { fullPage: true });
    console.log('Could not find confirm button. Browser stays open 60s.');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await screenshot(page, 'restack-error.png').catch(() => {});
} finally {
  await browser.close();
}

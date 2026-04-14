// Reply to a specific comment on Substack using Playwright
// Usage: node reply-comment.mjs <url> <comment-file> <search-text> [--dry-run] [--restack] [--newest]
//
// <url> can be:
//   - Article URL: https://pub.substack.com/p/slug (navigates to /comments)
//   - Comment thread URL: https://pub.substack.com/p/slug/comment/12345 (navigates directly)
//   - Comment thread with hash: .../comment/12345#comment-67890 (navigates to thread, targets hash comment)
// <search-text> matches against commenter name or comment text to find the right comment
// --newest: when multiple comments match, prefer the last one in DOM order (most recent)

import { launchBrowser, getPage, screenshot, HOME } from './lib/substack.mjs';
import { join } from 'path';
import { readFileSync } from 'fs';

const inputUrl = process.argv[2];
const commentFile = process.argv[3];
const searchText = process.argv[4];
const dryRun = process.argv.includes('--dry-run');
const restack = process.argv.includes('--restack');
const preferNewest = process.argv.includes('--newest');

// Extract target comment ID from URL hash if present (e.g. #comment-243174185)
const hashMatch = (inputUrl || '').match(/#comment-(\d+)/);
const targetCommentId = hashMatch ? hashMatch[1] : null;

if (!inputUrl || !commentFile || !searchText) {
  console.error('Usage: node reply-comment.mjs <url> <comment-file> <search-text> [--dry-run] [--restack] [--newest]');
  console.error('  <url> can be an article URL or a comment thread URL');
  console.error('  <search-text> matches commenter name or comment text');
  console.error('  --newest: prefer the last matching comment (most recent)');
  process.exit(1);
}

const commentText = readFileSync(commentFile, 'utf-8').trim();
console.log(`Searching for comment matching: "${searchText}"`);
if (targetCommentId) console.log(`Target comment ID from URL hash: ${targetCommentId}`);
if (preferNewest) console.log('Prefer newest match: ON');
console.log('Reply text:');
console.log('---');
console.log(commentText);
console.log('---');
if (dryRun) console.log('[DRY RUN - will not post]');

// Detect URL type: comment thread vs article
const isCommentThread = /\/comment\/\d+/.test(inputUrl);
const navUrl = isCommentThread
  ? inputUrl.split('?')[0].split('#')[0]  // use comment URL directly
  : inputUrl.replace(/\/$/, '') + '/comments';  // append /comments for articles

console.log(`URL type: ${isCommentThread ? 'comment thread' : 'article'}`);

const browser = await launchBrowser();
const page = await getPage(browser);
page.setDefaultTimeout(30000);

try {
  console.log(`Navigating to ${navUrl} ...`);
  await page.goto(navUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // For article comment pages, try to sort by newest
  if (!isCommentThread) {
    console.log('Looking for sort toggle...');
    const sorted = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const text = btn.textContent.trim().toLowerCase();
        if (text.includes('top first') || text.includes('top')) {
          btn.click();
          return 'clicked-top-first-toggle';
        }
      }
      return 'no-sort-found';
    });
    console.log(`Sort result: ${sorted}`);
    await page.waitForTimeout(3000);

    if (sorted === 'clicked-top-first-toggle') {
      await page.evaluate(() => {
        const allEls = document.querySelectorAll('button, a, [role="menuitem"], [role="option"], div, span');
        for (const el of allEls) {
          const text = el.textContent.trim().toLowerCase();
          if (text === 'newest first' || text === 'newest') { el.click(); return; }
        }
      });
      await page.waitForTimeout(3000);
    }
  }

  // Scroll to load comments/replies
  console.log('Scrolling to load comments...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  // Expand collapsed replies
  const expanded = await page.evaluate(() => {
    const clicked = [];
    const els = document.querySelectorAll('button, a');
    for (const el of els) {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text.includes('load more') || text.includes('see more') || text.includes('show more') ||
          text.includes('view more') || text.includes('more comments') || text.includes('more repl') ||
          text.includes('show repl') || text.includes('view repl')) {
        el.click();
        clicked.push(text);
      }
    }
    return clicked;
  });
  if (expanded.length > 0) {
    console.log(`Expanded: ${expanded.join(', ')}`);
    await page.waitForTimeout(3000);
  }

  // Scroll again after expanding, then back to top
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // Find the comment and click Reply
  console.log(`Looking for comment matching "${searchText}"...`);
  const found = await page.evaluate((opts) => {
    const { search, targetId, newest } = opts;
    const allLinks = Array.from(document.querySelectorAll('a'));
    const replyLinks = allLinks.filter(a => {
      const text = a.textContent.trim().toLowerCase();
      return text === 'reply' || text.startsWith('reply (') || text.startsWith('reply(');
    });

    const debug = { totalLinks: allLinks.length, replyLinks: replyLinks.length };

    // If we have a target comment ID from the URL hash, try to find it by data attribute or DOM id
    if (targetId) {
      // Substack uses data-comment-id or id="comment-{id}" patterns
      const byId = document.querySelector(`[data-comment-id="${targetId}"], #comment-${targetId}, [id*="${targetId}"]`);
      if (byId) {
        // Find the Reply link within or near this element
        let container = byId;
        for (let j = 0; j < 10; j++) {
          const links = container.querySelectorAll('a');
          for (const a of links) {
            const text = a.textContent.trim().toLowerCase();
            if (text === 'reply' || text.startsWith('reply (') || text.startsWith('reply(')) {
              a.scrollIntoView({ block: 'center' });
              a.click();
              return { found: true, method: 'comment-id', targetId, linkText: a.textContent.trim(), debug };
            }
          }
          if (!container.parentElement) break;
          container = container.parentElement;
        }
      }
    }

    // Smallest container algorithm - collect ALL matches, then pick best
    const matches = [];
    for (const link of replyLinks) {
      let container = link;
      for (let j = 0; j < 12; j++) {
        if (!container.parentElement) break;
        container = container.parentElement;
        const containerText = container.textContent || '';
        if (containerText.toLowerCase().includes(search.toLowerCase()) && containerText.length < 5000) {
          matches.push({ link, size: containerText.length, snippet: containerText.substring(0, 200), linkText: link.textContent.trim() });
          break;
        }
      }
    }

    if (matches.length > 0) {
      // Pick the best match:
      // --newest: prefer the last match in DOM order (among smallest containers)
      // default: prefer the smallest container
      let bestMatch;
      if (newest && matches.length > 1) {
        // Among matches, find the smallest containers, then pick the LAST one
        const minSize = Math.min(...matches.map(m => m.size));
        const smallest = matches.filter(m => m.size <= minSize * 1.2); // within 20% of smallest
        bestMatch = smallest[smallest.length - 1]; // last in DOM = newest
        bestMatch.matchCount = matches.length;
        bestMatch.selectedBy = 'newest-among-smallest';
      } else {
        bestMatch = matches.reduce((a, b) => a.size < b.size ? a : b);
        bestMatch.matchCount = matches.length;
        bestMatch.selectedBy = 'smallest';
      }

      if (matches.length > 1) {
        debug.warning = `${matches.length} comments matched search text - used ${bestMatch.selectedBy} strategy`;
      }

      bestMatch.link.scrollIntoView({ block: 'center' });
      bestMatch.link.click();
      return { found: true, method: 'smallest-container', linkText: bestMatch.linkText, containerLength: bestMatch.size, snippet: bestMatch.snippet, matchCount: bestMatch.matchCount, selectedBy: bestMatch.selectedBy, debug };
    }

    // Fallback: search by commenter name
    const nameLinks = document.querySelectorAll('a[href*="substack.com/@"]');
    for (const nameLink of nameLinks) {
      if (nameLink.textContent.toLowerCase().includes(search.toLowerCase())) {
        let container = nameLink;
        for (let j = 0; j < 10; j++) {
          if (!container.parentElement) break;
          container = container.parentElement;
          const links = container.querySelectorAll('a');
          for (const a of links) {
            const text = a.textContent.trim().toLowerCase();
            if (text === 'reply' || text.startsWith('reply (') || text.startsWith('reply(')) {
              a.scrollIntoView({ block: 'center' });
              a.click();
              return { found: true, method: 'name-link-reply', name: nameLink.textContent.trim(), linkText: a.textContent.trim(), debug };
            }
          }
        }
      }
    }

    const pageText = document.body.innerText;
    return { found: false, searchTextOnPage: pageText.toLowerCase().includes(search.toLowerCase()), debug, pageSnippet: pageText.substring(0, 500) };
  }, { search: searchText, targetId: targetCommentId, newest: preferNewest });

  console.log('Search result:', JSON.stringify(found, null, 2));

  if (!found.found) {
    await page.screenshot({ path: join(HOME, 'substack-reply-notfound.png'), fullPage: true });
    console.log('Could not find target comment. Screenshot: ~/substack-reply-notfound.png');
    if (found.searchTextOnPage) {
      console.log('NOTE: Search text IS on the page but no Reply button found near it.');
    }
    console.log('Browser stays open 60s for manual action.');
    await page.waitForTimeout(60000);
    await browser.close();
    process.exit(1);
  }

  // Wait for reply textarea
  console.log('Waiting for reply input...');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(HOME, 'substack-reply-opened.png') });

  // Find and focus the reply textarea
  const inputInfo = await page.evaluate(() => {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    for (let i = textareas.length - 1; i >= 0; i--) {
      const ta = textareas[i];
      const parent = ta.closest('form') || ta.parentElement?.parentElement?.parentElement;
      if (parent) {
        const buttons = parent.querySelectorAll('button');
        const hasCancel = Array.from(buttons).some(b => b.textContent.trim().toLowerCase() === 'cancel');
        if (hasCancel) {
          ta.scrollIntoView({ block: 'center' });
          ta.focus();
          ta.click();
          return { found: true, index: i, method: 'cancel-nearby', total: textareas.length };
        }
      }
    }
    if (textareas.length > 0) {
      const ta = textareas[textareas.length - 1];
      ta.scrollIntoView({ block: 'center' });
      ta.focus();
      ta.click();
      return { found: true, index: textareas.length - 1, method: 'last-textarea', total: textareas.length };
    }
    const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    if (editables.length > 0) {
      const el = editables[editables.length - 1];
      el.scrollIntoView({ block: 'center' });
      el.focus();
      el.click();
      return { found: true, method: 'contenteditable', total: editables.length };
    }
    return { found: false, textareaCount: textareas.length };
  });

  console.log('Input info:', JSON.stringify(inputInfo));

  if (!inputInfo.found) {
    await page.screenshot({ path: join(HOME, 'substack-reply-noinput.png'), fullPage: true });
    console.log('Reply input not found. Screenshot: ~/substack-reply-noinput.png');
    console.log('Browser stays open 60s for manual action.');
    await page.waitForTimeout(60000);
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(500);

  // Set reply text via native setter (more stable than keyboard.type on Windows/GPU issues)
  console.log('Setting reply text...');
  const setResult = await page.evaluate((text) => {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    for (let i = textareas.length - 1; i >= 0; i--) {
      const ta = textareas[i];
      const parent = ta.closest('form') || ta.parentElement?.parentElement?.parentElement;
      if (parent) {
        const buttons = parent.querySelectorAll('button');
        const hasCancel = Array.from(buttons).some(b => b.textContent.trim().toLowerCase() === 'cancel');
        if (hasCancel) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(ta, text);
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
          ta.focus();
          return { set: true, method: 'cancel-nearby', index: i };
        }
      }
    }
    if (textareas.length > 0) {
      const ta = textareas[textareas.length - 1];
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(ta, text);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.dispatchEvent(new Event('change', { bubbles: true }));
      ta.focus();
      return { set: true, method: 'last', index: textareas.length - 1 };
    }
    return { set: false };
  }, commentText);

  console.log('Set result:', JSON.stringify(setResult));

  await page.waitForTimeout(1000);

  // Handle restack checkbox
  if (restack) {
    console.log('Looking for "share to Notes" checkbox...');
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'));
      const notesLabel = labels.find(l => /notes|share|restack/i.test(l.textContent));
      if (notesLabel) {
        const checkbox = notesLabel.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) checkbox.click();
      }
    });
  }

  await page.screenshot({ path: join(HOME, 'substack-before-reply.png') });
  console.log('Screenshot before posting: ~/substack-before-reply.png');

  if (dryRun) {
    console.log('DRY RUN complete. Reply typed but not posted.');
    await page.waitForTimeout(15000);
    await browser.close();
    process.exit(0);
  }

  // Submit via full mouse event sequence (React delegated handlers)
  console.log('Looking for Post/Reply submit button...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const candidates = buttons.filter(b => {
      const text = b.textContent.trim().toLowerCase();
      return (text === 'reply' || text === 'post' || text === 'comment') && !b.disabled;
    });

    if (candidates.length > 0) {
      const btn = candidates[candidates.length - 1];
      btn.scrollIntoView({ block: 'center' });
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return { clicked: true, text: btn.textContent.trim() };
    }

    const fallback = buttons.filter(b => {
      const text = b.textContent.trim().toLowerCase();
      return (text.startsWith('reply') || text.startsWith('post')) && !b.disabled;
    });
    if (fallback.length > 0) {
      const btn = fallback[fallback.length - 1];
      btn.scrollIntoView({ block: 'center' });
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return { clicked: true, text: btn.textContent.trim(), method: 'fallback' };
    }

    return { clicked: false, buttonTexts: buttons.map(b => b.textContent.trim().substring(0, 30)) };
  });

  console.log('Click result:', JSON.stringify(clicked));

  if (clicked.clicked) {
    await page.waitForTimeout(5000);
    await page.screenshot({ path: join(HOME, 'substack-after-reply.png') });
    console.log('REPLIED! Screenshot: ~/substack-after-reply.png');
  } else {
    await page.screenshot({ path: join(HOME, 'substack-reply-nobutton.png'), fullPage: true });
    console.log('Could not find post button. Screenshot: ~/substack-reply-nobutton.png');
    console.log('Browser stays open 60s for manual posting.');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(HOME, 'substack-reply-error.png') }).catch(() => {});
  console.log('Error screenshot: ~/substack-reply-error.png');
} finally {
  await browser.close();
}

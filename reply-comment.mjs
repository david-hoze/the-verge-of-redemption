// Reply to a specific comment on Substack using Playwright
// Usage: node reply-comment.mjs <article-url> <comment-file> <search-text> [--dry-run] [--restack]
// <search-text> matches against commenter name or comment text to find the right comment

import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';
import { readFileSync } from 'fs';

const PROFILE_DIR = join(homedir(), '.substack-playwright');

const articleUrl = process.argv[2];
const commentFile = process.argv[3];
const searchText = process.argv[4];
const dryRun = process.argv.includes('--dry-run');
const restack = process.argv.includes('--restack');

if (!articleUrl || !commentFile || !searchText) {
  console.error('Usage: node reply-comment.mjs <article-url> <comment-file> <search-text> [--dry-run]');
  console.error('  <search-text> matches commenter name or comment text');
  process.exit(1);
}

const commentText = readFileSync(commentFile, 'utf-8').trim();
console.log(`Searching for comment matching: "${searchText}"`);
console.log('Reply to post:');
console.log('---');
console.log(commentText);
console.log('---');
if (dryRun) console.log('[DRY RUN - will not post]');

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  // Navigate directly to comments section
  const commentsUrl = articleUrl.replace(/\/$/, '') + '/comments';
  console.log(`Navigating to ${commentsUrl} ...`);
  await page.goto(commentsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Try to sort by newest - click "Top first" to toggle to "Newest first"
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

  // If sort opened a menu, look for "Newest first" option and click it
  if (sorted === 'clicked-top-first-toggle') {
    const menuResult = await page.evaluate(() => {
      // Look for any newly visible element with "newest" text
      const allEls = document.querySelectorAll('button, a, [role="menuitem"], [role="option"], div, span');
      for (const el of allEls) {
        const text = el.textContent.trim().toLowerCase();
        if (text === 'newest first' || text === 'newest') {
          el.click();
          return 'clicked-newest';
        }
      }
      return 'no-newest-option';
    });
    console.log(`Menu result: ${menuResult}`);
    await page.waitForTimeout(3000);
  }

  // Scroll down to load more comments
  console.log('Scrolling to load comments...');
  for (let i = 0; i < 8; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1000);
  }

  // Click any "See more comments" / "Load more" buttons
  const loadMore = await page.evaluate(() => {
    const clicked = [];
    const buttons = document.querySelectorAll('button, a');
    for (const btn of buttons) {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('load more') || text.includes('see more') ||
          text.includes('show more') || text.includes('view more') ||
          text.includes('more comments')) {
        btn.click();
        clicked.push(text);
      }
    }
    return clicked;
  });
  if (loadMore.length > 0) {
    console.log(`Clicked load-more buttons: ${loadMore.join(', ')}`);
    await page.waitForTimeout(3000);
    // Scroll again after loading more
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1000);
    }
  }

  // Scroll back to top to start searching
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);

  // Strategy: Substack Reply links are <a> tags (not <button>), with text "Reply" or "Reply (N)"
  // CSS makes them uppercase visually. Find the SMALLEST container matching search text.
  console.log(`Looking for comment matching "${searchText}"...`);
  const found = await page.evaluate((search) => {
    // Find all <a> elements whose text starts with "Reply" (Substack comment action links)
    const allLinks = Array.from(document.querySelectorAll('a'));
    const replyLinks = allLinks.filter(a => {
      const text = a.textContent.trim().toLowerCase();
      return text === 'reply' || text.startsWith('reply (') || text.startsWith('reply(');
    });

    const debug = {
      totalLinks: allLinks.length,
      replyLinks: replyLinks.length,
    };

    // For each Reply link, walk up to find the SMALLEST container with the search text
    // This ensures we match the specific comment, not the whole thread
    let bestMatch = null;

    for (const link of replyLinks) {
      let container = link;
      for (let j = 0; j < 10; j++) {
        if (!container.parentElement) break;
        container = container.parentElement;
        const containerText = container.textContent || '';
        if (containerText.toLowerCase().includes(search.toLowerCase()) && containerText.length < 5000) {
          // Found a container with the search text - is it smaller than current best?
          if (!bestMatch || containerText.length < bestMatch.size) {
            bestMatch = {
              link,
              size: containerText.length,
              snippet: containerText.substring(0, 200),
              linkText: link.textContent.trim(),
            };
          }
          break; // Don't walk up further for this link
        }
      }
    }

    if (bestMatch) {
      bestMatch.link.scrollIntoView({ block: 'center' });
      bestMatch.link.click();
      return {
        found: true,
        method: 'smallest-container',
        linkText: bestMatch.linkText,
        containerLength: bestMatch.size,
        snippet: bestMatch.snippet,
        debug,
      };
    }

    // Fallback: search by commenter name in profile links, then find nearest Reply <a>
    const nameLinks = document.querySelectorAll('a[href*="substack.com/@"]');
    for (const nameLink of nameLinks) {
      if (nameLink.textContent.toLowerCase().includes(search.toLowerCase())) {
        // Found the commenter's name - walk up to find the Reply link for this comment
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
              return {
                found: true,
                method: 'name-link-reply',
                name: nameLink.textContent.trim(),
                linkText: a.textContent.trim(),
                debug,
              };
            }
          }
        }
        return { found: true, method: 'name-found-no-reply-link', name: nameLink.textContent.trim(), debug };
      }
    }

    // Not found - dump diagnostic info
    const pageText = document.body.innerText;
    const hasSearch = pageText.toLowerCase().includes(search.toLowerCase());
    return {
      found: false,
      searchTextOnPage: hasSearch,
      debug,
      pageSnippet: pageText.substring(0, 500),
    };
  }, searchText);

  console.log('Search result:', JSON.stringify(found, null, 2));

  if (!found.found) {
    await page.screenshot({ path: join(homedir(), 'substack-reply-notfound.png'), fullPage: true });
    console.log('Could not find target comment. Screenshot: ~/substack-reply-notfound.png');
    if (found.searchTextOnPage) {
      console.log('NOTE: Search text IS on the page but no Reply button found near it.');
      console.log('The comment may need more scrolling or a "See more" click.');
    }
    console.log('Browser stays open 60s for manual action.');
    await page.waitForTimeout(60000);
    await browser.close();
    process.exit(1);
  }

  // Wait for reply input to appear
  console.log('Waiting for reply input...');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: join(homedir(), 'substack-reply-opened.png') });
  console.log('Screenshot after clicking Reply: ~/substack-reply-opened.png');

  // Find and focus the reply textarea using evaluate (bypasses Playwright stability checks)
  // The reply box has "Cancel" and "Reply" buttons nearby - use that to find the RIGHT textarea
  const inputInfo = await page.evaluate(() => {
    // Look for textareas - the reply one should be near Cancel/Reply buttons
    const textareas = Array.from(document.querySelectorAll('textarea'));
    const info = textareas.map((t, i) => ({
      index: i,
      placeholder: t.placeholder,
      visible: t.offsetParent !== null,
      rect: t.getBoundingClientRect(),
    }));

    // Find the textarea near Cancel/Reply buttons (the reply box, not the top-level comment box)
    for (let i = textareas.length - 1; i >= 0; i--) {
      const ta = textareas[i];
      // Check if there's a Cancel button nearby (reply boxes have Cancel + Reply buttons)
      const parent = ta.closest('form') || ta.parentElement?.parentElement?.parentElement;
      if (parent) {
        const buttons = parent.querySelectorAll('button');
        const hasCancel = Array.from(buttons).some(b => b.textContent.trim().toLowerCase() === 'cancel');
        if (hasCancel) {
          ta.scrollIntoView({ block: 'center' });
          ta.focus();
          ta.click();
          return { found: true, index: i, placeholder: ta.placeholder, method: 'cancel-nearby', total: textareas.length };
        }
      }
    }

    // Fallback: just use the last textarea
    if (textareas.length > 0) {
      const ta = textareas[textareas.length - 1];
      ta.scrollIntoView({ block: 'center' });
      ta.focus();
      ta.click();
      return { found: true, index: textareas.length - 1, placeholder: ta.placeholder, method: 'last-textarea', total: textareas.length };
    }

    // Try contenteditable
    const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    if (editables.length > 0) {
      const el = editables[editables.length - 1];
      el.scrollIntoView({ block: 'center' });
      el.focus();
      el.click();
      return { found: true, method: 'contenteditable', total: editables.length };
    }

    return { found: false, textareaCount: textareas.length, info };
  });

  console.log('Input info:', JSON.stringify(inputInfo));

  if (!inputInfo.found) {
    await page.screenshot({ path: join(homedir(), 'substack-reply-noinput.png'), fullPage: true });
    console.log('Reply input not found. Screenshot: ~/substack-reply-noinput.png');
    console.log('Browser stays open 60s for manual action.');
    await page.waitForTimeout(60000);
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(500);

  // Type the reply using keyboard (input should already be focused via evaluate)
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

  // Screenshot before posting
  await page.screenshot({ path: join(homedir(), 'substack-before-reply.png'), fullPage: true });
  console.log('Screenshot before posting: ~/substack-before-reply.png');

  if (dryRun) {
    console.log('DRY RUN complete. Reply typed but not posted.');
    await page.waitForTimeout(15000);
    await browser.close();
    process.exit(0);
  }

  // Click the submit button - look for "Reply" or "Post" near the reply input
  console.log('Looking for Post/Reply submit button...');
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    // Look for submit-style buttons that say "Reply" or "Post" (not the comment action REPLY buttons)
    // The submit button is typically near the input and has different styling
    const candidates = buttons.filter(b => {
      const text = b.textContent.trim().toLowerCase();
      // Match "reply" or "post" but NOT "reply (3)" which is a comment action button
      return (text === 'reply' || text === 'post' || text === 'comment') && !b.disabled;
    });

    if (candidates.length > 0) {
      // Use the last one (closest to the newly opened reply box)
      const btn = candidates[candidates.length - 1];
      btn.scrollIntoView({ block: 'center' });
      // Dispatch full mouse event sequence so React's delegated handlers fire
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return { clicked: true, text: btn.textContent.trim(), index: candidates.length - 1 };
    }

    // Fallback: look for any enabled button with these texts
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
      return { clicked: true, text: btn.textContent.trim(), index: fallback.length - 1, method: 'fallback' };
    }

    return { clicked: false, buttonTexts: buttons.map(b => b.textContent.trim().substring(0, 30)) };
  });

  console.log('Click result:', JSON.stringify(clicked));

  if (clicked.clicked) {
    await page.waitForTimeout(5000);
    await page.screenshot({ path: join(homedir(), 'substack-after-reply.png') });
    console.log('REPLIED! Screenshot: ~/substack-after-reply.png');
  } else {
    await page.screenshot({ path: join(homedir(), 'substack-reply-nobutton.png'), fullPage: true });
    console.log('Could not find post button. Screenshot: ~/substack-reply-nobutton.png');
    console.log('Browser stays open 60s for manual posting.');
    await page.waitForTimeout(60000);
  }

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(homedir(), 'substack-reply-error.png') }).catch(() => {});
  console.log('Error screenshot: ~/substack-reply-error.png');
} finally {
  await browser.close();
}

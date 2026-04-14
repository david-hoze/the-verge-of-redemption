// Substack Playwright framework
// All scripts import from here. Composable primitives for browser, navigation,
// input, comment finding, and submission.

import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

export const PROFILE_DIR = join(homedir(), '.substack-playwright');
export const HOME = homedir();

const GPU_PREFS = {
  'layers.acceleration.disabled': true,
  'gfx.webrender.all': false,
};

// ---------------------------------------------------------------------------
// Browser
// ---------------------------------------------------------------------------

export async function launchBrowser(opts = {}) {
  const { headless = false, viewport = { width: 1280, height: 900 }, timeout } = opts;
  const launchOpts = { headless, viewport, firefoxUserPrefs: GPU_PREFS };
  if (timeout) launchOpts.timeout = timeout;
  return firefox.launchPersistentContext(PROFILE_DIR, launchOpts);
}

export async function getPage(browser) {
  return browser.pages()[0] || await browser.newPage();
}

export async function screenshot(page, filename, opts = {}) {
  const path = join(HOME, filename);
  await page.screenshot({ path, fullPage: opts.fullPage || false });
  console.log(`Screenshot: ~/${filename}`);
  return path;
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

/** Navigate and wait for page to settle. */
export async function navigateTo(page, url, opts = {}) {
  const { wait = 5000, timeout = 60000 } = opts;
  console.log(`Navigating to ${url} ...`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
  await page.waitForTimeout(wait);
}

// ---------------------------------------------------------------------------
// Content expansion
// ---------------------------------------------------------------------------

/** Click all "see more", "load more", "show replies" etc. Returns count. */
export async function expandAll(page) {
  const clicked = await page.evaluate(() => {
    const results = [];
    const els = document.querySelectorAll('button, a');
    for (const el of els) {
      const text = (el.textContent || '').trim().toLowerCase();
      if (text.includes('load more') || text.includes('see more') || text.includes('show more') ||
          text.includes('view more') || text.includes('more comments') || text.includes('more repl') ||
          text.includes('show repl') || text.includes('view repl')) {
        el.click();
        results.push(text);
      }
    }
    return results;
  });
  if (clicked.length > 0) {
    console.log(`Expanded: ${clicked.join(', ')}`);
    await page.waitForTimeout(3000);
  }
  return clicked;
}

/** Scroll to bottom and back to top - forces lazy-loaded content to appear. */
export async function loadAllContent(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await expandAll(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
}

// ---------------------------------------------------------------------------
// Comment finding
// ---------------------------------------------------------------------------

/**
 * Find a comment on the page and click its Reply link.
 * @param {import('playwright').Page} page
 * @param {Object} opts
 * @param {string} opts.search - text to match in comment body or commenter name
 * @param {string} [opts.targetId] - specific comment ID to find by DOM attribute
 * @param {boolean} [opts.newest] - prefer last DOM match among smallest containers
 * @returns {Promise<Object>} - { found: boolean, method, ... }
 */
export async function findComment(page, opts) {
  const result = await page.evaluate((opts) => {
    const { search, targetId, newest } = opts;
    const allLinks = Array.from(document.querySelectorAll('a'));
    const replyLinks = allLinks.filter(a => {
      const text = a.textContent.trim().toLowerCase();
      return text === 'reply' || text.startsWith('reply (') || text.startsWith('reply(');
    });

    const debug = { totalLinks: allLinks.length, replyLinks: replyLinks.length };

    // Strategy 1: find by DOM ID
    if (targetId) {
      const byId = document.querySelector(`[data-comment-id="${targetId}"], #comment-${targetId}, [id*="${targetId}"]`);
      if (byId) {
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

    // Strategy 2: smallest container algorithm
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
      let bestMatch;
      if (newest && matches.length > 1) {
        const minSize = Math.min(...matches.map(m => m.size));
        const smallest = matches.filter(m => m.size <= minSize * 1.2);
        bestMatch = smallest[smallest.length - 1];
        bestMatch.selectedBy = 'newest-among-smallest';
      } else {
        bestMatch = matches.reduce((a, b) => a.size < b.size ? a : b);
        bestMatch.selectedBy = 'smallest';
      }
      bestMatch.matchCount = matches.length;
      if (matches.length > 1) {
        debug.warning = `${matches.length} comments matched - used ${bestMatch.selectedBy} strategy`;
      }
      bestMatch.link.scrollIntoView({ block: 'center' });
      bestMatch.link.click();
      return { found: true, method: 'smallest-container', linkText: bestMatch.linkText, containerLength: bestMatch.size, snippet: bestMatch.snippet, matchCount: bestMatch.matchCount, selectedBy: bestMatch.selectedBy, debug };
    }

    // Strategy 3: commenter name
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
              return { found: true, method: 'name-link', name: nameLink.textContent.trim(), linkText: a.textContent.trim(), debug };
            }
          }
        }
      }
    }

    return { found: false, searchTextOnPage: document.body.innerText.toLowerCase().includes(search.toLowerCase()), debug };
  }, opts);

  console.log('Find comment:', JSON.stringify(result, null, 2));
  return result;
}

// ---------------------------------------------------------------------------
// Input finding
// ---------------------------------------------------------------------------

/**
 * Find the active text input (textarea or contenteditable) and focus it.
 * Prefers textarea near a Cancel button (reply context), falls back to
 * last visible textarea, then last visible contenteditable.
 * @returns {Promise<{found: boolean, type: string, method: string}>}
 */
export async function findInput(page) {
  const result = await page.evaluate(() => {
    // Prefer textarea near Cancel button (reply inline)
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
          return { found: true, type: 'textarea', method: 'cancel-nearby', index: i };
        }
      }
    }
    // Last visible textarea
    for (let i = textareas.length - 1; i >= 0; i--) {
      if (textareas[i].offsetParent != null) {
        textareas[i].scrollIntoView({ block: 'center' });
        textareas[i].focus();
        textareas[i].click();
        return { found: true, type: 'textarea', method: 'last-visible', index: i };
      }
    }
    // Last visible contenteditable
    const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    for (let i = editables.length - 1; i >= 0; i--) {
      if (editables[i].offsetParent != null) {
        editables[i].scrollIntoView({ block: 'center' });
        editables[i].focus();
        editables[i].click();
        return { found: true, type: 'contenteditable', method: 'last-visible', index: i };
      }
    }
    return { found: false, textareaCount: textareas.length, editableCount: editables.length };
  });
  console.log('Find input:', JSON.stringify(result));
  return result;
}

/**
 * Find a comment input on an article page.
 * Tries multiple selectors, then looks for a comment button to click.
 */
export async function findCommentInput(page) {
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

  for (const sel of selectors) {
    const el = await page.$(sel);
    if (el) return { element: el, selector: sel };
  }

  // Try clicking a comment button first
  const commentButton = await page.$('button:has-text("comment")')
    || await page.$('a:has-text("comment")')
    || await page.$('[data-testid="comment-button"]');
  if (commentButton) {
    await commentButton.click();
    await page.waitForTimeout(2000);
    for (const sel of selectors) {
      const el = await page.$(sel);
      if (el) return { element: el, selector: sel };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Text input
// ---------------------------------------------------------------------------

/**
 * Set text in a React-controlled textarea using the native value setter.
 * More stable than keyboard.type on Windows with GPU issues.
 * @returns {Promise<{set: boolean, method: string}>}
 */
export async function setText(page, text) {
  const result = await page.evaluate((text) => {
    const textareas = Array.from(document.querySelectorAll('textarea'));
    // Prefer textarea near Cancel (reply context)
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
    // Fallback: last textarea
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
  }, text);
  console.log('Set text:', JSON.stringify(result));
  return result;
}

/**
 * Type text into a focused contenteditable/ProseMirror using keyboard events.
 * Splits on double-newlines into paragraphs (Enter+Enter between them).
 */
export async function typeText(page, text) {
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  const paragraphs = text.split('\n\n');
  for (let i = 0; i < paragraphs.length; i++) {
    await page.keyboard.type(paragraphs[i], { delay: 5 });
    if (i < paragraphs.length - 1) {
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');
    }
  }
}

/**
 * Type text for chat (Shift+Enter for newlines, Enter sends).
 */
export async function typeChatText(page, text) {
  const paragraphs = text.split('\n\n');
  for (let i = 0; i < paragraphs.length; i++) {
    const lines = paragraphs[i].split('\n');
    for (let j = 0; j < lines.length; j++) {
      await page.keyboard.type(lines[j], { delay: 3 });
      if (j < lines.length - 1) await page.keyboard.press('Shift+Enter');
    }
    if (i < paragraphs.length - 1) {
      await page.keyboard.press('Shift+Enter');
      await page.keyboard.press('Shift+Enter');
    }
  }
}

// ---------------------------------------------------------------------------
// Button clicking
// ---------------------------------------------------------------------------

/**
 * Click a submit button (Reply/Post/Comment) using the full React-compatible
 * mouse event sequence (mousedown + mouseup + click with bubbles).
 * @param {import('playwright').Page} page
 * @param {string[]} [labels=['reply','post','comment']] - button text to match
 * @returns {Promise<{clicked: boolean, text?: string}>}
 */
export async function clickSubmit(page, labels) {
  const result = await page.evaluate((labels) => {
    const targets = labels || ['reply', 'post', 'comment'];
    const buttons = Array.from(document.querySelectorAll('button'));

    // Exact match
    const candidates = buttons.filter(b => {
      const text = b.textContent.trim().toLowerCase();
      return targets.includes(text) && !b.disabled && b.offsetParent !== null;
    });
    if (candidates.length > 0) {
      const btn = candidates[candidates.length - 1];
      btn.scrollIntoView({ block: 'center' });
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return { clicked: true, text: btn.textContent.trim() };
    }

    // Starts-with fallback
    const fallback = buttons.filter(b => {
      const text = b.textContent.trim().toLowerCase();
      return targets.some(t => text.startsWith(t)) && !b.disabled && b.offsetParent !== null;
    });
    if (fallback.length > 0) {
      const btn = fallback[fallback.length - 1];
      btn.scrollIntoView({ block: 'center' });
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return { clicked: true, text: btn.textContent.trim(), method: 'fallback' };
    }

    return { clicked: false, buttonTexts: buttons.map(b => b.textContent.trim().substring(0, 30)).filter(t => t) };
  }, labels || null);
  console.log('Submit:', JSON.stringify(result));
  return result;
}

/**
 * Click a button matching text pattern (e.g. "Leave a reply").
 * Uses full mouse event sequence for React compatibility.
 */
export async function clickButton(page, pattern) {
  return page.evaluate((pattern) => {
    const regex = new RegExp(pattern, 'i');
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const btn of buttons) {
      if (regex.test(btn.textContent.trim())) {
        btn.scrollIntoView({ block: 'center' });
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return { found: true, text: btn.textContent.trim() };
      }
    }
    return { found: false };
  }, pattern);
}

// ---------------------------------------------------------------------------
// Restack / share to Notes
// ---------------------------------------------------------------------------

export async function checkRestack(page) {
  const result = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label'));
    const notesLabel = labels.find(l => /notes|share|restack/i.test(l.textContent));
    if (notesLabel) {
      const checkbox = notesLabel.querySelector('input[type="checkbox"]')
        || notesLabel.previousElementSibling
        || document.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) { checkbox.click(); return 'checked'; }
      if (checkbox && checkbox.checked) return 'already-checked';
    }
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    const unchecked = checkboxes.find(c => !c.checked);
    if (unchecked) { unchecked.click(); return 'checked-fallback'; }
    return 'not-found';
  });
  console.log(`Restack: ${result}`);
  return result;
}

// ---------------------------------------------------------------------------
// Comment sorting
// ---------------------------------------------------------------------------

export async function sortNewest(page) {
  const sorted = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent.trim().toLowerCase();
      if (text.includes('top first') || text.includes('top')) {
        btn.click();
        return 'clicked-toggle';
      }
    }
    return 'no-sort-found';
  });
  if (sorted === 'clicked-toggle') {
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
      const allEls = document.querySelectorAll('button, a, [role="menuitem"], [role="option"], div, span');
      for (const el of allEls) {
        const text = el.textContent.trim().toLowerCase();
        if (text === 'newest first' || text === 'newest') { el.click(); return; }
      }
    });
    await page.waitForTimeout(3000);
  }
  return sorted;
}

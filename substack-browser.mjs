// Persistent Substack browser - stays open, reads commands from a queue file
// Usage: node substack-browser.mjs [initial-url]
// Commands are written to ~/substack-cmd.json, results to ~/substack-result.json

import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';

const PROFILE_DIR = join(homedir(), '.substack-playwright');
const CMD_FILE = join(homedir(), 'substack-cmd.json');
const RESULT_FILE = join(homedir(), 'substack-result.json');
const initialUrl = process.argv[2] || 'https://substack.com/activity';

// Clean up old files
if (existsSync(CMD_FILE)) unlinkSync(CMD_FILE);
if (existsSync(RESULT_FILE)) unlinkSync(RESULT_FILE);

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1920, height: 1200 },
  firefoxUserPrefs: {
    'layers.acceleration.disabled': true,
    'gfx.webrender.all': false,
  },
});

const page = browser.pages()[0] || await browser.newPage();

console.log(`Navigating to ${initialUrl}...`);
await page.goto(initialUrl, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(4000);
await page.screenshot({ path: join(homedir(), 'substack-shot.png') });
console.log('Ready. Watching for commands...');

// Write initial result
writeFileSync(RESULT_FILE, JSON.stringify({ status: 'ready', url: page.url() }));

// Poll for commands
while (true) {
  await new Promise(r => setTimeout(r, 500));

  if (!existsSync(CMD_FILE)) continue;

  let cmd;
  try {
    cmd = JSON.parse(readFileSync(CMD_FILE, 'utf-8'));
    unlinkSync(CMD_FILE);
  } catch (e) {
    continue;
  }

  console.log('Command:', JSON.stringify(cmd));
  let result = { status: 'ok' };

  try {
    switch (cmd.action) {
      case 'screenshot': {
        const path = join(homedir(), cmd.filename || 'substack-shot.png');
        await page.screenshot({ path, fullPage: cmd.fullPage || false });
        result = { status: 'ok', path };
        break;
      }

      case 'goto': {
        await page.goto(cmd.url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(cmd.wait || 3000);
        result = { status: 'ok', url: page.url() };
        break;
      }

      case 'click-text': {
        const el = await page.$(`text=${cmd.text}`);
        if (el) {
          await el.click();
          await page.waitForTimeout(cmd.wait || 2000);
          result = { status: 'ok', clicked: cmd.text, url: page.url() };
        } else {
          result = { status: 'error', message: `Text not found: ${cmd.text}` };
        }
        break;
      }

      case 'click-reply-icon': {
        // Click the Nth comment/reply speech bubble icon (0-indexed)
        const n = cmd.index || 0;
        const clicked = await page.evaluate((idx) => {
          // Find all action bars with heart/comment/restack/share buttons
          const allButtons = Array.from(document.querySelectorAll('button'));
          const commentBtns = allButtons.filter(btn => {
            const svg = btn.querySelector('svg');
            if (!svg) return false;
            const label = (btn.getAttribute('aria-label') || '').toLowerCase();
            if (label.includes('comment') || label.includes('reply')) return true;
            // Check for comment icon by looking at sibling buttons (like, restack, share pattern)
            const parent = btn.parentElement;
            if (!parent) return false;
            const siblings = parent.querySelectorAll('button');
            return siblings.length >= 3 && siblings.length <= 5;
          });
          // Filter to ones that look like the comment button (2nd in action bar)
          const actionBars = Array.from(document.querySelectorAll('[class*="action"], [class*="button-bar"], [class*="toolbar"]'));
          // Fallback: find buttons with SVG that are second in their parent group
          const candidates = allButtons.filter(btn => {
            const svg = btn.querySelector('svg');
            if (!svg) return false;
            const parent = btn.parentElement;
            if (!parent) return false;
            const siblingBtns = Array.from(parent.querySelectorAll(':scope > button, :scope > a'));
            return siblingBtns.length >= 3 && siblingBtns.indexOf(btn) === 1;
          });
          if (candidates[idx]) {
            candidates[idx].scrollIntoView({ block: 'center' });
            candidates[idx].click();
            return { clicked: true, total: candidates.length };
          }
          return { clicked: false, total: candidates.length };
        }, n);
        await page.waitForTimeout(2000);
        result = { status: clicked.clicked ? 'ok' : 'error', ...clicked };
        break;
      }

      case 'click-placeholder': {
        const ph = await page.$('text=Leave a reply')
          || await page.$('text=Write a reply')
          || await page.$('text=Write a comment');
        if (ph) {
          await ph.click();
          await page.waitForTimeout(1000);
          result = { status: 'ok' };
        } else {
          result = { status: 'error', message: 'No placeholder found' };
        }
        break;
      }

      case 'type': {
        const text = cmd.file
          ? readFileSync(cmd.file, 'utf-8').trim()
          : cmd.text;
        const input = await page.$('div.ProseMirror[contenteditable="true"]')
          || await page.$('[role="textbox"]')
          || await page.$('[contenteditable="true"]');
        if (input) {
          await input.click();
          await input.focus();
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
          result = { status: 'ok', length: text.length };
        } else {
          result = { status: 'error', message: 'No text input found' };
        }
        break;
      }

      case 'post': {
        // Two-step: click Reply/Post, then confirm Post in modal
        const step1 = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => {
            const t = b.textContent.trim().toLowerCase();
            return (t === 'reply' || t === 'post' || t === 'comment') && !b.disabled;
          });
          if (btn) { btn.click(); return { clicked: true, text: btn.textContent.trim() }; }
          return { clicked: false };
        });
        await page.waitForTimeout(3000);
        // Step 2: confirmation modal
        const step2 = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => b.textContent.trim().toLowerCase() === 'post' && !b.disabled);
          if (btn) { btn.click(); return { clicked: true }; }
          return { clicked: false };
        });
        await page.waitForTimeout(3000);
        result = { status: 'ok', step1, step2 };
        break;
      }

      case 'scroll': {
        await page.evaluate((px) => window.scrollBy(0, px), cmd.pixels || 500);
        await page.waitForTimeout(500);
        result = { status: 'ok' };
        break;
      }

      case 'wait': {
        await page.waitForTimeout(cmd.ms || 2000);
        result = { status: 'ok' };
        break;
      }

      case 'expand-and-extract': {
        // Click all "See more" links, then extract full page text
        const seeMoreLinks = await page.$$('text=See more');
        for (const link of seeMoreLinks) {
          try { await link.click(); await page.waitForTimeout(500); } catch(e) {}
        }
        await page.waitForTimeout(1000);
        const fullText = await page.evaluate(() => document.body.innerText);
        result = { status: 'ok', expanded: seeMoreLinks.length, text: fullText.substring(0, 25000) };
        break;
      }

      case 'eval': {
        // Run arbitrary JS in the page context
        const evalResult = await page.evaluate(new Function('return ' + cmd.code)());
        await page.waitForTimeout(cmd.wait || 1000);
        result = { status: 'ok', evalResult };
        break;
      }

      case 'click-like': {
        // Click the Nth like/heart button (0-indexed) - first button in action bar groups
        const n = cmd.index || 0;
        const liked = await page.evaluate((idx) => {
          const allButtons = Array.from(document.querySelectorAll('button'));
          const candidates = allButtons.filter(btn => {
            const svg = btn.querySelector('svg');
            if (!svg) return false;
            const parent = btn.parentElement;
            if (!parent) return false;
            const siblingBtns = Array.from(parent.querySelectorAll(':scope > button, :scope > a'));
            return siblingBtns.length >= 3 && siblingBtns.indexOf(btn) === 0;
          });
          if (candidates[idx]) {
            candidates[idx].scrollIntoView({ block: 'center' });
            candidates[idx].click();
            return { clicked: true, total: candidates.length };
          }
          return { clicked: false, total: candidates.length };
        }, n);
        await page.waitForTimeout(1000);
        result = { status: liked.clicked ? 'ok' : 'error', ...liked };
        break;
      }

      case 'quit': {
        result = { status: 'quitting' };
        writeFileSync(RESULT_FILE, JSON.stringify(result));
        await browser.close();
        process.exit(0);
      }

      default:
        result = { status: 'error', message: `Unknown action: ${cmd.action}` };
    }
  } catch (err) {
    result = { status: 'error', message: err.message };
  }

  console.log('Result:', JSON.stringify(result));
  writeFileSync(RESULT_FILE, JSON.stringify(result));
}

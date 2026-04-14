// Shared Substack browser utilities
// All Playwright scripts import from here to avoid boilerplate duplication.

import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

export const PROFILE_DIR = join(homedir(), '.substack-playwright');
export const HOME = homedir();

// Standard Firefox prefs to prevent GPU crashes on Windows
const GPU_PREFS = {
  'layers.acceleration.disabled': true,
  'gfx.webrender.all': false,
};

/**
 * Launch a persistent Firefox browser context with Substack session.
 * @param {Object} [opts]
 * @param {boolean} [opts.headless=false]
 * @param {{width:number, height:number}} [opts.viewport={width:1280,height:900}]
 * @param {number} [opts.timeout] - launch timeout
 * @returns {Promise<import('playwright').BrowserContext>}
 */
export async function launchBrowser(opts = {}) {
  const {
    headless = false,
    viewport = { width: 1280, height: 900 },
    timeout,
  } = opts;

  const launchOpts = {
    headless,
    viewport,
    firefoxUserPrefs: GPU_PREFS,
  };
  if (timeout) launchOpts.timeout = timeout;

  return firefox.launchPersistentContext(PROFILE_DIR, launchOpts);
}

/**
 * Get the first page from a browser context, or create one.
 * @param {import('playwright').BrowserContext} browser
 * @returns {Promise<import('playwright').Page>}
 */
export async function getPage(browser) {
  return browser.pages()[0] || await browser.newPage();
}

/**
 * Take a screenshot to ~/filename.
 * @param {import('playwright').Page} page
 * @param {string} filename
 * @param {Object} [opts]
 * @param {boolean} [opts.fullPage=false]
 */
export async function screenshot(page, filename, opts = {}) {
  const path = join(HOME, filename);
  await page.screenshot({ path, fullPage: opts.fullPage || false });
  console.log(`Screenshot: ~/${filename}`);
  return path;
}

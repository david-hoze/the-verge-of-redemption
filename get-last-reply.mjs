// Get the last reply in the thread by scrolling down and extracting
import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const PROFILE_DIR = join(homedir(), '.substack-playwright');
const url = 'https://substack.com/profile/480779762-structure-and-biography/note/c-242036756#comment-242592493';

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1920, height: 1200 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Scroll to bottom to load all comments
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(800);
  }

  // Now find the comment containing "You stopped doing the thing I named"
  // and click ITS See more
  const result = await page.evaluate(() => {
    // Find all comment body containers
    const bodies = document.querySelectorAll('[class*="feedCommentBodyInner"]');
    const allBodies = Array.from(bodies);

    // Find the one with our target text
    const target = allBodies.find(el => el.textContent.includes('You stopped doing the thing'));
    if (!target) return { found: false, total: allBodies.length, lastText: allBodies.length > 0 ? allBodies[allBodies.length-1].textContent.substring(0,100) : 'none' };

    // Find the See more link near this element
    let parent = target.parentElement;
    for (let i = 0; i < 5; i++) {
      if (!parent) break;
      const seeMore = parent.querySelector('a.link-LIBpto');
      if (seeMore && seeMore.textContent.trim() === 'See more') {
        seeMore.click();
        return { found: true, clickedSeeMore: true };
      }
      parent = parent.parentElement;
    }

    // Return whatever text we have even if truncated
    return { found: true, clickedSeeMore: false, text: target.textContent };
  });

  console.log('Result:', JSON.stringify(result, null, 2));

  if (result.clickedSeeMore) {
    await page.waitForTimeout(2000);
    // Now extract the expanded text
    const expanded = await page.evaluate(() => {
      const bodies = document.querySelectorAll('[class*="feedCommentBodyInner"]');
      const target = Array.from(bodies).find(el => el.textContent.includes('You stopped doing the thing'));
      return target ? target.textContent : 'not found after expansion';
    });
    console.log('\n=== EXPANDED TEXT ===');
    console.log(expanded);
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

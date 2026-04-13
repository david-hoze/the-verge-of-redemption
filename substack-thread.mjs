// Click into a thread from activity
import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const PROFILE_DIR = join(homedir(), '.substack-playwright');
const searchText = process.argv[2] || 'Ellen Davis';
const count = parseInt(process.argv[3]) || 8;

const browser = await firefox.launchPersistentContext(PROFILE_DIR, {
  headless: false,
  viewport: { width: 1280, height: 900 },
});

const page = browser.pages()[0] || await browser.newPage();

try {
  await page.goto('https://substack.com/activity', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click on the reply text
  const reply = await page.$(`text=${searchText}`);
  if (reply) {
    await reply.click();
    console.log(`Clicked: "${searchText}"`);
  } else {
    console.log(`Could not find text: "${searchText}"`);
  }

  await page.waitForTimeout(5000);
  console.log('URL:', page.url());

  for (let i = 0; i < count; i++) {
    await page.screenshot({ path: join(homedir(), `substack-thread-${i}.png`) });
    console.log(`Screenshot: ~/substack-thread-${i}.png`);
    await page.evaluate(() => window.scrollBy(0, 700));
    await page.waitForTimeout(800);
  }

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(homedir(), 'substack-error.png') });
} finally {
  await browser.close();
}

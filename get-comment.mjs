// Get the full text of a comment thread
import { firefox } from 'playwright';

const url = process.argv[2] || 'https://substack.com/profile/480779762-structure-and-biography/note/c-242036756#comment-242592493';

const browser = await firefox.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Try clicking all "See more" expand toggles
  for (let round = 0; round < 3; round++) {
    const count = await page.evaluate(() => {
      let clicked = 0;
      document.querySelectorAll('span, div, button, a').forEach(el => {
        if (el.textContent.trim() === 'See more' && el.offsetParent !== null) {
          el.click();
          clicked++;
        }
      });
      return clicked;
    });
    if (count === 0) break;
    await page.waitForTimeout(1000);
  }

  await page.waitForTimeout(1000);
  const text = await page.evaluate(() => document.body.innerText);
  console.log(text.substring(0, 25000));
} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

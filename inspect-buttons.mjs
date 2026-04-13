// Inspect button structure in Substack comments
import { firefox } from 'playwright';
import { join } from 'path';
import { homedir } from 'os';

const url = process.argv[2] || 'https://richardtuschman.substack.com/p/my-2024-mental-health-crisis';

const browser = await firefox.launchPersistentContext(join(homedir(), '.substack-playwright'), {
  headless: false,
  viewport: { width: 1280, height: 900 },
});
const page = browser.pages()[0] || await browser.newPage();

try {
  await page.goto(url + '/comments', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);

  const info = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    // Get all button text content
    const buttonTexts = buttons.map((b, i) => ({
      index: i,
      text: b.textContent.trim().substring(0, 80),
      innerHTML: b.innerHTML.substring(0, 200),
      classes: b.className,
      ariaLabel: b.getAttribute('aria-label'),
    }));

    // Also look for anything clickable that has "reply" in text or attributes
    const replyLike = [];
    document.querySelectorAll('*').forEach(el => {
      const text = el.textContent.trim();
      const ariaLabel = el.getAttribute('aria-label') || '';
      if ((text.toUpperCase() === 'REPLY' || text.toUpperCase().startsWith('REPLY (') ||
           ariaLabel.toLowerCase().includes('reply')) && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
        // Only leaf-ish elements (text length < 50)
        if (text.length < 50) {
          replyLike.push({
            tag: el.tagName,
            text: text,
            classes: el.className,
            ariaLabel,
            role: el.getAttribute('role'),
            clickable: el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button',
            parentTag: el.parentElement?.tagName,
            parentClasses: el.parentElement?.className?.substring(0, 100),
          });
        }
      }
    });

    return {
      totalButtons: buttons.length,
      // Show buttons that might be reply-related (filter out obvious non-matches)
      replyRelated: buttonTexts.filter(b =>
        b.text.toLowerCase().includes('reply') ||
        b.text.toLowerCase().includes('like') ||
        b.text.toLowerCase().includes('share') ||
        (b.ariaLabel && b.ariaLabel.toLowerCase().includes('reply'))
      ),
      replyLikeElements: replyLike.slice(0, 20),
      // Also show first 10 buttons for context
      firstButtons: buttonTexts.slice(0, 10),
    };
  });

  console.log(JSON.stringify(info, null, 2));

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

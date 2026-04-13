// Extract SaB's last reply by expanding it and getting full text
import { join } from 'path';
import { homedir } from 'os';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';

const CMD_FILE = join(homedir(), 'substack-cmd.json');
const RESULT_FILE = join(homedir(), 'substack-result.json');

// First: click all "See more" links to expand everything
const cmd = {
  action: 'eval',
  code: `(async function() {
    var links = Array.from(document.querySelectorAll('a, button, span, div')).filter(function(el) {
      return el.textContent.trim() === 'See more' && el.offsetParent !== null;
    });
    for (var i = 0; i < links.length; i++) {
      links[i].click();
      await new Promise(function(r) { setTimeout(r, 300); });
    }
    // Wait for expansion
    await new Promise(function(r) { setTimeout(r, 1000); });
    // Now get all the text again
    return { expanded: links.length, text: document.body.innerText.substring(0, 20000) };
  })()`,
  wait: 5000
};

if (existsSync(RESULT_FILE)) unlinkSync(RESULT_FILE);
writeFileSync(CMD_FILE, JSON.stringify(cmd));

const start = Date.now();
while (Date.now() - start < 20000) {
  await new Promise(r => setTimeout(r, 500));
  if (existsSync(RESULT_FILE)) {
    try {
      const result = JSON.parse(readFileSync(RESULT_FILE, 'utf-8'));
      if (result.evalResult && result.evalResult.text) {
        console.log('Expanded:', result.evalResult.expanded, 'links');
        console.log('---');
        console.log(result.evalResult.text);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
      process.exit(0);
    } catch(e) {}
  }
}
console.error('Timeout');

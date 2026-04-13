// Extract the last reply's full text from the current page
import { join } from 'path';
import { homedir } from 'os';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';

const CMD_FILE = join(homedir(), 'substack-cmd.json');
const RESULT_FILE = join(homedir(), 'substack-result.json');

// Write eval command that extracts all comment texts
const cmd = {
  action: 'eval',
  code: `(function() {
    // Get all text content from the page, organized by comment blocks
    // Look for the comment container structure
    var body = document.body.innerText;
    return { bodyLength: body.length, text: body.substring(0, 15000) };
  })`,
  wait: 1000
};

if (existsSync(RESULT_FILE)) unlinkSync(RESULT_FILE);
writeFileSync(CMD_FILE, JSON.stringify(cmd));

// Wait for result
const start = Date.now();
while (Date.now() - start < 15000) {
  await new Promise(r => setTimeout(r, 300));
  if (existsSync(RESULT_FILE)) {
    try {
      const result = JSON.parse(readFileSync(RESULT_FILE, 'utf-8'));
      if (result.evalResult && result.evalResult.text) {
        console.log(result.evalResult.text);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
      process.exit(0);
    } catch(e) {}
  }
}
console.error('Timeout');

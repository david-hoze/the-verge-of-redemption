// Send a command to the persistent Substack browser daemon
// Usage: node substack-send.mjs '{"action":"screenshot"}'
//        node substack-send.mjs screenshot [filename]
//        node substack-send.mjs goto <url>
//        node substack-send.mjs click-text <text>
//        node substack-send.mjs type <text-or-file>
//        node substack-send.mjs scroll [pixels]
//        node substack-send.mjs post
//        node substack-send.mjs quit

import { join } from 'path';
import { homedir } from 'os';
import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';

const CMD_FILE = join(homedir(), 'substack-cmd.json');
const RESULT_FILE = join(homedir(), 'substack-result.json');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node substack-send.mjs <action> [args...]');
  process.exit(1);
}

let cmd;
// If first arg looks like JSON, use it directly
if (args[0].startsWith('{')) {
  cmd = JSON.parse(args[0]);
} else {
  const action = args[0];
  switch (action) {
    case 'screenshot':
      cmd = { action: 'screenshot', filename: args[1] || 'substack-shot.png' };
      break;
    case 'goto':
      cmd = { action: 'goto', url: args[1], wait: parseInt(args[2]) || 3000 };
      break;
    case 'click-text':
      cmd = { action: 'click-text', text: args[1], wait: parseInt(args[2]) || 2000 };
      break;
    case 'click-reply':
      cmd = { action: 'click-reply-icon', index: parseInt(args[1]) || 0 };
      break;
    case 'click-placeholder':
      cmd = { action: 'click-placeholder' };
      break;
    case 'type':
      if (existsSync(args[1])) {
        cmd = { action: 'type', file: args[1] };
      } else {
        cmd = { action: 'type', text: args[1] };
      }
      break;
    case 'post':
      cmd = { action: 'post' };
      break;
    case 'scroll':
      cmd = { action: 'scroll', pixels: parseInt(args[1]) || 500 };
      break;
    case 'wait':
      cmd = { action: 'wait', ms: parseInt(args[1]) || 2000 };
      break;
    case 'quit':
      cmd = { action: 'quit' };
      break;
    default:
      console.error(`Unknown action: ${action}`);
      process.exit(1);
  }
}

// Clear old result
if (existsSync(RESULT_FILE)) unlinkSync(RESULT_FILE);

// Write command
writeFileSync(CMD_FILE, JSON.stringify(cmd));
console.log('Sent:', JSON.stringify(cmd));

// Wait for result (poll up to 30s)
const start = Date.now();
while (Date.now() - start < 30000) {
  await new Promise(r => setTimeout(r, 300));
  if (existsSync(RESULT_FILE)) {
    try {
      const result = JSON.parse(readFileSync(RESULT_FILE, 'utf-8'));
      console.log('Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    } catch (e) {
      // File might be partially written, retry
    }
  }
}
console.error('Timeout waiting for result');
process.exit(1);

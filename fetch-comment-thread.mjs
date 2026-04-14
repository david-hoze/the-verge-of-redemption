// Fetch a Substack comment thread via API
// Usage: node fetch-comment-thread.mjs <comment-id-or-url> [--replies-only]
//
// Accepts:
//   - A numeric comment ID: 242196575
//   - A comment URL: https://metaphorician.substack.com/p/virtualism/comment/242196575
//   - A URL with hash: ...#comment-243131404 (fetches the hash target)
//
// Outputs the comment and all replies as a threaded conversation.
// --replies-only: skip the parent, just show replies

import { launchBrowser, getPage } from './lib/substack.mjs';

const input = process.argv[2];
const repliesOnly = process.argv.includes('--replies-only');

if (!input) {
  console.error('Usage: node fetch-comment-thread.mjs <comment-id-or-url> [--replies-only]');
  process.exit(1);
}

// Parse comment ID from input
let commentId;
let pageUrl;

if (/^\d+$/.test(input)) {
  commentId = input;
} else {
  // Extract from URL
  const hashMatch = input.match(/#comment-(\d+)/);
  const pathMatch = input.match(/\/comment\/(\d+)/);
  if (hashMatch) {
    commentId = hashMatch[1];
  } else if (pathMatch) {
    commentId = pathMatch[1];
  }
  // Use the URL (without hash) as the page to navigate to for auth
  pageUrl = input.split('#')[0].split('?')[0];
}

if (!commentId) {
  console.error('Could not extract comment ID from:', input);
  process.exit(1);
}

// If no page URL, we need any Substack page for the API calls
if (!pageUrl) {
  pageUrl = 'https://substack.com/activity';
}

console.log(`Fetching comment ${commentId}...`);

const browser = await launchBrowser();
const page = await getPage(browser);
page.setDefaultTimeout(30000);

try {
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Fetch the parent comment
  const parent = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/reader/comment/${id}`);
    return r.json();
  }, commentId);

  const pc = parent.item?.comment || parent;

  if (!repliesOnly) {
    console.log(`\n=== ${pc.name} (${pc.date}) [${pc.id}] ===`);
    console.log(pc.body);
    console.log(`[${pc.children_count || 0} replies]`);
  }

  // Fetch replies
  if (pc.children_count > 0 || repliesOnly) {
    const replies = await page.evaluate(async (id) => {
      const r = await fetch(`/api/v1/reader/comment/${id}/replies?comment_id=${id}`);
      return r.json();
    }, commentId);

    function printComment(c, indent = 0) {
      if (!c || !c.id) return;
      const prefix = '  '.repeat(indent);
      console.log(`\n${prefix}=== ${c.name} (${c.date}) [${c.id}] ===`);
      console.log(`${prefix}${c.body}`);
      if (c.children_count > 0) console.log(`${prefix}[${c.children_count} replies]`);
    }

    if (replies.commentBranches) {
      for (const branch of replies.commentBranches) {
        if (branch.comment) printComment(branch.comment, 1);
        if (branch.descendantComments) {
          for (const dc of branch.descendantComments) {
            printComment(dc, 2);
          }
        }
      }
    }
  }

  // If the parent has an ancestor_path, offer to fetch the full chain
  if (pc.ancestor_path) {
    const ids = pc.ancestor_path.split('.');
    console.log(`\n--- Ancestor chain: ${ids.join(' -> ')} -> ${commentId} ---`);
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}

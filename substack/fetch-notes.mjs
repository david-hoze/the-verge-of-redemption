// Download all notes from a Substack profile via API
// Usage: node fetch-notes.mjs [user-id] [output-dir]

import { launchBrowser, getPage, screenshot, HOME } from './lib.mjs';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
const USER_ID = process.argv[2] || '348513546'; // default: @machinepoet
const OUTPUT_DIR = process.argv[3] || './notes-output';
const API_BASE = `https://substack.com/api/v1/reader/feed/profile/${USER_ID}`;

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

const browser = await launchBrowser({ timeout: 60000 });
const page = await getPage(browser);

try {
  console.log(`Navigating to profile ${USER_ID}...`);
  await page.goto('https://substack.com/home', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  let nextCursor = null;
  let allNotes = [];
  let pageNum = 0;

  while (true) {
    pageNum++;
    const url = nextCursor
      ? `${API_BASE}?cursor=${encodeURIComponent(nextCursor)}`
      : API_BASE;
    console.log(`\nFetching page ${pageNum}...`);

    const result = await page.evaluate(async (fetchUrl) => {
      const resp = await fetch(fetchUrl);
      if (!resp.ok) return { error: resp.status + ' ' + resp.statusText };
      return await resp.json();
    }, url);

    if (result.error) {
      console.error('API error:', result.error);
      break;
    }

    const items = result.items || [];
    console.log(`Got ${items.length} items`);
    if (items.length === 0) {
      console.log('No more items.');
      break;
    }

    for (const item of items) {
      const comment = item.comment;
      if (comment) {
        allNotes.push({
          id: comment.id,
          body: comment.body || '',
          body_json: comment.body_json || null,
          date: comment.date || comment.created_at,
          name: comment.name,
          reactions: comment.reactions || {},
          children_count: comment.children_count || 0,
          ancestor_path: comment.ancestor_path || '',
          handle: comment.handle,
          attachments: comment.attachments || [],
          entity_key: item.entity_key,
          context_type: item.context?.type || '',
        });
      }
    }

    nextCursor = result.nextCursor || null;
    if (!nextCursor) {
      console.log('No more pages.');
      break;
    }

    await page.waitForTimeout(500);
  }

  console.log(`\nTotal notes collected: ${allNotes.length}`);

  // Save full JSON
  writeFileSync(join(OUTPUT_DIR, '_all_notes.json'), JSON.stringify(allNotes, null, 2));

  // Save individual files
  for (const note of allNotes) {
    const dateStr = note.date ? note.date.substring(0, 10) : 'unknown';
    const filename = `${dateStr}_c-${note.id}.md`;
    let text = note.body || '';
    if (note.body_json?.content) {
      text = extractText(note.body_json);
    }
    const header = [
      `# Note c-${note.id}`,
      `**Date:** ${note.date}`,
      `**Author:** ${note.name}`,
      `**Reactions:** ${JSON.stringify(note.reactions)}`,
      `**Replies:** ${note.children_count}`,
      `**Context:** ${note.context_type}`,
      note.ancestor_path ? `**Thread:** ${note.ancestor_path}` : '',
      '',
      '---',
      '',
    ].filter(Boolean).join('\n');
    writeFileSync(join(OUTPUT_DIR, filename), header + text);
  }

  console.log(`Saved ${allNotes.length} note files to ${OUTPUT_DIR}/`);

} catch (err) {
  console.error('Error:', err.message);
  await page.screenshot({ path: join(HOME, 'machinepoet-error.png') });
} finally {
  await browser.close();
}

function extractText(doc) {
  if (!doc || !doc.content) return '';
  const lines = [];
  for (const node of doc.content) {
    if (node.type === 'paragraph') {
      const parts = [];
      if (node.content) {
        for (const inline of node.content) {
          if (inline.type === 'text') {
            let t = inline.text || '';
            if (inline.marks) {
              for (const mark of inline.marks) {
                if (mark.type === 'italic') t = `*${t}*`;
                if (mark.type === 'bold') t = `**${t}**`;
                if (mark.type === 'link') t = `[${t}](${mark.attrs?.href || ''})`;
              }
            }
            parts.push(t);
          } else if (inline.type === 'mention') {
            parts.push(`@${inline.attrs?.label || ''}`);
          }
        }
      }
      lines.push(parts.join(''));
    } else if (node.type === 'blockquote') {
      const bqText = extractText(node);
      lines.push(bqText.split('\n').map(l => '> ' + l).join('\n'));
    } else if (node.type === 'image' || node.type === 'captionedImage') {
      const src = node.attrs?.src || '';
      lines.push(`![](${src})`);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

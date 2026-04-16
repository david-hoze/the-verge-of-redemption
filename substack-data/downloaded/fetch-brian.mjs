import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const USER_ID = '438312282';
const API_BASE = `https://substack.com/api/v1/reader/feed/profile/${USER_ID}`;
const OUT = 'downloaded/brianrayray-notes';

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

let cursor = null;
let allNotes = [];
let page = 0;

while (true) {
  page++;
  const url = cursor ? `${API_BASE}?cursor=${encodeURIComponent(cursor)}` : API_BASE;
  console.log(`Page ${page}...`);

  const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!resp.ok) { console.error(`Error: ${resp.status}`); break; }
  const data = await resp.json();

  const items = data.items || [];
  console.log(`  ${items.length} items`);
  if (items.length === 0) break;

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

  cursor = data.nextCursor || null;
  if (!cursor) { console.log('No more pages.'); break; }
  await new Promise(r => setTimeout(r, 500));
}

console.log(`\nTotal notes: ${allNotes.length}`);
writeFileSync(join(OUT, '_all_notes.json'), JSON.stringify(allNotes, null, 2));

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
  writeFileSync(join(OUT, filename), header + text);
}

console.log(`Saved ${allNotes.length} note files to ${OUT}/`);

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

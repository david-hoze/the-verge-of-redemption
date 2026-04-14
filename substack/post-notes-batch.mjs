// Post approved Notes from a daily draft file
// Usage: node substack/post-notes-batch.mjs [draft-file] [--dry-run]
//
// Reads the draft markdown, extracts Note sections, and posts each one.
// Updates notes-schedule.json with promotion tracking.
//
// Draft format expected:
//   ## Note N: Article Title
//   **Hook:**
//   <the text to post>
//   **Link:** <url>
//
// Sections that were deleted from the draft are skipped.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEDULE_FILE = join(__dirname, 'notes-schedule.json');
const BASH = String.raw`C:\msys64\usr\bin\bash.exe`;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const today = new Date().toISOString().substring(0, 10);

// Find draft file
let draftFile = args.find(a => a !== '--dry-run');
if (!draftFile) {
  draftFile = join(__dirname, '..', 'notes-drafts', `${today}.md`);
}

if (!existsSync(draftFile)) {
  console.error(`No draft found at ${draftFile}`);
  console.error('Run: node substack/notes-engine.mjs first');
  process.exit(1);
}

const draft = readFileSync(draftFile, 'utf-8');
const schedule = JSON.parse(readFileSync(SCHEDULE_FILE, 'utf-8'));

// -----------------------------------------------------------------------
// Parse draft sections
// -----------------------------------------------------------------------

function parseNotes(draft) {
  const notes = [];
  const sections = draft.split(/^## /m).filter(Boolean);

  for (const section of sections) {
    // Article-hook Notes
    const noteMatch = section.match(/^Note \d+: (.+)\n/);
    if (noteMatch) {
      const title = noteMatch[1].trim();
      const hookMatch = section.match(/\*\*Hook:\*\*\s*\n\n([^\n]+(?:\n[^\n*])*)/);
      const linkMatch = section.match(/\*\*Link:\*\*\s*(\S+)/);
      if (hookMatch && linkMatch) {
        notes.push({
          type: 'note',
          title,
          hook: hookMatch[1].trim(),
          link: linkMatch[1].trim()
        });
      }
    }

    // Self-restack
    if (section.startsWith('Self-Restack:')) {
      const titleMatch = section.match(/^Self-Restack: (.+)\n/);
      const linkMatch = section.match(/\*\*Link:\*\*\s*(\S+)/);
      if (titleMatch && linkMatch) {
        notes.push({
          type: 'self-restack',
          title: titleMatch[1].trim(),
          link: linkMatch[1].trim()
        });
      }
    }
  }

  return notes;
}

const notes = parseNotes(draft);

if (notes.length === 0) {
  console.log('No postable sections found in draft.');
  process.exit(0);
}

console.log(`Found ${notes.length} sections to post:\n`);
for (const note of notes) {
  console.log(`  [${note.type}] ${note.title}`);
  if (note.hook) console.log(`    Hook: ${note.hook.substring(0, 80)}...`);
  console.log(`    Link: ${note.link}`);
  console.log();
}

if (dryRun) {
  console.log('[DRY RUN] Would post the above. Add --dry-run to each sub-script too.');
}

// -----------------------------------------------------------------------
// Post each section
// -----------------------------------------------------------------------

for (const note of notes) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Posting: [${note.type}] ${note.title}`);
  console.log('='.repeat(60));

  try {
    if (note.type === 'note') {
      // Write hook to temp file
      const tmpFile = '/tmp/note-text.txt';
      writeFileSync(join(String.raw`C:\msys64`, 'tmp', 'note-text.txt'), note.hook);

      const dryFlag = dryRun ? ' --dry-run' : '';
      const cmd = `node "${join(__dirname, 'post-note.mjs')}" "${tmpFile}" --link "${note.link}"${dryFlag}`;
      console.log(`> ${cmd}\n`);
      execSync(cmd, { shell: BASH, stdio: 'inherit', timeout: 120000 });

      // Update schedule
      if (!dryRun) {
        const article = schedule.articles.find(a => a.title === note.title);
        if (article) {
          article.promoted.push(today);
        }
        schedule.notes_posted.push({
          date: today,
          type: 'note',
          title: note.title,
          hook: note.hook.substring(0, 100)
        });
      }

    } else if (note.type === 'self-restack') {
      const dryFlag = dryRun ? ' --dry-run' : '';
      const cmd = `node "${join(__dirname, 'restack-post.mjs')}" "${note.link}"${dryFlag}`;
      console.log(`> ${cmd}\n`);
      execSync(cmd, { shell: BASH, stdio: 'inherit', timeout: 120000 });

      if (!dryRun) {
        schedule.notes_posted.push({
          date: today,
          type: 'self-restack',
          title: note.title
        });
      }
    }

    // Wait between posts to avoid rate limiting
    if (!dryRun) {
      console.log('Waiting 30s before next post...');
      await new Promise(r => setTimeout(r, 30000));
    }

  } catch (err) {
    console.error(`FAILED: ${err.message}`);
    console.log('Continuing with next section...');
  }
}

// Save updated schedule
if (!dryRun) {
  schedule.last_run = today;
  writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2));
  console.log('\nSchedule updated.');
}

console.log('\nDone.');

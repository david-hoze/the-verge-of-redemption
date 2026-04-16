// Notes Engine - generates daily draft for David's approval
// Usage: node substack/notes-engine.mjs [--post]
//
// Without --post: generates drafts/YYYY-MM-DD.md for review
// With --post: posts approved drafts via Playwright
//
// The draft contains:
//   1. Two article-hook Notes (from ranked schedule)
//   2. One self-restack suggestion
//   3. Restack candidates from niche-adjacent writers
//
// David reviews, edits, removes what he doesn't want, then runs with --post.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const SCHEDULE_FILE = join(__dirname, 'notes-schedule.json');
const DRAFTS_DIR = join(REPO, 'drafts');

if (!existsSync(DRAFTS_DIR)) mkdirSync(DRAFTS_DIR, { recursive: true });

const schedule = JSON.parse(readFileSync(SCHEDULE_FILE, 'utf-8'));
const today = new Date().toISOString().substring(0, 10);
const draftFile = join(DRAFTS_DIR, `${today}.md`);

// -----------------------------------------------------------------------
// Pick articles to promote today
// -----------------------------------------------------------------------

function pickArticles(schedule, count = 2) {
  // Sort by: least promoted first, then by rank (lower = higher priority)
  const candidates = schedule.articles
    .map(a => ({
      ...a,
      timesPromoted: a.promoted.length,
      lastPromoted: a.promoted.length > 0 ? a.promoted[a.promoted.length - 1] : null,
      daysSincePromo: a.promoted.length > 0
        ? Math.floor((Date.now() - new Date(a.promoted[a.promoted.length - 1]).getTime()) / 86400000)
        : 999
    }))
    .sort((a, b) => {
      // Never-promoted first
      if (a.timesPromoted === 0 && b.timesPromoted > 0) return -1;
      if (b.timesPromoted === 0 && a.timesPromoted > 0) return 1;
      // Among promoted, prefer longer gap since last promo
      if (a.timesPromoted > 0 && b.timesPromoted > 0) {
        if (a.daysSincePromo !== b.daysSincePromo) return b.daysSincePromo - a.daysSincePromo;
      }
      // Then by rank
      return a.rank - b.rank;
    });

  return candidates.slice(0, count);
}

function pickHook(article) {
  // Pick the hook that has been used least (or first unused)
  const usedHooks = (article.promoted || []).map((p, i) => i % article.hooks.length);
  const hookCounts = article.hooks.map((_, i) => usedHooks.filter(u => u === i).length);
  const minCount = Math.min(...hookCounts);
  const bestIdx = hookCounts.indexOf(minCount);
  return { text: article.hooks[bestIdx], index: bestIdx };
}

function pickSelfRestack(schedule) {
  // Pick a previously promoted article to self-restack, or fall back to top-ranked
  const promoted = schedule.articles.filter(a => a.promoted.length > 0);
  if (promoted.length > 0) {
    // Pick the one promoted longest ago
    const sorted = promoted.sort((a, b) => {
      const aLast = new Date(a.promoted[a.promoted.length - 1]).getTime();
      const bLast = new Date(b.promoted[b.promoted.length - 1]).getTime();
      return aLast - bLast;
    });
    return sorted[0];
  }
  // Nothing promoted yet - suggest top tier 1
  return schedule.articles[0];
}

function pickRestackSources(schedule, count = 2) {
  // Rotate through restack sources
  const posted = schedule.notes_posted || [];
  const recentRestacks = posted
    .filter(p => p.type === 'restack')
    .map(p => p.handle);

  // Prefer sources not recently restacked
  const sources = schedule.restack_sources
    .map(s => ({
      ...s,
      recentCount: recentRestacks.filter(h => h === s.handle).length
    }))
    .sort((a, b) => a.recentCount - b.recentCount);

  return sources.slice(0, count);
}

// -----------------------------------------------------------------------
// Generate draft
// -----------------------------------------------------------------------

const articles = pickArticles(schedule);
const restackSources = pickRestackSources(schedule);
const selfRestack = pickSelfRestack(schedule);

let draft = `# Notes Draft - ${today}\n\n`;
draft += `Review and edit below. Delete any section you don't want posted.\n`;
draft += `When ready, tell Shamash "post notes" to deploy.\n\n`;
draft += `---\n\n`;

// Article-hook Notes
for (let i = 0; i < articles.length; i++) {
  const article = articles[i];
  const hook = pickHook(article);
  const url = `${schedule.substack_base}${article.slug}`;

  draft += `## Note ${i + 1}: ${article.title}\n\n`;
  draft += `**Audience:** ${article.audience}\n`;
  draft += `**Controversy:** ${'*'.repeat(article.controversy)}/5\n`;
  draft += `**Tier:** ${article.tier}\n`;
  draft += `**Times promoted:** ${article.promoted.length}\n\n`;
  draft += `**Hook:**\n\n`;
  draft += `${hook.text}\n\n`;
  draft += `**Link:** ${url}\n\n`;

  // Show alternate hooks
  draft += `<details>\n<summary>Alternate hooks</summary>\n\n`;
  for (let j = 0; j < article.hooks.length; j++) {
    if (j !== hook.index) {
      draft += `- ${article.hooks[j]}\n`;
    }
  }
  draft += `\n</details>\n\n`;
  draft += `---\n\n`;
}

// Self-restack
draft += `## Self-Restack: ${selfRestack.title}\n\n`;
draft += `Resurface this article to reach subscribers who joined after it was published.\n`;
draft += `**Link:** ${schedule.substack_base}${selfRestack.slug}\n\n`;
draft += `---\n\n`;

// Restack candidates
draft += `## Restack Candidates\n\n`;
draft += `Restack 1-2 posts from these writers to signal audience overlap:\n\n`;
for (const source of restackSources) {
  draft += `- **${source.name}** (@${source.handle}) - ${source.domain}\n`;
  draft += `  Visit: https://substack.com/@${source.handle}\n`;
  draft += `  ${source.note}\n\n`;
}

draft += `---\n\n`;
draft += `## Posting Checklist\n\n`;
draft += `- [ ] Note 1 reviewed and edited\n`;
draft += `- [ ] Note 2 reviewed and edited\n`;
draft += `- [ ] Self-restack confirmed\n`;
draft += `- [ ] Picked 1-2 posts to restack from candidates above\n`;
draft += `- [ ] Ready to post\n`;

writeFileSync(draftFile, draft);
console.log(`Draft generated: ${draftFile}`);
console.log(`\nToday's picks:`);
for (const a of articles) {
  console.log(`  - ${a.title} (rank #${a.rank}, tier ${a.tier})`);
}
console.log(`  - Self-restack: ${selfRestack.title}`);
console.log(`  - Restack from: ${restackSources.map(s => s.name).join(', ')}`);

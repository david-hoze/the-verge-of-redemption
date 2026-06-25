// Fetch a Substack profile's likes + replies feed back to a cutoff date.
// Usage: node substack/fetch-likes.mjs [user-id] [since-YYYY-MM-DD] [output.json]
// Defaults: David Hoze (379279962), 2026-05-01, ./substack-notes/likes-replies-raw.json
// Endpoint: /api/v1/reader/feed/profile/{id}?types[]=like&types[]=replies (cursor-paginated).
// Handles 429 with backoff and saves incrementally so a kill mid-run keeps progress.
import { launchBrowser, getPage } from './lib.mjs';
import { writeFileSync, existsSync, readFileSync } from 'fs';
const USER_ID = process.argv[2] || '379279962';
const SINCE = process.argv[3] || '2026-05-01';
const BASE = `https://substack.com/api/v1/reader/feed/profile/${USER_ID}?types%5B%5D=like&types%5B%5D=replies`;
const OUT = process.argv[4] || './substack-notes/likes-replies-raw.json';

const browser = await launchBrowser({ timeout: 60000 });
const page = await getPage(browser);
const sleep = ms => new Promise(r => setTimeout(r, ms));
try {
  await page.goto('https://substack.com/home', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  let cursor = null, all = [], pageNum = 0, stop = false;
  const seen = new Set();
  while (!stop && pageNum < 250) {
    pageNum++;
    const url = cursor ? `${BASE}&cursor=${encodeURIComponent(cursor)}` : BASE;
    let res, tries = 0;
    while (tries < 6) {
      res = await page.evaluate(async (u) => {
        const r = await fetch(u);
        if (!r.ok) return { error: r.status };
        return await r.json();
      }, url);
      if (!res.error) break;
      if (res.error === 429) { tries++; const w = 15000 * tries; console.log(`429, wait ${w/1000}s`); await sleep(w); }
      else { console.error('API error', res.error); break; }
    }
    if (res.error) break;
    const items = res.items || [];
    if (!items.length) { console.log('no items, done'); break; }
    for (const it of items) {
      const k = it.entity_key || JSON.stringify(it).slice(0,40);
      if (seen.has(k)) continue; seen.add(k);
      all.push(it);
      const d = (it.context?.timestamp||'').slice(0,10);
      if (d && d < SINCE) stop = true;
    }
    cursor = res.nextCursor || null;
    const last = (all[all.length-1]?.context?.timestamp||'').slice(0,10);
    console.log(`page ${pageNum}: total ${all.length}, oldest ${last}, cursor=${cursor?'y':'n'}`);
    writeFileSync(OUT, JSON.stringify(all, null, 2));
    if (!cursor) break;
    await sleep(1400);
  }
  console.log('DONE saved', all.length, 'items to', OUT);
} catch (e) { console.error('ERR', e.message); }
finally { await browser.close(); }

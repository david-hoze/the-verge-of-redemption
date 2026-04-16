# The Verge of Redemption - Directory Structure

## Substack Content

- `substack-articles/` - Published articles, organized by topic
  - `ai-and-human-relationship/` - AI companionship, substitution, human connection
  - `ai-ethics-moral-status-and-agency/` - Moral reasoning vs judgment, encoding vs encoded
  - `ai-governance-and-policy/` - Policy, regulation, governance frameworks
  - `angel-chidushim/` - Angel-sourced insights
  - `art-voice-and-creativity/` - Humor theory, voice, creativity, why AI can't be funny
  - `breslov-and-inner-life/` - Breslov teachings, inner work, spiritual life
  - `consciousness-and-the-hard-problem/` - Consciousness, hard problem, qualia
  - `culture-meaning-and-civilization/` - Western void, meaning, civilization
  - `education-and-formation/` - Education, formation, keenness framework
  - `geopolitics-and-investigation/` - Geopolitics, investigation pieces
  - `jewish-law-and-ai/` - Halakha and AI intersections
  - `narrative-and-fiction/` - Fiction, narrative pieces
- `substack-notes/` - Short notes for Substack posting
  - `GUIDE.md` - Production rules for advice notes
  - `wellness/` - Advice batches by source (gemara, likutey-halachot, marriage-counseling, shiurei-harav, etc.)
- `substack-people/` - People profiles and correspondence
  - `friends/` - Friends and collaborators
  - `respondents/` - People David is responding to or arguing against
  - `threshold-people/` - People on the line, not yet categorized
  - `disciples/` - Disciples
  - `sharers/` - Distribution channels, accounts with reach
- `substack-strategy/` - Outreach and engagement strategy
- `substack-serpents/` - AI personas
- `substack/` - Playwright scripts for Substack interaction

## Torah & Study

- `torah-writing/` - Submodule: Hebrew source texts, claims extraction, article production pipeline
  - `books/` - Likutey Moharan, Likutey Halachot, Etz Chaim
  - `sources/` - Rav's shiurim transcripts (417 lessons)
  - `scripts/` - Pipeline scripts (see `scripts/PIPELINE.md`)
- `seder/` - Daily study structure, progress tracking
- `chidushim/` - Torah insights
- `marriage-counseling/` - Marriage counseling session transcripts

## Infrastructure

- `Adam/` - Submodule: EDEN runtime (Idris2)
- `.eden/` - Shamash graph database (gitignored)
- `graph/` - Graph exports
- `build/` - Build artifacts
- `scripts/` - Utility scripts (downloader, converters, image processing)

## Drafts & Reference

- `drafts/` - Article drafts and research notes
- `guides/` - Reference guides

## Media

- `images/` - Article images
- `movie-images/` - Movie screenshots for articles

## Data & Archive

- `substack-data/` - Archived content, downloaded notes, reference materials

## Root Files

- `ARTICLES.md` - Full article index with titles and summaries
- `CLAUDE.md` - Project instructions for Shamash
- `SUBSTACK-PLAYBOOK.md` - Substack interaction patterns and URL structures
- `movies.md` - Movies used as article openers (don't reuse)
- `movie-images-workflow.md` - Image download process
- `activity-tracker.md` - Activity tracking

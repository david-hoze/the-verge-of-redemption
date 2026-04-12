# The Verge of Redemption

David Hoze's articles, downloaded from https://davidhoze.substack.com/

## Article Index

See [ARTICLES.md](ARTICLES.md) for a detailed index of all articles organized by topic, with filenames, titles, and one-line summaries.

## People

- `friends/` - Profiles of friends and collaborators. Each has their own folder with `profile.md` and optionally `correspondence.md`.
- `respondents/` - Profiles of people David is arguing against or responding to. Each has their own folder with `profile.md` and optionally `correspondence.md`.
- `threshold-people/` - People standing on the line. Not yet friends, not respondents - waiting to see which way they step.

When engaging with someone, check these folders for existing context and prior correspondence. Correspondence files (`correspondence.md`) track all interactions: DMs, comments, replies, and strategic notes. Use "correspondence" not "responses."

## Download Script

`download.idr` fetches all articles from the Substack API and saves them as `.md` files. It skips already-downloaded articles.

```bash
# Run the downloader
cd /home/natanh/docs/the-verge-of-redemption
PATH="/home/natanh/chez/bin:/ucrt64/bin:/usr/bin:$PATH" /home/natanh/.idris2/bin/idris2 --no-banner --exec main download.idr
```

- Pure Idris2 — JSON parsing and HTML-to-markdown conversion done in Idris2
- Only external dependency: `curl` (via bash, to avoid cmd.exe quoting issues on Windows)
- Temp files go to `C:/msys64/tmp/substack-dl/`
- Idempotent: re-running skips existing `.md` files

## Movies

See [movies.md](movies.md) for a list of movies already used as article openers. When writing a new article, pick a movie NOT on this list and add it to the list afterward.

## Writing Style

- Output markdown only - no HTML tags (use `---` for horizontal rules, not `<hr>`)
- Always use regular dashes (-), never em dashes or en dashes
- After printing a composed response (e.g. a reply, summary, or draft), always copy it to the clipboard using `clip`
- When the user pastes, references external content, or mentions something obscure/unfamiliar, check `~/clip.md` for context
- When copying an article to the clipboard, strip the image link and caption at the top (the `[- -](https://...)` block)

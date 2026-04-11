# The Verge of Redemption

David Hoze's articles, downloaded from https://davidhoze.substack.com/

## Article Index

See [ARTICLES.md](ARTICLES.md) for a detailed index of all articles organized by topic, with filenames, titles, and one-line summaries.

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

## Writing Style

- Always use regular dashes (-), never em dashes or en dashes
- After printing a composed response (e.g. a reply, summary, or draft), always copy it to the clipboard using `clip`
- When the user pastes or references external content (e.g. a Substack note to reply to), look for it in `~/clip.md`
- When copying an article to the clipboard, strip the image link and caption at the top (the `[- -](https://...)` block)

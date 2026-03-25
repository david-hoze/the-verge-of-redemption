# The Verge of Redemption

David Hoze's articles, downloaded from https://davidhoze.substack.com/

## Download Script

`download.idr` fetches all articles from the Substack API and saves them as `.md` files. It skips already-downloaded articles.

```bash
# Run the downloader
cd /home/natanh/docs/the-verge-of-redemption
PATH="/home/natanh/chez/bin:/ucrt64/bin:/usr/bin:$PATH" /home/natanh/Idris2/build/exec/idris2 --no-banner --exec main download.idr
```

- Pure Idris2 — JSON parsing and HTML-to-markdown conversion done in Idris2
- Only external dependency: `curl` (via bash, to avoid cmd.exe quoting issues on Windows)
- Temp files go to `C:/msys64/tmp/substack-dl/`
- Idempotent: re-running skips existing `.md` files

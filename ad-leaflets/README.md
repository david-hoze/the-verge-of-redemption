# Making a PDF leaflet

Pipeline: write the content in Markdown, hand-build an HTML file with embedded
fonts, render to PDF with headless Chrome, verify the page count. Hebrew RTL
throughout. `ad-1.*` is the worked example - copy it as a starting point.

## Files per leaflet

- `ad-N.md` - the source text (what you write first).
- `leaflet.html` - the designed HTML (RTL, print CSS). One per leaflet, or copy `ad-1`'s.
- `fonts.css` - the Assistant Hebrew font, embedded as base64. Shared, reusable as-is.
- `ad-N.pdf` - the output.

## Steps

1. Write the content in `ad-N.md`.

2. Build the HTML. Easiest is to copy `leaflet.html` and swap the text. Keep:
   - `<html lang="he" dir="rtl">` and `<meta charset="utf-8">`.
   - `@import url("fonts.css")` at the top of `<style>`.
   - `@page { size:A4; margin:0 }` and `.page` blocks with `page-break-after:always`
     (drop the break on the last page). Each `.page` is a physical side.

3. Render with headless Chrome (Hebrew/RTL and print CSS just work):

   ```bash
   CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
   DIR="C:/msys64/home/natanh/docs/the-verge-of-redemption/ad-leaflets"
   "$CHROME" --headless=new --disable-gpu --virtual-time-budget=3000 \
     --no-pdf-header-footer \
     --print-to-pdf="$DIR/ad-N.pdf" "file:///$DIR/leaflet.html"
   ```

4. Verify. Page count must equal your `.page` count (a spill to an extra page
   means content overflowed - tighten margins/font-size):

   ```bash
   pdfinfo ad-N.pdf | grep -i pages
   pdftoppm -png -r 90 ad-N.pdf pg   # eyeball pg-1.png, pg-2.png; then: rm pg-*.png
   ```

## Gotchas (all hit while making ad-1)

- **font-display must be `swap`, never `block`.** With `block`, any font face
  still loading at snapshot time renders *invisible* - text silently vanishes
  from the PDF. `fonts.css` already uses `swap`. Also pass
  `--virtual-time-budget=3000` so fonts settle before the snapshot.
- **Fonts are embedded, not linked** - the PDF prints identically anywhere with
  no substitution. To use a different font, download its woff2 subsets and
  base64-embed them the same way (see below).
- **Bidi around Latin/numbers:** wrap Latin words and phone numbers in `<bdi>`
  (e.g. `ב-<bdi>SMS</bdi>, <bdi>055-7000128</bdi>`) or dashes jump to the wrong side.
- **Double-sided fit:** aim for an exact even page count. Balance content across
  pages; two-column blocks (`column-count:2`) help density and look professional.
- **Dashes:** regular `-` only, never em/en dashes (house style).

## Regenerating fonts.css (only if changing typeface)

Fetch the Google Fonts CSS with a browser UA, download each woff2 subset, and
emit `@font-face` rules with `src:url(data:font/woff2;base64,...)` and the
matching `unicode-range`. Use `font-display:swap`. Keep the Hebrew and Latin
subsets (Latin covers digits, phone, email).

# Substack Playbook

How Substack actually works, learned by doing. Every rule here was verified by screenshot at least 3 times before being committed to code.

## Core Principle

**Screenshot after every operation.** Never assume a click, navigation, or input worked. Take a screenshot, read it, confirm, then proceed. If it went somewhere wrong, stop and investigate before continuing.

**Three-strike rule:** Only codify a pattern into a script after it has worked correctly 3 times in manual/exploratory runs. Until then, it's a hypothesis, not a procedure.

## URL Structure

Every Substack URL follows one of these patterns. When navigating programmatically, use these exactly - wrong suffixes or wrong domains cause silent redirects.

### Publications & Articles
- Publication home: `https://{publication}.substack.com/`
- Article page: `https://{publication}.substack.com/p/{slug}`
- Comments section: `https://{publication}.substack.com/p/{slug}/comments`
- Specific comment (deep link): `https://{publication}.substack.com/p/{slug}/comment/{comment-id}`
  - Example: `https://metaphorician.substack.com/p/virtualism/comment/242196575`
  - This navigates directly to the comment thread, with "Return to thread" link at top
  - Comment IDs are numeric (not prefixed with `c-`)
- Comments live on the **same domain** as the article (the publication's subdomain)

### Profiles
- Profile page: `https://substack.com/@{handle}`
- Profile has tabs: Posts, Activity, Likes, etc.
- David's profile: `https://substack.com/@davidhoze`

### Notes
- Note by author: `https://substack.com/@{handle}/note/{note-id}`
- Note IDs can be `c-{number}` (comment-style) or `p-{number}` (post-style)
- **Do NOT append `/comments` to note URLs.** This breaks navigation and redirects to Discover.

### Activity
- **Correct URL:** `https://substack.com/activity`
- **WRONG:** `https://substack.com/profile/activity` (redirects to Discover)

### Chat
- Chat thread: `https://substack.com/chat/{channel-id}/post/{post-uuid}`
- Channel IDs are numeric, post IDs are UUIDs (e.g. `c3b28d3f-0d63-415e-80a8-0e07234e58e3`)

### Collaborative articles (not on David's Substack)
- Farida Khalaf collabs: `https://fafi25.substack.com/p/{slug}`
  - "The God Who Waits" and "What Is God Actually Saying" live there

### URL Pattern Summary Table
| Type | Pattern | Domain |
|------|---------|--------|
| Article | `/{publication}.substack.com/p/{slug}` | publication subdomain |
| Article comments | `/{publication}.substack.com/p/{slug}/comments` | publication subdomain |
| Specific comment | `/{publication}.substack.com/p/{slug}/comment/{id}` | publication subdomain |
| Profile | `/substack.com/@{handle}` | substack.com |
| Note | `/substack.com/@{handle}/note/{note-id}` | substack.com |
| Activity | `/substack.com/activity` | substack.com |
| Chat | `/substack.com/chat/{channel-id}/post/{uuid}` | substack.com |

## UI Elements

### Article Comments
- **Reply links are `<a>` tags, not `<button>` elements.** Text is "Reply" or "Reply (N)" in mixed case (CSS uppercase makes them appear uppercase).
- **Reply textarea:** After clicking Reply link, a textarea appears with Cancel + Reply buttons nearby. Use the "cancel-nearby" method to identify the correct textarea.
- **Submit button:** Use full mousedown/mouseup/click event dispatch with `bubbles: true`. Plain `.click()` often fails because React's delegated event handlers don't catch synthetic clicks.
- **Finding the right comment:** Use "smallest container" algorithm - for each Reply link, walk up the DOM and find the smallest parent containing search text. This prevents matching the whole thread instead of the specific comment.

### Notes
- **Reply input:** Click "Leave a reply..." button to open input. Input is `contenteditable`, not `textarea`.
- **Submit:** Click "Post" button (found by text match on `<button>` elements).
- Notes use a different layout from articles - left sidebar with chat/nav, main content area.

### Chat (Subscriber Chat)
- **URL pattern:** `https://substack.com/chat/{channel-id}/post/{post-uuid}`
- **Layout:** Left sidebar shows all chats, right panel shows thread + replies.
- **Reply input:** `contenteditable` div at bottom of right panel.
- **Submit:** SVG button (send icon), not a text button. Found via `button` with child `svg`.
- **Newlines:** Use Shift+Enter (Enter sends the message).

### Activity Page
- Shows: replies to notes, comments on articles, likes, restacks, mentions.
- **Activity items are NOT reliable links to the original content.** Clicking on an activity item or extracting hrefs near it may navigate to the WRONG note/article. The activity feed renders items in cards that may contain links to other content (like article links within the notification text).
- **Comment modal (inline reply):** Each activity card has icon buttons (heart, comment, restack, share). Clicking the **comment bubble icon** (2nd SVG button in the card) opens an **inline reply modal** without navigating away from the activity page. The modal shows the original content, a `contenteditable` reply input, and Cancel/Post buttons.
- **To reply to a note from activity:** Use the comment modal. Find the card by text content (e.g. author name + keywords), click the 2nd SVG icon button, type in the contenteditable input, click Post. Do NOT extract the URL from the activity card - activity links are unreliable.
- **Finding the right card:** Use `document.querySelectorAll('div')`, filter by `innerText` containing the author name + keywords, constrain by `text.length < 2000` to avoid matching the whole page.

## Known Pitfalls

1. **Activity links are unreliable.** An activity notification about Ellen Davis replying to a note about nonduality contained a link to "The Great Loss" article instead. The activity card mixes note context with article links.

2. **`/comments` suffix breaks note URLs.** Only use for article URLs.

3. **Firefox profile locking.** Multiple Playwright sessions can lock `parent.lock`. Kill stale processes with `taskkill //F //IM firefox.exe`.

4. **"See more" on activity page.** Clicking "See more" expands the text but the DOM structure may change, making subsequent text extraction fail. Re-query the DOM after expanding.

5. **React event delegation.** Substack uses React. Always dispatch full mouse event sequences (mousedown, mouseup, click with bubbles:true) instead of plain `.click()`.

6. **Paywall comment gates.** Some posts restrict commenting to paid subscribers. The paywall modal (`data-testid="paywall"`, class `paywall modal-paywall`) appears *after* clicking the comment input, not on page load. It says "Only paid subscribers can comment on this post." The `post-comment.mjs` script now detects this via `checkPaywall()` in lib.mjs and exits cleanly. Without this check, `typeText`'s initial `Ctrl+A` selects the entire page (since the textarea lost focus to the modal), and the browser context crashes.

7. **Don't dry-run then live-run in sequence.** Running a script twice (once with `--dry-run`, once without) can fail on the second run because the browser state changed between runs (modal already opened, card position shifted, page cache). Either dry-run OR live-run, not both in the same session. If you need to verify, do it manually from screenshots, then run once for real.

## Procedure for New Interactions

1. Navigate to the URL. Screenshot. Verify you're on the right page.
2. Find the element you need (input, button, link). Screenshot. Verify it's the right one.
3. Perform the action (click, type). Screenshot. Verify it worked.
4. If ANY step produces unexpected results, STOP. Investigate. Do not proceed blindly.
5. Only after an interaction pattern works 3 times in exploratory runs, codify it into a script.

## Scripts

- **post-comment.mjs** - Post top-level comment on an article. Verified working.
- **reply-comment.mjs** - Reply to a specific comment on an article. Verified working (after mousedown/mouseup/click fix).
- **reply-note.mjs** - Reply to a Substack note. Verified working.
- **post-chat.mjs** - Post in a Substack chat thread. Verified working (one run).
- **substack-activity.mjs** - Check activity page. URL fixed to `/activity`.
- **substack-login.mjs** - Open browser for login. Session persists.

## Unverified / Needs Work

- **Activity comment modal reply.** Discovered that clicking the comment icon on an activity card opens an inline reply modal. Tested once (find-ellen-note3.mjs opened the modal successfully). Needs 2 more successful runs before codifying into a reusable script.
- **post-chat.mjs** - Only verified once. Needs 2 more successful runs before trusting.
- **post-ellen-final.mjs** - Uses the activity comment modal approach. Created but not yet run. Needs first run + verification.

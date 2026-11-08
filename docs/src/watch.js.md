# src/watch.js

`createSession()` returns `{ visited: Set, owner }`. `visited` lives for the whole run; `owner` is reset at each chain start.

`watchVideo(page, id, session, ctx, { fresh, last })` watches one video and returns `{ reason, nextId? }`:

- `recommended` (with `nextId`): a same-channel card was clicked in the last `endWindowSeconds` of content.
- `ended`: the video finished and no recommendation was taken.
- `autoplay-switch`: the URL changed to another video that we did not choose (decision 0005).
- `stopped`: the abort signal fired.

Throws on: tab closed, player never loaded (`startupTimeoutMs`), live video, ad or playback stalled (`stallTimeoutMs`), and `WallError` from the guard.

## Per poll (every `pollMs`)

1. Tab and URL checks.
2. Every `wallCheckMs`: `waitForHuman` (blocks while a human clears a wall).
3. `skipIfAvailable`: first thing, on every poll, ad or not, so pods and mid-rolls are covered.
4. Read media state; read the channel owner until known.
5. If an ad is showing: only track stall time, then loop. Content timing is ignored during ads.
6. Content: turn autoplay off once the player is ready and about every 10 s; return `ended`; press Play if paused (at most every 5 s); track progress.
7. If not `last`, the owner is known, at least `min(5 s, duration / 2)` was played and 10 s or less remain: pick the first unvisited same-channel card and click it. Retries every `recommendationRetryMs` if none yet.

`fresh` forces `page.goto` even if the URL already matches (used on retries). `last` disables the recommendation click, so the final video of a chain just plays to the end instead of navigating to a video that will not be watched.

The script never seeks to 0:00 or otherwise touches playback (decision 0003).

# src/youtube/player.js

Player actions. `ctx` is `{ cfg, log, signal }`.

- `mediaState(page)`: `{ ad, current, duration, paused, ended, ready }` for the main video, or `null` when no player. `ad` is true when `#movie_player` has `ad-showing` or `ad-interrupting`. Read-only.
- `createSkipper(ctx)` returns `skipIfAvailable(page)`. It looks at every `selectors.skip` match (max 8), and clicks the first one that is visible, enabled and not inside `aria-hidden`, using `humanClick`. Returns true when a click happened. A `skipCooldownMs` guard stops double clicks on one button. A click that Playwright rejects (covered, detached) is logged and retried on the next poll. Called each `pollMs`, so ad pods and mid-rolls are handled the same way as the first ad.
- `disableAutonav(page, ctx)`: clicks the autoplay toggle only when it reports `aria-checked="true"` (re-checked right before the click), then waits up to `clickTimeoutMs` for it to read off. Returns true only when it verified off; otherwise logs and returns false so the next check retries (a stale read can never flip it back on, because it only clicks when the page says it is on).
- `likeIfNeeded(page, ctx)`: clicks the Like button only when it is visible and `aria-pressed` is exactly `"false"`, re-checked right before the click. Already liked (`"true"`), unknown state, missing button, or a signed-out masthead sign-in link all mean no click, so a video can never be unliked by accident. Returns true when it clicked.
- `resumeIfPaused(page, ctx)`: clicks Play only when the video element is paused, and re-checks that right before clicking (`stillNeeded`), so it can never pause a video that started on its own during the click pause. Returns true only when it clicked.

Never done here, by design (decision 0003): seeking, muting, `playbackRate`, hiding or blocking ads.

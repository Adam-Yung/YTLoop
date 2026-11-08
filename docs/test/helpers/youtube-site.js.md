# test/helpers/youtube-site.js

`createSite(context, { videos, channels, timeScale })` installs a route on a Playwright context so `https://www.youtube.com/**` is served from local HTML. Returns `site`:

- `site.visits`: navigation requests as `{ path, referer }`. A click navigation has a referer; a `page.goto` does not. Tests use this to prove "click, don't goto".
- `site.botWall`: a `Set` of video ids that render the bot-check page instead of the player. Delete an id to simulate the human clearing it.

## Definitions

Channel: `{ id, name, handle, uploads: [videoIds] }`.

Video: `{ id, title, channel, duration, related, breaks, layout, startPaused, autoplayTo, skipCovered, timeScale }`.

- `related`: video ids shown in the sidebar, in order.
- `layout`: `'old'` (default, `ytd-compact-video-renderer`) or `'new'` (`yt-lockup-view-model`).
- `breaks`: `[{ at, ads: [{ length, skipAfter }] }]`. `at` is content seconds; `ads` is a pod played back to back; `skipAfter` is the ad second at which the Skip button appears (`null` for unskippable).
- `autoplayTo`: video id YouTube would autoplay to after the end when the autonav toggle is on.
- `skipCovered`: an overlay covers the Skip button so a real click is blocked.
- `autoplayDelayMs`: delay before the autoplay switch (default 300).
- `autonavStuck`: the autoplay toggle ignores clicks, so a switch cannot be prevented.
- `stallAt`: content second at which playback freezes.
- `timeScale`: media seconds per real second (default 20) so tests run fast.

Routes: `/watch?v=ID`, `/@handle/videos`. Anything else is 404.

## Why the fake is built this way

The fake `video` element overrides `currentTime`, `playbackRate`, `muted` and friends so any write is recorded as `{ t: 'tamper' }` in `window.__yt.log`. This is how tests prove ads are never touched.

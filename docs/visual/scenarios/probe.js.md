# visual/scenarios/probe.js

Live (`npm run probe`, about 15 s). Uses `.env` and the persistent live profile (`.profile/<channel>`), so a login you did once stays.

Checks:

| Id | What |
| --- | --- |
| `probe.1` | the playlist is fetched with yt-dlp |
| `probe.2` | the configured browser launches headed within `launchTimeoutMs` (this is what hung at a blank page with admin-locked Chrome) |
| `probe.3` | the first walk-order video loads and is not `about:blank` |
| `probe.4` | no bot check, consent or sign-in wall (if there is one, resolve it by hand in the window and rerun) |
| `probe.sel.*` | each selector in `selectors.js` matches: player, video, play button, autoplay toggle, Like button, owner link, sidebar cards and links |
| `probe.signedout` | the app's signed-out detection agrees with the visible "Sign in" link |
| `probe.5` | the real screen shows the player with content (not blank) |
| `probe.6` | after the app's own Play press (YouTube does not autoplay without a gesture) playback time advances |

The Skip Ad button only exists during a skippable ad, so it is covered by the `watch` scenario when an ad appears. Evidence: `probe.page.png`, `probe.screen.png`, `probe-playing.*`.

Before screen checks it raises the app's own browser window with `capture.raiseWindow(page, cfg)` (by process id, see `docs/visual/lib/capture.js.md`).

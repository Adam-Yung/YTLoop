# visual/scenarios/launch.js

Regression for the blank-page bug. Checks: the headed browser launches in time; the watch page loads with the right title (not about:blank); the page screenshot is not blank; on the real screen the `#movie_player` pixel is the dark player color and `ytd-app` is not blank.

Before screen checks it raises the app's own browser window with `capture.raiseWindow(page, cfg)` (by process id, see `docs/visual/lib/capture.js.md`).

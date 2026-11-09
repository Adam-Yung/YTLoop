# visual/scenarios/like.js

Checks: an unliked video gets one click and the Like button is blue on the real screen (it was light grey before); a second call clicks nothing; a video that starts liked gets no click.

Before screen checks it raises the app's own browser window with `capture.raiseWindow(page, cfg)` (by process id, see `docs/visual/lib/capture.js.md`).

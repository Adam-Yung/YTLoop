# visual/scenarios/ads.js

Pod of two 40 s ads with Skip after 2 s, real time. Checks: ad running and the player is red on the real screen; Skip button visible and yellow on screen; `createSkipper` clicks both ads with `isTrusted` clicks; after the pod the player is dark again; no `tamper` events.

Before screen checks it raises the app's own browser window with `capture.raiseWindow(page, cfg)` (by process id, see `docs/visual/lib/capture.js.md`).

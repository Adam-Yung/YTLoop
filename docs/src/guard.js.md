# src/guard.js

- `probeWall(page)`: `true`, `false`, or `null` when the page cannot be evaluated right now (for example mid-navigation).
- `hasWall(page)`: true only when `probeWall` is `true`, that is when the page is on a consent, sign-in or `/sorry` host, its visible text (layout-independent text nodes, scripts and styles excluded) matches `wall.text`, or a CAPTCHA or consent element exists. An evaluation error does not count as a wall when first detecting.
- `waitForHuman(page, cfg, log, signal)`: returns `false` immediately when there is no wall. Otherwise logs to `errors.log`, polls every `wallPollMs` (2 s) until `probeWall` is `false` (returns `true`; an evaluation error keeps waiting, so a glitch never counts as cleared), the signal aborts (returns `true`), or `cfg.botWaitMs` passes (throws `WallError`).
- `WallError`: catastrophic for the chain (decision 0002).

The guard only reads the page. It never clicks, types or reloads (decision 0004).

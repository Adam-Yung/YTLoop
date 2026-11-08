# src/guard.js

- `hasWall(page)`: true when the page is on a consent, sign-in or `/sorry` host, its text matches `wall.text`, or a CAPTCHA or consent element exists. Evaluation errors count as "no wall".
- `waitForHuman(page, cfg, log, signal)`: returns `false` immediately when there is no wall. Otherwise logs to `errors.log`, polls every 2 s until the wall disappears (returns `true`), the signal aborts (returns `true`), or `cfg.botWaitMs` passes (throws `WallError`).
- `WallError`: catastrophic for the chain (decision 0002).

The guard only reads the page. It never clicks, types or reloads (decision 0004).

# visual/lib/ctx.js

Context passed to every scenario.

- `createContext({ dir, live, resultsFile })` returns `{ dir, live, cfg, log, rows, check, skip, note, record, evidence, sleep, until, cleanup }`.
  - `check(id, name, fn)`: passes unless `fn` returns `false` or throws. Records to the TSV immediately, so a crash keeps earlier results.
  - `evidence(page, name)`: saves `<name>.page.png` (Playwright) and `<name>.screen.png` (real screen) and returns `{ pw, os }` where `os` is the decoded screen PNG or `null`.
  - `until(fn, timeoutMs, stepMs)`: polls an async predicate.
  - `cfg`: default config with a scratch profile in `<repo>/tmp/` (fixture scenarios).
  - `liveCfg()`: loads `.env` and returns the real config (persistent profile `.profile/<channel>`) for live scenarios.
- `openFake(ctx, { videos, channels, timeScale })`: launches the real headed browser (`src/browser.js`), installs the fake YouTube (`test/helpers/youtube-site.js`) and returns `{ context, page, site, close }`.
- `colorOnScreen(page, shot, selector)` and `statsOnScreen(...)`: map the element's page box to screen pixels and read the color at 90% of its width (avoids the button's text) or region statistics. Returns `null` without a screen capture.

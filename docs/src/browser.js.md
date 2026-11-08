# src/browser.js

- `launch(cfg, { headless })`: `chromium.launchPersistentContext(cfg.profileDir)` with `channel: 'chrome'`, `viewport: null` (real window size), `--enable-automation` removed and `--disable-blink-features=AutomationControlled` added. Returns `{ context, page }` with default timeouts set. Headed by default; tests pass `headless: true`.
- `createBrowser(cfg, opts)`: lazy wrapper returning `{ page(), close() }`. `page()` launches Chrome when there is none or the page is closed; `close()` closes the context and forgets it so the next `page()` relaunches. The chain uses this for browser recovery.
- `isClosedError(err)`: recognizes "target/browser/context closed" errors so callers relaunch.

Do not run two instances on one profile directory; Chrome locks it. No stealth plugins (decision 0004).

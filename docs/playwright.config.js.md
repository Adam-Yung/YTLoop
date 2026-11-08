# playwright.config.js

Defines three test projects:

| Project | Dir | Browser | Run with |
| --- | --- | --- | --- |
| `unit` | `test/unit` | none | `npm test` |
| `fixture` | `test/fixture` | Playwright Chromium, headless | `npm test` |
| `live` | `test/live` | Playwright Chromium, headed, real YouTube | `npm run test:live` (sets `LIVE=1`) |

Set `BROWSER_CHANNEL=chrome` to run against installed Chrome instead (only possible where Chrome is not admin-locked). Set `HEADED=1` to watch fixture tests in a visible Chrome. Fixture tests run in parallel; the live project runs serially with a 5 minute timeout.

## Stability

Fixture tests used to run on installed Chrome and lost the whole browser every few tests (its GPU process died), which needed GPU flags and `retries`. Playwright's own Chromium does not have that problem (0 failures in 10 full runs), so both workarounds were removed. If flakes come back, check the browser first.

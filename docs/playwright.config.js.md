# playwright.config.js

Defines two test projects (`npm test` runs both):

| Project | Dir | Browser |
| --- | --- | --- |
| `unit` | `test/unit` | none |
| `fixture` | `test/fixture` | Playwright Chromium, headless, against the fake YouTube |

Real-screen checks and live YouTube checks are not Playwright Test projects; they are the scenarios in `visual/` (`docs/visual.md`).

Set `BROWSER_CHANNEL=chrome` to run against installed Chrome instead (only possible where Chrome is not admin-locked). Set `HEADED=1` to watch fixture tests in a visible browser. Tests run in parallel.

## Stability

Fixture tests used to run on installed Chrome and lost the whole browser every few tests (its GPU process died), which needed GPU flags and `retries`. Playwright's own Chromium does not have that problem (0 failures in 10 full runs), so both workarounds were removed. If flakes come back, check the browser first.

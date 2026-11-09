# playwright.config.js

Defines two test projects (`npm test` runs both):

| Project | Dir | Browser |
| --- | --- | --- |
| `unit` | `test/unit` | none |
| `fixture` | `test/fixture` | Playwright Chromium, headless, against the fake YouTube |

Real-screen checks and live YouTube checks are not Playwright Test projects; they are the scenarios in `visual/` (`docs/visual.md`).

Set `BROWSER_CHANNEL=chrome` to run against installed Chrome instead (only possible where Chrome is not admin-locked). Set `HEADED=1` to watch fixture tests in a visible browser. Tests run in parallel with 3 workers.

## Stability

Fixture tests used to run on installed Chrome and lost the whole browser every few tests (its GPU process died), which needed GPU flags and `retries`. Playwright's own Chromium does not have that problem (0 failures in 10 full runs), so both workarounds were removed. If flakes come back, check the browser first. The fixture tests have real-time budgets of a few hundred milliseconds (stall timeout 800 ms, click timeouts), and the default of 5 workers on the 10-core VM made them miss those budgets about one run in three once the VM was busy, so the worker count is capped at 3.

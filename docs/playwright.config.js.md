# playwright.config.js

Defines two test projects (`npm test` runs both):

| Project | Dir | Browser |
| --- | --- | --- |
| `unit` | `test/unit` | none |
| `fixture` | `test/fixture` | headless, against the fake YouTube: Playwright's Chromium, or installed Chrome when `BROWSER_CHANNEL=chrome` (what the VM's `.env` sets, decision 0009) |

Real-screen checks and live YouTube checks are not Playwright Test projects; they are the scenarios in `visual/` (`docs/visual.md`).

Set `HEADED=1` to watch fixture tests in a visible browser. Tests run in parallel with 3 workers by default; `YTLOOP_WORKERS` overrides it (`workers: Number(process.env.YTLOOP_WORKERS) || 3`). `vm/windows/run.sh` sets it to 1, because the Windows VM has 2 CPUs and 4 GB: with 3 workers `site.spec.js` (Skip Ad click) and `chain.spec.js` (liked once) timed out, and both pass with 1. `YTLOOP_RETRIES` (default 0) sets Playwright's `retries`; `vm/windows/run.sh` sets it to 1 because the first fixture test of a run (a cold Chromium start on a VM that also runs Box, Dropbox and Prisma agents) failed about one run in three even with 1 worker and 5x budgets. A retried test passes as "flaky" in the report, it is not hidden; the Mac VM keeps 0.

## Stability

The fixture tests have real-time budgets of a few hundred milliseconds (stall timeout 800 ms, click timeouts) and the fake pages run on a scaled clock. Three things keep them reliable on the VM, and each was found by failing about one run in three:

- **Workers capped at 3.** The default of 5 workers on the 10-core VM made the tests miss their budgets once the VM was busy.
- **Slow fake clock in `chain.spec.js`.** The fake site runs at `timeScale: 5`. At faster clocks the last-10-seconds window was shorter than one watch-loop iteration in real Chrome (each Play, autoplay and Like click costs a few hundred ms), so the same-channel recommendation was missed and the test fell back to the channel page.
- **Long fake skippable ads in `player.spec.js`** (100 s), so an ad cannot end by itself before its Skip is clicked.

If flakes come back, check the VM load and the browser first, then the fake clock. Earlier (on the Mac, installed Chrome) the whole browser died every few tests because of its GPU process; that was the reason decision 0007 moved to Chromium and does not happen on the VM's Chrome.

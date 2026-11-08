---
name: visual-verify
description: Run, extend or debug the real-screen verification for YTLoop (headed browser, screen screenshots and recordings, pixel checks, live YouTube probe). Use after any change to browser, ad, like, chain or selector code, when the browser window is blank or wrong, or when asked to verify visually.
---

# Visual verification

Read `docs/visual.md` first. Plain Node plus macOS `screencapture`; no model is needed to run it.

## Run

1. `npm run verify` runs the fixture scenarios (launch, ads, like, chain). A run takes about 40 s and opens a visible browser window. Do not touch the mouse or keyboard while it runs.
2. `npm run probe` checks the real YouTube DOM. `npm run verify:live watch` plays a real video for a while.
3. Read the PASS/FAIL lines, then open the evidence in `visual/results/<latest>/`: `*.screen.png` is what the real screen looked like. Look at the images before changing code.
4. A FAIL is a finding until proven a test bug. Reproduce by hand in a screenshot first.

## Extend

- Add a check to the scenario that already has the setup (`visual/scenarios/`), or add a file exporting `{ name, live?, manual?, run(ctx) }`. Use `ctx.check(id, name, fn)`, `ctx.evidence(page, name)`, `colorOnScreen`.
- A check must be able to fail: assert the precondition (for example the ad really showed) before asserting the result.
- Keep fixture states visually distinct (`test/fixtures/watch.html`), then assert pixels with a tolerance (display color profiles shift saturated colors by up to about 70 per channel).
- Add a doc for every new file under `docs/visual/` (mirror rule).

## Gotchas

- Scratch files go in `<repo>/tmp/`, never `/tmp`. Delete them after.
- The owner's screensaver starts after 15 minutes: `visual/lib/awake.js` nudges the mouse; keep using it in any long run.
- Never use System Events/AppleScript (permission prompt). Raise the window with `open -a`.
- Installed Google Chrome is admin-locked here (remote debugging disallowed); use the default `BROWSER_CHANNEL=chromium`.
- A stale macOS permission dialog or notification banner can cover part of the screen and break a pixel check; take a screenshot and look.
- The mapping from page boxes to screen pixels assumes the window is on display 1.

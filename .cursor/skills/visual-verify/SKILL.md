---
name: visual-verify
description: Run, extend or debug the real-screen verification for YTLoop on the test VM (headed browser, screen screenshots and recordings, pixel checks, live YouTube probe). Use after any change to browser, ad, like, chain or selector code, when the browser window is blank or wrong, or when asked to verify visually.
---

# Visual verification

Read `docs/visual.md` and `docs/vm.md` first. Everything runs on the test VM; the Mac only edits, lints and looks at fetched evidence.

## Run

1. Make sure the VM is started (`/Applications/UTM.app/Contents/MacOS/utmctl list`; `start macOS` if stopped). Nobody should touch the VM display during a run.
2. `npm run vm:verify` runs the fixture scenarios (launch, ads, like, chain), about a minute. `npm run vm:probe` checks the real YouTube DOM. `npm run vm:watch` plays real videos for several minutes.
3. Read the PASS/FAIL lines, then open the evidence copied to `tmp/vm-results/<latest>/`: `*.screen.png` is what the VM screen looked like. Look at the images before changing code. Delete `tmp/vm-results` when finished.
4. A FAIL is a finding until proven a test bug. Reproduce by hand in a screenshot first.

## Extend

- Add a check to the scenario that already has the setup (`visual/scenarios/`), or add a file exporting `{ name, live?, manual?, run(ctx) }`. Use `ctx.check(id, name, fn)`, `ctx.evidence(page, name)`, `colorOnScreen`.
- A check must be able to fail: assert the precondition (for example the ad really showed) before asserting the result.
- Keep fixture states visually distinct (`test/fixtures/watch.html`), then assert pixels with a tolerance (display color profiles shift saturated colors by up to about 70 per channel).
- Add a doc for every new file under `docs/visual/` (mirror rule).

## Gotchas

- Never run a browser, the tests or the app on the Mac: the npm scripts refuse without `YTLOOP_VM=1`.
- Scratch files go in `<repo>/tmp/`, never `/tmp`. Delete them with the Delete tool, not chained `rm`.
- Never use System Events/AppleScript (permission prompt). Raise the window with `open -a`.
- Installed Google Chrome is admin-locked on managed Macs (remote debugging disallowed); use the default `BROWSER_CHANNEL=chromium`.
- A stale macOS permission dialog or notification banner can cover part of the screen and break a pixel check; take a screenshot and look.
- The VM shares one screen with prisma-encryptor; the lease in `vm/lib.sh` serializes runs. If a lease looks stuck, check who holds it before breaking it.
- The mapping from page boxes to screen pixels assumes the window is on display 1; `launch.4` proves it on the VM.

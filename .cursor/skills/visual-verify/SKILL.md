---
name: visual-verify
description: Run, extend or debug the real-screen verification for YTLoop on the test VM (headed browser, screen screenshots and recordings, pixel checks, live YouTube probe). Use after any change to browser, ad, like, chain or selector code, when the browser window is blank or wrong, or when asked to verify visually.
---

# Visual verification

Read `docs/visual.md` and `docs/vm.md` first. Development checks run on the test VM (the product itself runs on users' own machines); the Mac only edits, lints and looks at fetched evidence.

## Run

1. Make sure the VM is started (macOS VM: `/Applications/UTM.app/Contents/MacOS/utmctl list`; `start macOS` if stopped; Windows VM: ssh must answer and the console must be logged in and unlocked). Nobody should touch the VM display during a run. The VM can be macOS or Windows; `vm/lib.sh` detects it (decision 0010) and the same commands work for both.
2. `npm run vm:verify` runs the fixture scenarios (launch, ads, like, chain), about a minute. `npm run vm:probe` checks the real YouTube DOM. `npm run vm:watch` plays real videos for several minutes and needs the signed-in profile (`npm run vm:login` once, at the VM display).
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
- Windows VM: screenshots, recordings and window focus go through PowerShell (`visual/lib/win.js`) and ffmpeg; a run needs an unlocked console session, and a helper that keeps node alive makes a run hang after its last check. Disk is small, so empty old `visual\results` folders on the VM now and then.
- Never use System Events/AppleScript (permission prompt). The window is raised by activating the browser process by pid through JXA (`visual/lib/capture.js`), which needs no permission. Do not use `open -a "Google Chrome"`: it raises the person's own Chrome window.
- The installed Chrome of a managed Mac is admin-locked (remote debugging disallowed). The VM's Chrome is not, and `.env` there sets `BROWSER_CHANNEL=chrome` (decision 0009); on a locked Chrome use `BROWSER_CHANNEL=chromium`.
- A live `watch` passing is not proof: open the `watch-samples` and `watch-end.screen.png` and check it shows the app, signed in, playing.
- A stale macOS permission dialog or notification banner can cover part of the screen and break a pixel check; take a screenshot and look.
- The VM shares one screen with prisma-encryptor; the lease in `vm/lib.sh` serializes runs. If a lease looks stuck, check who holds it before breaking it.
- The mapping from page boxes to screen pixels assumes the window is on display 1; `launch.4` proves it on the VM.
